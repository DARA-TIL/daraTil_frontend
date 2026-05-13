import axios from "axios";
import { create } from "zustand";
import i18n from "@/shared/config/i18n/i18n";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import UserProfileService from "../api/UserProfileService";
import type { UserProfile } from "../model/userProfile";

type FetchOptions = {
  force?: boolean;
  silent?: boolean;
};

type UserProfileState = {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  lastLoadedUserId: number | null;
  fetchByUserId: (
    userId: number,
    options?: FetchOptions,
  ) => Promise<UserProfile | null>;
  updatePinnedAchievements: (
    pinnedAchievementIds: number[],
    options?: { silent?: boolean },
  ) => Promise<boolean>;
  clear: () => void;
};

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: null,
  loading: false,
  saving: false,
  lastLoadedUserId: null,

  fetchByUserId: async (userId, options = {}) => {
    if (!userId) return null;

    const cached = get().profile;
    if (
      !options.force &&
      cached &&
      get().lastLoadedUserId === userId &&
      cached.userId === userId
    ) {
      return cached;
    }

    if (!options.silent) {
      set({ loading: true });
    }

    try {
      const profile = await UserProfileService.getByUserId(userId);
      set({
        profile,
        lastLoadedUserId: userId,
      });
      return profile;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        set({
          profile: null,
          lastLoadedUserId: userId,
        });
        return null;
      }

      if (!options.silent) {
        useUiStore.getState().showSnackbar(
          getApiErrorMessage(error) ??
            i18n.t("messages.profileLoadFailed", {
              ns: "profile",
              defaultValue: "Failed to load profile",
            }),
          "error",
        );
      }
      return get().profile;
    } finally {
      if (!options.silent) {
        set({ loading: false });
      }
    }
  },

  updatePinnedAchievements: async (pinnedAchievementIds, options = {}) => {
    const normalizedIds = Array.from(
      new Set(
        pinnedAchievementIds.filter(
          (id) => typeof id === "number" && Number.isFinite(id) && id > 0,
        ),
      ),
    );

    if (normalizedIds.length === 0) {
      useUiStore.getState().showSnackbar(
        i18n.t("messages.pinnedRequired", {
          ns: "profile",
          defaultValue: "Select at least one pinned achievement",
        }),
        "warning",
      );
      return false;
    }

    if (normalizedIds.length > 3) {
      useUiStore.getState().showSnackbar(
        i18n.t("messages.pinnedLimit", {
          ns: "profile",
          defaultValue: "You can pin up to 3 achievements",
        }),
        "warning",
      );
      return false;
    }

    set({ saving: true });

    try {
      await UserProfileService.updatePinnedAchievements({
        pinnedAchievementIds: normalizedIds,
      });

      const currentUserId = useAuthStore.getState().user?.id ?? 0;
      if (currentUserId > 0) {
        await get().fetchByUserId(currentUserId, { force: true, silent: true });
      }

      if (!options.silent) {
        useUiStore
          .getState()
          .showSnackbar(
            i18n.t("messages.pinnedUpdated", {
              ns: "profile",
              defaultValue: "Pinned achievements updated",
            }),
            "success",
          );
      }
      return true;
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ??
          i18n.t("messages.pinnedUpdateFailed", {
            ns: "profile",
            defaultValue: "Failed to update pinned achievements",
          }),
        "error",
      );
      return false;
    } finally {
      set({ saving: false });
    }
  },

  clear: () =>
    set({
      profile: null,
      loading: false,
      saving: false,
      lastLoadedUserId: null,
    }),
}));
