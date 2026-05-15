import type React from "react";
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import RootLayout from "@/layout/rootLayout/RootLayout";
import DashboardLayout from "@/layout/dashboardLayout/DashboardLayout";
import Home from "@/pages/home/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/notFound/NotFound";
import ProtectedRoute from "./ProtectedRoute";

const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const LessonsPage = lazy(() => import("@/pages/lessons/LessonsPage"));
const LessonDetailsPage = lazy(() => import("@/pages/lessons/LessonDetailsPage"));
const MapPage = lazy(() => import("@/pages/map/MapPage"));
const FolklorePage = lazy(() => import("@/pages/folklore/FolklorePage"));
const DictionaryPage = lazy(() => import("@/pages/dictionary/DictionaryPage"));
const AIChatPage = lazy(() => import("@/pages/aiChat/AIChatPage"));
const EventsPage = lazy(() => import("@/pages/events/EventsPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"));
const ProgressPage = lazy(() => import("@/pages/progress/ProgressPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard/LeaderboardPage"));

const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));
const FolkloreAdminPage = lazy(() => import("@/pages/admin/folklore/FolkloreAdminPage"));
const FolkloreCreatePage = lazy(() => import("@/pages/admin/folklore/FolkloreCreatePage"));
const FolkloreEditPage = lazy(() => import("@/pages/admin/folklore/FolkloreEditPage"));
const LessonsAdminPage = lazy(() => import("@/pages/admin/lessons/LessonsAdminPage"));
const LessonCreatePage = lazy(() => import("@/pages/admin/lessons/LessonCreatePage"));
const LessonEditPage = lazy(() => import("@/pages/admin/lessons/LessonEditPage"));
const UsersAdminPage = lazy(() => import("@/pages/admin/users/UsersAdminPage"));
const UserEditAdminPage = lazy(() => import("@/pages/admin/users/UserEditAdminPage"));
const RegionsAdminPage = lazy(() => import("@/pages/admin/regions/RegionsAdminPage"));
const AchievementsAdminPage = lazy(() => import("@/pages/admin/achievements/AchievementsAdminPage"));
const TimeEventsAdminPage = lazy(() => import("@/pages/admin/timeEvents/TimeEventsAdminPage"));
const NotificationsAdminPage = lazy(() => import("@/pages/admin/notifications/NotificationsAdminPage"));

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
        element: <ForgotPassword />,
      },
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
            element: <MapPage />,
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
            path: "ai-chat",
            element: <AIChatPage />,
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
            path: "admin",
            element: (
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            ),
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
