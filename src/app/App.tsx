import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./providers/router/AppRouter";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import GlobalSnackbar from "@/shared/lib/GlobalSnackbar";
import GlobalConfirmDialog from "@/shared/lib/GlobalConfirmDialog";
import { appWebSocket } from "@/shared/realtime/AppWebSocket";
import { useAchievementsStore } from "@/features/achievements/store/useAchievementsStore";
import { useNotificationsStore } from "@/features/notifications/store/useNotificationsStore";

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isAuth = useAuthStore((s) => s.isAuth);

  useEffect(() => {
    const loggedOut = localStorage.getItem("loggedOut") === "true";
    if (!loggedOut) {
      checkAuth();
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  }, [checkAuth]);

  useEffect(() => {
    if (isAuth) {
      appWebSocket.connect();
    } else {
      appWebSocket.disconnect();
      useNotificationsStore.getState().reset();
    }

    return () => {
      appWebSocket.disconnect();
    };
  }, [isAuth]);

  useEffect(() => {
    const syncRealtimeState = () => {
      if (!useAuthStore.getState().isAuth) return;

      appWebSocket.connect();
      void useAuthStore.getState().checkAuth();
      void useAchievementsStore.getState().fetchAll(true, { silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncRealtimeState();
      }
    };

    window.addEventListener("focus", syncRealtimeState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncRealtimeState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRouter />
      <GlobalConfirmDialog />
      <GlobalSnackbar />
    </BrowserRouter>
  );
}

export default App;
