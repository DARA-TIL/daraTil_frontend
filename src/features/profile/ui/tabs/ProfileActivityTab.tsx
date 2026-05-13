import React, { useEffect, useMemo } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import ProfileSectionCard from "../ProfileSectionCard";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useActivityStore } from "@/features/activity/store/useActivityStore";
import {
  formatActivityDateTime,
  formatRelativeActivityTime,
  getActivityColor,
  getActivityEntityLabel,
  getActivityTitle,
} from "@/features/activity/model/presentation";

type ActivityTimelineItem = {
  key: string;
  color: string;
  title: string;
  meta: string;
  dateTime: string;
};

const ProfileActivityTab: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation("profile");
  const userID = useAuthStore((s) => s.user?.id ?? 0);

  const items = useActivityStore((s) => s.items);
  const loading = useActivityStore((s) => s.loading);
  const fetchRecent = useActivityStore((s) => s.fetchRecent);

  useEffect(() => {
    void fetchRecent();
  }, [fetchRecent]);

  const timelineItems = useMemo<ActivityTimelineItem[]>(() => {
    const locale = i18n.resolvedLanguage ?? "en";

    return items
      .filter((item) => userID <= 0 || item.userID === userID)
      .map((item, index) => {
        const timeAgo = formatRelativeActivityTime(item.time, locale, t);
        const entity = getActivityEntityLabel(item.entityType, item.entityID, t);

        return {
          key: `${item.id}-${item.time}-${item.action}-${index}`,
          color: getActivityColor(item.action),
          title: getActivityTitle(item.action, t),
          meta: t("cards.activityMeta", {
            defaultValue: "{{timeAgo}} - {{entity}}",
            timeAgo,
            entity,
          }),
          dateTime: formatActivityDateTime(item.time, locale, t),
        };
      });
  }, [items, userID, i18n.resolvedLanguage, t]);

  const showLoading = loading && timelineItems.length === 0;
  const showEmpty = !loading && timelineItems.length === 0;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            {t("cards.activityTimelineTitle", {
              defaultValue: "Activity timeline",
            })}
          </Typography>

          {showLoading && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {t("cards.activityLoading", {
                defaultValue: "Loading activity...",
              })}
            </Typography>
          )}

          {showEmpty && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {t("cards.activityEmpty", {
                defaultValue: "No recent activity yet.",
              })}
            </Typography>
          )}

          <Stack spacing={1.25}>
            {timelineItems.map((item) => (
              <Box
                key={item.key}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  borderLeft: "4px solid",
                  borderLeftColor: item.color,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(15,23,42,0.55)",
                }}
              >
                <Typography fontWeight={800}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.meta}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.dateTime}
                </Typography>
              </Box>
            ))}
          </Stack>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileActivityTab;


