import React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ProfileSectionCard from "../ProfileSectionCard";

const ProfileActivityTab: React.FC = () => {
  const theme = useTheme();

  const items = [
    { title: "Completed Lesson 5", time: "Today - 14:12" },
    { title: "Earned 120 XP", time: "Yesterday - 19:40" },
    { title: "Liked folklore: Koblandy Batyr", time: "2 days ago" },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            Activity timeline
          </Typography>

          <Stack spacing={1.25}>
            {items.map((x) => (
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
                <Typography fontWeight={800}>{x.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {x.time}
                </Typography>
              </Box>
            ))}
          </Stack>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileActivityTab;
