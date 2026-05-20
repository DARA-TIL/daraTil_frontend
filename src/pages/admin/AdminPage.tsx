import React from "react";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import { useTranslation } from "react-i18next";

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation(["admin", "pronunciation"]);

  const Card = ({
    title,
    subtitle,
    icon,
    to,
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    to: string;
  }) => (
    <Paper
      sx={{
        p: 2.5,
        backgroundImage: theme.gradients.cardSoft,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Stack gap={0.5}>
          <Typography fontWeight={800} fontSize={18}>
            {title}
          </Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={icon}
          onClick={() => nav(to)}
          sx={{
            alignSelf: { xs: "flex-start", md: "center" },
            boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
          }}
        >
          {t("admin.open", { ns: "pronunciation", defaultValue: "Open" })}
        </Button>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={2}>
        {t("adminPage.title")}
      </Typography>

      <Stack gap={2}>
        <Card
          title={t("adminPage.cards.folklore.title")}
          subtitle={t("adminPage.cards.folklore.subtitle")}
          icon={<AutoStoriesIcon />}
          to="/app/admin/folklore"
        />

        <Card
          title={t("adminPage.cards.lessons.title")}
          subtitle={t("adminPage.cards.lessons.subtitle")}
          icon={<MenuBookIcon />}
          to="/app/admin/lessons"
        />

        <Card
          title={t("adminPage.cards.users.title")}
          subtitle={t("adminPage.cards.users.subtitle")}
          icon={<PeopleAltIcon />}
          to="/app/admin/users"
        />

        <Card
          title={t("adminPage.cards.regions.title", {
            defaultValue: "Regions management",
          })}
          subtitle={t("adminPage.cards.regions.subtitle", {
            defaultValue:
              "Manage imported regions, translations, dialects, traditions, and images for the map drawer.",
          })}
          icon={<TravelExploreRoundedIcon />}
          to="/app/admin/regions"
        />

        <Card
          title={t("adminPage.cards.achievements.title", {
            defaultValue: "Achievements and rules",
          })}
          subtitle={t("adminPage.cards.achievements.subtitle", {
            defaultValue:
              "Create achievements and control which actions affect streaks, activities, and achievements.",
          })}
          icon={<EmojiEventsRoundedIcon />}
          to="/app/admin/achievements"
        />

        <Card
          title={t("adminPage.cards.timeEvents.title", {
            defaultValue: "Time events",
          })}
          subtitle={t("adminPage.cards.timeEvents.subtitle", {
            defaultValue:
              "Manage weekly and custom events, track action-based competition, and finish events with XP rewards for winners.",
          })}
          icon={<EventAvailableRoundedIcon />}
          to="/app/admin/time-events"
        />

        <Card
          title={t("adminPage.cards.notifications.title", {
            defaultValue: "Notifications",
          })}
          subtitle={t("adminPage.cards.notifications.subtitle", {
            defaultValue:
              "Create global and user-scoped notifications, edit active records, and remove notifications by ID.",
          })}
          icon={<NotificationsRoundedIcon />}
          to="/app/admin/notifications"
        />

        <Card
          title={t("admin.cardTitle", {
            ns: "pronunciation",
            defaultValue: "Speech tests",
          })}
          subtitle={t("admin.cardSubtitle", {
            ns: "pronunciation",
            defaultValue:
              "Create pronunciation tasks with Kazakh text, translations, and difficulty levels.",
          })}
          icon={<RecordVoiceOverRoundedIcon />}
          to="/app/admin/speech-tests"
        />
      </Stack>
    </Box>
  );
};

export default AdminPage;
