// src/pages/dashboard/DashboardPage.tsx
import React from "react";
import { Box, Grid, Stack } from "@mui/material";
import { DashboardHeader } from "../../features/dashboard/ui/DashboardHeader";
import { LessonsMapCard } from "../../features/dashboard/ui/LessonsMapCard";
import { ProgressCard } from "../../features/dashboard/ui/ProgressCard";
import { FeaturedFolkloreCard } from "../../features/dashboard/ui/FeaturedFolkloreCard";
import { StreakCard } from "../../features/dashboard/ui/StreakCard";
import { DailyChallengeCard } from "../../features/dashboard/ui/DailyChallengeCard";
import { DictionarySummaryCard } from "../../features/dashboard/ui/DictionarySummaryCard";
import { RecentActivityCard } from "../../features/dashboard/ui/RecentActivityCard";

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
        {/* LEFT COLUMN */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <LessonsMapCard />
            <ProgressCard />
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, md:5 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <FeaturedFolkloreCard />
            <StreakCard />
            <DictionarySummaryCard />
            <DailyChallengeCard />
          </Stack>
        </Grid>

        {/* BOTTOM FULL-WIDTH */}
        <Grid size={{ xs: 12 }}>
          <RecentActivityCard />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
