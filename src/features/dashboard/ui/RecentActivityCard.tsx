import React, { useEffect, useMemo } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  formatRelativeActivityTime,
  getActivityColor,
  getActivityEntityLabel,
  getActivityTitle,
} from "@/features/activity/model/presentation";
import { useActivityStore } from "@/features/activity/store/useActivityStore";

type ActivityEvent = {
  id: string;
  title: string;
  meta: string;
  color: string;
};

export const RecentActivityCard: React.FC = () => {
  const { t, i18n } = useTranslation("dashboard");
  const userID = useAuthStore((s) => s.user?.id ?? 0);

  const items = useActivityStore((s) => s.items);
  const loading = useActivityStore((s) => s.loading);
  const fetchRecent = useActivityStore((s) => s.fetchRecent);

  useEffect(() => {
    void fetchRecent();
  }, [fetchRecent]);

  const events = useMemo<ActivityEvent[]>(() => {
    const locale = i18n.resolvedLanguage ?? "en";

    return items
      .filter((item) => userID <= 0 || item.userID === userID)
      .slice(0, 5)
      .map((item, index) => {
        const timeAgo = formatRelativeActivityTime(item.time, locale, t);
        const entity = getActivityEntityLabel(item.entityType, item.entityID, t);

        return {
          id: `${item.id}-${item.time}-${item.action}-${index}`,
          title: getActivityTitle(item.action, t),
          meta: t("cards.activityMeta", {
            defaultValue: "{{timeAgo}} - {{entity}}",
            timeAgo,
            entity,
          }),
          color: getActivityColor(item.action),
        };
      });
  }, [items, userID, i18n.resolvedLanguage, t]);

  const showLoading = loading && events.length === 0;
  const showEmptyState = !loading && events.length === 0;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
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
            : "0 16px 40px rgba(0,0,0,0.85)",
      })}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2.2}
      >
        <Typography variant="h6" fontWeight={600}>
          {t("cards.activityTitle")}
        </Typography>
        <Chip
          label={
            loading
              ? t("cards.activityLoadingShort", { defaultValue: "Updating..." })
              : t("cards.activityToday")
          }
          size="small"
          sx={{ borderRadius: 999 }}
        />
      </Stack>

      {showLoading && (
        <Typography variant="body2" color="text.secondary">
          {t("cards.activityLoading", { defaultValue: "Loading activity..." })}
        </Typography>
      )}

      {showEmptyState && (
        <Typography variant="body2" color="text.secondary">
          {t("cards.activityEmpty", {
            defaultValue: "No recent activity yet.",
          })}
        </Typography>
      )}

      {events.map((ev, index) => (
        <Box
          key={ev.id}
          sx={{
            position: "relative",
            mb: index === events.length - 1 ? 0 : 2.5,
            pl: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: -2,
              top: 5,
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid white",
              bgcolor: ev.color,
              boxShadow: "0 0 0 3px rgba(255,255,255,0.6)",
            }}
          />

          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.4 }}>
            {ev.title}
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({
              color:
                theme.palette.mode === "light"
                  ? "rgba(75,85,99,0.9)"
                  : "rgba(156,163,175,0.85)",
            })}
          >
            {ev.meta}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

