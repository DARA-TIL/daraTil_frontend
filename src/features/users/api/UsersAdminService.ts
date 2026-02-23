import $api from "@/shared/api/http";
import type { User, UserDto, UserUpdateDto } from "../model/types";

type ApiData<T> = { data: T };

function normalizeUser(dto: any): User {
  const p = dto.progress ?? dto.Progress ?? null;

  return {
    id: dto.id ?? dto.ID ?? 0,
    username: dto.username ?? dto.Username ?? "",
    email: dto.email ?? dto.Email ?? "",
    avatar: (dto.avatar ?? dto.Avatar ?? null) || null,
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

const UsersAdminService = {
  async getAll() {
    const res = await $api.get<ApiData<UserDto[]>>("/user/getAll");
    return (res.data.data ?? []).map(normalizeUser);
  },

  async getById(id: number) {
    const res = await $api.get<ApiData<UserDto>>(`/user/get/${id}`);
    return normalizeUser(res.data.data);
  },

  async updateById(id: number, payload: UserUpdateDto) {
    const body: any = {};
    if (payload.username !== undefined) body.Username = payload.username;
    if (payload.role !== undefined) body.Role = payload.role;
    if (payload.avatar !== undefined) body.Avatar = payload.avatar;
    if (payload.password !== undefined) body.Password = payload.password;

    const res = await $api.post<ApiData<UserDto>>(`/user/update/${id}`, body);
    return normalizeUser(res.data.data);
  },

  async levelUp(xp: number) {
    const res = await $api.post<ApiData<UserDto>>(`/user/levelUp/${xp}`);
    return normalizeUser(res.data.data);
  },
};

export default UsersAdminService;
