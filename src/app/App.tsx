import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./providers/router/AppRouter";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import GlobalSnackbar from "@/shared/lib/GlobalSnackbar";
import GlobalConfirmDialog from "@/shared/lib/GlobalConfirmDialog";
import { appWebSocket } from "@/shared/realtime/AppWebSocket";
import { useNotificationsStore } from "@/features/notifications/store/useNotificationsStore";
import { useAiChatStore } from "@/features/aiChat/store/useAiChatStore";

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
      useAiChatStore.getState().reset();
    }

    return () => {
      appWebSocket.disconnect();
    };
  }, [isAuth]);

  useEffect(() => {
    let lastReconnectAt = 0;

    const reconnectRealtime = () => {
      if (!useAuthStore.getState().isAuth) return;
      const now = Date.now();
      if (now - lastReconnectAt < 3_000) return;
      lastReconnectAt = now;

      appWebSocket.connect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconnectRealtime();
      }
    };

    window.addEventListener("focus", reconnectRealtime);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", reconnectRealtime);
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
