import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha, keyframes, useTheme } from "@mui/material/styles";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { parseStreakStatus } from "@/features/auth/model/streak";

const flameFloat = keyframes`
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-5px) scale(1.08); }
  100% { transform: translateY(0) scale(1); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.55); }
  70% { box-shadow: 0 0 0 18px rgba(249, 115, 22, 0); }
  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-3px); }
`;

type EffectState = "idle" | "up" | "down";

export const StreakCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const user = useAuthStore((s) => s.user);
  const streakEventToken = useAuthStore((s) => s.streakEventToken);

  const currentStreak = user?.streak?.currentStreak ?? 0;
  const longestStreak = user?.streak?.longestStreak ?? 0;
  const streakStatus = user?.streakStatus ?? "";

  const [effect, setEffect] = useState<EffectState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const kind = parseStreakStatus(streakStatus);

    if (kind === "incremented") {
      setEffect("up");
      setMessage(
        t("cards.streakStatusIncremented", {
          count: currentStreak,
          defaultValue: "Streak increased: {{count}} days",
        }),
      );
    } else if (kind === "created") {
      setEffect("up");
      setMessage(
        t("cards.streakStatusCreated", {
          defaultValue: "Streak created. Keep it alive!",
        }),
      );
    } else if (kind === "new_start") {
      setEffect("up");
      setMessage(
        t("cards.streakStatusNewStart", {
          defaultValue: "New streak started!",
        }),
      );
    } else if (kind === "reset") {
      setEffect("down");
      setMessage(
        t("cards.streakStatusReset", {
          defaultValue: "Streak reset to 0. Start again today.",
        }),
      );
    } else {
      setEffect("idle");
      setMessage("");
      return;
    }

    const timer = window.setTimeout(() => {
      setEffect("idle");
      setMessage("");
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [streakEventToken, streakStatus, currentStreak, t]);

  const isDown = effect === "down";
  const iconColor = isDown ? "#ef4444" : "#f97316";

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 1,
        height: "100%",
        minHeight: 278,
        borderRadius: 4,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
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
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            effect === "down"
              ? "radial-gradient(circle at 30% 30%, rgba(239,68,68,0.28), transparent 65%)"
              : "radial-gradient(circle at 30% 30%, rgba(249,115,22,0.28), transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.25}
      >
        <Typography variant="h6" fontWeight={600}>
          {t("cards.streakTitle", { defaultValue: "Daily streak" })}
        </Typography>

        <Chip
          label={t("cards.streakShort", { day: Math.max(currentStreak, 0) })}
          size="small"
          sx={{ borderRadius: 999 }}
        />
      </Stack>

      <Typography
        variant="body2"
        mb={1.8}
        sx={(theme) => ({
          color:
            theme.palette.mode === "light"
              ? "rgba(75,85,99,0.9)"
              : "rgba(156,163,175,0.95)",
        })}
      >
        {t("cards.streakDescription", {
          defaultValue: "Complete lessons and folklore actions every day.",
        })}
      </Typography>

      <Stack direction="row" spacing={1.25} mb={1.5}>
        <Box
          sx={{
            flex: 1,
            p: 1.25,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(248,250,252,0.85)"
                : "rgba(15,23,42,0.85)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("cards.streakCurrent", { defaultValue: "Current" })}
          </Typography>
          <Typography fontWeight={800}>
            {t("cards.streakCurrentValue", {
              count: currentStreak,
              defaultValue: "{{count}} days",
            })}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 1.25,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(248,250,252,0.85)"
                : "rgba(15,23,42,0.85)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("cards.streakLongest", { defaultValue: "Longest" })}
          </Typography>
          <Typography fontWeight={800}>
            {t("cards.streakLongestValue", {
              count: longestStreak,
              defaultValue: "{{count}} days",
            })}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              effect === "down"
                ? "radial-gradient(circle at 30% 20%, #fecaca, #fee2e2)"
                : "radial-gradient(circle at 30% 20%, #ffedd5, #fed7aa)",
            animation:
              effect === "up"
                ? `${glowPulse} 1.4s ease-out infinite`
                : effect === "down"
                  ? `${shake} 0.45s ease-in-out 4`
                  : "none",
          }}
        >
          {isDown ? (
            <RestartAltRoundedIcon
              sx={{
                color: iconColor,
                fontSize: 30,
              }}
            />
          ) : (
            <LocalFireDepartmentRoundedIcon
              sx={{
                color: iconColor,
                fontSize: 30,
                animation: effect === "up" ? `${flameFloat} 0.9s ease-in-out infinite` : "none",
              }}
            />
          )}
        </Box>

        <Button
          size="small"
          variant="contained"
          onClick={() => navigate("/app/lessons")}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            px: 2.3,
            boxShadow: "0 10px 20px rgba(15,23,42,0.35)",
            bgcolor:
              effect === "down"
                ? alpha("#ef4444", 0.9)
                : alpha(theme.palette.primary.main, 0.95),
            "&:hover": {
              bgcolor:
                effect === "down"
                  ? alpha("#dc2626", 0.95)
                  : alpha(theme.palette.primary.dark, 0.95),
            },
          }}
        >
          {t("cards.streakAction", { defaultValue: "Keep streak alive" })}
        </Button>
      </Stack>

      {message ? (
        <Box
          sx={{
            mt: 1.5,
            p: 1.2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: isDown ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)",
            backgroundColor: isDown
              ? "rgba(254,242,242,0.9)"
              : "rgba(236,253,245,0.9)",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: isDown ? "#b91c1c" : "#065f46" }}
          >
            {message}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
};
