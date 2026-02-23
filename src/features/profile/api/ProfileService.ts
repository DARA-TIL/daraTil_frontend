import $api from "@/shared/api/http";
import type { IUser } from "@/features/auth/model/IUser";

type ApiData<T> = { data: T };

function normalizeUser(dto: any): IUser {
  const p = dto.progress ?? dto.Progress ?? null;

  return {
    id: dto.id ?? dto.ID ?? 0,
    username: dto.username ?? dto.Username ?? "",
    email: dto.email ?? dto.Email ?? "",
    avatar: dto.avatar ?? dto.Avatar ?? "",
    role: dto.role ?? dto.Role ?? "",
    authProvider: dto.authProvider ?? dto.AuthProvider ?? "",
    progress: p
      ? {
          id: p.id ?? p.ID ?? 0,
          level: p.level ?? p.Level ?? 0,
          xpTotal: p.XpTotal ?? p.xpTotal ?? 0,
          xpForNextLevel: p.XpForNextLevel ?? p.xpForNextLevel ?? 1,
          userID: p.userID ?? p.UserID ?? 0,
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
    const body: any = {};
    if (payload.username !== undefined) body.Username = payload.username;
    if (payload.avatar !== undefined) body.Avatar = payload.avatar;
    if (payload.role !== undefined) body.Role = payload.role;
    if (payload.password !== undefined) body.Password = payload.password;

    const res = await $api.patch<ApiData<any>>("/user/update", body);
    return normalizeUser(res.data.data);
  },

  async levelUp(xp: number) {
    const res = await $api.post<ApiData<any>>(`/user/levelUp/${xp}`);
    return normalizeUser(res.data.data);
  },
};

export default ProfileService;
