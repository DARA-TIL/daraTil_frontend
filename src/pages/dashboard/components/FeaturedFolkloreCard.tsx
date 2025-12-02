// src/pages/dashboard/components/FeaturedFolkloreCard.tsx
import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const FeaturedFolkloreCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 1,
        borderRadius: 4,
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `
          ${theme.gradients.cardSoft},
          url('/images/folklore-bg.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(15,23,42,0.9)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 16px 40px rgba(15,23,42,0.12)"
            : "0 18px 45px rgba(0,0,0,0.85)",
      })}
    >
      {/* Блик поверх для красоты */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 80% 0%, rgba(255,255,255,0.55), transparent 60%)",
        }}
      />

      {/* Контейнер контента сверху */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Typography variant="h6" fontWeight={600}>
          {t("cards.folkloreTitle", "Featured folklore")}
        </Typography>

        <Chip
          label={t("cards.new", "New")}
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

      {/* Описание */}
      <Typography
        variant="body2"
        mb={1}
        sx={(theme) => ({
          position: "relative",
          zIndex: 2,
          color:
            theme.palette.mode === "light"
              ? "rgba(15,23,42,0.8)"
              : "rgba(226,232,240,0.85)",
        })}
      >
        {t(
          "cards.folkloreDesc",
          "Listen to a traditional story from the southern region."
        )}
      </Typography>

      {/* Карточка истории */}
      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 2,
          flex: 1,
          mt: 1,
          borderRadius: 4,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.65)"
              : "rgba(15,23,42,0.75)",
          backdropFilter: "blur(6px)",
          border:
            theme.palette.mode === "light"
              ? "1px solid rgba(148,163,184,0.35)"
              : "1px solid rgba(255,255,255,0.1)",
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
          <Typography variant="subtitle1" fontWeight={700}>
            {t("cards.folkloreName", "Song of the steppe")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            12 min • Batys region
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
          {t("cards.listen", "Listen")}
        </Button>
      </Box>
    </Paper>
  );
};
