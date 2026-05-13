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
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useUiStore } from "@/shared/store/useUiStore";
import NotificationCard from "../NotificationCard";
import NotificationDetailsPanel from "../NotificationDetailsPanel";
import { useNotificationsAdminStore } from "../../store/useNotificationsAdminStore";
import type {
  AppNotification,
  NotificationScope,
  NotificationType,
} from "../../model/types";
import {
  getNotificationHeading,
  getNotificationScopeLabel,
  getNotificationTypeLabel,
} from "../../model/presentation";

type NotificationDraft = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  scope: NotificationScope;
  userId: string;
  entityId: string;
  isActive: boolean;
};

const PAGE_SIZE = 8;

function createEmptyDraft(): NotificationDraft {
  return {
    id: 0,
    title: "",
    message: "",
    type: "system",
    scope: "global",
    userId: "",
    entityId: "",
    isActive: true,
  };
}

function toDraft(notification: AppNotification): NotificationDraft {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    scope: notification.scope,
    userId: notification.userId ? String(notification.userId) : "",
    entityId: notification.entityId ? String(notification.entityId) : "",
    isActive: notification.isActive,
  };
}

function asOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : undefined;
}

const NotificationsManagementPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(["admin", "notifications"]);
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const items = useNotificationsAdminStore((state) => state.items);
  const loading = useNotificationsAdminStore((state) => state.loading);
  const actionLoading = useNotificationsAdminStore((state) => state.actionLoading);
  const selectedId = useNotificationsAdminStore((state) => state.selectedId);
  const filters = useNotificationsAdminStore((state) => state.filters);
  const fetchAll = useNotificationsAdminStore((state) => state.fetchAll);
  const create = useNotificationsAdminStore((state) => state.create);
  const update = useNotificationsAdminStore((state) => state.update);
  const deleteById = useNotificationsAdminStore((state) => state.deleteById);
  const selectById = useNotificationsAdminStore((state) => state.selectById);
  const setFilter = useNotificationsAdminStore((state) => state.setFilter);
  const resetFilters = useNotificationsAdminStore((state) => state.resetFilters);
  const getFilteredItems = useNotificationsAdminStore(
    (state) => state.getFilteredItems,
  );

  const [draft, setDraft] = useState<NotificationDraft>(createEmptyDraft());
  const [page, setPage] = useState(1);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setDraft(createEmptyDraft());
      return;
    }
    setDraft(toDraft(selected));
  }, [selected]);

  const rows = useMemo(() => getFilteredItems(), [getFilteredItems]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [page, rows]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.scope, filters.type, filters.limit]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const isCreateMode = !selected;

  async function handleSave() {
    const title = draft.title.trim();
    const message = draft.message.trim();

    if (!title || !message) return;
    const userId = asOptionalNumber(draft.userId);

    if (draft.scope === "user" && !userId) {
      showSnackbar(
        t("notificationsAdmin.validation.userIdRequired", {
          ns: "admin",
          defaultValue: "User ID is required for user-scoped notifications.",
        }),
        "warning",
      );
      return;
    }

    if (isCreateMode) {
      await create({
        title,
        message,
        type: draft.type,
        scope: draft.scope,
        userId: draft.scope === "user" ? userId : undefined,
        entityId: asOptionalNumber(draft.entityId),
      });
      setDraft(createEmptyDraft());
      selectById(null);
      return;
    }

    await update({
      id: draft.id,
      title,
      message,
      type: draft.type,
      scope: draft.scope,
      isActive: draft.isActive,
    });
  }

  async function handleDelete(id: number) {
    const confirmed = await requestConfirm({
      title: t("notificationsAdmin.confirmDeleteTitle", {
        ns: "admin",
        defaultValue: "Delete notification?",
      }),
      message: t("notificationsAdmin.confirmDelete", {
        ns: "admin",
        defaultValue:
          "This permanently deletes the notification record from the backend.",
      }),
      confirmLabel: t("common.delete", {
        ns: "admin",
        defaultValue: "Delete",
      }),
      variant: "danger",
    });

    if (!confirmed) return;
    const ok = await deleteById(id);
    if (!ok) return;

    if (selectedId === id) {
      setDraft(createEmptyDraft());
    }
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
            {t("notificationsAdmin.title", {
              ns: "admin",
              defaultValue: "Notifications admin",
            })}
          </Typography>
          <Typography color="text.secondary">
            {t("notificationsAdmin.subtitle", {
              ns: "admin",
              defaultValue:
                "Create global or user-scoped notifications, edit active records, and delete notifications by ID. The list reflects notifications visible to the current admin account.",
            })}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void fetchAll(true)}
          >
            {t("notificationsAdmin.actions.refresh", {
              ns: "admin",
              defaultValue: "Refresh notifications",
            })}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              selectById(null);
              setDraft(createEmptyDraft());
            }}
          >
            {t("notificationsAdmin.actions.new", {
              ns: "admin",
              defaultValue: "New notification",
            })}
          </Button>
        </Stack>
      </Stack>

      <Paper
        sx={{
          mb: 2,
          p: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <TextField
            label={t("common.search", { ns: "admin", defaultValue: "Search" })}
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            fullWidth
          />

          <TextField
            select
            label={t("notificationsAdmin.fields.type", {
              ns: "admin",
              defaultValue: "Type",
            })}
            value={filters.type}
            onChange={(event) =>
              setFilter("type", event.target.value as NotificationType | "all")
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">
              {t("common.all", { ns: "admin", defaultValue: "All" })}
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
            label={t("notificationsAdmin.fields.scope", {
              ns: "admin",
              defaultValue: "Scope",
            })}
            value={filters.scope}
            onChange={(event) =>
              setFilter("scope", event.target.value as NotificationScope | "all")
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">
              {t("common.all", { ns: "admin", defaultValue: "All" })}
            </MenuItem>
            <MenuItem value="global">
              {t("notifications.scopes.global", {
                ns: "notifications",
                defaultValue: "Global",
              })}
            </MenuItem>
            <MenuItem value="user">
              {t("notifications.scopes.user", {
                ns: "notifications",
                defaultValue: "User",
              })}
            </MenuItem>
          </TextField>

          <TextField
            select
            label={t("notificationsAdmin.fields.limit", {
              ns: "admin",
              defaultValue: "Load limit",
            })}
            value={filters.limit}
            onChange={(event) =>
              setFilter("limit", Number(event.target.value) || 100)
            }
            sx={{ minWidth: 160 }}
          >
            {[25, 50, 100, 200].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            onClick={() => {
              resetFilters();
              void fetchAll(true);
            }}
          >
            {t("common.reset", { ns: "admin", defaultValue: "Reset" })}
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(360px, 38%) minmax(0, 1fr)" },
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
              {t("notificationsAdmin.listTitle", {
                ns: "admin",
                defaultValue: "Notifications list",
              })}
            </Typography>

            {loading ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={114} />
                <Skeleton variant="rounded" height={114} />
                <Skeleton variant="rounded" height={114} />
              </Stack>
            ) : rows.length === 0 ? (
              <Typography color="text.secondary">
                {t("common.empty", {
                  ns: "admin",
                  defaultValue: "No items",
                })}
              </Typography>
            ) : (
              <Stack spacing={1.1}>
                {paginatedRows.map((item) => (
                  <NotificationCard
                    key={item.id}
                    notification={item}
                    selected={selectedId === item.id}
                    onClick={() => selectById(item.id)}
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

        <Stack spacing={2}>
          <Paper
            sx={{
              p: 2.25,
              borderRadius: 4,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              backgroundImage: theme.gradients.cardSoft,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                gap={1}
              >
                <Box>
                  <Typography fontWeight={900} fontSize={18}>
                    {isCreateMode
                      ? t("notificationsAdmin.labels.createMode", {
                          ns: "admin",
                          defaultValue: "Create mode",
                        })
                      : t("notificationsAdmin.labels.editMode", {
                          ns: "admin",
                          defaultValue: "Edit mode",
                        })}
                  </Typography>
                  <Typography color="text.secondary">
                    {isCreateMode
                      ? t("notificationsAdmin.labels.createDescription", {
                          ns: "admin",
                          defaultValue:
                            "Draft a global announcement or a user-targeted notification.",
                        })
                      : selected
                        ? getNotificationHeading(selected, t)
                        : t("notificationsAdmin.labels.editDescription", {
                            ns: "admin",
                            defaultValue: "Update the selected notification.",
                          })}
                  </Typography>
                </Box>

                {!isCreateMode && selected ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      color={selected.isActive ? "success" : "default"}
                      label={selected.isActive
                        ? t("notificationsAdmin.states.active", {
                            ns: "admin",
                            defaultValue: "Active",
                          })
                        : t("notificationsAdmin.states.inactive", {
                            ns: "admin",
                            defaultValue: "Inactive",
                          })}
                    />
                    <Chip
                      size="small"
                      label={getNotificationScopeLabel(selected.scope, t)}
                    />
                  </Stack>
                ) : null}
              </Stack>

              <TextField
                label={t("notificationsAdmin.fields.title", {
                  ns: "admin",
                  defaultValue: "Title",
                })}
                value={draft.title}
                onChange={(event) =>
                  setDraft((state) => ({ ...state, title: event.target.value }))
                }
                fullWidth
              />

              <TextField
                label={t("notificationsAdmin.fields.message", {
                  ns: "admin",
                  defaultValue: "Message",
                })}
                value={draft.message}
                onChange={(event) =>
                  setDraft((state) => ({ ...state, message: event.target.value }))
                }
                multiline
                minRows={4}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                <TextField
                  select
                  label={t("notificationsAdmin.fields.type", {
                    ns: "admin",
                    defaultValue: "Type",
                  })}
                  value={draft.type}
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      type: event.target.value as NotificationType,
                    }))
                  }
                  fullWidth
                >
                  {(
                    ["system", "event", "streak", "reward", "logOut"] as NotificationType[]
                  ).map((option) => (
                    <MenuItem key={option} value={option}>
                      {getNotificationTypeLabel(option, t)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label={t("notificationsAdmin.fields.scope", {
                    ns: "admin",
                    defaultValue: "Scope",
                  })}
                  value={draft.scope}
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      scope: event.target.value as NotificationScope,
                      userId:
                        event.target.value === "global" ? "" : state.userId,
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="global">
                    {t("notifications.scopes.global", {
                      ns: "notifications",
                      defaultValue: "Global",
                    })}
                  </MenuItem>
                  <MenuItem value="user">
                    {t("notifications.scopes.user", {
                      ns: "notifications",
                      defaultValue: "User",
                    })}
                  </MenuItem>
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                <TextField
                  label={t("notificationsAdmin.fields.userId", {
                    ns: "admin",
                    defaultValue: "User ID",
                  })}
                  value={draft.userId}
                  onChange={(event) =>
                    setDraft((state) => ({ ...state, userId: event.target.value }))
                  }
                  disabled={draft.scope === "global"}
                  fullWidth
                  helperText={t("notificationsAdmin.helpers.userId", {
                    ns: "admin",
                    defaultValue:
                      "Required only for user-scoped notifications.",
                  })}
                />

                <TextField
                  label={t("notificationsAdmin.fields.entityId", {
                    ns: "admin",
                    defaultValue: "Entity ID",
                  })}
                  value={draft.entityId}
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      entityId: event.target.value,
                    }))
                  }
                  fullWidth
                  helperText={t("notificationsAdmin.helpers.entityId", {
                    ns: "admin",
                    defaultValue:
                      "Optional related entity reference from the backend domain.",
                  })}
                />
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="center">
                <Switch
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      isActive: event.target.checked,
                    }))
                  }
                />
                <Typography>
                  {t("notificationsAdmin.fields.isActive", {
                    ns: "admin",
                    defaultValue: "Active record",
                  })}
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                <Button
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  disabled={actionLoading || !draft.title.trim() || !draft.message.trim()}
                  onClick={() => {
                    void handleSave();
                  }}
                >
                  {isCreateMode
                    ? t("common.create", {
                        ns: "admin",
                        defaultValue: "Create",
                      })
                    : t("common.save", {
                        ns: "admin",
                        defaultValue: "Save",
                      })}
                </Button>

                {!isCreateMode ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    disabled={actionLoading || !draft.id}
                    onClick={() => {
                      void handleDelete(draft.id);
                    }}
                  >
                    {t("common.delete", {
                      ns: "admin",
                      defaultValue: "Delete",
                    })}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          <NotificationDetailsPanel
            notification={selected}
            onDelete={
              selected
                ? () => {
                    void handleDelete(selected.id);
                  }
                : undefined
            }
          />

          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <NotificationsRoundedIcon color="primary" />
              <Typography fontWeight={900}>
                {t("notificationsAdmin.backendNoteTitle", {
                  ns: "admin",
                  defaultValue: "Backend note",
                })}
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              {t("notificationsAdmin.backendNote", {
                ns: "admin",
                defaultValue:
                  "This list reflects global notifications and personal notifications visible to the currently authenticated admin. The backend does not expose a dedicated list-all-users-notifications endpoint yet.",
              })}
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotificationsManagementPage;
