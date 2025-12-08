// src/shared/api/http.ts
import axios from "axios";
import type { AuthResponse } from "@/features/auth/model/response/AuthResponse";

export const API_URL = "https://daratilback.onrender.com/api";

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// глобальный промис для рефреша, чтобы всегда был только один HTTP-запрос /auth/refresh
let refreshPromise: Promise<string> | null = null;

$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isRefreshRequest =
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("auth/refresh");

    // если 401, запрос ещё не ретраили и это не сам /auth/refresh
    if (status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        // если рефреш ещё не запущен - запускаем
        if (!refreshPromise) {
          refreshPromise = axios
            .get<AuthResponse>(`${API_URL}/auth/refresh`, {
              withCredentials: true,
            })
            .then((res) => {
              const newAccessToken = res.data.accessToken;

              localStorage.setItem("token", newAccessToken);
              $api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

              return newAccessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        // ждём глобальный refresh
        const newToken = await refreshPromise;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // повторяем исходный запрос
        return $api(originalRequest);
      } catch (e) {
        // рефреш не удался - выкидываем на логин
        localStorage.setItem("lastPage", window.location.pathname);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default $api;
