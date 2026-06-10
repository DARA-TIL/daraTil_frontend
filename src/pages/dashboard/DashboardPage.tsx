// src/pages/dashboard/DashboardPage.tsx
import React from "react";
import { Box, Grid, Stack } from "@mui/material";
import { DashboardHeader } from "../../features/dashboard/ui/DashboardHeader";
import { LessonsMapCard } from "../../features/dashboard/ui/LessonsMapCard";
import { ProgressCard } from "../../features/dashboard/ui/ProgressCard";
import { FeaturedFolkloreCard } from "../../features/dashboard/ui/FeaturedFolkloreCard";
import { StreakCard } from "../../features/dashboard/ui/StreakCard";
import { DictionarySummaryCard } from "../../features/dashboard/ui/DictionarySummaryCard";
import { RecentActivityCard } from "../../features/dashboard/ui/RecentActivityCard";
import { ActiveTimeEventCard } from "../../features/dashboard/ui/ActiveTimeEventCard";
import { DashboardRankCard } from "../../features/dashboard/ui/DashboardRankCard";

const DashboardPage: React.FC = () => {
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        pt: 1.5,
        pb: 3,
        minHeight: "100vh",
      }}
    >
      <DashboardHeader />

      <Grid
        container
        spacing={2.5}
        sx={{
          minHeight: { xs: "auto", md: "calc(100vh - 210px)" },
        }}
      >
        <Grid size={{ xs: 12, xl: 7 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <Box sx={{ minHeight: { xs: "auto", xl: 520 }, display: "flex" }}>
              <ProgressCard />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 5 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <Grid container spacing={2.5} alignItems="stretch">
              <Grid size={{ xs: 12 }}>
                <FeaturedFolkloreCard />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <StreakCard />
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <Box sx={{ height: "100%" }}>
            <RecentActivityCard />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <Box sx={{ height: "100%" }}>
            <DashboardRankCard />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <Box sx={{ height: "100%" }}>
            <DictionarySummaryCard />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <Box sx={{ height: "100%" }}>
            <ActiveTimeEventCard />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ height: { xs: 380, xl: 420 } }}>
            <LessonsMapCard />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
