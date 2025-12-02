// src/pages/dashboard/components/EngagingLessonsCard.tsx
import React from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const EngagingLessonsCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 1,
        borderRadius: 4,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundImage: theme.gradients.cardSoft,
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(15,23,42,0.9)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 14px 32px rgba(15,23,42,0.12)"
            : "0 18px 40px rgba(0,0,0,0.85)",
      })}
    >
      {/* лёгкий блик сверху справа */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 100% 0, rgba(255,255,255,0.6), transparent 55%)",
        }}
      />

      {/* шапка */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {t("cards.charactersTitle", "Engaging lessons")}
          </Typography>
          <Chip
            label={t("cards.guidesOnline", "Guides online")}
            size="small"
            sx={{
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.9)",
              fontSize: 11,
              height: 22,
            }}
          />
        </Stack>

        <Button
          size="small"
          sx={{
            textTransform: "none",
            fontSize: 13,
          }}
          onClick={() => navigate("/app/lessons")}
        >
          {t("cards.viewAll", "View all")}
        </Button>
      </Stack>

      {/* описание */}
      <Typography
        variant="body2"
        color="text.secondary"
        mb={2}
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          color:
            theme.palette.mode === "light"
              ? "rgba(15,23,42,0.8)"
              : "rgba(226,232,240,0.9)",
        })}
      >
        {t(
          "cards.charactersDesc",
          "Meet your guides and continue from where you stopped.",
        )}
      </Typography>

      {/* аватарки персонажей */}
      <Box sx={{ position: "relative", zIndex: 1, mb: 1.5 }}>
        <AvatarGroup
          max={6}
          sx={{
            "& .MuiAvatar-root": {
              width: 42,
              height: 42,
              boxShadow: "0 6px 14px rgba(15,23,42,0.25)",
              border:
                "2px solid rgba(248,250,252,0.95)", // светлая окантовка кругов
            },
          }}
        >
          <Avatar alt="Aruzhan" src="/avatars/aruzhan.png" />
          <Avatar alt="Nursultan" src="/avatars/nursultan.png" />
          <Avatar alt="Dana" src="/avatars/dana.png" />
          <Avatar alt="Yerlan" src="/avatars/yerlan.png" />
          <Avatar alt="Madi" src="/avatars/madi.png" />
          <Avatar alt="Guest" />
        </AvatarGroup>
      </Box>

      {/* нижняя подпись и кнопка быстрого перехода */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ position: "relative", zIndex: 1, mt: 0.5 }}
      >
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {t("cards.nextGuide", "Continue with Aruzhan")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("cards.nextGuideMeta", "Storytelling • 5 min left")}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate("/app/lessons")}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            px: 2,
            fontSize: 13,
            bgcolor: "rgba(255,255,255,0.75)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.95)",
            },
          }}
        >
          {t("cards.resume", "Resume")}
        </Button>
      </Stack>
    </Paper>
  );
};
