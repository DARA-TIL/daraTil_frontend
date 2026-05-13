import React, { useEffect, useMemo, useState } from "react";
import {
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
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import NotificationCard from "@/features/notifications/ui/NotificationCard";
import NotificationDetailsPanel from "@/features/notifications/ui/NotificationDetailsPanel";
import { useNotificationsStore } from "@/features/notifications/store/useNotificationsStore";
import {
  getNotificationChipColor,
  getNotificationTypeLabel,
} from "@/features/notifications/model/presentation";
import type {
  AppNotification,
  NotificationQuery,
  NotificationScope,
  NotificationType,
} from "@/features/notifications/model/types";

type TypeFilter = "all" | NotificationType;
type ScopeFilter = "all" | NotificationScope;

const LIMIT_OPTIONS = [12, 24, 48, 96];
const PAGE_SIZE = 8;

const NotificationsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("notifications");

  const items = useNotificationsStore((state) => state.items);
  const loading = useNotificationsStore((state) => state.loading);
  const detailLoading = useNotificationsStore((state) => state.detailLoading);
  const actionLoading = useNotificationsStore((state) => state.actionLoading);
  const fetchFeed = useNotificationsStore((state) => state.fetchFeed);
  const fetchById = useNotificationsStore((state) => state.fetchById);
  const deleteMine = useNotificationsStore((state) => state.deleteMine);
  const clearMine = useNotificationsStore((state) => state.clearMine);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [limit, setLimit] = useState(24);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<AppNotification | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const query: NotificationQuery = {
      limit,
      type: type === "all" ? undefined : type,
      scope: scope === "all" ? undefined : scope,
    };

    void fetchFeed(query).then((nextItems) => {
      if (nextItems.length === 0) {
        setSelectedId(null);
        setSelectedItem(null);
        return;
      }

      setSelectedId((current) =>
        current && nextItems.some((item) => item.id === current)
          ? current
          : nextItems[0].id,
      );
    });
  }, [fetchFeed, limit, scope, type]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(null);
      return;
    }

    setSelectedItem(items.find((item) => item.id === selectedId) ?? null);
  }, [items, selectedId]);

  useEffect(() => {
    setPage(1);
  }, [search, type, scope, limit]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [item.title, item.message, item.type, item.scope]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [page, rows]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (!selectedId) return;
    if (!rows.some((item) => item.id === selectedId)) {
      const fallback = rows[0] ?? null;
      setSelectedId(fallback?.id ?? null);
      setSelectedItem(fallback);
    }
  }, [rows, selectedId]);

  const summary = useMemo(
    () => ({
      total: items.length,
      reward: items.filter((item) => item.type === "reward").length,
      event: items.filter((item) => item.type === "event").length,
      global: items.filter((item) => item.scope === "global").length,
    }),
    [items],
  );

  const activeDetail =
    (selectedId ? items.find((item) => item.id === selectedId) : null) ??
    selectedItem;

  async function handleDelete(id: number) {
    const confirmed = await requestConfirm({
      title: t("confirm.deleteTitle", {
        defaultValue: "Remove notification?",
      }),
      message: t("confirm.deleteMessage", {
        defaultValue: "This notification will be hidden from your personal list.",
      }),
      confirmLabel: t("actions.remove", {
        defaultValue: "Remove",
      }),
      variant: "danger",
    });

    if (!confirmed) return;

    const ok = await deleteMine(id);
    if (!ok) return;

    if (selectedId === id) {
      const fallback = rows.find((item) => item.id !== id) ?? null;
      setSelectedId(fallback?.id ?? null);
      setSelectedItem(fallback);
    }
  }

  async function handleClearAll() {
    const confirmed = await requestConfirm({
      title: t("confirm.clearTitle", {
        defaultValue: "Clear notifications?",
      }),
      message: t("confirm.clearMessage", {
        defaultValue:
          "This will hide all notifications from your current list.",
      }),
      confirmLabel: t("actions.clearAll", {
        defaultValue: "Clear all",
      }),
      variant: "danger",
    });

    if (!confirmed) return;

    const ok = await clearMine();
    if (!ok) return;

    setSelectedId(null);
    setSelectedItem(null);
  }

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 1.5, pb: 3 }}>
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
              <NotificationsRoundedIcon color="primary" />
              <Typography variant="h4" fontWeight={800}>
                {t("page.title", { defaultValue: "Notifications" })}
              </Typography>
            </Stack>

            <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
              {t("page.subtitle", {
                defaultValue:
                  "Review system updates, reward messages, streak changes, and event announcements in one place.",
              })}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {t("page.readBehavior", {
                defaultValue:
                  "Opening this center syncs your recent notifications and marks the loaded items as seen.",
              })}
            </Typography>
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper sx={{ flex: 1, p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h4" fontWeight={900}>
              {summary.total}
            </Typography>
            <Typography color="text.secondary">
              {t("summary.total", { defaultValue: "Loaded notifications" })}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h4" fontWeight={900}>
              {summary.reward}
            </Typography>
            <Typography color="text.secondary">
              {t("summary.reward", { defaultValue: "Rewards" })}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h4" fontWeight={900}>
              {summary.event}
            </Typography>
            <Typography color="text.secondary">
              {t("summary.event", { defaultValue: "Events" })}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h4" fontWeight={900}>
              {summary.global}
            </Typography>
            <Typography color="text.secondary">
              {t("summary.global", { defaultValue: "Global messages" })}
            </Typography>
          </Paper>
        </Stack>

        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack gap={2}>
            <TextField
              label={t("filters.search", {
                defaultValue: "Search notifications",
              })}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.25}
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <TextField
                select
                label={t("filters.type", { defaultValue: "Type" })}
                value={type}
                onChange={(event) => setType(event.target.value as TypeFilter)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">
                  {t("filters.allTypes", { defaultValue: "All types" })}
                </MenuItem>
                {(["system", "event", "streak", "reward", "logOut"] as NotificationType[]).map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {getNotificationTypeLabel(option, t)}
                    </MenuItem>
                  ),
                )}
              </TextField>

              <TextField
                select
                label={t("filters.scope", { defaultValue: "Scope" })}
                value={scope}
                onChange={(event) => setScope(event.target.value as ScopeFilter)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">
                  {t("filters.allScopes", { defaultValue: "All scopes" })}
                </MenuItem>
                <MenuItem value="user">
                  {t("scopes.user", { defaultValue: "User" })}
                </MenuItem>
                <MenuItem value="global">
                  {t("scopes.global", { defaultValue: "Global" })}
                </MenuItem>
              </TextField>

              <TextField
                select
                label={t("filters.limit", { defaultValue: "Limit" })}
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value) || 24)}
                sx={{ minWidth: 160 }}
              >
                {LIMIT_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => {
                    void fetchFeed({
                      limit,
                      type: type === "all" ? undefined : type,
                      scope: scope === "all" ? undefined : scope,
                    });
                  }}
                >
                  {t("actions.refresh", { defaultValue: "Refresh" })}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepRoundedIcon />}
                  disabled={actionLoading || items.length === 0}
                  onClick={() => {
                    void handleClearAll();
                  }}
                >
                  {t("actions.clearAll", { defaultValue: "Clear all" })}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "minmax(340px, 38%) minmax(0, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1.25}>
              <Typography fontWeight={900}>
                {t("list.title", { defaultValue: "Recent notifications" })}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(["system", "event", "streak", "reward", "logOut"] as NotificationType[]).map(
                  (itemType) => (
                    <Chip
                      key={itemType}
                      size="small"
                      color={getNotificationChipColor(itemType)}
                      label={`${getNotificationTypeLabel(itemType, t)}: ${
                        items.filter((item) => item.type === itemType).length
                      }`}
                    />
                  ),
                )}
              </Stack>

              {loading ? (
                <Stack spacing={1}>
                  <Skeleton variant="rounded" height={114} />
                  <Skeleton variant="rounded" height={114} />
                  <Skeleton variant="rounded" height={114} />
                </Stack>
              ) : rows.length === 0 ? (
                <Typography color="text.secondary">
                  {t("empty.description", {
                    defaultValue:
                      "When the platform has updates for you, they will appear here in real time.",
                  })}
                </Typography>
              ) : (
                <Stack spacing={1.1}>
                  {paginatedRows.map((item) => (
                    <NotificationCard
                      key={item.id}
                      notification={item}
                      selected={selectedId === item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        setSelectedItem(item);
                        void fetchById(item.id).then((next) => {
                          if (next) {
                            setSelectedItem(next);
                          }
                        });
                      }}
                      onDelete={() => {
                        void handleDelete(item.id);
                      }}
                    />
                  ))}
                </Stack>
              )}

              {rows.length > PAGE_SIZE ? (
                <Pagination
                  page={page}
                  count={pageCount}
                  onChange={(_, value) => setPage(value)}
                />
              ) : null}
            </Stack>
          </Paper>

          {detailLoading && !activeDetail ? (
            <Paper
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={220} />
                <Skeleton variant="rounded" height={48} />
                <Skeleton variant="rounded" height={48} />
              </Stack>
            </Paper>
          ) : (
            <NotificationDetailsPanel
              notification={activeDetail}
              onDelete={
                activeDetail
                  ? () => {
                      void handleDelete(activeDetail.id);
                    }
                  : undefined
              }
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default NotificationsPage;
