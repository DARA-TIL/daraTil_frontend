import $api from "@/shared/api/http";
import {
  normalizeUserProfile,
  type CreateUserProfileDto,
  type UserProfile,
  type UserProfileUpdateDto,
} from "../model/userProfile";

const UserProfileService = {
  async getByUserId(userId: number): Promise<UserProfile | null> {
    const res = await $api.get<unknown>(`/userProfile/getByUserId/${userId}`);
    return normalizeUserProfile(res.data);
  },

  async create(payload: CreateUserProfileDto): Promise<string> {
    const res = await $api.post<string>("/userProfile/create", payload);
    return typeof res.data === "string" ? res.data : "success";
  },

  async updatePinnedAchievements(
    payload: UserProfileUpdateDto,
  ): Promise<string> {
    const res = await $api.patch<string>(
      "/userProfile/updatePinnedAchievements",
      payload,
    );
    return typeof res.data === "string" ? res.data : "success";
  },
};

export default UserProfileService;
