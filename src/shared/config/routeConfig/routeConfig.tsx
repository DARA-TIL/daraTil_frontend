import type React from "react";
import RootLayout from "@/layout/rootLayout/RootLayout";
import DashboardLayout from "@/layout/dashboardLayout/DashboardLayout";

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
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import FolkloreAdminPage from "@/pages/admin/folklore/FolkloreAdminPage";
import FolkloreCreatePage from "@/pages/admin/folklore/FolkloreCreatePage";
import FolkloreEditPage from "@/pages/admin/folklore/FolkloreEditPage";
import AdminPage from "@/pages/admin/AdminPage";
import LessonDetailsPage from "@/pages/lessons/LessonDetailsPage";
import LessonEditPage from "@/pages/admin/lessons/LessonEditPage";
import LessonsAdminPage from "@/pages/admin/lessons/LessonsAdminPage";
import LessonCreatePage from "@/pages/admin/lessons/LessonCreatePage";
import UsersAdminPage from "@/pages/admin/users/UsersAdminPage";
import UserEditAdminPage from "@/pages/admin/users/UserEditAdminPage";

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
      {
        path: "forgot-password",
        element: <ForgotPassword />, // ← новый публичный роут
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
          {
            path: "lessons/:id",
            element: <LessonDetailsPage />,
          },
          {
            path: "admin/folklore",
            element: (
              <ProtectedRoute requiredRole="admin">
                <FolkloreAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/folklore/new",
            element: (
              <ProtectedRoute requiredRole="admin">
                <FolkloreCreatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/folklore/:id/edit",
            element: (
              <ProtectedRoute requiredRole="admin">
                <FolkloreEditPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin",
            element: (
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/lessons",
            element: (
              <ProtectedRoute requiredRole="admin">
                <LessonsAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/lessons/new",
            element: (
              <ProtectedRoute requiredRole="admin">
                <LessonCreatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/lessons/:id/edit",
            element: (
              <ProtectedRoute requiredRole="admin">
                <LessonEditPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/users",
            element: (
              <ProtectedRoute requiredRole="admin">
                <UsersAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/users/:id/edit",
            element: (
              <ProtectedRoute requiredRole="admin">
                <UserEditAdminPage />
              </ProtectedRoute>
            ),
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
