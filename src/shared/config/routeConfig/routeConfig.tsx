import type React from "react";
import RootLayout from "@/layout/rootLayout/RootLayout";
import DashboardLayout from "@/layout/dashboardLayout/DashboardLayout";
import ProtectedRoute from "@/app/providers/router/ProtectedRoute";

import Home from "@/pages/home/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/notFound/NotFound";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LessonsPage from "@/pages/lessons/LessonsPage";
import MapPage from "@/pages/map/MapPage";
import FolklorePage from "@/pages/folklore/FolklorePage";
import ProgressPage from "@/pages/progress/ProgressPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";

export interface AppRouteConfig {
  path?: string;
  index?: boolean;
  element?: React.ReactNode;
  children?: AppRouteConfig[];
}

export const routeConfig: AppRouteConfig[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },

      // приватная ветка /app
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <DashboardPage />,
          },
          {
            path: "lessons",
            element: <LessonsPage />,
          },
          {
            path: "map",
            element: <MapPage />, // твой существующий Map, но только для авторизованных
          },
          {
            path: "folklore",
            element: <FolklorePage />,
          },
          {
            path: "progress",
            element: <ProgressPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
