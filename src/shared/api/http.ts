import axios from "axios";
import type {
  AuthResponse,
  AuthPayload,
} from "@/features/auth/model/response/AuthResponse";

export const API_URL = "https://daratilback.onrender.com/api";

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

function unwrapAuth(payload: AuthResponse | any): AuthPayload | any {
  return payload?.data ?? payload;
}

function extractAccessToken(payload: AuthResponse | any): string | null {
  const p = unwrapAuth(payload);
  return (p?.accessToken ?? null) as string | null;
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
  async (error) => {
    const originalRequest = error.config as any;

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const isRefreshRequest =
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("auth/refresh");

    if (status === 401 && !originalRequest._retry && !isRefreshRequest) {
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
            } catch {
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

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return $api(originalRequest);
      } catch (e) {
        localStorage.setItem("lastPage", window.location.pathname);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default $api;
