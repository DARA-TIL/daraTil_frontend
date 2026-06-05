import $api from "@/shared/api/http";
import axios from "axios";
import type {
  Achievement,
  AchievementCreateDto,
  AchievementUpdateDto,
  UserAchievement,
  UserAchievementCreateDto,
  UserAchievementUpdateDto,
} from "../model/types";
import {
  normalizeUserAchievement,
  unwrapAchievementPayload,
} from "../model/normalize";
import AchievementService from "./AchievementService";

function isUnprocessableDelete(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 422;
}

async function clearAchievementProgress(id: number): Promise<void> {
  const achievement = await AchievementService.getById(id);

  await $api.patch<unknown>("/achievement/update", {
    ...achievement,
    userAchievements: [],
  });
}

const AchievementAdminService = {
  async create(payload: AchievementCreateDto): Promise<Achievement> {
    const res = await $api.post<unknown>("/achievement/create", payload);
    const achievement = unwrapAchievementPayload(res.data) ?? payload;
    return achievement as Achievement;
  },

  async update(payload: AchievementUpdateDto): Promise<Achievement> {
    const res = await $api.patch<unknown>("/achievement/update", payload);
    const achievement = unwrapAchievementPayload(res.data) ?? payload;
    return achievement as Achievement;
  },

  async delete(id: number): Promise<void> {
    try {
      await $api.delete(`/achievement/delete/${id}`);
      return;
    } catch (error) {
      if (!isUnprocessableDelete(error)) {
        throw error;
      }

      try {
        await clearAchievementProgress(id);
        await $api.delete(`/achievement/delete/${id}`);
        return;
      } catch {
        throw new Error(
          "Backend rejected deletion. This achievement likely has user progress; backend must cascade/delete related userAchievements before removing it.",
        );
      }
    }
  },

  async createUserAchievement(
    payload: UserAchievementCreateDto,
  ): Promise<void> {
    await $api.post("/userAchievements/create", payload);
  },

  async updateUserAchievement(
    payload: UserAchievementUpdateDto,
  ): Promise<void> {
    await $api.patch("/userAchievements/update", payload);
  },

  async deleteUserAchievement(id: number): Promise<void> {
    await $api.delete(`/userAchievements/delete/${id}`);
  },

  async getUserAchievementById(id: number): Promise<UserAchievement> {
    const res = await $api.get<unknown>(`/userAchievements/getById/${id}`);
    return normalizeUserAchievement(
      typeof res.data === "object" && res.data !== null && "data" in res.data
        ? (res.data as { data?: unknown }).data
        : res.data,
    );
  },

  async getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]> {
    const res = await $api.get<unknown>(
      `/userAchievements/getByUserId/${userId}`,
    );
    const payload =
      typeof res.data === "object" && res.data !== null && "data" in res.data
        ? (res.data as { data?: unknown }).data
        : res.data;
    return Array.isArray(payload) ? payload.map(normalizeUserAchievement) : [];
  },
};

export default AchievementAdminService;
