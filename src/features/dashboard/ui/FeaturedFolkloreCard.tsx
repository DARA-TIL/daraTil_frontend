// src/pages/dashboard/components/FeaturedFolkloreCard.tsx
import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const FeaturedFolkloreCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  // сюда потом можно будет подставлять данные с API
  const storyTitle = t("cards.folkloreName");
  const minutes = 12;
  const region = "Batys"; // позже можно брать из API

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 1,
        height: "100%",
        minHeight: 278,
        borderRadius: 4,
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          theme.palette.mode === "light" ? "#ffffff" : "rgba(15,23,42,0.9)",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(15,23,42,0.9)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 12px 30px rgba(15,23,42,0.08)"
            : "0 16px 40px rgba(0,0,0,0.9)",
      })}
    >
      {/* мягкий блик сверху, как в ProgressCard/LessonsMapCard */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(147,51,234,0.28), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* заголовок + чип "New" */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Typography variant="h6" fontWeight={600}>
          {t("cards.folkloreTitle")}
        </Typography>

        <Chip
          label={t("cards.new")}
          color="secondary"
          size="small"
          sx={{
            borderRadius: 999,
            fontWeight: 600,
            bgcolor: "secondary.main",
            color: "#fff",
          }}
        />
      </Stack>

      {/* описание */}
      <Typography
        variant="body2"
        mb={2}
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          color:
            theme.palette.mode === "light"
              ? "rgba(75,85,99,0.9)"
              : "rgba(156,163,175,0.95)",
        })}
      >
        {t("cards.folkloreDesc")}
      </Typography>

      {/* внутренняя карточка истории */}
      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          flex: 1,
          mt: 0.5,
          borderRadius: 4,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            theme.palette.mode === "light"
              ? "rgba(249,250,251,0.9)"
              : "rgba(15,23,42,0.9)",
          backdropFilter: "blur(6px)",
          border:
            theme.palette.mode === "light"
              ? "1px solid rgba(148,163,184,0.35)"
              : "1px solid rgba(55,65,81,0.9)",
          transition: "0.25s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 10px 28px rgba(15,23,42,0.18)"
                : "0 14px 32px rgba(0,0,0,0.9)",
          },
        })}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.3 }}>
            {storyTitle}
          </Typography>

          <Typography
            variant="body2"
            sx={(theme) => ({
              color:
                theme.palette.mode === "light"
                  ? "rgba(75,85,99,0.9)"
                  : "rgba(156,163,175,0.9)",
            })}
          >
            {t("cards.folkloreMeta", { minutes, region })}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<VolumeUpIcon />}
          onClick={() => navigate("/app/folklore")}
          sx={{
            borderRadius: 999,
            px: 2.3,
            py: 0.6,
            fontWeight: 600,
            color: "#fff",
            boxShadow: "0 6px 16px rgba(147,51,234,0.35)",
            "&:hover": {
              boxShadow: "0 10px 22px rgba(147,51,234,0.45)",
            },
          }}
        >
          {t("cards.listen")}
        </Button>
      </Box>
    </Paper>
  );
};
