import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  ACTION_OPTIONS,
  type AchievementAction,
} from "@/features/achievements/model/actions";
import { getActionLabel } from "@/features/achievements/model/presentation";
import type { ActionRule } from "../../model/types";
import { useActionRulesAdminStore } from "../../store/useActionRulesAdminStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useTranslation } from "react-i18next";

const DEFAULT_RULE_KEYS = ["streak", "activity", "achievement"] as const;

function createEmptyRule(): ActionRule {
  return {
    action: "lesson_completed",
    rules: {
      streak: true,
      activity: true,
      achievement: true,
    },
  };
}

function ensureDefaultKeys(rule: ActionRule): ActionRule {
  const merged = { ...rule.rules };
  for (const key of DEFAULT_RULE_KEYS) {
    if (!(key in merged)) {
      merged[key] = false;
    }
  }

  return {
    ...rule,
    rules: merged,
  };
}

export const ActionRulesManagementTab: React.FC = () => {
  const { t } = useTranslation(["admin", "achievements"]);
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const items = useActionRulesAdminStore((state) => state.items);
  const loading = useActionRulesAdminStore((state) => state.loading);
  const actionLoading = useActionRulesAdminStore((state) => state.actionLoading);
  const filters = useActionRulesAdminStore((state) => state.filters);
  const setFilter = useActionRulesAdminStore((state) => state.setFilter);
  const resetFilters = useActionRulesAdminStore((state) => state.resetFilters);
  const getFilteredItems = useActionRulesAdminStore((state) => state.getFilteredItems);
  const fetchAll = useActionRulesAdminStore((state) => state.fetchAll);
  const create = useActionRulesAdminStore((state) => state.create);
  const update = useActionRulesAdminStore((state) => state.update);
  const remove = useActionRulesAdminStore((state) => state.delete);

  const [newRule, setNewRule] = useState<ActionRule>(createEmptyRule());
  const [drafts, setDrafts] = useState<Record<string, ActionRule>>({});

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        items.map((item) => [item.action, ensureDefaultKeys(item)]),
      ),
    );
  }, [items]);

  const rows = useMemo(
    () =>
      [...getFilteredItems()].sort((left, right) =>
        left.action.localeCompare(right.action),
      ),
    [filters, getFilteredItems, items],
  );

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            {t("actionRulesAdmin.title", {
              ns: "admin",
              defaultValue: "Action rules",
            })}
          </Typography>
          <Typography color="text.secondary">
            {t("actionRulesAdmin.subtitle", {
              ns: "admin",
              defaultValue:
                "Control whether each action affects streaks, activities, and achievements.",
            })}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void fetchAll(true)}
        >
          {t("actionRulesAdmin.actions.refresh", {
            ns: "admin",
            defaultValue: "Refresh rules",
          })}
        </Button>
      </Stack>

      <Paper
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
          <TextField
            label={t("common.search", { ns: "admin" })}
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            fullWidth
          />

          <Button variant="outlined" onClick={resetFilters} sx={{ minWidth: 140 }}>
            {t("common.reset", { ns: "admin" })}
          </Button>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddRoundedIcon color="primary" />
            <Typography fontWeight={900}>
              {t("actionRulesAdmin.createTitle", {
                ns: "admin",
                defaultValue: "Create action rule",
              })}
            </Typography>
          </Stack>

          <TextField
            label={t("actionRulesAdmin.fields.action", {
              ns: "admin",
              defaultValue: "Action",
            })}
            value={newRule.action}
            onChange={(event) =>
              setNewRule((current) => ({
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

          <Stack direction={{ xs: "column", sm: "row" }} useFlexGap flexWrap="wrap">
            {DEFAULT_RULE_KEYS.map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={Boolean(newRule.rules[key])}
                    onChange={(_, checked) =>
                      setNewRule((current) => ({
                        ...current,
                        rules: {
                          ...current.rules,
                          [key]: checked,
                        },
                      }))
                    }
                  />
                }
                label={t(`actionRulesAdmin.ruleKeys.${key}`, {
                  ns: "admin",
                  defaultValue: key,
                })}
              />
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              disabled={actionLoading || !newRule.action.trim()}
              onClick={async () => {
                const ok = await create(newRule);
                if (ok) {
                  showSnackbar(
                    t("actionRulesAdmin.snackbar.created", {
                      ns: "admin",
                      defaultValue: "Action rule created",
                    }),
                    "success",
                  );
                  setNewRule(createEmptyRule());
                }
              }}
            >
              {t("common.create", { ns: "admin" })}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TuneRoundedIcon color="primary" />
            <Typography fontWeight={900}>
              {t("actionRulesAdmin.listTitle", {
                ns: "admin",
                defaultValue: "Existing rules",
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
                const draft = drafts[item.action] ?? ensureDefaultKeys(item);
                const ruleKeys = Array.from(new Set([...DEFAULT_RULE_KEYS, ...Object.keys(draft.rules)]));

                return (
                  <Paper
                    key={item.action}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900}>
                            {getActionLabel(item.action, t)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.action}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={t("actionRulesAdmin.labels.ruleCount", {
                            ns: "admin",
                            defaultValue: "Rules: {{count}}",
                            count: Object.keys(draft.rules).length,
                          })}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} useFlexGap flexWrap="wrap">
                        {ruleKeys.map((key) => (
                          <FormControlLabel
                            key={key}
                            control={
                              <Switch
                                checked={Boolean(draft.rules[key])}
                                onChange={(_, checked) =>
                                  setDrafts((current) => ({
                                    ...current,
                                    [item.action]: {
                                      ...draft,
                                      rules: {
                                        ...draft.rules,
                                        [key]: checked,
                                      },
                                    },
                                  }))
                                }
                              />
                            }
                            label={t(`actionRulesAdmin.ruleKeys.${key}`, {
                              ns: "admin",
                              defaultValue: key,
                            })}
                          />
                        ))}
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" gap={1}>
                        <Button
                          variant="outlined"
                          startIcon={<SaveRoundedIcon />}
                          disabled={actionLoading}
                          onClick={async () => {
                            const ok = await update(draft);
                            if (ok) {
                              showSnackbar(
                                t("actionRulesAdmin.snackbar.saved", {
                                  ns: "admin",
                                  defaultValue: "Action rule saved",
                                }),
                                "success",
                              );
                            }
                          }}
                        >
                          {t("common.save", { ns: "admin" })}
                        </Button>

                        <Button
                          color="error"
                          variant="text"
                          startIcon={<DeleteOutlineRoundedIcon />}
                          disabled={actionLoading}
                          onClick={async () => {
                            const confirmed = await requestConfirm({
                              title: t("common.delete", { ns: "admin" }),
                              message: t("actionRulesAdmin.confirmDelete", {
                                ns: "admin",
                                defaultValue: "Delete this action rule?",
                              }),
                              confirmLabel: t("common.delete", { ns: "admin" }),
                              variant: "danger",
                            });
                            if (!confirmed) return;

                            const ok = await remove(item.action);
                            if (ok) {
                              showSnackbar(
                                t("actionRulesAdmin.snackbar.deleted", {
                                  ns: "admin",
                                  defaultValue: "Action rule deleted",
                                }),
                                "success",
                              );
                            }
                          }}
                        >
                          {t("common.delete", { ns: "admin" })}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};
