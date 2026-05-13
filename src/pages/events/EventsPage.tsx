import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useTimeEventsStore } from "@/features/timeEvents/store/useTimeEventsStore";
import {
  formatTimeEventDateTime,
  getFeaturedTimeEvent,
  getRewardTotal,
  getTimeEventActionLabel,
  getTimeEventStatusLabel,
  sortTimeEventsByPriority,
} from "@/features/timeEvents/model/presentation";
import type { TimeEventStatus } from "@/features/timeEvents/model/types";

type StatusFilter = "all" | "started" | "waiting" | "ended" | "canceled";

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "started",
  "waiting",
  "ended",
  "canceled",
];

const PARTICIPANT_LIMIT_OPTIONS = [5, 10, 25, 50];

const EventsPage: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(["events", "achievements", "admin"]);
  const currentUserId = useAuthStore((state) => state.user?.id ?? 0);

  const items = useTimeEventsStore((state) => state.items);
  const loading = useTimeEventsStore((state) => state.loading);
  const participantsLoadingEventId = useTimeEventsStore(
    (state) => state.participantsLoadingEventId,
  );
  const fetchAll = useTimeEventsStore((state) => state.fetchAll);
  const fetchParticipants = useTimeEventsStore((state) => state.fetchParticipants);
  const getParticipants = useTimeEventsStore((state) => state.getParticipants);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [participantsLimit, setParticipantsLimit] = useState(10);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const summary = useMemo(
    () => ({
      total: items.length,
      started: items.filter((item) => item.status === "started").length,
      waiting: items.filter((item) => item.status === "waiting").length,
      rewardPool: items.reduce(
        (sum, item) =>
          sum + getRewardTotal(item.rewardFirst, item.rewardSecond, item.rewardThird),
        0,
      ),
    }),
    [items],
  );

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortTimeEventsByPriority(
      items.filter((item) => {
        if (status !== "all" && item.status !== status) return false;
        if (!query) return true;
        return [item.name, item.description, item.eventType, item.status]
          .join(" ")
          .toLowerCase()
          .includes(query);
      }),
    );
  }, [items, search, status]);

  const selected = useMemo(
    () =>
      rows.find((item) => item.id === selectedId) ??
      (selectedId === null ? getFeaturedTimeEvent(rows) : null),
    [rows, selectedId],
  );

  useEffect(() => {
    if (!selected && rows.length > 0) {
      setSelectedId(rows[0].id);
      return;
    }
    if (selected && selectedId !== selected.id) {
      setSelectedId(selected.id);
    }
    if (rows.length === 0) {
      setSelectedId(null);
    }
  }, [rows, selected, selectedId]);

  useEffect(() => {
    if (!selected?.id) return;
    void fetchParticipants(selected.id, participantsLimit);
  }, [fetchParticipants, participantsLimit, selected?.id]);

  const participants = selected ? getParticipants(selected.id) : [];
  const rewardPool = selected
    ? getRewardTotal(selected.rewardFirst, selected.rewardSecond, selected.rewardThird)
    : 0;
  const isParticipantLoading = selected?.id
    ? participantsLoadingEventId === selected.id
    : false;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        pt: 1.5,
        pb: 3,
      }}
    >
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2, md: 2.6 },
            backgroundImage: theme.gradients.cardSoft,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={0.9}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventAvailableRoundedIcon color="primary" />
              <Typography variant="h4" fontWeight={800}>
                {t("page.title", { defaultValue: "Events" })}
              </Typography>
            </Stack>

            <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
              {t("page.subtitle", {
                defaultValue:
                  "Join weekly and custom events, compete through tracked actions, and climb the leaderboard for XP rewards.",
              })}
            </Typography>
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <EventAvailableRoundedIcon color="primary" />
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  {summary.total}
                </Typography>
                <Typography color="text.secondary">
                  {t("summary.total", { defaultValue: "Total events" })}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <LocalFireDepartmentRoundedIcon sx={{ color: theme.palette.success.main }} />
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  {summary.started}
                </Typography>
                <Typography color="text.secondary">
                  {t("summary.started", { defaultValue: "Active now" })}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <ScheduleRoundedIcon sx={{ color: theme.palette.warning.main }} />
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  {summary.waiting}
                </Typography>
                <Typography color="text.secondary">
                  {t("summary.waiting", { defaultValue: "Upcoming" })}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <EmojiEventsRoundedIcon sx={{ color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  {summary.rewardPool}
                </Typography>
                <Typography color="text.secondary">
                  {t("summary.rewardPool", { defaultValue: "XP reward pool" })}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>

        <Paper
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack gap={2}>
            <TextField
              label={t("filters.search", { defaultValue: "Search events" })}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {STATUS_FILTERS.map((option) => {
                const active = status === option;
                const label =
                  option === "all"
                    ? t("filters.all", { defaultValue: "All" })
                    : getTimeEventStatusLabel(option as TimeEventStatus, t);

                return (
                  <Chip
                    key={option}
                    label={label}
                    color={active ? "primary" : "default"}
                    variant={active ? "filled" : "outlined"}
                    onClick={() => setStatus(option)}
                  />
                );
              })}
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "minmax(320px, 34%) minmax(0, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            <Stack spacing={1.25}>
              <Typography fontWeight={900}>
                {t("list.title", { defaultValue: "Available events" })}
              </Typography>

              {loading ? (
                <Stack spacing={1}>
                  <Skeleton variant="rounded" height={110} />
                  <Skeleton variant="rounded" height={110} />
                  <Skeleton variant="rounded" height={110} />
                </Stack>
              ) : rows.length === 0 ? (
                <Typography color="text.secondary">
                  {t("empty.list", {
                    defaultValue: "No events match the current filter.",
                  })}
                </Typography>
              ) : (
                <Stack gap={1.2}>
                  {rows.map((item) => {
                    const active = item.id === selected?.id;
                    const pool = getRewardTotal(
                      item.rewardFirst,
                      item.rewardSecond,
                      item.rewardThird,
                    );

                    return (
                      <Paper
                        key={item.id}
                        variant="outlined"
                        onClick={() => setSelectedId(item.id)}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          borderRadius: 3,
                          borderColor: active
                            ? theme.palette.primary.main
                            : theme.customColors.sidebarBorder,
                          backgroundImage: active ? theme.gradients.cardSoft : "none",
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={800} noWrap>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {getTimeEventActionLabel(item.eventType, t)}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              color={item.status === "started" ? "success" : "default"}
                              label={getTimeEventStatusLabel(item.status, t)}
                            />
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                              size="small"
                              label={t("list.pool", {
                                defaultValue: "{{value}} XP pool",
                                value: pool,
                              })}
                            />
                            <Chip
                              size="small"
                              label={t("list.participants", {
                                defaultValue: "{{count}} participants",
                                count: item.participants.length,
                              })}
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            {formatTimeEventDateTime(item.startDate, i18n.language)} -{" "}
                            {formatTimeEventDateTime(item.endDate, i18n.language)}
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            {!selected ? (
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={800}>
                  {t("empty.detailsTitle", {
                    defaultValue: "Select an event",
                  })}
                </Typography>
                <Typography color="text.secondary">
                  {t("empty.detailsDescription", {
                    defaultValue:
                      "Choose a live or upcoming event to inspect rewards, timings, and the public leaderboard.",
                  })}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Box
                  sx={{
                    minHeight: 200,
                    borderRadius: 4,
                    p: 2.25,
                    color: "#fff",
                    backgroundImage:
                      "linear-gradient(135deg, rgba(14,116,144,0.94), rgba(30,64,175,0.9), rgba(88,28,135,0.88))",
                  }}
                >
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        size="small"
                        label={getTimeEventStatusLabel(selected.status, t)}
                        sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}
                      />
                      <Chip
                        size="small"
                        label={t("details.pool", {
                          defaultValue: "{{value}} XP reward pool",
                          value: rewardPool,
                        })}
                        sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}
                      />
                    </Stack>

                    <Typography variant="h4" fontWeight={900}>
                      {selected.name}
                    </Typography>

                    <Typography sx={{ opacity: 0.92 }}>
                      {selected.description ||
                        t("details.noDescription", {
                          defaultValue:
                            "This event tracks progress on selected actions and rewards the top participants with XP.",
                        })}
                    </Typography>

                    <Typography fontWeight={700}>
                      {getTimeEventActionLabel(selected.eventType, t)}
                    </Typography>

                    <Typography sx={{ opacity: 0.85 }}>
                      {formatTimeEventDateTime(selected.startDate, i18n.language)} -{" "}
                      {formatTimeEventDateTime(selected.endDate, i18n.language)}
                    </Typography>
                  </Stack>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} gap={1.25}>
                  <Chip
                    icon={<MilitaryTechRoundedIcon />}
                    label={t("details.firstPlace", {
                      defaultValue: "1st place: {{value}} XP",
                      value: selected.rewardFirst,
                    })}
                  />
                  <Chip
                    icon={<MilitaryTechRoundedIcon />}
                    label={t("details.secondPlace", {
                      defaultValue: "2nd place: {{value}} XP",
                      value: selected.rewardSecond,
                    })}
                  />
                  <Chip
                    icon={<MilitaryTechRoundedIcon />}
                    label={t("details.thirdPlace", {
                      defaultValue: "3rd place: {{value}} XP",
                      value: selected.rewardThird,
                    })}
                  />
                </Stack>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    justifyContent="space-between"
                    gap={1.5}
                    mb={1.5}
                  >
                    <Box>
                      <Typography fontWeight={900}>
                        {t("leaderboard.title", {
                          defaultValue: "Public leaderboard",
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("leaderboard.subtitle", {
                          defaultValue:
                            "Top participants are ranked by the tracked action count for this event.",
                        })}
                      </Typography>
                    </Box>

                    <TextField
                      label={t("leaderboard.limit", {
                        defaultValue: "Top users",
                      })}
                      value={participantsLimit}
                      onChange={(event) => {
                        const next = Number(event.target.value) || 10;
                        setParticipantsLimit(next);
                        void fetchParticipants(selected.id, next, true);
                      }}
                      select
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {PARTICIPANT_LIMIT_OPTIONS.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  {isParticipantLoading ? (
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" height={72} />
                      <Skeleton variant="rounded" height={72} />
                      <Skeleton variant="rounded" height={72} />
                    </Stack>
                  ) : participants.length === 0 ? (
                    <Typography color="text.secondary">
                      {t("leaderboard.empty", {
                        defaultValue: "No participants yet.",
                      })}
                    </Typography>
                  ) : (
                    <Stack gap={1.1}>
                      {participants.map((participant) => {
                        const isCurrentUser = participant.userId === currentUserId;

                        return (
                          <Paper
                            key={participant.id}
                            variant="outlined"
                            sx={{
                              p: 1.25,
                              borderRadius: 3,
                              borderColor: isCurrentUser
                                ? theme.palette.primary.main
                                : theme.customColors.sidebarBorder,
                              backgroundImage: isCurrentUser
                                ? theme.gradients.cardSoft
                                : "none",
                            }}
                          >
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              gap={1}
                            >
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <Avatar src={participant.user?.avatar || undefined}>
                                  {(participant.user?.username || "?")
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography fontWeight={800} noWrap>
                                    {participant.user?.username ||
                                      t("leaderboard.unknown", {
                                        defaultValue: "Unknown user",
                                      })}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {t("leaderboard.actionsCount", {
                                      defaultValue: "{{count}} tracked actions",
                                      count: participant.count,
                                    })}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Chip
                                  size="small"
                                  icon={<EmojiEventsRoundedIcon />}
                                  label={t("leaderboard.place", {
                                    defaultValue: "Place #{{value}}",
                                    value: participant.place || "—",
                                  })}
                                />
                                <Chip
                                  size="small"
                                  color={participant.isActive ? "success" : "default"}
                                  label={participant.isActive
                                    ? t("leaderboard.active", {
                                        defaultValue: "Active",
                                      })
                                    : t("leaderboard.inactive", {
                                        defaultValue: "Inactive",
                                      })}
                                />
                                {isCurrentUser ? (
                                  <Chip
                                    size="small"
                                    color="primary"
                                    label={t("leaderboard.you", {
                                      defaultValue: "You",
                                    })}
                                  />
                                ) : null}
                              </Stack>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              </Stack>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default EventsPage;
