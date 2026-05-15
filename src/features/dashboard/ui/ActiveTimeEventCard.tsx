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
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTimeEventsStore } from "@/features/timeEvents/store/useTimeEventsStore";
import {
  formatTimeEventDateTime,
  getRewardTotal,
  getTimeEventActionLabel,
  getTimeEventStatusLabel,
} from "@/features/timeEvents/model/presentation";

export const ActiveTimeEventCard: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["dashboard", "achievements", "admin"]);

  const loading = useTimeEventsStore((state) => state.loading);
  const items = useTimeEventsStore((state) => state.items);
  const fetchAll = useTimeEventsStore((state) => state.fetchAll);
  const getFeaturedEvent = useTimeEventsStore((state) => state.getFeaturedEvent);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const featured = getFeaturedEvent();

  const rewardPool = useMemo(
    () =>
      featured
        ? getRewardTotal(
            featured.rewardFirst,
            featured.rewardSecond,
            featured.rewardThird,
          )
        : 0,
    [featured],
  );

  const participantsCount = featured?.participants.length ?? 0;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        p: 2.5,
        height: "100%",
        minHeight: 292,
        position: "relative",
        overflow: "hidden",
        backgroundImage: theme.gradients.cardSoft,
        border: `1px solid ${theme.customColors.sidebarBorder}`,
      })}
    >
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(249,115,22,0.25), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <EventAvailableRoundedIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              {t("cards.eventsTitle", {
                defaultValue: "Live events",
              })}
            </Typography>
          </Stack>

          <Chip
            label={t("cards.eventsChip", {
              defaultValue: "{{count}} total",
              count: items.length,
            })}
            size="small"
          />
        </Stack>

        {loading && !featured ? (
          <Stack spacing={1.1}>
            <Skeleton variant="rounded" height={28} />
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={28} width="60%" />
          </Stack>
        ) : !featured ? (
          <Stack spacing={1}>
            <Typography fontWeight={800}>
              {t("cards.eventsEmptyTitle", {
                defaultValue: "No events yet",
              })}
            </Typography>
            <Typography color="text.secondary">
              {t("cards.eventsEmptyDescription", {
                defaultValue:
                  "When weekly or custom events start, they will appear here with rewards and rankings.",
              })}
            </Typography>
            <Button
              variant="contained"
              sx={{ alignSelf: "flex-start", borderRadius: 999, px: 2.5 }}
              onClick={() => navigate("/app/events")}
            >
              {t("cards.eventsOpen", { defaultValue: "Open events" })}
            </Button>
          </Stack>
        ) : (
          <>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                color={featured.status === "started" ? "success" : "warning"}
                label={getTimeEventStatusLabel(featured.status, t)}
              />
              <Chip
                size="small"
                icon={<EmojiEventsRoundedIcon />}
                label={t("cards.eventsPool", {
                  defaultValue: "{{value}} XP pool",
                  value: rewardPool,
                })}
              />
              <Chip
                size="small"
                icon={<LocalFireDepartmentRoundedIcon />}
                label={t("cards.eventsParticipants", {
                  defaultValue: "{{count}} participants",
                  count: participantsCount,
                })}
              />
            </Stack>

            <Box>
              <Typography variant="h6" fontWeight={800}>
                {featured.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {featured.description ||
                  t("cards.eventsNoDescription", {
                    defaultValue:
                      "Compete through tracked actions and earn XP rewards for the top places.",
                  })}
              </Typography>
            </Box>

            <Stack spacing={0.6}>
              <Typography variant="body2" fontWeight={700}>
                {getTimeEventActionLabel(featured.eventType, t)}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {formatTimeEventDateTime(featured.startDate, i18n.language)} -{" "}
                  {formatTimeEventDateTime(featured.endDate, i18n.language)}
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              sx={{ alignSelf: "flex-start", borderRadius: 999, px: 2.5 }}
              onClick={() => navigate("/app/events")}
            >
              {t("cards.eventsOpen", { defaultValue: "Open events" })}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
};
