import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MapIcon from "@mui/icons-material/Map";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BarChartIcon from "@mui/icons-material/BarChart";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const profileMenuItems = [
  { icon: DashboardIcon, key: "dashboard", path: "/app" },
  { icon: PersonIcon, key: "profile", path: "/app/profile" },
  { icon: MenuBookIcon, key: "lessons", path: "/app/lessons" },
  { icon: MapIcon, key: "map", path: "/app/map" },
  { icon: AutoStoriesIcon, key: "folklore", path: "/app/folklore" },
  { icon: TranslateRoundedIcon, key: "dictionary", path: "/app/dictionary" },
  { icon: SmartToyRoundedIcon, key: "aiChat", path: "/app/ai-chat" },
  { icon: RecordVoiceOverRoundedIcon, key: "pronunciation", path: "/app/pronunciation" },
  { icon: EventAvailableRoundedIcon, key: "events", path: "/app/events" },
  { icon: BarChartIcon, key: "progress", path: "/app/progress" },
  { icon: LeaderboardRoundedIcon, key: "leaderboard", path: "/app/leaderboard" },
  { icon: AdminPanelSettingsIcon, key: "admin", path: "/app/admin" },
];
