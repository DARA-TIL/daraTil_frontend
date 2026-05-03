import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { countFilledDictionaryValues } from "@/features/dictionary/model/helpers";
import { useDictionaryStore } from "@/features/dictionary/store/useDictionaryStore";

type DictionaryMetric = {
  key: string;
  label: string;
  value: number;
};

export const DictionarySummaryCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const items = useDictionaryStore((state) => state.items);
  const favoriteIds = useDictionaryStore((state) => state.favoriteIds);
  const loading = useDictionaryStore((state) => state.loading);
  const fetchCollection = useDictionaryStore((state) => state.fetchCollection);

  useEffect(() => {
    void fetchCollection();
  }, [fetchCollection]);

  const favorites = useMemo(
    () => items.filter((item) => Boolean(favoriteIds[item.id])),
    [favoriteIds, items],
  );

  const metrics = useMemo<DictionaryMetric[]>(() => {
    const explained = items.filter(
      (item) => countFilledDictionaryValues(item.wordExplainingTranslations) > 0,
    ).length;

    return [
      {
        key: "total",
        label: t("cards.dictionarySavedWords", {
          defaultValue: "Saved words",
        }),
        value: items.length,
      },
      {
        key: "favorites",
        label: t("cards.dictionaryFavorites", {
          defaultValue: "Favorites",
        }),
        value: favorites.length,
      },
      {
        key: "explained",
        label: t("cards.dictionaryExplained", {
          defaultValue: "With explanations",
        }),
        value: explained,
      },
    ];
  }, [favorites.length, items, t]);

  const favoritePreview = favorites.slice(0, 3);
  const favoriteOverflow = Math.max(favorites.length - favoritePreview.length, 0);

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        position: "relative",
        overflow: "hidden",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, rgba(255,255,255,1), rgba(241,245,249,0.96))"
            : "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(17,24,39,0.94))",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(51,65,85,0.75)"
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
          right: -28,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.22), transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={(theme) => ({
            width: 46,
            height: 46,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              theme.palette.mode === "light"
                ? "rgba(37,99,235,0.12)"
                : "rgba(59,130,246,0.18)",
            border: `1px solid ${
              theme.palette.mode === "light"
                ? "rgba(37,99,235,0.2)"
                : "rgba(96,165,250,0.24)"
            }`,
          })}
        >
          <MenuBookRoundedIcon color="primary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>
            {t("cards.dictionaryTitle", {
              defaultValue: "Dictionary pulse",
            })}
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({
              mt: 0.55,
              color:
                theme.palette.mode === "light"
                  ? "rgba(75,85,99,0.9)"
                  : "rgba(156,163,175,0.95)",
            })}
          >
            {t("cards.dictionaryDescription", {
              defaultValue:
                "Words you save with the assistant stay ready for quick review.",
            })}
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={78}
                sx={{ flex: 1, borderRadius: 3 }}
              />
            ))
          : metrics.map((metric, index) => {
              const Icon =
                index === 1
                  ? FavoriteRoundedIcon
                  : index === 2
                    ? AutoAwesomeRoundedIcon
                    : MenuBookRoundedIcon;

              return (
                <Box
                  key={metric.key}
                  sx={(theme) => ({
                    flex: 1,
                    p: 1.2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(248,250,252,0.85)"
                        : "rgba(15,23,42,0.78)",
                  })}
                >
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Icon
                      sx={{
                        fontSize: 17,
                        color:
                          index === 1
                            ? "#f97316"
                            : index === 2
                              ? "#8b5cf6"
                              : "#2563eb",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.65 }} variant="h5" fontWeight={900}>
                    {metric.value}
                  </Typography>
                </Box>
              );
            })}
      </Stack>

      {loading ? (
        <Skeleton variant="rounded" height={74} sx={{ borderRadius: 3 }} />
      ) : favoritePreview.length > 0 ? (
        <Box
          sx={(theme) => ({
            p: 1.25,
            borderRadius: 3,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.8)"
                : "rgba(15,23,42,0.66)",
          })}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {t("cards.dictionaryQuickPicks", {
              defaultValue: "Favorite words",
            })}
          </Typography>
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {favoritePreview.map((item) => (
              <Chip
                key={item.id}
                label={item.originalWord}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 999, fontWeight: 700 }}
              />
            ))}
            {favoriteOverflow > 0 ? (
              <Chip
                label={`+${favoriteOverflow}`}
                size="small"
                sx={{ borderRadius: 999, fontWeight: 700 }}
              />
            ) : null}
          </Stack>
        </Box>
      ) : (
        <Box
          sx={(theme) => ({
            p: 1.5,
            borderRadius: 3,
            border: "1px dashed",
            borderColor: theme.customColors.sidebarBorder,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(248,250,252,0.75)"
                : "rgba(15,23,42,0.55)",
          })}
        >
          <Typography fontWeight={700}>
            {t("cards.dictionaryEmptyTitle", {
              defaultValue: "Your dictionary is still empty",
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("cards.dictionaryEmptyDescription", {
              defaultValue:
                "Use the word assistant in lessons, folklore, or the map to start collecting useful vocabulary.",
            })}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        endIcon={<ArrowOutwardRoundedIcon />}
        onClick={() => navigate("/app/dictionary")}
        sx={{ alignSelf: "flex-start", borderRadius: 999, px: 2.25 }}
      >
        {t("cards.dictionaryAction", {
          defaultValue: "Open dictionary",
        })}
      </Button>
    </Paper>
  );
};
