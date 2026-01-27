import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MapIcon from "@mui/icons-material/Map";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const profileMenuItems = [
  { icon: DashboardIcon, key: "dashboard", path: "/app" },
  { icon: PersonIcon, key: "profile", path: "/app/profile" },
  { icon: MenuBookIcon, key: "lessons", path: "/app/lessons" },
  { icon: MapIcon, key: "map", path: "/app/map" },
  { icon: AutoStoriesIcon, key: "folklore", path: "/app/folklore" },
  { icon: BarChartIcon, key: "progress", path: "/app/progress" },
  { icon: SettingsIcon, key: "settings", path: "/app/settings" },
  { icon: AdminPanelSettingsIcon, key: "admin", path: "/app/admin" },
];
