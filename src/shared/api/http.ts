import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  AuthResponse,
  AuthPayload,
} from "@/features/auth/model/response/AuthResponse";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";

export const API_URL =
  import.meta.env.VITE_API_URL || "https://daratilback.onrender.com/api";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

function unwrapAuth(payload: AuthResponse | unknown): AuthPayload | unknown {
  return unwrapApiData(payload);
}

function extractAccessToken(payload: AuthResponse | unknown): string | null {
  const p = unwrapAuth(payload);
  if (!isRecord(p)) return null;
  return typeof p.accessToken === "string" ? p.accessToken : null;
}

function shouldFallbackToPost(error: unknown): boolean {
  const status = axios.isAxiosError(error) ? error.response?.status : null;
  return status === 404 || status === 405;
}

function isPublicAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  );
}

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// один refresh запрос на все 401
let refreshPromise: Promise<string> | null = null;

$api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!error.response || !originalRequest) return Promise.reject(error);

    const status = error.response.status;
    const isRefreshRequest =
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("auth/refresh");
    const skipAutoRefresh = Boolean(originalRequest?.skipAuthRefresh);

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !skipAutoRefresh
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            // 1) пробуем GET
            try {
              const res = await axios.get<AuthResponse>(
                `${API_URL}/auth/refresh`,
                {
                  withCredentials: true,
                },
              );
              const token = extractAccessToken(res.data);
              if (!token)
                throw new Error("Refresh: no accessToken in response");
              return token;
            } catch (getError) {
              if (!shouldFallbackToPost(getError)) {
                throw getError;
              }

              // 2) fallback на POST (если бэк поменяет метод)
              const res = await axios.post<AuthResponse>(
                `${API_URL}/auth/refresh`,
                {},
                { withCredentials: true },
              );
              const token = extractAccessToken(res.data);
              if (!token)
                throw new Error("Refresh: no accessToken in response");
              return token;
            }
          })()
            .then((newToken) => {
              localStorage.setItem("token", newToken);
              $api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
              return newToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return $api(originalRequest);
      } catch (e) {
        localStorage.setItem("lastPage", window.location.pathname);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        if (!isPublicAuthPath(window.location.pathname)) {
          window.location.replace("/login");
        }

        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default $api;
