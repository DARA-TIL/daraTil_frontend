import $api from "@/shared/api/http";
import axios from "axios";
import type {
  Achievement,
  AchievementCreateDto,
  AchievementUpdateDto,
} from "../model/types";
import { unwrapAchievementPayload } from "../model/normalize";
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
};

export default AchievementAdminService;
