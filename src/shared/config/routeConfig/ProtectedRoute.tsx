import React, { type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { useUiStore } from "@/shared/store/useUiStore";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isAuth = useAuthStore((s) => s.isAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  const showSnackbar = useUiStore((s) => s.showSnackbar);

  // ⚠️ Не запускаем checkAuth если сейчас идёт OAuth
  const search = new URLSearchParams(location.search);
  if (search.get("oauth") === "google") return null;

  if (isLoading) return null;

  if (!isAuth) {
    showSnackbar("Please log in to access this page", "warning");

    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return children;
};



export default ProtectedRoute;
