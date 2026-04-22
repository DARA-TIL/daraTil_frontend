import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/shared/store/useUiStore";
import { useLessonsAdminStore } from "@/features/lessons/store/useLessonAdminStore";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useTranslation } from "react-i18next";

const LessonsAdminPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const loading = useLessonsAdminStore((s) => s.loading);
  const items = useLessonsAdminStore((s) => s.items);
  const filters = useLessonsAdminStore((s) => s.filters);
  const setFilter = useLessonsAdminStore((s) => s.setFilter);
  const resetFilters = useLessonsAdminStore((s) => s.resetFilters);

  const fetchAll = useLessonsAdminStore((s) => s.fetchAll);
  const remove = useLessonsAdminStore((s) => s.remove);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((x) =>
      `${x.name} ${x.description} ${x.author}`.toLowerCase().includes(q),
    );
  }, [items, filters.search]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            {t("lessons.listTitle")}
          </Typography>
          <Typography color="text.secondary">
            {t("lessons.listSubtitle")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => nav("/app/admin/lessons/new")}
          sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
        >
          {t("lessons.actions.createLesson")}
        </Button>
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
            label={t("common.search")}
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{ minWidth: 140 }}
          >
            {t("common.reset")}
          </Button>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
        }}
      >
        {loading ? (
          <Typography color="text.secondary">{t("common.loading")}</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">{t("lessons.empty")}</Typography>
        ) : (
          <Stack gap={1.2}>
            {rows.map((x) => (
              <Paper
                key={x.ID}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  backgroundImage: theme.gradients.cardSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap>
                    {x.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {t("lessons.rowMeta", {
                      level: x.requiredLevel ?? 0,
                      reward: x.reward ?? 0,
                      blocks: x.blocks?.length ?? 0,
                      author: x.author ?? "",
                    })}
                  </Typography>
                </Box>

                <Stack direction="row" gap={1} flexShrink={0}>
                  <IconButton
                    onClick={() => nav(`/app/lessons/${x.ID}`)}
                    title={t("lessons.actions.openAsUser")}
                  >
                    <OpenInNewIcon />
                  </IconButton>

                  <IconButton
                    onClick={() => nav(`/app/admin/lessons/${x.ID}/edit`)}
                    title={t("common.edit")}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    title={t("common.delete")}
                    onClick={async () => {
                      const ok = await requestConfirm({
                        title: t("common.delete"),
                        message: t("lessons.confirmDeleteLesson", {
                          name: x.name,
                        }),
                        confirmLabel: t("common.delete"),
                        variant: "danger",
                      });
                      if (!ok) return;

                      const success = await remove(x.ID);
                      if (success)
                        showSnackbar(t("lessons.snackbar.deleted"), "success");
                      else
                        showSnackbar(
                          t("lessons.snackbar.deleteFailed"),
                          "error",
                        );
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

export default LessonsAdminPage;
