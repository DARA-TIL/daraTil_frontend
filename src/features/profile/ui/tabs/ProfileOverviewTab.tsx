import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ProfileSectionCard from "../ProfileSectionCard";

const ProfileOverviewTab: React.FC = () => {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [username, setUsername] = useState(user?.username ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [edit, setEdit] = useState(false);

  const stats = useMemo(
    () => [
      { label: "Completed lessons", value: "18" },
      { label: "Words learned", value: "320" },
      { label: "Time spent", value: "5h 20m" },
      { label: "Streak", value: "4 days" },
    ],
    [],
  );

  useEffect(() => {
    if (!user) return;
    setUsername(user.username ?? "");
    setAvatar(user.avatar ?? "");
  }, [user?.username, user?.avatar]);

  if (!user) return null;

  const level = user.progress?.level ?? 0;
  const xpTotal = user.progress?.xpTotal ?? 0;

  const onSave = async () => {
    await updateProfile({ username, avatar });
    setEdit(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <ProfileSectionCard
          variant="hero"
          sx={{ overflow: "hidden", position: "relative" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                src={avatar || user.avatar}
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: 36,
                  fontWeight: 800,
                  background: "rgba(255,255,255,0.18)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {user.username}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user.email}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  mt={1.25}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={`Level ${level}`}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                  <Chip
                    label={`${xpTotal} XP`}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                  <Chip
                    label={user.role}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Button
                variant="contained"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEdit((v) => !v)}
                sx={{
                  background: "rgba(255,255,255,0.92)",
                  color: "#0f172a",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                }}
              >
                {edit ? "Cancel" : "Edit"}
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={!edit}
                onClick={onSave}
                sx={{
                  background: "rgba(15,23,42,0.85)",
                  color: "#fff",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>

          {edit && (
            <Stack spacing={2} mt={3} sx={{ maxWidth: 520 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.10)",
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.85)" },
                  "& .MuiOutlinedInput-input": { color: "#fff" },
                }}
              />
              <TextField
                label="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.10)",
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.85)" },
                  "& .MuiOutlinedInput-input": { color: "#fff" },
                }}
              />
            </Stack>
          )}
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            Quick stats
          </Typography>

          <Grid container spacing={2}>
            {stats.map((s) => (
              <Grid key={s.label} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(15,23,42,0.55)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {s.label}
                  </Typography>
                  <Typography fontWeight={900} fontSize={18}>
                    {s.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ProfileSectionCard>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <EmojiEventsOutlinedIcon />
            <Typography fontWeight={800}>Achievements</Typography>
          </Stack>

          <Stack spacing={1.25}>
            {["First lesson completed", "3-day streak", "100 XP earned"].map(
              (x) => (
                <Box
                  key={x}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(15,23,42,0.55)",
                  }}
                >
                  <Typography fontWeight={700}>{x}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placeholder - backend will provide real data
                  </Typography>
                </Box>
              ),
            )}
          </Stack>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileOverviewTab;
