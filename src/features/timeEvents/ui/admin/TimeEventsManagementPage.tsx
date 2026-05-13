import React, { useEffect, useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import type {
  TimeEventAction,
  TimeEventCreateDto,
  TimeEventStatus,
  TimeEventUpdateDto,
} from "../../model/types";
import {
  EDITABLE_TIME_EVENT_STATUS_OPTIONS,
  TIME_EVENT_ACTION_OPTIONS,
} from "../../model/types";
import {
  addHoursToDate,
  formatTimeEventDateTime,
  formatTimeEventInputValue,
  getDurationLabel,
  getRewardTotal,
  getTimeEventActionLabel,
  getTimeEventStatusLabel,
  getTimeEventStatusTone,
  toApiDateTime,
} from "../../model/presentation";
import { useTimeEventsAdminStore } from "../../store/useTimeEventsAdminStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useTranslation } from "react-i18next";

type TimeEventDraft = TimeEventUpdateDto;

function roundToNextHour(date: Date): Date {
  const result = new Date(date);
  result.setMinutes(0, 0, 0);
  return result;
}

function createEmptyDraft(): TimeEventDraft {
  const start = roundToNextHour(new Date());
  const end = new Date(start);
  end.setHours(end.getHours() + 168);

  return {
    id: 0,
    name: "",
    description: "",
    eventType: "lesson_completed",
    status: "started",
    duration: 168,
    startDate: formatTimeEventInputValue(start.toISOString()),
    endDate: formatTimeEventInputValue(end.toISOString()),
    rewardFirst: 300,
    rewardSecond: 200,
    rewardThird: 100,
  };
}

function TimeEventDetailsSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={160} />
    </Stack>
  );
}

function RewardCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 3,
        minWidth: 110,
        backgroundColor: alpha(tone, 0.1),
        borderColor: alpha(tone, 0.25),
      }}
    >
      <Typography fontWeight={900} fontSize={22}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export const TimeEventsManagementPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const { t, i18n } = useTranslation(["admin", "achievements"]);
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const items = useTimeEventsAdminStore((state) => state.items);
  const selectedId = useTimeEventsAdminStore((state) => state.selectedId);
  const selected = useTimeEventsAdminStore((state) => state.selected);
  const loading = useTimeEventsAdminStore((state) => state.loading);
  const selectedLoading = useTimeEventsAdminStore((state) => state.selectedLoading);
  const participants = useTimeEventsAdminStore((state) => state.participants);
  const participantsLoading = useTimeEventsAdminStore(
    (state) => state.participantsLoading,
  );
  const selectedParticipantId = useTimeEventsAdminStore(
    (state) => state.selectedParticipantId,
  );
  const selectedParticipant = useTimeEventsAdminStore(
    (state) => state.selectedParticipant,
  );
  const selectedParticipantLoading = useTimeEventsAdminStore(
    (state) => state.selectedParticipantLoading,
  );
  const participantsLimit = useTimeEventsAdminStore(
    (state) => state.participantsLimit,
  );
  const actionLoading = useTimeEventsAdminStore((state) => state.actionLoading);
  const filters = useTimeEventsAdminStore((state) => state.filters);
  const setFilter = useTimeEventsAdminStore((state) => state.setFilter);
  const resetFilters = useTimeEventsAdminStore((state) => state.resetFilters);
  const setParticipantsLimit = useTimeEventsAdminStore(
    (state) => state.setParticipantsLimit,
  );
  const getFilteredItems = useTimeEventsAdminStore(
    (state) => state.getFilteredItems,
  );
  const fetchAll = useTimeEventsAdminStore((state) => state.fetchAll);
  const selectById = useTimeEventsAdminStore((state) => state.selectById);
  const clearSelected = useTimeEventsAdminStore((state) => state.clearSelected);
  const fetchParticipants = useTimeEventsAdminStore(
    (state) => state.fetchParticipants,
  );
  const selectParticipantById = useTimeEventsAdminStore(
    (state) => state.selectParticipantById,
  );
  const clearSelectedParticipant = useTimeEventsAdminStore(
    (state) => state.clearSelectedParticipant,
  );
  const create = useTimeEventsAdminStore((state) => state.create);
  const update = useTimeEventsAdminStore((state) => state.update);
  const finish = useTimeEventsAdminStore((state) => state.finish);
  const remove = useTimeEventsAdminStore((state) => state.delete);

  const [draft, setDraft] = useState<TimeEventDraft>(createEmptyDraft());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!selected) {
      setDraft(createEmptyDraft());
      return;
    }

    setDraft({
      id: selected.id,
      name: selected.name,
      description: selected.description,
      eventType: selected.eventType,
      status: selected.status,
      duration: Math.max(1, selected.duration),
      startDate: formatTimeEventInputValue(selected.startDate),
      endDate: formatTimeEventInputValue(selected.endDate),
      rewardFirst: selected.rewardFirst,
      rewardSecond: selected.rewardSecond,
      rewardThird: selected.rewardThird,
    });
  }, [selected]);

  const rows = getFilteredItems();

  useEffect(() => {
    setPage(1);
  }, [
    filters.search,
    filters.eventType,
    filters.status,
    filters.startDateFrom,
    filters.startDateTo,
    filters.endDateFrom,
    filters.endDateTo,
  ]);

  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  const summary = useMemo(
    () => ({
      total: items.length,
      started: items.filter((item) => item.status === "started").length,
      waiting: items.filter((item) => item.status === "waiting").length,
      ended: items.filter((item) => item.status === "ended").length,
    }),
    [items],
  );

  const isCreateMode = !selectedId;
  const busy = actionLoading;
  const statusOptions = useMemo(() => {
    const options = [...EDITABLE_TIME_EVENT_STATUS_OPTIONS];
    if (draft.status === "ended") {
      return ["ended", ...options];
    }
    return options;
  }, [draft.status]);

  function syncEndDateFromDuration(startDateValue: string, durationValue: number) {
    const apiValue = toApiDateTime(startDateValue);
    if (!apiValue) return "";
    return formatTimeEventInputValue(addHoursToDate(apiValue, durationValue));
  }

  function handleStartDateChange(value: string) {
    setDraft((current) => ({
      ...current,
      startDate: value,
      endDate: syncEndDateFromDuration(value, current.duration),
    }));
  }

  function handleDurationChange(value: number) {
    setDraft((current) => ({
      ...current,
      duration: Math.max(1, value),
      endDate: syncEndDateFromDuration(current.startDate, Math.max(1, value)),
    }));
  }

  function handleEndDateChange(value: string) {
    setDraft((current) => {
      const start = new Date(current.startDate);
      const end = new Date(value);
      const duration =
        Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
          ? current.duration
          : Math.max(1, Math.round((end.getTime() - start.getTime()) / 3600000));

      return {
        ...current,
        endDate: value,
        duration,
      };
    });
  }

  function toPayload():
    | TimeEventCreateDto
    | TimeEventUpdateDto
    | null {
    const name = draft.name.trim();
    const startDate = toApiDateTime(draft.startDate);
    const endDate = toApiDateTime(draft.endDate);

    if (!name || !startDate || !endDate) {
      showSnackbar(
        t("timeEvents.validation.required", {
          ns: "admin",
          defaultValue: "Fill in the required fields before saving.",
        }),
        "warning",
      );
      return null;
    }

    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      showSnackbar(
        t("timeEvents.validation.endAfterStart", {
          ns: "admin",
          defaultValue: "End date must be later than start date.",
        }),
        "warning",
      );
      return null;
    }

      const base = {
        description: draft.description.trim(),
        duration: Math.max(1, Math.round(draft.duration)),
        endDate,
        eventType: draft.eventType,
        name,
      rewardFirst: Math.max(0, Math.round(draft.rewardFirst)),
      rewardSecond: Math.max(0, Math.round(draft.rewardSecond)),
      rewardThird: Math.max(0, Math.round(draft.rewardThird)),
      startDate,
      status: draft.status,
    } satisfies TimeEventCreateDto;

      if (isCreateMode) {
        if (draft.status === "ended") {
          showSnackbar(
            t("timeEvents.validation.noEndedCreate", {
              ns: "admin",
              defaultValue: "A new event cannot be created with ended status.",
            }),
            "warning",
          );
          return null;
        }
        return {
          ...base,
          status: draft.status as Exclude<TimeEventStatus, "ended">,
        };
      }

      return {
        ...base,
        id: draft.id,
    } satisfies TimeEventUpdateDto;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            {t("timeEvents.title", {
              ns: "admin",
              defaultValue: "Time events",
            })}
          </Typography>
          <Typography color="text.secondary">
            {t("timeEvents.subtitle", {
              ns: "admin",
              defaultValue:
                "Manage weekly and custom competitive events, define tracked actions, and distribute XP rewards to top participants.",
            })}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void fetchAll(true)}
          >
            {t("timeEvents.actions.refresh", {
              ns: "admin",
              defaultValue: "Refresh events",
            })}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              clearSelected();
              clearSelectedParticipant();
            }}
          >
            {t("timeEvents.actions.new", {
              ns: "admin",
              defaultValue: "New event",
            })}
          </Button>
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Paper
          sx={{
            flex: 1,
            p: 2,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundImage: theme.gradients.cardSoft,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <EventAvailableRoundedIcon color="primary" />
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {summary.total}
              </Typography>
              <Typography color="text.secondary">
                {t("timeEvents.summary.total", {
                  ns: "admin",
                  defaultValue: "Total events",
                })}
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
            <FlagRoundedIcon sx={{ color: theme.palette.success.main }} />
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {summary.started}
              </Typography>
              <Typography color="text.secondary">
                {t("timeEvents.summary.started", {
                  ns: "admin",
                  defaultValue: "Live now",
                })}
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
            <AccessTimeRoundedIcon sx={{ color: theme.palette.warning.main }} />
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {summary.waiting}
              </Typography>
              <Typography color="text.secondary">
                {t("timeEvents.summary.waiting", {
                  ns: "admin",
                  defaultValue: "Scheduled",
                })}
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
            <DoneAllRoundedIcon sx={{ color: theme.palette.info.main }} />
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {summary.ended}
              </Typography>
              <Typography color="text.secondary">
                {t("timeEvents.summary.ended", {
                  ns: "admin",
                  defaultValue: "Finished",
                })}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      <Paper
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
        }}
      >
        <Stack gap={2}>
          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              label={t("common.search", { ns: "admin" })}
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              fullWidth
            />

            <TextField
              label={t("timeEvents.fields.eventType", {
                ns: "admin",
                defaultValue: "Action",
              })}
              value={filters.eventType}
              onChange={(event) => setFilter("eventType", event.target.value)}
              select
              sx={{ minWidth: { md: 240 } }}
            >
              <MenuItem value="">{t("common.all", { ns: "admin" })}</MenuItem>
              {TIME_EVENT_ACTION_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {getTimeEventActionLabel(option, t)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("timeEvents.fields.status", {
                ns: "admin",
                defaultValue: "Status",
              })}
              value={filters.status}
              onChange={(event) => setFilter("status", event.target.value)}
              select
              sx={{ minWidth: { md: 200 } }}
            >
              <MenuItem value="">{t("common.all", { ns: "admin" })}</MenuItem>
              {["started", "waiting", "ended", "canceled"].map((option) => (
                <MenuItem key={option} value={option}>
                  {getTimeEventStatusLabel(option, t)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              label={t("timeEvents.fields.startDateFrom", {
                ns: "admin",
                defaultValue: "Start from",
              })}
              type="datetime-local"
              value={filters.startDateFrom}
              onChange={(event) => setFilter("startDateFrom", event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={t("timeEvents.fields.startDateTo", {
                ns: "admin",
                defaultValue: "Start to",
              })}
              type="datetime-local"
              value={filters.startDateTo}
              onChange={(event) => setFilter("startDateTo", event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={t("timeEvents.fields.endDateFrom", {
                ns: "admin",
                defaultValue: "End from",
              })}
              type="datetime-local"
              value={filters.endDateFrom}
              onChange={(event) => setFilter("endDateFrom", event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={t("timeEvents.fields.endDateTo", {
                ns: "admin",
                defaultValue: "End to",
              })}
              type="datetime-local"
              value={filters.endDateTo}
              onChange={(event) => setFilter("endDateTo", event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              onClick={() => {
                resetFilters();
                void fetchAll(true);
              }}
            >
              {t("common.reset", { ns: "admin" })}
            </Button>
            <Button
              variant="contained"
              onClick={() => void fetchAll(true)}
            >
              {t("timeEvents.actions.applyFilters", {
                ns: "admin",
                defaultValue: "Apply filters",
              })}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isDesktop
            ? "minmax(320px, 34%) minmax(0, 1fr)"
            : "minmax(0, 1fr)",
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
            backgroundColor: "background.paper",
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EventAvailableRoundedIcon color="primary" />
              <Typography fontWeight={900}>
                {t("timeEvents.listTitle", {
                  ns: "admin",
                  defaultValue: "Events",
                })}
              </Typography>
            </Stack>

            {loading ? (
              <Typography color="text.secondary">
                {t("common.loading", { ns: "admin" })}
              </Typography>
            ) : rows.length === 0 ? (
              <Typography color="text.secondary">
                {t("common.empty", { ns: "admin" })}
              </Typography>
            ) : (
              <Stack gap={1.2}>
                {paginatedRows.map((item) => {
                  const isSelected = item.id === selectedId;
                  const rewardTotal = getRewardTotal(
                    item.rewardFirst,
                    item.rewardSecond,
                    item.rewardThird,
                  );

                  return (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        borderColor: isSelected
                          ? theme.palette.primary.main
                          : theme.customColors.sidebarBorder,
                        backgroundImage: isSelected ? theme.gradients.cardSoft : "none",
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          gap={1}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={900} noWrap>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {getTimeEventActionLabel(item.eventType, t)}
                            </Typography>
                          </Box>

                          <Button
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => void selectById(item.id)}
                          >
                            {isSelected
                              ? t("timeEvents.actions.editing", {
                                  ns: "admin",
                                  defaultValue: "Editing",
                                })
                              : t("common.edit", { ns: "admin" })}
                          </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            color={getTimeEventStatusTone(item.status)}
                            label={getTimeEventStatusLabel(item.status, t)}
                          />
                          <Chip
                            size="small"
                            label={t("timeEvents.labels.rewardPool", {
                              ns: "admin",
                              defaultValue: "Pool {{value}} XP",
                              value: rewardTotal,
                            })}
                          />
                          <Chip
                            size="small"
                            label={getDurationLabel(item.duration, t)}
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

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "center" }}
                  gap={1.25}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("regions.pagination.summary", {
                      ns: "admin",
                      defaultValue: "Showing {{from}}-{{to}} of {{total}}",
                      from: (page - 1) * rowsPerPage + 1,
                      to: Math.min(page * rowsPerPage, rows.length),
                      total: rows.length,
                    })}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
                    <TextField
                      label={t("regions.pagination.perPage", {
                        ns: "admin",
                        defaultValue: "Per page",
                      })}
                      value={rowsPerPage}
                      onChange={(event) => {
                        setRowsPerPage(Number(event.target.value) || 6);
                        setPage(1);
                      }}
                      select
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {[3, 6, 9, 12].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Pagination
                      page={page}
                      count={pageCount}
                      color="primary"
                      shape="rounded"
                      onChange={(_, nextPage) => setPage(nextPage)}
                    />
                  </Stack>
                </Stack>
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
            backgroundColor: "background.paper",
          }}
        >
          {selectedLoading ? (
            <TimeEventDetailsSkeleton />
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  minHeight: 180,
                  borderRadius: 4,
                  p: 2.25,
                  color: "#fff",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(14,116,144,0.94), rgba(30,64,175,0.9), rgba(88,28,135,0.88))",
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      color="default"
                      label={
                        isCreateMode
                          ? t("timeEvents.labels.createMode", {
                              ns: "admin",
                              defaultValue: "Create mode",
                            })
                          : t("timeEvents.labels.editMode", {
                              ns: "admin",
                              defaultValue: "Edit mode",
                            })
                      }
                      sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }}
                    />
                    {!isCreateMode ? (
                      <Chip
                        size="small"
                        label={getTimeEventStatusLabel(selected?.status ?? draft.status, t)}
                        sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}
                      />
                    ) : null}
                  </Stack>

                  <Typography variant="h4" fontWeight={900}>
                    {draft.name ||
                      t("timeEvents.labels.newEvent", {
                        ns: "admin",
                        defaultValue: "New time event",
                      })}
                  </Typography>

                  <Typography sx={{ opacity: 0.92 }}>
                    {getTimeEventActionLabel(draft.eventType, t)}
                  </Typography>

                  <Typography sx={{ opacity: 0.82 }}>
                    {draft.startDate && draft.endDate
                      ? `${formatTimeEventDateTime(
                          toApiDateTime(draft.startDate),
                          i18n.language,
                        )} - ${formatTimeEventDateTime(
                          toApiDateTime(draft.endDate),
                          i18n.language,
                        )}`
                      : t("timeEvents.emptyRange", {
                          ns: "admin",
                          defaultValue: "Choose the event time window",
                        })}
                  </Typography>
                </Stack>
              </Box>

              <Stack direction={{ xs: "column", lg: "row" }} gap={1.5}>
                <RewardCard
                  value={draft.rewardFirst}
                  label={t("timeEvents.labels.firstPlace", {
                    ns: "admin",
                    defaultValue: "1st place XP",
                  })}
                  tone={theme.palette.warning.main}
                />
                <RewardCard
                  value={draft.rewardSecond}
                  label={t("timeEvents.labels.secondPlace", {
                    ns: "admin",
                    defaultValue: "2nd place XP",
                  })}
                  tone={theme.palette.info.main}
                />
                <RewardCard
                  value={draft.rewardThird}
                  label={t("timeEvents.labels.thirdPlace", {
                    ns: "admin",
                    defaultValue: "3rd place XP",
                  })}
                  tone={theme.palette.success.main}
                />
                <RewardCard
                  value={getRewardTotal(
                    draft.rewardFirst,
                    draft.rewardSecond,
                    draft.rewardThird,
                  )}
                  label={t("timeEvents.labels.rewardPoolShort", {
                    ns: "admin",
                    defaultValue: "Reward pool",
                  })}
                  tone={theme.palette.primary.main}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("timeEvents.fields.name", {
                    ns: "admin",
                    defaultValue: "Name",
                  })}
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  fullWidth
                />

                <TextField
                  label={t("timeEvents.fields.eventType", {
                    ns: "admin",
                    defaultValue: "Action",
                  })}
                  value={draft.eventType}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      eventType: event.target.value as TimeEventAction,
                    }))
                  }
                  select
                  fullWidth
                >
                  {TIME_EVENT_ACTION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {getTimeEventActionLabel(option, t)}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("timeEvents.fields.status", {
                    ns: "admin",
                    defaultValue: "Status",
                  })}
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target.value as TimeEventStatus,
                    }))
                  }
                  select
                  disabled={selected?.status === "ended"}
                  fullWidth
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {getTimeEventStatusLabel(option, t)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label={t("timeEvents.fields.duration", {
                    ns: "admin",
                    defaultValue: "Duration (hours)",
                  })}
                  type="number"
                  value={draft.duration}
                  onChange={(event) =>
                    handleDurationChange(Number(event.target.value) || 1)
                  }
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("timeEvents.fields.startDate", {
                    ns: "admin",
                    defaultValue: "Start date",
                  })}
                  type="datetime-local"
                  value={draft.startDate}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label={t("timeEvents.fields.endDate", {
                    ns: "admin",
                    defaultValue: "End date",
                  })}
                  type="datetime-local"
                  value={draft.endDate}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("timeEvents.fields.rewardFirst", {
                    ns: "admin",
                    defaultValue: "Reward for 1st place",
                  })}
                  type="number"
                  value={draft.rewardFirst}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      rewardFirst: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label={t("timeEvents.fields.rewardSecond", {
                    ns: "admin",
                    defaultValue: "Reward for 2nd place",
                  })}
                  type="number"
                  value={draft.rewardSecond}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      rewardSecond: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label={t("timeEvents.fields.rewardThird", {
                    ns: "admin",
                    defaultValue: "Reward for 3rd place",
                  })}
                  type="number"
                  value={draft.rewardThird}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      rewardThird: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  fullWidth
                />
              </Stack>

              <TextField
                label={t("timeEvents.fields.description", {
                  ns: "admin",
                  defaultValue: "Description",
                })}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                multiline
                minRows={4}
                fullWidth
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={1.25}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    clearSelected();
                    clearSelectedParticipant();
                  }}
                >
                  {t("timeEvents.actions.resetForm", {
                    ns: "admin",
                    defaultValue: "Reset form",
                  })}
                </Button>

                <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                  {!isCreateMode ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<EmojiEventsRoundedIcon />}
                      disabled={busy || selected?.status === "ended"}
                      onClick={async () => {
                        if (!selectedId) return;

                        const confirmed = await requestConfirm({
                          title: t("timeEvents.actions.finish", {
                            ns: "admin",
                            defaultValue: "Finish event",
                          }),
                          message: t("timeEvents.confirmFinish", {
                            ns: "admin",
                            defaultValue:
                              "Finish this event now and distribute rewards to winners?",
                          }),
                          confirmLabel: t("timeEvents.actions.finish", {
                            ns: "admin",
                            defaultValue: "Finish event",
                          }),
                        });

                        if (!confirmed) return;

                        const ok = await finish(selectedId);
                        if (ok) {
                          showSnackbar(
                            t("timeEvents.snackbar.finished", {
                              ns: "admin",
                              defaultValue: "Time event finished",
                            }),
                            "success",
                          );
                        }
                      }}
                    >
                      {t("timeEvents.actions.finish", {
                        ns: "admin",
                        defaultValue: "Finish event",
                      })}
                    </Button>
                  ) : null}

                  {!isCreateMode ? (
                    <Button
                      color="error"
                      variant="text"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      disabled={busy}
                      onClick={async () => {
                        if (!draft.id) return;

                        const confirmed = await requestConfirm({
                          title: t("common.delete", { ns: "admin" }),
                          message: t("timeEvents.confirmDelete", {
                            ns: "admin",
                            defaultValue: "Delete this time event?",
                          }),
                          confirmLabel: t("common.delete", { ns: "admin" }),
                          variant: "danger",
                        });

                        if (!confirmed) return;

                        const ok = await remove(draft.id);
                        if (ok) {
                          showSnackbar(
                            t("timeEvents.snackbar.deleted", {
                              ns: "admin",
                              defaultValue: "Time event deleted",
                            }),
                            "success",
                          );
                        }
                      }}
                    >
                      {t("common.delete", { ns: "admin" })}
                    </Button>
                  ) : null}

                  <Button
                    variant="contained"
                    startIcon={isCreateMode ? <AddRoundedIcon /> : <SaveRoundedIcon />}
                    disabled={busy || !draft.name.trim()}
                    onClick={async () => {
                      const payload = toPayload();
                      if (!payload) return;

                      const ok = isCreateMode
                        ? await create(payload as TimeEventCreateDto)
                        : await update(payload as TimeEventUpdateDto);

                      if (ok) {
                        showSnackbar(
                          t(
                            isCreateMode
                              ? "timeEvents.snackbar.created"
                              : "timeEvents.snackbar.saved",
                            {
                              ns: "admin",
                              defaultValue: isCreateMode
                                ? "Time event created"
                                : "Time event saved",
                            },
                          ),
                          "success",
                        );
                      }
                    }}
                  >
                    {isCreateMode
                      ? t("common.create", { ns: "admin" })
                      : t("common.save", { ns: "admin" })}
                  </Button>
                </Stack>
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
                      {t("timeEvents.participants.title", {
                        ns: "admin",
                        defaultValue: "Participants leaderboard",
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("timeEvents.participants.subtitle", {
                        ns: "admin",
                        defaultValue:
                          "Inspect top participants, action counts, and the current podium before finishing the event.",
                      })}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                    <TextField
                      label={t("timeEvents.participants.limit", {
                        ns: "admin",
                        defaultValue: "Top users",
                      })}
                      value={participantsLimit}
                      onChange={(event) => {
                        const nextLimit = Number(event.target.value) || 10;
                        setParticipantsLimit(nextLimit);
                        void fetchParticipants(nextLimit);
                      }}
                      select
                      size="small"
                      sx={{ minWidth: 120 }}
                      disabled={!selectedId}
                    >
                      {[3, 10, 25, 50].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshRoundedIcon />}
                      disabled={!selectedId}
                      onClick={() => void fetchParticipants(participantsLimit)}
                    >
                      {t("timeEvents.actions.refreshParticipants", {
                        ns: "admin",
                        defaultValue: "Refresh leaderboard",
                      })}
                    </Button>
                  </Stack>
                </Stack>

                {!selectedId ? (
                  <Typography color="text.secondary">
                    {t("timeEvents.participants.emptyNoEvent", {
                      ns: "admin",
                      defaultValue:
                        "Select an event to inspect its participants leaderboard.",
                    })}
                  </Typography>
                ) : participantsLoading ? (
                  <Stack spacing={1}>
                    <Skeleton variant="rounded" height={72} />
                    <Skeleton variant="rounded" height={72} />
                    <Skeleton variant="rounded" height={72} />
                  </Stack>
                ) : participants.length === 0 ? (
                  <Typography color="text.secondary">
                    {t("timeEvents.participants.empty", {
                      ns: "admin",
                      defaultValue: "No participants yet.",
                    })}
                  </Typography>
                ) : (
                  <Stack gap={1.1}>
                    {participants.map((participant) => {
                      const isSelectedParticipant =
                        participant.id === selectedParticipantId;

                      return (
                        <Paper
                          key={participant.id}
                          variant="outlined"
                          sx={{
                            p: 1.25,
                            borderRadius: 3,
                            cursor: "pointer",
                            borderColor: isSelectedParticipant
                              ? theme.palette.primary.main
                              : theme.customColors.sidebarBorder,
                            backgroundImage: isSelectedParticipant
                              ? theme.gradients.cardSoft
                              : "none",
                          }}
                          onClick={() => void selectParticipantById(participant.id)}
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
                                    t("usersAdmin.labels.unknown", {
                                      ns: "admin",
                                      defaultValue: "Unknown",
                                    })}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {t("timeEvents.participants.countLabel", {
                                    ns: "admin",
                                    defaultValue: "{{count}} actions tracked",
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
                                icon={<MilitaryTechRoundedIcon />}
                                label={t("timeEvents.participants.place", {
                                  ns: "admin",
                                  defaultValue: "Place #{{value}}",
                                  value: participant.place || "—",
                                })}
                              />
                              <Chip
                                size="small"
                                color={participant.isActive ? "success" : "default"}
                                label={participant.isActive
                                  ? t("timeEvents.participants.active", {
                                      ns: "admin",
                                      defaultValue: "Active",
                                    })
                                  : t("timeEvents.participants.inactive", {
                                      ns: "admin",
                                      defaultValue: "Inactive",
                                    })}
                              />
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}

                {selectedParticipantLoading ? (
                  <Skeleton variant="rounded" height={120} sx={{ mt: 1.5 }} />
                ) : selectedParticipant ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 3,
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <GroupsRoundedIcon color="primary" />
                        <Typography fontWeight={900}>
                          {t("timeEvents.participants.detailsTitle", {
                            ns: "admin",
                            defaultValue: "Selected participant",
                          })}
                        </Typography>
                      </Stack>

                      <Typography fontWeight={800}>
                        {selectedParticipant.user?.username ||
                          t("usersAdmin.labels.unknown", {
                            ns: "admin",
                            defaultValue: "Unknown",
                          })}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={t("timeEvents.participants.place", {
                            ns: "admin",
                            defaultValue: "Place #{{value}}",
                            value: selectedParticipant.place || "—",
                          })}
                        />
                        <Chip
                          size="small"
                          label={t("timeEvents.participants.countLabel", {
                            ns: "admin",
                            defaultValue: "{{count}} actions tracked",
                            count: selectedParticipant.count,
                          })}
                        />
                        <Chip
                          size="small"
                          label={t("timeEvents.participants.level", {
                            ns: "admin",
                            defaultValue: "Level {{value}}",
                            value: selectedParticipant.user?.progress?.level ?? 0,
                          })}
                        />
                        <Chip
                          size="small"
                          label={t("timeEvents.participants.streak", {
                            ns: "admin",
                            defaultValue: "Streak {{value}}",
                            value: selectedParticipant.user?.streak?.currentStreak ?? 0,
                          })}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Paper>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
