import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MapIcon from "@mui/icons-material/Map";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import QuizIcon from "@mui/icons-material/Quiz";

const pillSx = {
  borderRadius: 999,
  px: 2.5,
  py: 0.75,
  textTransform: "none" as const,
  fontWeight: 500,
  fontSize: 14,
};

export const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  // дальше можно будет подменять title/subtitle данными с API
  const title = t("title");
  const subtitle = t("subtitle");

  // конфиг кнопок - позже легко подменить через API/стор
  const actions = [
    {
      key: "continue",
      label: t("actions.continue"),
      to: "/app/lessons",
      variant: "contained" as const,
      color: "primary" as const,
      icon: <PlayArrowIcon />,
      sx: {
        boxShadow: "0 10px 24px rgba(15,23,42,0.35)",
        bgcolor: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.3)",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.2)",
        },
      },
    },
    {
      key: "library",
      label: t("actions.library"),
      to: "/app/lessons",
      variant: "outlined" as const,
      icon: <MenuBookIcon />,
      sx: {
        borderColor: "rgba(255,255,255,0.45)",
        color: "#fff",
        "&:hover": {
          borderColor: "#fff",
          bgcolor: "rgba(15,23,42,0.16)",
        },
      },
    },
    {
      key: "map",
      label: t("actions.map"),
      to: "/app/map",
      variant: "outlined" as const,
      icon: <MapIcon />,
      sx: {
        borderColor: "rgba(255,255,255,0.3)",
        color: "#fff",
        "&:hover": {
          borderColor: "#fff",
          bgcolor: "rgba(15,23,42,0.16)",
        },
      },
    },
    {
      key: "folklore",
      label: t("actions.folklore"),
      to: "/app/folklore",
      variant: "outlined" as const,
      icon: <AutoStoriesIcon />,
      sx: {
        borderColor: "rgba(255,255,255,0.3)",
        color: "#fff",
        "&:hover": {
          borderColor: "#fff",
          bgcolor: "rgba(15,23,42,0.16)",
        },
      },
    },
    {
      key: "quiz",
      label: t("actions.quiz"),
      to: "/app/progress",
      variant: "outlined" as const,
      icon: <QuizIcon />,
      sx: {
        borderColor: "rgba(255,255,255,0.3)",
        color: "#fff",
        "&:hover": {
          borderColor: "#fff",
          bgcolor: "rgba(15,23,42,0.16)",
        },
      },
    },
  ];

  return (
    <Box
      sx={(theme) => ({
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        borderRadius: 3,
        px: 2,
        py: 1.5,
        backgroundImage: theme.gradients.dashboardHeader,
        color: "#fff",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 14px 28px rgba(15,23,42,0.16)"
            : "0 18px 40px rgba(0,0,0,0.65)",
      })}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.88, fontWeight: 400 }}>
          {subtitle}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="flex-end"
      >
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant}
            color={action.color}
            startIcon={action.icon}
            onClick={() => navigate(action.to)}
            sx={{
              ...pillSx,
              ...action.sx,
            }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};
