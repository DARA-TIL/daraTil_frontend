import type { IUser } from "@/features/auth/model/IUser";

export interface AuthPayload {
  user: IUser;
  accessToken?: string;
  refreshToken?: string;
  streak?: string;
}

export type AuthResponse = AuthPayload | { data: AuthPayload };
