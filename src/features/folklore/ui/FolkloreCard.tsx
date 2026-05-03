import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Folklore } from "../model/types";
import { useFolkloreStore } from "../store/useFolkloreStore";
import { useTranslation } from "react-i18next";
import { AssistantSelectionSurface } from "@/features/assistant/ui/AssistantSelectionSurface";
import { normalizeAssistantLanguage } from "@/features/assistant/model/helpers";

export const FolkloreCard: React.FC<{
  item: Folklore;
  onOpen: (id: number) => void;
}> = ({ item, onOpen }) => {
  const { t, i18n } = useTranslation("folklore");

  const liked = useFolkloreStore((s) => Boolean(s.likedIds[item.id]));
  const toggleLike = useFolkloreStore((s) => s.toggleLike);

  const typeLabel = t(`types.${item.type}`, { defaultValue: item.type });
  const regionLabel = t(`regions.${item.region}`, {
    defaultValue: item.region,
  });

  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor:
          theme.palette.mode === "light" ? "#fff" : "rgba(15,23,42,0.9)",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(15,23,42,0.9)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 12px 30px rgba(15,23,42,0.08)"
            : "0 16px 40px rgba(0,0,0,0.9)",
        position: "relative",
      })}
    >
      <CardActionArea onClick={() => onOpen(item.id)}>
        <Box
          sx={(theme) => ({
            height: 140,
            background: item.imageUrl
              ? `url(${item.imageUrl}) center/cover no-repeat`
              : theme.gradients.cardSoft,
            position: "relative",
          })}
        >
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.30), transparent 60%)",
              pointerEvents: "none",
            }}
          />
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} mb={1} alignItems="center">
            <Chip size="small" label={typeLabel} sx={{ borderRadius: 999 }} />
            <Chip size="small" label={regionLabel} sx={{ borderRadius: 999 }} />

            {item.mediaUrl ? (
              <Chip
                size="small"
                icon={<PlayArrowIcon />}
                label={t("card.media")}
                sx={{ borderRadius: 999 }}
              />
            ) : null}
          </Stack>

          <Typography fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {item.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            {item.author}
          </Typography>

          <AssistantSelectionSurface
            block={item.content}
            language={normalizeAssistantLanguage(i18n.resolvedLanguage ?? i18n.language)}
          >
            <Typography
              variant="body2"
              sx={(theme) => ({
                mt: 0.8,
                color:
                  theme.palette.mode === "light"
                    ? "rgba(75,85,99,0.9)"
                    : "rgba(156,163,175,0.95)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              })}
            >
              {item.content}
            </Typography>
          </AssistantSelectionSurface>
        </CardContent>
      </CardActionArea>

      <Box
        sx={{
          position: "absolute",
          right: 10,
          bottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: "rgba(255,255,255,0.75)",
          borderRadius: 999,
          px: 0.8,
          py: 0.2,
          backdropFilter: "blur(6px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton size="small" onClick={() => toggleLike(item.id)}>
          <FavoriteIcon color={liked ? "error" : "disabled"} fontSize="small" />
        </IconButton>
        <Typography variant="caption" fontWeight={600}>
          {item.likesCount}
        </Typography>
      </Box>
    </Card>
  );
};
