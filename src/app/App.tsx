import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./providers/router/AppRouter";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import GlobalSnackbar from "@/shared/lib/GlobalSnackbar";

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    const loggedOut = localStorage.getItem("loggedOut") === "true";
    if (!loggedOut) {
      checkAuth();
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <AppRouter />
      <GlobalSnackbar />
    </BrowserRouter>
  );
}

export default App;
