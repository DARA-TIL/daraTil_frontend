import React from "react";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useTranslation } from "react-i18next";

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation("admin");

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
          {t("common.open")}
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
      </Stack>
    </Box>
  );
};

export default AdminPage;
