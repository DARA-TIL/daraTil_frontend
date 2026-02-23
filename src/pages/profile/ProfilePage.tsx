import React, { useMemo, useState } from "react";
import { Box, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ProfileSecurityTab from "@/features/profile/ui/tabs/ProfileSecurityTab";
import ProfileLearningTab from "@/features/profile/ui/tabs/ProfileLearningTab";
import ProfileActivityTab from "@/features/profile/ui/tabs/ProfileActivityTab";
import ProfileOverviewTab from "@/features/profile/ui/tabs/ProfileOverviewTab";

type TabKey = "overview" | "learning" | "security" | "activity";

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  const tabs = useMemo(
    () => [
      {
        key: "overview" as const,
        label: "Overview",
        icon: <PersonOutlineIcon />,
      },
      {
        key: "learning" as const,
        label: "Learning",
        icon: <SchoolOutlinedIcon />,
      },
      {
        key: "security" as const,
        label: "Security",
        icon: <SecurityOutlinedIcon />,
      },
      {
        key: "activity" as const,
        label: "Activity",
        icon: <TimelineOutlinedIcon />,
      },
    ],
    [],
  );

  const [tab, setTab] = useState<TabKey>("overview");

  if (!user) return null;

  return (
    <Box>
      <Stack spacing={2.25} mb={2.5}>
        <Typography variant="h5" fontWeight={800}>
          Profile
        </Typography>

        <Paper
          sx={{
            p: 0.75,
            backgroundImage: theme.gradients.cardSoft,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                minHeight: 44,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 999,
                mx: 0.5,
              },
              "& .MuiTabs-indicator": {
                height: 0,
              },
            }}
          >
            {tabs.map((t) => (
              <Tab
                key={t.key}
                value={t.key}
                icon={t.icon}
                iconPosition="start"
                label={t.label}
                sx={{
                  px: 2,
                  backgroundColor:
                    tab === t.key
                      ? theme.palette.mode === "light"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(15,23,42,0.85)"
                      : "transparent",
                  border:
                    tab === t.key
                      ? `1px solid ${theme.customColors.sidebarBorder}`
                      : "1px solid transparent",
                  boxShadow:
                    tab === t.key
                      ? theme.palette.mode === "light"
                        ? "0 10px 24px rgba(15,23,42,0.10)"
                        : "0 16px 40px rgba(0,0,0,0.55)"
                      : "none",
                }}
              />
            ))}
          </Tabs>
        </Paper>
      </Stack>

      {tab === "overview" && <ProfileOverviewTab />}
      {tab === "learning" && <ProfileLearningTab />}
      {tab === "security" && <ProfileSecurityTab />}
      {tab === "activity" && <ProfileActivityTab />}
    </Box>
  );
};

export default ProfilePage;
