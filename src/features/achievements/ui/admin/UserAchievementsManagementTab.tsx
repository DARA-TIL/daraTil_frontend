import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AchievementAdminService from "../../api/AchievementAdminService";
import type { UserAchievement } from "../../model/types";
import { useAchievementsAdminStore } from "../../store/useAchievementsAdminStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";

function createEmptyDraft(userId = 0): UserAchievement {
  return {
    id: 0,
    userId,
    achievementId: 0,
    quantity: 0,
    achieved: false,
  };
}

export const UserAchievementsManagementTab: React.FC = () => {
  const showSnackbar = useUiStore((state) => state.showSnackbar);
  const achievements = useAchievementsAdminStore((state) => state.items);
  const fetchAchievements = useAchievementsAdminStore((state) => state.fetchAll);

  const [records, setRecords] = useState<UserAchievement[]>([]);
  const [userId, setUserId] = useState("");
  const [recordId, setRecordId] = useState("");
  const [draft, setDraft] = useState<UserAchievement>(createEmptyDraft());
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const achievementById = useMemo(
    () => new Map(achievements.map((item) => [item.id, item])),
    [achievements],
  );

  useEffect(() => {
    void fetchAchievements();
  }, [fetchAchievements]);

  async function loadByUser() {
    const id = Number(userId);
    if (!id) {
      showSnackbar("User ID is required", "warning");
      return;
    }

    setLoading(true);
    try {
      const loaded = await AchievementAdminService.getUserAchievementsByUserId(id);
      setRecords(loaded);
      setDraft(createEmptyDraft(id));
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load user achievements",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadByRecord() {
    const id = Number(recordId);
    if (!id) {
      showSnackbar("Record ID is required", "warning");
      return;
    }

    setLoading(true);
    try {
      const loaded = await AchievementAdminService.getUserAchievementById(id);
      setRecords([loaded]);
      setDraft(loaded);
      setUserId(String(loaded.userId));
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load user achievement",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: () => Promise<void>, success: string) {
    setActionLoading(true);
    try {
      await action();
      if (userId) {
        const loaded = await AchievementAdminService.getUserAchievementsByUserId(
          Number(userId),
        );
        setRecords(loaded);
      }
      showSnackbar(success, "success");
    } catch (error) {
      showSnackbar(getApiErrorMessage(error) ?? "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveDraft() {
    if (!draft.userId || !draft.achievementId) {
      showSnackbar("User ID and achievement are required", "warning");
      return;
    }

    const payload = {
      ...draft,
      quantity: Math.max(0, Math.round(draft.quantity)),
    };

    await runAction(async () => {
      if (payload.id) {
        await AchievementAdminService.updateUserAchievement(payload);
      } else {
        await AchievementAdminService.createUserAchievement(payload);
      }
    }, payload.id ? "User achievement saved" : "User achievement created");
  }

  async function deleteRecord(id: number) {
    const ok = await requestConfirm({
      title: "Delete user achievement",
      message: "Delete this user achievement record?",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    await runAction(async () => {
      await AchievementAdminService.deleteUserAchievement(id);
      setDraft(createEmptyDraft(Number(userId) || 0));
    }, "User achievement deleted");
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            User achievement progress
          </Typography>
          <Typography color="text.secondary">
            Create, inspect, update, and delete explicit user achievement records.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          disabled={!userId || loading}
          onClick={() => void loadByUser()}
        >
          Refresh user records
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
          <TextField
            label="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => void loadByUser()}
          >
            Load by user
          </Button>
          <TextField
            label="Record ID"
            value={recordId}
            onChange={(event) => setRecordId(event.target.value)}
            fullWidth
          />
          <Button
            variant="outlined"
            disabled={loading}
            onClick={() => void loadByRecord()}
          >
            Load record
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack gap={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography fontWeight={900}>Records</Typography>
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setDraft(createEmptyDraft(Number(userId) || 0))}
              >
                New record
              </Button>
            </Stack>

            {records.length === 0 ? (
              <Typography color="text.secondary">
                {loading ? "Loading..." : "No records loaded"}
              </Typography>
            ) : (
              records.map((record) => {
                const selected = record.id === draft.id;
                const achievement = achievementById.get(record.achievementId);

                return (
                  <Paper
                    key={record.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderColor: selected ? "primary.main" : "divider",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box>
                        <Typography fontWeight={900}>
                          Record #{record.id}
                        </Typography>
                        <Typography color="text.secondary">
                          User #{record.userId} ·{" "}
                          {achievement?.name ?? `Achievement #${record.achievementId}`}
                        </Typography>
                      </Box>
                      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={`Quantity ${record.quantity}`}
                        />
                        <Chip
                          size="small"
                          color={record.achieved ? "success" : "default"}
                          label={record.achieved ? "Achieved" : "In progress"}
                        />
                        <Button
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => setDraft(record)}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack gap={1.5}>
            <Typography fontWeight={900}>
              {draft.id ? `Edit record #${draft.id}` : "Create record"}
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
              <TextField
                label="User ID"
                type="number"
                value={draft.userId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    userId: Number(event.target.value) || 0,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Achievement"
                value={draft.achievementId || ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    achievementId: Number(event.target.value) || 0,
                  }))
                }
                select
                fullWidth
              >
                {achievements.map((achievement) => (
                  <MenuItem key={achievement.id} value={achievement.id}>
                    #{achievement.id} {achievement.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
              <TextField
                label="Quantity"
                type="number"
                value={draft.quantity}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    quantity: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
                fullWidth
              />
              <TextField
                label="Achieved"
                value={draft.achieved ? "true" : "false"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    achieved: event.target.value === "true",
                  }))
                }
                select
                fullWidth
              >
                <MenuItem value="false">In progress</MenuItem>
                <MenuItem value="true">Achieved</MenuItem>
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              <Button
                variant="contained"
                startIcon={draft.id ? <SaveRoundedIcon /> : <AddRoundedIcon />}
                disabled={actionLoading}
                onClick={() => void saveDraft()}
              >
                {draft.id ? "Save record" : "Create record"}
              </Button>
              {draft.id ? (
                <Button
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  disabled={actionLoading}
                  onClick={() => void deleteRecord(draft.id)}
                >
                  Delete
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};
