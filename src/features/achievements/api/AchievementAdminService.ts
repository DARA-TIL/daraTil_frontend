import $api from "@/shared/api/http";
import type {
  Achievement,
  AchievementCreateDto,
  AchievementUpdateDto,
} from "../model/types";
import { unwrapAchievementPayload } from "../model/normalize";

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
    await $api.delete(`/achievement/delete/${id}`);
  },
};

export default AchievementAdminService;
