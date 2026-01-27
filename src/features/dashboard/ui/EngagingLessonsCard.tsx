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

type Guide = {
  name: string;
  avatarSrc?: string;
};

export const EngagingLessonsCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  // позже можно будет получать это из API/стора
  const guides: Guide[] = [
    { name: "Aruzhan", avatarSrc: "/avatars/aruzhan.png" },
    { name: "Nursultan", avatarSrc: "/avatars/nursultan.png" },
    { name: "Dana", avatarSrc: "/avatars/dana.png" },
    { name: "Yerlan", avatarSrc: "/avatars/yerlan.png" },
    { name: "Madi", avatarSrc: "/avatars/madi.png" },
    { name: "Guest" },
  ];

  const onlineGuidesCount = guides.length - 1;

  const title = t("cards.charactersTitle");
  const description = t("cards.charactersDesc");

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
      {/* мягкий блик сверху справа, как в ProgressCard */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.25), transparent 60%)",
          pointerEvents: "none",
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
            {title}
          </Typography>
          <Chip
            label={t("cards.guidesOnline", { count: onlineGuidesCount })}
            size="small"
            sx={{
              borderRadius: 999,
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
          {t("cards.viewAll")}
        </Button>
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
        {description}
      </Typography>

      {/* аватарки персонажей в лёгком внутреннем блоке */}
      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          mb: 1.5,
          borderRadius: 3,
          p: 1.2,
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(249,250,251,0.9)"
              : "rgba(15,23,42,0.9)",
          border:
            theme.palette.mode === "light"
              ? "1px solid rgba(148,163,184,0.35)"
              : "1px solid rgba(55,65,81,0.9)",
        })}
      >
        <AvatarGroup
          max={6}
          sx={{
            "& .MuiAvatar-root": {
              width: 42,
              height: 42,
              boxShadow: "0 6px 14px rgba(15,23,42,0.25)",
              border: "2px solid rgba(248,250,252,0.95)",
            },
          }}
        >
          {guides.map((guide) => (
            <Avatar
              key={guide.name}
              alt={guide.name}
              src={guide.avatarSrc}
            />
          ))}
        </AvatarGroup>
      </Box>
    </Paper>
  );
};
