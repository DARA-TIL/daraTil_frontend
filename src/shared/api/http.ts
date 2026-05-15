import axios, { AxiosHeaders } from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  AuthPayload,
  AuthResponse,
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
  const parsed = unwrapAuth(payload);
  if (!isRecord(parsed)) return null;
  return typeof parsed.accessToken === "string" ? parsed.accessToken : null;
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

// Keep only one refresh request in flight for concurrent 401 responses.
let refreshPromise: Promise<string> | null = null;

$api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isRefreshRequest =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("auth/refresh");
    const skipAutoRefresh = Boolean(originalRequest.skipAuthRefresh);

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
            // Try GET first because some backend deployments expose refresh as GET.
            try {
              const response = await axios.get<AuthResponse>(
                `${API_URL}/auth/refresh`,
                {
                  withCredentials: true,
                },
              );

              const token = extractAccessToken(response.data);
              if (!token) {
                throw new Error("Refresh: no accessToken in response");
              }

              return token;
            } catch (getError) {
              if (!shouldFallbackToPost(getError)) {
                throw getError;
              }

              // Fall back to POST when backend refresh uses a different method.
              const response = await axios.post<AuthResponse>(
                `${API_URL}/auth/refresh`,
                {},
                { withCredentials: true },
              );

              const token = extractAccessToken(response.data);
              if (!token) {
                throw new Error("Refresh: no accessToken in response");
              }

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

        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return $api(originalRequest);
      } catch (refreshError) {
        localStorage.setItem("lastPage", window.location.pathname);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        if (!isPublicAuthPath(window.location.pathname)) {
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default $api;
