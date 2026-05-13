import type React from "react";
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import RootLayout from "@/layout/rootLayout/RootLayout";
import DashboardLayout from "@/layout/dashboardLayout/DashboardLayout";

import Home from "@/pages/home/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/notFound/NotFound";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LessonsPage from "@/pages/lessons/LessonsPage";
import FolklorePage from "@/pages/folklore/FolklorePage";
import ProgressPage from "@/pages/progress/ProgressPage";
import ProfilePage from "@/pages/profile/ProfilePage";
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
import RegionsAdminPage from "@/pages/admin/regions/RegionsAdminPage";
import AchievementsAdminPage from "@/pages/admin/achievements/AchievementsAdminPage";
import TimeEventsAdminPage from "@/pages/admin/timeEvents/TimeEventsAdminPage";
import NotificationsAdminPage from "@/pages/admin/notifications/NotificationsAdminPage";

const MapPage = lazy(() => import("@/pages/map/MapPage"));
const DictionaryPage = lazy(() => import("@/pages/dictionary/DictionaryPage"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard/LeaderboardPage"));
const EventsPage = lazy(() => import("@/pages/events/EventsPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"));

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
            path: "dictionary",
            element: <DictionaryPage />,
          },
          {
            path: "events",
            element: <EventsPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
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
            path: "leaderboard",
            element: <LeaderboardPage />,
          },
          {
            path: "settings",
            element: <Navigate to="/app/leaderboard" replace />,
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
          {
            path: "admin/regions",
            element: (
              <ProtectedRoute requiredRole="admin">
                <RegionsAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/achievements",
            element: (
              <ProtectedRoute requiredRole="admin">
                <AchievementsAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/time-events",
            element: (
              <ProtectedRoute requiredRole="admin">
                <TimeEventsAdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/notifications",
            element: (
              <ProtectedRoute requiredRole="admin">
                <NotificationsAdminPage />
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
