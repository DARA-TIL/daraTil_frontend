import { API_URL } from "@/shared/api/http";

export type WsAuthMode = "cookie" | "query" | "none";

export function getWsAuthMode(): WsAuthMode {
  const value = String(import.meta.env.VITE_WS_AUTH_MODE ?? "none").toLowerCase();

  if (value === "cookie" || value === "query") {
    return value;
  }

  return "none";
}

export function isWsDisabledByEnv(): boolean {
  const value = String(import.meta.env.VITE_WS_ENABLED ?? "true").toLowerCase();
  return value === "false" || value === "0";
}

export function getWsQueryToken(): string | null {
  return localStorage.getItem("token");
}

export function hasWsCredentials(mode = getWsAuthMode()): boolean {
  if (mode !== "query") return true;
  return Boolean(getWsQueryToken());
}

export function buildWebSocketUrl(targetPath: "/ws" | "/ws/aiChat"): string {
  const configuredBase = String(import.meta.env.VITE_WS_URL ?? API_URL);
  const url = new URL(configuredBase, window.location.origin);

  if (url.protocol === "http:" || url.protocol === "https:") {
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  }

  url.pathname = joinWsPath(url.pathname, targetPath);

  const mode = getWsAuthMode();
  if (mode === "query") {
    const token = getWsQueryToken();
    if (token) {
      url.searchParams.set("token", token);
    } else {
      url.searchParams.delete("token");
    }
  }

  return url.toString();
}

function joinWsPath(basePath: string, targetPath: "/ws" | "/ws/aiChat"): string {
  const normalizedBase = basePath.replace(/\/+$/, "");

  if (!normalizedBase || normalizedBase === "/") {
    return targetPath;
  }

  if (normalizedBase.endsWith(targetPath)) {
    return normalizedBase;
  }

  if (normalizedBase.endsWith("/ws") && targetPath.startsWith("/ws/")) {
    return `${normalizedBase}${targetPath.slice(3)}`;
  }

  return `${normalizedBase}${targetPath}`;
}
