import React from "react";
import { Box, Chip, Paper, Stack, Typography, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const LessonsMapCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  // данные, которые потом можно будет подменить с API
  const todayLabel = t("cards.today");
  const mapTitle = t("cards.mapTitle");
  const mapSubtitle = t("cards.mapSubtitle");

  const mapPoints = [
    {
      top: "18%",
      left: "16%",
      label: t("cards.mapRegionWest"),
    },
    {
      top: "38%",
      left: "46%",
      label: t("cards.mapRegionNorth"),
    },
    {
      top: "64%",
      left: "72%",
      label: t("cards.mapRegionSouth"),
    },
  ];

  const nextLessonName = t("cards.nextLessonName");
  const nextLessonRegion = t("cards.mapRegionNorth");
  const nextLessonUnit = 2;
  const nextLessonMinutes = 15;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 1.2,
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
            ? "0 16px 40px rgba(15,23,42,0.12)"
            : "0 18px 45px rgba(0,0,0,0.8)"
      })}
    >
      {/* лёгкий блик поверх */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.6), transparent 55%)",
        }}
      />

      {/* заголовок + Today */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {mapTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color:
                theme.palette.mode === "light"
                  ? "rgba(15,23,42,0.7)"
                  : "rgba(226,232,240,0.75)",
              mt: 0.3,
            })}
          >
            {mapSubtitle}
          </Typography>
        </Box>

        <Chip
          label={todayLabel}
          size="small"
          sx={{
            borderRadius: 999,
            fontWeight: 500,
            bgcolor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(6px)",
          }}
        />
      </Stack>

      {/* псевдо-карта с маршрутом и точками */}
      <Box
        sx={(theme) => ({
          position: "relative",
          flex: 1,
          borderRadius: 3,
          mt: 1,
          mb: 1.5,
          overflow: "hidden",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(135deg,#e0f2fe,#eef2ff)"
              : "linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.95))",
          border:
            theme.palette.mode === "light"
              ? "1px solid rgba(148,163,184,0.6)"
              : "1px solid rgba(55,65,81,0.9)",
        })}
      >
        {/* сетка как карта */}
        <Box
          sx={(theme) => ({
            position: "absolute",
            inset: 0,
            opacity: theme.palette.mode === "light" ? 0.45 : 0.22,
            backgroundImage: `
              linear-gradient(to right, rgba(148,163,184,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148,163,184,0.35) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          })}
        />

        {/* линия маршрута */}
        <Box
          sx={{
            position: "absolute",
            inset: 18,
            borderRadius: 3,
            border: "2px dashed rgba(37,99,235,0.7)",
            borderStyle: "dashed",
          }}
        />

        {/* точки - «уроки» */}
        {mapPoints.map((point, idx) => (
          <Box
            key={point.label}
            sx={() => ({
              position: "absolute",
              top: point.top,
              left: point.left,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.3,
            })}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid #ffffff",
                background:
                  idx === 1
                    ? "linear-gradient(135deg,#2563eb,#a855f7)"
                    : "rgba(59,130,246,0.8)",
                boxShadow:
                  idx === 1
                    ? "0 0 0 6px rgba(37,99,235,0.35)"
                    : "0 0 0 4px rgba(37,99,235,0.25)",
              }}
            />
            <Typography
              variant="caption"
              sx={(theme) => ({
                px: 0.6,
                py: 0.1,
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 500,
                color:
                  theme.palette.mode === "light"
                    ? "rgba(15,23,42,0.8)"
                    : "rgba(226,232,240,0.85)",
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(15,23,42,0.9)",
              })}
            >
              {point.label}
            </Typography>
          </Box>
        ))}

        {/* текст заглушки - поверх всего */}
        <Box
          sx={(theme) => ({
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            p: 1.5,
            pointerEvents: "none",
            color:
              theme.palette.mode === "light"
                ? "rgba(15,23,42,0.75)"
                : "rgba(209,213,219,0.85)",
            fontSize: 13,
            fontWeight: 500,
            textShadow:
              theme.palette.mode === "light"
                ? "0 1px 2px rgba(255,255,255,0.9)"
                : "0 1px 2px rgba(0,0,0,0.9)",
          })}
        >
          {t("cards.mapPlaceholder")}
        </Box>
      </Box>

      {/* нижняя часть - следующий урок + кнопка */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mt={0.5}
        gap={2}
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {t("cards.nextLesson")}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {nextLessonName}
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({
              color:
                theme.palette.mode === "light"
                  ? "rgba(55,65,81,0.85)"
                  : "rgba(156,163,175,0.9)",
            })}
          >
            {t("cards.nextLessonMeta", {
              region: nextLessonRegion,
              unit: nextLessonUnit,
              minutes: nextLessonMinutes,
            })}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={() => navigate("/app/lessons")}
          sx={{
            borderRadius: 999,
            px: 2.7,
            py: 0.7,
            fontWeight: 600,
            boxShadow:
              "0 10px 24px rgba(37,99,235,0.35), 0 0 0 1px rgba(255,255,255,0.2)",
          }}
        >
          {t("cards.start")}
        </Button>
      </Stack>
    </Paper>
  );
};
