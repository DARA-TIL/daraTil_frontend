import React, { type JSX, useEffect, useMemo, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUiStore } from "@/shared/store/useUiStore";

interface Props {
  children: JSX.Element;
  requiredRole?: string | string[];
}

function normalizeRole(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const isAuth = useAuthStore((s) => s.isAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const location = useLocation();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const notifiedRef = useRef<string>("");

  // ⚠️ Не запускаем checkAuth если сейчас идёт OAuth
  const search = new URLSearchParams(location.search);
  if (search.get("oauth") === "google") return null;

  // если авторизован, но user ещё не подгружен - подгружаем
  useEffect(() => {
    if (isAuth && !user && !isLoading) {
      checkAuth();
    }
  }, [isAuth, user, isLoading, checkAuth]);

  const required = useMemo(() => {
    if (!requiredRole) return null;
    return (Array.isArray(requiredRole) ? requiredRole : [requiredRole]).map(
      normalizeRole,
    );
  }, [requiredRole]);

  if (isLoading) return null;

  if (!isAuth) {
    const key = `login:${location.pathname}${location.search}`;
    if (notifiedRef.current !== key) {
      notifiedRef.current = key;
      showSnackbar("Please log in to access this page", "warning");
    }

    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // ВАЖНО: ждём user, иначе role-check будет undefined
  if (!user) return null;

  if (required) {
    const userRole = normalizeRole(user.role);
    const allowed = required.includes(userRole);

    if (!allowed) {
      const key = `denied:${location.pathname}`;
      if (notifiedRef.current !== key) {
        notifiedRef.current = key;
        showSnackbar("Access denied", "error");
      }
      return <Navigate to="/app" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
