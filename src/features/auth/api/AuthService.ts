// src/services/AuthService.ts
import type { AxiosResponse } from "axios";
import type { AuthResponse } from "@/features/auth/model/response/AuthResponse";
import $api from "@/shared/api/http";

export default class AuthService {
  static async login(
    email: string,
    password: string
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>("/auth/login", { email, password });
  }

  static async registration(
    username: string,
    email: string,
    password: string
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
      role: "user",
    });
  }

  static async logout(): Promise<void> {
    return $api.post("/auth/logout");
  }

  static async requestPasswordReset(email: string): Promise<{ email: string }> {
    const res = await $api.post<{ email: string }>(
      `/user/changePassword/${encodeURIComponent(email)}`
    );
    return res.data;
  }

  // 2) проверка кода
  static async verifyPasswordReset(code: string): Promise<{ message: string }> {
    const res = await $api.post<{ message: string }>(
      "/user/verifyPasswordReset",
      { code }
    );
    return res.data;
  }

  // 3) подтверждение нового пароля
  static async confirmPasswordReset(
    password: string
  ): Promise<{ message: string }> {
    const res = await $api.post<{ message: string }>(
      "/user/confirmPasswordReset",
      { password }
    );
    return res.data;
  }
}
