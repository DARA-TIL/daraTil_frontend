import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useFolkloreAdminStore } from "@/features/folklore/store/useFolkloreAdminStore";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useTranslation } from "react-i18next";

const TYPES = ["proverb", "story", "song", "legend", "aitys", "kui"];
const REGIONS = [
  "Almaty",
  "Astana",
  "Shymkent",
  "Batys",
  "Soltustik",
  "Ontustik",
];

const FolkloreAdminPage: React.FC = () => {
  const nav = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tFolklore } = useTranslation("folklore");

  const loading = useFolkloreAdminStore((s) => s.loading);
  const fetchAllIfNeeded = useFolkloreAdminStore((s) => s.fetchAllIfNeeded);
  const remove = useFolkloreAdminStore((s) => s.remove);

  const filters = useFolkloreAdminStore((s) => s.filters);
  const setFilter = useFolkloreAdminStore((s) => s.setFilter);
  const resetFilters = useFolkloreAdminStore((s) => s.resetFilters);
  const getFilteredItems = useFolkloreAdminStore((s) => s.getFilteredItems);

  useEffect(() => {
    fetchAllIfNeeded();
  }, [fetchAllIfNeeded]);

  const rows = useMemo(() => getFilteredItems(), [getFilteredItems, filters]);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={800}>
          {t("folklore.listTitle")}
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => nav("/app/admin/folklore/new")}
        >
          {t("common.create")}
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
          <TextField
            label={t("common.search")}
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            fullWidth
          />

          <TextField
            label={t("folklore.fields.type")}
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            select
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>

            {TYPES.map((tpe) => (
              <MenuItem key={tpe} value={tpe}>
                {tFolklore(`types.${tpe}`, { defaultValue: tpe })}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t("folklore.fields.region")}
            value={filters.region}
            onChange={(e) => setFilter("region", e.target.value)}
            select
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>

            {REGIONS.map((r) => (
              <MenuItem key={r} value={r}>
                {tFolklore(`regions.${r}`, { defaultValue: r })}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={resetFilters}>
            {t("common.reset")}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography color="text.secondary">{t("common.loading")}</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">{t("common.empty")}</Typography>
        ) : (
          <Stack gap={1}>
            {rows.map((x) => (
              <Paper
                key={x.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {x.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {x.type} - {x.region} - {x.author} - ❤️ {x.likesCount}
                  </Typography>
                </Box>

                <Stack direction="row" gap={1} flexShrink={0}>
                  <IconButton
                    onClick={() => nav(`/app/admin/folklore/${x.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    onClick={async () => {
                      const ok = await requestConfirm({
                        title: t("common.delete"),
                        message: t("folklore.confirmDelete"),
                        confirmLabel: t("common.delete"),
                        variant: "danger",
                      });
                      if (!ok) return;
                      await remove(x.id);
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default FolkloreAdminPage;
