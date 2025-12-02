// src/pages/dashboard/components/DashboardHeader.tsx
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
          {t("title", "Dashboard")}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.88, fontWeight: 400 }}>
          {t(
            "subtitle",
            "Continue your journey, explore lessons and folklore content.",
          )}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="flex-end"
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={() => navigate("/app/lessons")}
          sx={{
            ...pillSx,
            boxShadow: "0 10px 24px rgba(15,23,42,0.35)",
            bgcolor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          {t("actions.continue", "Continue lesson")}
        </Button>

        <Button
          variant="outlined"
          startIcon={<MenuBookIcon />}
          onClick={() => navigate("/app/lessons")}
          sx={{
            ...pillSx,
            borderColor: "rgba(255,255,255,0.45)",
            color: "#fff",
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(15,23,42,0.16)",
            },
          }}
        >
          {t("actions.library", "Lessons library")}
        </Button>

        <Button
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={() => navigate("/app/map")}
          sx={{
            ...pillSx,
            borderColor: "rgba(255,255,255,0.3)",
            color: "#fff",
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(15,23,42,0.16)",
            },
          }}
        >
          {t("actions.map", "Dialect map")}
        </Button>

        <Button
          variant="outlined"
          startIcon={<AutoStoriesIcon />}
          onClick={() => navigate("/app/folklore")}
          sx={{
            ...pillSx,
            borderColor: "rgba(255,255,255,0.3)",
            color: "#fff",
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(15,23,42,0.16)",
            },
          }}
        >
          {t("actions.folklore", "Folklore")}
        </Button>

        <Button
          variant="outlined"
          startIcon={<QuizIcon />}
          onClick={() => navigate("/app/progress")}
          sx={{
            ...pillSx,
            borderColor: "rgba(255,255,255,0.3)",
            color: "#fff",
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(15,23,42,0.16)",
            },
          }}
        >
          {t("actions.quiz", "Quick practice")}
        </Button>
      </Stack>
    </Box>
  );
};
