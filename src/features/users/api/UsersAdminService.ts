import $api from "@/shared/api/http";
import type { User, UserDto, UserUpdateDto } from "../model/types";
import { getRecord, isRecord } from "@/shared/lib/unknownRecord";

type ApiData<T> = { data: T };

function normalizeUser(dto: unknown): User {
  const source = isRecord(dto) ? dto : {};
  const p = getRecord(source, "progress") ?? getRecord(source, "Progress");

  return {
    id: Number(source.id ?? source.ID ?? 0),
    username: String(source.username ?? source.Username ?? ""),
    email: String(source.email ?? source.Email ?? ""),
    avatar:
      typeof source.avatar === "string"
        ? source.avatar
        : typeof source.Avatar === "string"
          ? source.Avatar
          : null,
    role: String(source.role ?? source.Role ?? ""),
    authProvider: String(source.authProvider ?? source.AuthProvider ?? ""),
    progress: p
      ? {
          id: Number(p.id ?? p.ID ?? 0),
          level: Number(p.level ?? p.Level ?? 0),
          xpTotal: Number(p.XpTotal ?? p.xpTotal ?? 0),
          xpForNextLevel: Number(p.XpForNextLevel ?? p.xpForNextLevel ?? 1),
          userID: Number(p.userID ?? p.UserID ?? 0),
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
    const body: Record<string, string | null> = {};
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
