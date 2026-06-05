import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  getRegionDisplayName,
  normalizeRegionLanguage,
} from "@/features/regions/model/helpers";
import { useRegionsAdminStore } from "@/features/regions/store/useRegionsAdminStore";
import { RegionAdminEditor } from "@/features/regions/ui/admin/RegionAdminEditor";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useUiStore } from "@/shared/store/useUiStore";

type CreateRegionDraft = {
  code: string;
  kind: string;
  requiredLevel: number;
  isActive: boolean;
  imageUrl: string;
};

function createEmptyRegionDraft(): CreateRegionDraft {
  return {
    code: "",
    kind: "region",
    requiredLevel: 1,
    isActive: true,
    imageUrl: "",
  };
}

const RegionsAdminPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t, i18n } = useTranslation("admin");
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateRegionDraft>(
    createEmptyRegionDraft(),
  );

  const loading = useRegionsAdminStore((state) => state.loading);
  const selectedId = useRegionsAdminStore((state) => state.selectedId);
  const selected = useRegionsAdminStore((state) => state.selected);
  const selectedLoading = useRegionsAdminStore((state) => state.selectedLoading);
  const filters = useRegionsAdminStore((state) => state.filters);
  const setFilter = useRegionsAdminStore((state) => state.setFilter);
  const resetFilters = useRegionsAdminStore((state) => state.resetFilters);
  const getFilteredItems = useRegionsAdminStore((state) => state.getFilteredItems);
  const fetchAll = useRegionsAdminStore((state) => state.fetchAll);
  const selectById = useRegionsAdminStore((state) => state.selectById);
  const actionLoading = useRegionsAdminStore((state) => state.actionLoading);
  const createRegion = useRegionsAdminStore((state) => state.createRegion);
  const createAllRegions = useRegionsAdminStore((state) => state.createAllRegions);
  const deleteRegion = useRegionsAdminStore((state) => state.deleteRegion);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const displayLanguage = normalizeRegionLanguage(i18n.resolvedLanguage ?? "en");

  const rows = [...getFilteredItems()].sort((left, right) =>
    getRegionDisplayName(left, displayLanguage, left.code).localeCompare(
      getRegionDisplayName(right, displayLanguage, right.code),
    ),
  );

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.kind, filters.state]);

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
            {t("regions.title", { defaultValue: "Regions admin" })}
          </Typography>
          <Typography color="text.secondary">
            {t("regions.subtitle", {
              defaultValue:
                "Manage region metadata, translations, dialects, traditions, and drawer imagery for the interactive map.",
            })}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void fetchAll(true)}
          >
            {t("regions.actions.refresh", { defaultValue: "Refresh regions" })}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            disabled={actionLoading}
            onClick={async () => {
              const ok = await requestConfirm({
                title: t("regions.actions.importAll", {
                  defaultValue: "Import default regions",
                }),
                message: t("regions.confirmCreateAll", {
                  defaultValue:
                    "Create all pre-imported Kazakhstan regions from backend geojson?",
                }),
                confirmLabel: t("regions.actions.importAll", {
                  defaultValue: "Import all",
                }),
              });
              if (!ok) return;
              const created = await createAllRegions();
              if (created) {
                showSnackbar(
                  t("regions.snackbar.imported", {
                    defaultValue: "Default regions imported",
                  }),
                  "success",
                );
              }
            }}
          >
            {t("regions.actions.importAll", { defaultValue: "Import all" })}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setShowCreateForm((current) => !current)}
          >
            {t("regions.actions.newRegion", { defaultValue: "New region" })}
          </Button>
          {selectedId ? (
            <Button
              color="error"
              variant="text"
              startIcon={<DeleteOutlineRoundedIcon />}
              disabled={actionLoading}
              onClick={async () => {
                const ok = await requestConfirm({
                  title: t("regions.actions.deleteRegion", {
                    defaultValue: "Delete region",
                  }),
                  message: t("regions.confirmDeleteRegion", {
                    defaultValue: "Delete selected region?",
                  }),
                  confirmLabel: t("common.delete"),
                  variant: "danger",
                });
                if (!ok) return;
                const deleted = await deleteRegion(selectedId);
                if (deleted) {
                  showSnackbar(
                    t("regions.snackbar.deleted", {
                      defaultValue: "Region deleted",
                    }),
                    "success",
                  );
                }
              }}
            >
              {t("common.delete")}
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {showCreateForm ? (
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
            <Typography fontWeight={900}>
              {t("regions.createTitle", { defaultValue: "Create region" })}
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} gap={2}>
              <TextField
                label={t("regions.fields.code", { defaultValue: "Code" })}
                value={createDraft.code}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label={t("regions.fields.kind", { defaultValue: "Kind" })}
                value={createDraft.kind}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    kind: event.target.value,
                  }))
                }
                select
                fullWidth
              >
                <MenuItem value="region">
                  {t("regions.kind.region", { defaultValue: "Region" })}
                </MenuItem>
                <MenuItem value="city">
                  {t("regions.kind.city", { defaultValue: "City" })}
                </MenuItem>
              </TextField>
              <TextField
                label={t("regions.fields.requiredLevel", {
                  defaultValue: "Required level",
                })}
                value={createDraft.requiredLevel}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    requiredLevel: Math.max(1, Number(event.target.value) || 1),
                  }))
                }
                type="number"
                fullWidth
              />
              <TextField
                label={t("regions.fields.isActive", { defaultValue: "Active" })}
                value={createDraft.isActive ? "true" : "false"}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    isActive: event.target.value === "true",
                  }))
                }
                select
                fullWidth
              >
                <MenuItem value="true">
                  {t("regions.state.active", { defaultValue: "Active" })}
                </MenuItem>
                <MenuItem value="false">
                  {t("regions.state.inactive", { defaultValue: "Inactive" })}
                </MenuItem>
              </TextField>
            </Stack>
            <TextField
              label={t("regions.fields.image", { defaultValue: "Region image" })}
              value={createDraft.imageUrl}
              onChange={(event) =>
                setCreateDraft((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                disabled={actionLoading || !createDraft.code.trim()}
                onClick={async () => {
                  const ok = await createRegion({
                    code: createDraft.code.trim(),
                    kind: createDraft.kind,
                    requiredLevel: createDraft.requiredLevel,
                    isActive: createDraft.isActive,
                    imageUrl: createDraft.imageUrl.trim() || null,
                    regionSlang: [],
                    regionTraditions: [],
                    translations: [],
                  });
                  if (ok) {
                    setCreateDraft(createEmptyRegionDraft());
                    setShowCreateForm(false);
                    showSnackbar(
                      t("regions.snackbar.created", {
                        defaultValue: "Region created",
                      }),
                      "success",
                    );
                  }
                }}
              >
                {t("common.create")}
              </Button>
              <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                {t("common.cancel")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

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
            label={t("common.search")}
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            fullWidth
          />

          <TextField
            label={t("regions.filters.kind", { defaultValue: "Kind" })}
            value={filters.kind}
            onChange={(event) => setFilter("kind", event.target.value)}
            select
            sx={{ minWidth: { md: 180 } }}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="region">
              {t("regions.kind.region", { defaultValue: "Region" })}
            </MenuItem>
            <MenuItem value="city">
              {t("regions.kind.city", { defaultValue: "City" })}
            </MenuItem>
          </TextField>

          <TextField
            label={t("regions.filters.state", { defaultValue: "State" })}
            value={filters.state}
            onChange={(event) => setFilter("state", event.target.value)}
            select
            sx={{ minWidth: { md: 180 } }}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="active">
              {t("regions.state.active", { defaultValue: "Active" })}
            </MenuItem>
            <MenuItem value="inactive">
              {t("regions.state.inactive", { defaultValue: "Inactive" })}
            </MenuItem>
          </TextField>

          <Button variant="outlined" onClick={resetFilters} sx={{ minWidth: 140 }}>
            {t("common.reset")}
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
              <PublicRoundedIcon color="primary" />
              <Typography fontWeight={900}>
                {t("regions.listTitle", { defaultValue: "Imported regions" })}
              </Typography>
            </Stack>

            {loading ? (
              <Typography color="text.secondary">{t("common.loading")}</Typography>
            ) : rows.length === 0 ? (
              <Typography color="text.secondary">{t("common.empty")}</Typography>
            ) : (
              <Stack gap={1.4}>
                <Stack gap={1.1}>
                  {paginatedRows.map((region) => {
                    const name = getRegionDisplayName(
                      region,
                      displayLanguage,
                      region.code,
                    );
                    const isSelected = selectedId === region.id;

                    return (
                      <Paper
                        key={region.id}
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
                        <Stack spacing={1.2}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={900} noWrap>
                                {name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t("regions.labels.regionCode", {
                                  defaultValue: "Code: {{code}}",
                                  code: region.code,
                                })}
                              </Typography>
                            </Box>

                            <Button
                              variant={isSelected ? "contained" : "outlined"}
                              startIcon={<EditRoundedIcon />}
                              onClick={() => void selectById(region.id)}
                              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                            >
                              {isSelected
                                ? t("regions.actions.editing", {
                                    defaultValue: "Editing",
                                  })
                                : t("common.edit")}
                            </Button>
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                              size="small"
                              label={region.kind === "city"
                                ? t("regions.kind.city", { defaultValue: "City" })
                                : t("regions.kind.region", { defaultValue: "Region" })}
                            />
                            <Chip
                              size="small"
                              label={region.isActive
                                ? t("regions.state.active", { defaultValue: "Active" })
                                : t("regions.state.inactive", { defaultValue: "Inactive" })}
                            />
                            <Chip
                              size="small"
                              label={t("regions.labels.levelBadge", {
                                defaultValue: "Level {{level}}",
                                level: region.requiredLevel,
                              })}
                            />
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "center" }}
                  gap={1.25}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("regions.pagination.summary", {
                      defaultValue: "Showing {{from}}-{{to}} of {{total}}",
                      from: (page - 1) * rowsPerPage + 1,
                      to: Math.min(page * rowsPerPage, rows.length),
                      total: rows.length,
                    })}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={1.25}
                  >
                    <TextField
                      label={t("regions.pagination.perPage", {
                        defaultValue: "Per page",
                      })}
                      value={rowsPerPage}
                      onChange={(event) => {
                        setRowsPerPage(Number(event.target.value) || 8);
                        setPage(1);
                      }}
                      select
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {[6, 8, 12, 16].map((value) => (
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

        <RegionAdminEditor region={selected} loading={selectedLoading} />
      </Box>
    </Box>
  );
};

export default RegionsAdminPage;
