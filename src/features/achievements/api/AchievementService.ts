import $api from "@/shared/api/http";
import type { Achievement } from "../model/types";
import {
  unwrapAchievementListPayload,
  unwrapAchievementPayload,
} from "../model/normalize";

const AchievementService = {
  async getAll(): Promise<Achievement[]> {
    const res = await $api.get<unknown>("/achievement/getAll");
    return unwrapAchievementListPayload(res.data);
  },

  async getAchieved(): Promise<Achievement[]> {
    const res = await $api.get<unknown>("/achievement/achieved");
    return unwrapAchievementListPayload(res.data);
  },

  async getById(id: number): Promise<Achievement> {
    const res = await $api.get<unknown>(`/achievement/getById/${id}`);
    const achievement = unwrapAchievementPayload(res.data);
    if (!achievement) {
      throw new Error("Get achievement by id: invalid response");
    }
    return achievement;
  },
};

export default AchievementService;
