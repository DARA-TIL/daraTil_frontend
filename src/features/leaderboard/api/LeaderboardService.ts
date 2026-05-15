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

const LEADERBOARD_CACHE_TTL_MS = 45_000;

type CacheEntry<T> = {
  data: T | null;
  expiresAt: number;
  promise: Promise<T> | null;
};

const leaderboardCache = new Map<string, CacheEntry<unknown>>();

function getCacheEntry<T>(key: string): CacheEntry<T> {
  const existing = leaderboardCache.get(key);
  if (existing) {
    return existing as CacheEntry<T>;
  }

  const created: CacheEntry<T> = {
    data: null,
    expiresAt: 0,
    promise: null,
  };
  leaderboardCache.set(key, created);
  return created;
}

async function withLeaderboardCache<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const entry = getCacheEntry<T>(key);
  const now = Date.now();

  if (entry.data !== null && entry.expiresAt > now) {
    return entry.data;
  }

  if (entry.promise) {
    return entry.promise;
  }

  entry.promise = loader()
    .then((result) => {
      entry.data = result;
      entry.expiresAt = Date.now() + LEADERBOARD_CACHE_TTL_MS;
      return result;
    })
    .catch((error: unknown) => {
      if (entry.data !== null) {
        return entry.data;
      }
      throw error;
    })
    .finally(() => {
      entry.promise = null;
    });

  return entry.promise;
}

const LeaderboardService = {
  async getUsers(metric: UserLeaderboardMetric, limit: number): Promise<IUser[]> {
    return withLeaderboardCache(`users:${metric}:${limit}`, async () => {
      const res = await $api.get<unknown>(`/leaderboard/${metric}/${limit}`);
      return normalizeUserLeaderboard(res.data);
    });
  },

  async getProfiles(
    metric: ProfileLeaderboardMetric,
    limit: number,
  ): Promise<LeaderboardProfileEntry[]> {
    return withLeaderboardCache(`profiles:${metric}:${limit}`, async () => {
      const res = await $api.get<unknown>(`/leaderboard/profile/${metric}/${limit}`);
      return normalizeProfileLeaderboard(res.data);
    });
  },
};

export default LeaderboardService;
