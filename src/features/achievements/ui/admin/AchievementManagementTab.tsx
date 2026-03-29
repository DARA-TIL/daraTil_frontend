import React, { useEffect, useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  ACTION_OPTIONS,
  type AchievementAction,
} from "../../model/actions";
import type { Achievement } from "../../model/types";
import { getActionLabel } from "../../model/presentation";
import { useAchievementsAdminStore } from "../../store/useAchievementsAdminStore";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useUiStore } from "@/shared/store/useUiStore";
import { useTranslation } from "react-i18next";

type AchievementDraft = Achievement;

function createEmptyDraft(): AchievementDraft {
  return {
    id: 0,
    name: "",
    description: "",
    action: "lesson_completed",
    quantity: 1,
    iconUrl: null,
    userAchievements: [],
  };
}

function AchievementSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={120} />
    </Stack>
  );
}

export const AchievementManagementTab: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t } = useTranslation(["admin", "achievements"]);
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const items = useAchievementsAdminStore((state) => state.items);
  const loading = useAchievementsAdminStore((state) => state.loading);
  const selectedId = useAchievementsAdminStore((state) => state.selectedId);
  const selected = useAchievementsAdminStore((state) => state.selected);
  const selectedLoading = useAchievementsAdminStore((state) => state.selectedLoading);
  const actionLoading = useAchievementsAdminStore((state) => state.actionLoading);
  const filters = useAchievementsAdminStore((state) => state.filters);
  const setFilter = useAchievementsAdminStore((state) => state.setFilter);
  const resetFilters = useAchievementsAdminStore((state) => state.resetFilters);
  const getFilteredItems = useAchievementsAdminStore((state) => state.getFilteredItems);
  const fetchAll = useAchievementsAdminStore((state) => state.fetchAll);
  const selectById = useAchievementsAdminStore((state) => state.selectById);
  const clearSelected = useAchievementsAdminStore((state) => state.clearSelected);
  const create = useAchievementsAdminStore((state) => state.create);
  const update = useAchievementsAdminStore((state) => state.update);
  const remove = useAchievementsAdminStore((state) => state.delete);

  const [draft, setDraft] = useState<AchievementDraft>(createEmptyDraft());
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconUploading, setIconUploading] = useState(false);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!selected) {
      setDraft(createEmptyDraft());
      setIconFile(null);
      return;
    }

    setDraft({
      ...selected,
      iconUrl: selected.iconUrl ?? null,
      userAchievements: selected.userAchievements ?? [],
    });
    setIconFile(null);
  }, [selected]);

  const rows = useMemo(
    () =>
      [...getFilteredItems()].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    [filters, getFilteredItems, items],
  );

  async function uploadIconIfNeeded(): Promise<string | null> {
    if (!iconFile) return draft.iconUrl ?? null;

    const type = (iconFile.type || "").toLowerCase();
    const sizeMb = iconFile.size / (1024 * 1024);
    if (!type.startsWith("image/")) {
      showSnackbar(
        t("achievementsAdmin.validation.iconType", {
          ns: "admin",
          defaultValue: "Please select an image file.",
        }),
        "warning",
      );
      return null;
    }
    if (sizeMb > 5) {
      showSnackbar(
        t("achievementsAdmin.validation.iconTooLarge", {
          ns: "admin",
          defaultValue: "Image is too large (max {{max}}MB).",
          max: 5,
        }),
        "warning",
      );
      return null;
    }

    try {
      setIconUploading(true);
      const uploaded = await uploadToCloudinary(iconFile, {
        kind: "image",
        folder: "daratil/achievements/icons",
      });
      return uploaded.secureUrl;
    } catch {
      showSnackbar(
        t("achievementsAdmin.validation.iconUploadFailed", {
          ns: "admin",
          defaultValue: "Icon upload failed. Please try again.",
        }),
        "error",
      );
      return null;
    } finally {
      setIconUploading(false);
    }
  }

  const isCreateMode = !selected;
  const busy = actionLoading || iconUploading;

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
            {t("achievementsAdmin.title", {
              ns: "admin",
              defaultValue: "Achievements admin",
            })}
          </Typography>
          <Typography color="text.secondary">
            {t("achievementsAdmin.subtitle", {
              ns: "admin",
              defaultValue:
                "Create achievements, assign actions, define required quantity, and manage icon visuals.",
            })}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void fetchAll(true)}
          >
            {t("achievementsAdmin.actions.refresh", {
              ns: "admin",
              defaultValue: "Refresh achievements",
            })}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={clearSelected}
          >
            {t("achievementsAdmin.actions.new", {
              ns: "admin",
              defaultValue: "New achievement",
            })}
          </Button>
        </Stack>
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
        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
          <TextField
            label={t("common.search", { ns: "admin" })}
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            fullWidth
          />

          <TextField
            label={t("achievementsAdmin.fields.action", {
              ns: "admin",
              defaultValue: "Action",
            })}
            value={filters.action}
            onChange={(event) => setFilter("action", event.target.value)}
            select
            sx={{ minWidth: { md: 240 } }}
          >
            <MenuItem value="">{t("common.all", { ns: "admin" })}</MenuItem>
            {ACTION_OPTIONS.map((action) => (
              <MenuItem key={action} value={action}>
                {getActionLabel(action, t)}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={resetFilters} sx={{ minWidth: 140 }}>
            {t("common.reset", { ns: "admin" })}
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isDesktop
            ? "minmax(320px, 38%) minmax(0, 1fr)"
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
          <Stack spacing={1.2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmojiEventsRoundedIcon color="primary" />
              <Typography fontWeight={900}>
                {t("achievementsAdmin.listTitle", {
                  ns: "admin",
                  defaultValue: "Achievements",
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
              <Stack gap={1.1}>
                {rows.map((item) => {
                  const isSelected = item.id === selectedId;
                  const achievedUsers = item.userAchievements.filter(
                    (entry) => entry.achieved,
                  ).length;

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
                        backgroundImage: isSelected
                          ? theme.gradients.cardSoft
                          : "none",
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
                              {getActionLabel(item.action, t)}
                            </Typography>
                          </Box>

                          <Button
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => void selectById(item.id)}
                          >
                            {isSelected
                              ? t("achievementsAdmin.actions.editing", {
                                  ns: "admin",
                                  defaultValue: "Editing",
                                })
                              : t("common.edit", { ns: "admin" })}
                          </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            label={t("achievementsAdmin.labels.quantity", {
                              ns: "admin",
                              defaultValue: "Goal {{value}}",
                              value: item.quantity,
                            })}
                          />
                          <Chip
                            size="small"
                            label={t("achievementsAdmin.labels.achievedUsers", {
                              ns: "admin",
                              defaultValue: "Achieved by {{value}} users",
                              value: achievedUsers,
                            })}
                          />
                        </Stack>
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
            backgroundColor: "background.paper",
          }}
        >
          {selectedLoading ? (
            <AchievementSkeleton />
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  minHeight: 180,
                  borderRadius: 4,
                  p: 2.25,
                  color: "#fff",
                  backgroundImage: draft.iconUrl
                    ? `linear-gradient(180deg, rgba(15,23,42,0.24), rgba(15,23,42,0.84)), url(${draft.iconUrl})`
                    : "linear-gradient(135deg, rgba(245,158,11,0.92), rgba(234,88,12,0.9), rgba(37,99,235,0.84))",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="overline" sx={{ opacity: 0.88 }}>
                    {isCreateMode
                      ? t("achievementsAdmin.labels.createMode", {
                          ns: "admin",
                          defaultValue: "Create mode",
                        })
                      : t("achievementsAdmin.labels.editMode", {
                          ns: "admin",
                          defaultValue: "Edit mode",
                        })}
                  </Typography>
                  <Typography variant="h4" fontWeight={900}>
                    {draft.name ||
                      t("achievementsAdmin.labels.newAchievement", {
                        ns: "admin",
                        defaultValue: "New achievement",
                      })}
                  </Typography>
                  <Typography sx={{ opacity: 0.92 }}>
                    {getActionLabel(draft.action, t)}
                  </Typography>
                </Stack>
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("achievementsAdmin.fields.name", {
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
                  label={t("achievementsAdmin.fields.action", {
                    ns: "admin",
                    defaultValue: "Action",
                  })}
                  value={draft.action}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      action: event.target.value as AchievementAction,
                    }))
                  }
                  select
                  fullWidth
                >
                  {ACTION_OPTIONS.map((action) => (
                    <MenuItem key={action} value={action}>
                      {getActionLabel(action, t)}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("achievementsAdmin.fields.quantity", {
                    ns: "admin",
                    defaultValue: "Required quantity",
                  })}
                  type="number"
                  value={draft.quantity}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      quantity: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                  fullWidth
                />

                <TextField
                  label={t("achievementsAdmin.labels.usersTracked", {
                    ns: "admin",
                    defaultValue: "User progress entries",
                  })}
                  value={draft.userAchievements.length}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Stack>

              <TextField
                label={t("achievementsAdmin.fields.description", {
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

              <Stack spacing={1.25}>
                <Box
                  sx={{
                    minHeight: 132,
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor: alpha(theme.palette.warning.main, 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    backgroundImage: draft.iconUrl
                      ? `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.18)), url(${draft.iconUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {draft.iconUrl ? null : (
                    <Stack spacing={1} alignItems="center" color="text.secondary">
                      <ImageOutlinedIcon sx={{ fontSize: 52 }} />
                      <Typography variant="body2">
                        {t("achievementsAdmin.placeholderIcon", {
                          ns: "admin",
                          defaultValue: "No icon uploaded yet",
                        })}
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <FileUploadField
                  label={t("achievementsAdmin.fields.icon", {
                    ns: "admin",
                    defaultValue: "Icon",
                  })}
                  urlValue={draft.iconUrl ?? ""}
                  onUrlChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      iconUrl: value.trim() || null,
                    }))
                  }
                  file={iconFile}
                  onFileChange={setIconFile}
                  uploading={iconUploading}
                  uploadedUrl={draft.iconUrl}
                  accept="image/*"
                  helperText={t("achievementsAdmin.helpers.icon", {
                    ns: "admin",
                    defaultValue:
                      "Paste an image URL or upload a file. Uploads are stored in Cloudinary.",
                  })}
                />
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={1.25}
              >
                <Button variant="outlined" onClick={clearSelected}>
                  {t("achievementsAdmin.actions.resetForm", {
                    ns: "admin",
                    defaultValue: "Reset form",
                  })}
                </Button>

                <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                  {!isCreateMode ? (
                    <Button
                      color="error"
                      variant="text"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      disabled={busy}
                      onClick={async () => {
                        const confirmed = window.confirm(
                          t("achievementsAdmin.confirmDelete", {
                            ns: "admin",
                            defaultValue: "Delete this achievement?",
                          }),
                        );
                        if (!confirmed || !draft.id) return;

                        const ok = await remove(draft.id);
                        if (ok) {
                          showSnackbar(
                            t("achievementsAdmin.snackbar.deleted", {
                              ns: "admin",
                              defaultValue: "Achievement deleted",
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
                      const uploadedIcon = await uploadIconIfNeeded();
                      if (iconFile && !uploadedIcon) return;

                      const payload = {
                        ...draft,
                        name: draft.name.trim(),
                        description: draft.description.trim(),
                        quantity: Math.max(1, draft.quantity),
                        iconUrl: (uploadedIcon ?? draft.iconUrl) || null,
                      };

                      const ok = isCreateMode
                        ? await create(payload)
                        : await update(payload);

                      if (ok) {
                        setIconFile(null);
                        showSnackbar(
                          t(
                            isCreateMode
                              ? "achievementsAdmin.snackbar.created"
                              : "achievementsAdmin.snackbar.saved",
                            {
                              ns: "admin",
                              defaultValue: isCreateMode
                                ? "Achievement created"
                                : "Achievement saved",
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
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
