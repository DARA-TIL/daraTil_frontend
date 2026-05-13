import $api from "@/shared/api/http";
import type { IUser } from "@/features/auth/model/IUser";
import {
  normalizeProfileLeaderboard,
  normalizeUserLeaderboard,
} from "../model/normalize";
import type {
  LeaderboardProfileEntry,
  ProfileLeaderboardMetric,
  UserLeaderboardMetric,
} from "../model/types";

const LeaderboardService = {
  async getUsers(metric: UserLeaderboardMetric, limit: number): Promise<IUser[]> {
    const res = await $api.get<unknown>(`/leaderboard/${metric}/${limit}`);
    return normalizeUserLeaderboard(res.data);
  },

  async getProfiles(
    metric: ProfileLeaderboardMetric,
    limit: number,
  ): Promise<LeaderboardProfileEntry[]> {
    const res = await $api.get<unknown>(`/leaderboard/profile/${metric}/${limit}`);
    return normalizeProfileLeaderboard(res.data);
  },
};

export default LeaderboardService;
