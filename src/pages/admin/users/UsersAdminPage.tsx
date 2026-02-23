import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useNavigate } from "react-router-dom";
import { useUsersAdminStore } from "@/features/users/store/useUsersAdminStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUiStore } from "@/shared/store/useUiStore";

const UsersAdminPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();

  const loading = useUsersAdminStore((s) => s.loading);
  const fetchAll = useUsersAdminStore((s) => s.fetchAll);

  const filters = useUsersAdminStore((s) => s.filters);
  const setFilter = useUsersAdminStore((s) => s.setFilter);
  const resetFilters = useUsersAdminStore((s) => s.resetFilters);

  const items = useUsersAdminStore((s) => s.items);
  const getFilteredItems = useUsersAdminStore((s) => s.getFilteredItems);

  const updateById = useUsersAdminStore((s) => s.updateById);

  const [roleDrafts, setRoleDrafts] = useState<Record<number, string>>({});

  const me = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const levelUpMe = useUsersAdminStore((s) => s.levelUpMe);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const [xp, setXp] = useState<string>("100");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rows = useMemo(
    () => getFilteredItems(),
    [items, filters, getFilteredItems],
  );

  const getRoleValue = (id: number, current: string) =>
    roleDrafts[id] ?? current ?? "user";

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
            Users Admin
          </Typography>
          <Typography color="text.secondary">
            Manage users, roles and profile data.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => fetchAll()}>
          Refresh
        </Button>
      </Stack>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundImage: theme.gradients.cardSoft,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900} noWrap>
              Admin tools
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Increase your own XP/level for testing.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current: level {me?.progress?.level ?? 0} - XP{" "}
              {me?.progress?.xpTotal ?? 0}
            </Typography>
          </Box>

          <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
            <TextField
              label="XP"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              type="number"
              size="small"
              sx={{ width: 140 }}
            />

            <Button
              variant="contained"
              disabled={loading}
              onClick={async () => {
                const n = Number(xp);
                if (!Number.isFinite(n) || n <= 0) {
                  showSnackbar("XP must be a positive number", "warning");
                  return;
                }

                const ok = await levelUpMe(n);
                if (!ok) return;

                // обновляем текущего пользователя в auth store
                await checkAuth();
              }}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              Level up me
            </Button>
          </Stack>
        </Stack>
      </Paper>

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
            label="Search"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            fullWidth
          />

          <TextField
            label="Role"
            value={filters.role}
            onChange={(e) => setFilter("role", e.target.value)}
            select
            sx={{ minWidth: { md: 200 } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">user</MenuItem>
            <MenuItem value="admin">admin</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{ minWidth: 140 }}
          >
            Reset
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
          <Typography color="text.secondary">Loading...</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">No users</Typography>
        ) : (
          <Stack gap={1.2}>
            {rows.map((u) => {
              const currentRole = String(u.role ?? "user").toLowerCase();
              const draftRole = getRoleValue(u.id, currentRole);
              const isDirty = draftRole !== currentRole;

              return (
                <Paper
                  key={u.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundImage: theme.gradients.cardSoft,
                    display: "flex",
                    alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  <Stack
                    direction="row"
                    gap={1.5}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Avatar
                      src={u.avatar ?? undefined}
                      sx={{
                        width: 38,
                        height: 38,
                        backgroundImage: theme.gradients.dashboardHeader,
                        fontWeight: 800,
                      }}
                    >
                      {u.username?.[0]?.toUpperCase?.() ?? "U"}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900} noWrap>
                        #{u.id} - {u.username || "Unknown"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {u.email} - level {u.progress?.level ?? 0} - XP{" "}
                        {u.progress?.xpTotal ?? 0}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    flexShrink={0}
                  >
                    <TextField
                      label="Role"
                      value={draftRole}
                      onChange={(e) =>
                        setRoleDrafts((s) => ({ ...s, [u.id]: e.target.value }))
                      }
                      select
                      size="small"
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value="user">user</MenuItem>
                      <MenuItem value="admin">admin</MenuItem>
                    </TextField>

                    <Button
                      variant="contained"
                      startIcon={<SaveOutlinedIcon />}
                      disabled={!isDirty || loading}
                      onClick={async () => {
                        const ok = await updateById(u.id, { role: draftRole });
                        if (ok) {
                          setRoleDrafts((s) => {
                            const copy = { ...s };
                            delete copy[u.id];
                            return copy;
                          });
                        }
                      }}
                      sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
                    >
                      Save
                    </Button>

                    <IconButton
                      onClick={() => nav(`/app/admin/users/${u.id}/edit`)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default UsersAdminPage;
