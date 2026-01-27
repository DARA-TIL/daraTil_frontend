import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./providers/router/AppRouter";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import GlobalSnackbar from "@/shared/lib/GlobalSnackbar";

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Если в localStorage есть токен - пробуем освежить сессию
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth();
    } else {
      // если токена нет - просто говорим "мы не загружаемся"
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
