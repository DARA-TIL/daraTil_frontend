import React from "react";
import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ProfileSectionCard from "../ProfileSectionCard";

const ProfileLearningTab: React.FC = () => {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const xpTotal = user.progress?.xpTotal ?? 0;
  const xpNext = user.progress?.xpForNextLevel ?? 1;
  const percent = Math.min(100, Math.round((xpTotal / xpNext) * 100));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={1}>
            Level progress
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Keep learning to reach the next level.
          </Typography>

          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{ height: 14, borderRadius: 999 }}
          />

          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography variant="body2">{xpTotal} XP</Typography>
            <Typography variant="body2" color="text.secondary">
              Next: {xpNext} XP
            </Typography>
          </Stack>

          <Stack spacing={1.25} mt={3}>
            {[
              { title: "Next goal", value: "Complete 2 lessons" },
              { title: "Daily streak", value: "4 days" },
              { title: "Recommended", value: "Lesson 6 - Vocabulary" },
            ].map((x) => (
              <Box
                key={x.title}
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
                  {x.title}
                </Typography>
                <Typography fontWeight={800}>{x.value}</Typography>
              </Box>
            ))}
          </Stack>
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            Modules
          </Typography>

          <Stack spacing={1.25}>
            {[
              { name: "Basics", progress: 70 },
              { name: "Grammar", progress: 35 },
              { name: "Listening", progress: 10 },
            ].map((m) => (
              <Box
                key={m.name}
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
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={800}>{m.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.progress}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={m.progress}
                  sx={{ height: 10, borderRadius: 999 }}
                />
              </Box>
            ))}
          </Stack>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileLearningTab;
