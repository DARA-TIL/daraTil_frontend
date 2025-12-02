// src/pages/dashboard/DashboardPage.tsx
import React from "react";
import { Box, Grid, Stack } from "@mui/material";
import { DashboardHeader } from "./components/DashboardHeader";
import { LessonsMapCard } from "./components/LessonsMapCard";
import { ProgressCard } from "./components/ProgressCard";
import { FeaturedFolkloreCard } from "./components/FeaturedFolkloreCard";
import { EngagingLessonsCard } from "./components/EngagingLessonsCard";
import { DailyChallengeCard } from "./components/DailyChallengeCard";
import { RecentActivityCard } from "./components/RecentActivityCard";

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
        <Grid size={{ xs: 6, md: 7 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <LessonsMapCard />
            <ProgressCard />
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid size={{ xs: 12, md:5 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <FeaturedFolkloreCard />
            <EngagingLessonsCard />
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
