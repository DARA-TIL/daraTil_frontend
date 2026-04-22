import $api from "@/shared/api/http";
import type { UserDto } from "../model/types";

type ApiData<T> = { data: T };

function normalizeUser(dto: UserDto) {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    avatar: dto.avatar,
    role: dto.role,
    authProvider: dto.authProvider,
    progress: dto.progress
      ? {
          id: dto.progress.id,
          level: dto.progress.level,
          xpTotal: dto.progress.XpTotal,
          xpForNextLevel: dto.progress.XpForNextLevel,
          userID: dto.progress.userID,
        }
      : null,
  };
}

const UserService = {
  async getById(id: number) {
    const res = await $api.get<ApiData<UserDto>>(`/user/get/${id}`);
    return normalizeUser(res.data.data);
  },

  async getAll() {
    const res = await $api.get<ApiData<UserDto[]>>(`/user/getAll`);
    return (res.data.data ?? []).map(normalizeUser);
  },

  async updateSelf(payload: {
    avatar?: string;
    password?: string;
    role?: string;
    username?: string;
  }) {
    const body: Record<string, string> = {};
    if (payload.username !== undefined) body.Username = payload.username;
    if (payload.role !== undefined) body.Role = payload.role;
    if (payload.avatar !== undefined) body.Avatar = payload.avatar;
    if (payload.password !== undefined) body.Password = payload.password;

    const res = await $api.put<ApiData<UserDto>>(`/user/update`, body);
    return normalizeUser(res.data.data);
  },

  async updateById(
    id: number,
    payload: {
      avatar?: string;
      password?: string;
      role?: string;
      username?: string;
    },
  ) {
    const body: Record<string, string> = {};
    if (payload.username !== undefined) body.Username = payload.username;
    if (payload.role !== undefined) body.Role = payload.role;
    if (payload.avatar !== undefined) body.Avatar = payload.avatar;
    if (payload.password !== undefined) body.Password = payload.password;

    const res = await $api.put<ApiData<UserDto>>(`/user/update/${id}`, body);
    return normalizeUser(res.data.data);
  },

  async levelUp(xp: number) {
    const res = await $api.post<ApiData<UserDto>>(`/user/levelUp/${xp}`);
    return normalizeUser(res.data.data);
  },

  // уже есть в AuthService, но можно продублировать для целостности
  async changePassword(email: string) {
    return $api.post(`/user/changePassword/${encodeURIComponent(email)}`);
  },

  async confirmPasswordReset(password: string) {
    return $api.post(`/user/confirmPasswordReset`, { password });
  },
};

export default UserService;
