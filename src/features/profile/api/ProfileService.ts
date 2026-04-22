import $api from "@/shared/api/http";
import type { IUser } from "@/features/auth/model/IUser";
import { getRecord, isRecord } from "@/shared/lib/unknownRecord";

type ApiData<T> = { data: T };

function normalizeUser(dto: unknown): IUser {
  const source = isRecord(dto) ? dto : {};
  const p = getRecord(source, "progress") ?? getRecord(source, "Progress");
  const st = getRecord(source, "streak") ?? getRecord(source, "Streak");

  return {
    id: Number(source.id ?? source.ID ?? 0),
    username: String(source.username ?? source.Username ?? ""),
    email: String(source.email ?? source.Email ?? ""),
    avatar: String(source.avatar ?? source.Avatar ?? ""),
    role: String(source.role ?? source.Role ?? ""),
    authProvider: String(source.authProvider ?? source.AuthProvider ?? ""),
    streakStatus: typeof source.streak === "string" ? source.streak : "",
    progress: p
      ? {
          id: Number(p.id ?? p.ID ?? 0),
          level: Number(p.level ?? p.Level ?? 0),
          xpTotal: Number(p.XpTotal ?? p.xpTotal ?? 0),
          xpForNextLevel: Number(p.XpForNextLevel ?? p.xpForNextLevel ?? 1),
          userID: Number(p.userID ?? p.UserID ?? 0),
        }
      : null,
    streak: st
      ? {
          id: Number(st.id ?? st.ID ?? 0),
          userID: Number(st.userID ?? st.UserID ?? source.id ?? source.ID ?? 0),
          currentStreak: Number(st.currentStreak ?? st.CurrentStreak ?? 0),
          longestStreak: Number(st.longestStreak ?? st.LongestStreak ?? 0),
        }
      : null,
  };
}

const ProfileService = {
  async updateSelf(payload: {
    avatar?: string;
    password?: string;
    role?: string;
    username?: string;
  }) {
    // backend DTO в PascalCase, поэтому отправляем так
    const body: Record<string, string> = {};
    if (payload.username !== undefined) body.Username = payload.username;
    if (payload.avatar !== undefined) body.Avatar = payload.avatar;
    if (payload.role !== undefined) body.Role = payload.role;
    if (payload.password !== undefined) body.Password = payload.password;

    const res = await $api.patch<ApiData<unknown>>("/user/update", body);
    return normalizeUser(res.data.data);
  },

  async levelUp(xp: number) {
    const res = await $api.post<ApiData<unknown>>(`/user/levelUp/${xp}`);
    return normalizeUser(res.data.data);
  },
};

export default ProfileService;
