import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import {
  routeConfig,
  type AppRouteConfig,
} from "@/shared/config/routeConfig/routeConfig";
import { Box, CircularProgress } from "@mui/material";

const LoaderFallback = () => (
  <Box
    sx={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

const withSuspense = (element?: React.ReactNode) => (
  <Suspense fallback={<LoaderFallback />}>{element}</Suspense>
);

const renderRoute = (route: AppRouteConfig, key: string | number) => {
  const { path, element, children } = route;

  if (children && children.length > 0) {
    return (
      <Route key={key} path={path} element={withSuspense(element)}>
        {children.map((child, idx) =>
          renderRoute(child, `${key}-${idx}`),
        )}
      </Route>
    );
  }

  return <Route key={key} path={path} element={withSuspense(element)} />;
};

const AppRouter = () => {
  return (
    <Routes>
      {routeConfig.map((route, index) =>
        renderRoute(route, route.path ?? index),
      )}
    </Routes>
  );
};

export default AppRouter;
