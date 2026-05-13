import React from "react";
import { Box, Button, Paper, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type RouteNode = {
  x: number;
  y: number;
  state: "unlocked" | "current" | "locked";
};

const routePath = "M 42 186 C 116 112, 190 138, 242 98 S 348 66, 430 124";

export const LessonsMapCard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation("dashboard");

  const mapNodes: RouteNode[] = [
    { x: 56, y: 178, state: "unlocked" },
    { x: 146, y: 126, state: "unlocked" },
    { x: 248, y: 100, state: "current" },
    { x: 348, y: 92, state: "locked" },
    { x: 430, y: 124, state: "locked" },
  ];

  const getNodeStyles = (state: RouteNode["state"]) => {
    switch (state) {
      case "current":
        return {
          dot: "linear-gradient(135deg,#38bdf8,#6366f1)",
          ring: "0 0 0 8px rgba(56,189,248,0.20), 0 0 28px rgba(99,102,241,0.42)",
        };
      case "unlocked":
        return {
          dot: "linear-gradient(135deg,#22c55e,#16a34a)",
          ring: "0 0 0 6px rgba(34,197,94,0.16)",
        };
      default:
        return {
          dot: alpha("#94a3b8", 0.85),
          ring: "0 0 0 5px rgba(148,163,184,0.16)",
        };
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 5,
        p: { xs: 1.5, md: 2 },
        position: "relative",
        overflow: "hidden",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(244,247,255,0.98))"
            : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,27,75,0.94))",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.24)"
            : "rgba(99,102,241,0.18)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 24px 54px rgba(15,23,42,0.08)"
            : "0 28px 70px rgba(2,6,23,0.48)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            theme.palette.mode === "light"
              ? "radial-gradient(circle at 12% 20%, rgba(56,189,248,0.18), transparent 26%), radial-gradient(circle at 88% 16%, rgba(99,102,241,0.18), transparent 24%), radial-gradient(circle at 76% 78%, rgba(34,197,94,0.12), transparent 20%)"
              : "radial-gradient(circle at 10% 18%, rgba(56,189,248,0.18), transparent 26%), radial-gradient(circle at 86% 14%, rgba(139,92,246,0.18), transparent 22%), radial-gradient(circle at 74% 76%, rgba(34,197,94,0.12), transparent 20%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 300, md: 340 },
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${
            theme.palette.mode === "light"
              ? "rgba(148,163,184,0.24)"
              : "rgba(148,163,184,0.14)"
          }`,
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(145deg, rgba(233,244,255,0.92), rgba(238,242,255,0.92))"
              : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(17,24,39,0.96))",
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: theme.palette.mode === "light" ? 0.6 : 0.18,
            backgroundImage: `
              linear-gradient(to right, rgba(148,163,184,0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148,163,184,0.38) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 18,
            left: 18,
            width: 88,
            height: 88,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(125,211,252,0.08) 55%, transparent 72%)",
            filter: "blur(0.2px)",
            opacity: theme.palette.mode === "light" ? 0.9 : 0.55,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            right: 22,
            top: 24,
            width: 136,
            height: 136,
            borderRadius: "50%",
            border: `1px solid ${alpha("#cbd5e1", 0.16)}`,
            background:
              theme.palette.mode === "light"
                ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.28), transparent 64%)"
                : "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12), transparent 64%)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            right: 86,
            top: 68,
            width: 86,
            height: 86,
            borderRadius: "50%",
            border: `1px solid ${alpha("#cbd5e1", 0.14)}`,
          }}
        />

        <Box
          component="svg"
          viewBox="0 0 480 260"
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        >
          <path
            d={routePath}
            fill="none"
            stroke={theme.palette.mode === "light" ? "#93c5fd" : "#334155"}
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.2"
          />
          <path
            d={routePath}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 10"
          />
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="42%" stopColor="#38bdf8" />
              <stop offset="72%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </Box>

        {mapNodes.map((node) => {
          const styles = getNodeStyles(node.state);

          return (
            <Box
              key={`${node.x}-${node.y}-${node.state}`}
              sx={{
                position: "absolute",
                left: `${(node.x / 480) * 100}%`,
                top: `${(node.y / 260) * 100}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 3,
              }}
            >
              <Box
                sx={{
                  width: node.state === "current" ? 20 : 16,
                  height: node.state === "current" ? 20 : 16,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.92)",
                  background: styles.dot,
                  boxShadow: styles.ring,
                }}
              />
            </Box>
          );
        })}
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<PlayArrowRoundedIcon />}
          onClick={() => navigate("/app/lessons")}
          sx={{
            borderRadius: 999,
            py: 1,
            fontWeight: 700,
          }}
        >
          {t("actions.continue")}
        </Button>

        <Button
          fullWidth
          variant="contained"
          startIcon={<TravelExploreRoundedIcon />}
          onClick={() => navigate("/app/map")}
          sx={{
            borderRadius: 999,
            py: 1,
            fontWeight: 800,
            boxShadow:
              "0 14px 32px rgba(37,99,235,0.28), 0 0 0 1px rgba(255,255,255,0.12)",
          }}
        >
          {t("actions.map")}
        </Button>
      </Stack>
    </Paper>
  );
};
