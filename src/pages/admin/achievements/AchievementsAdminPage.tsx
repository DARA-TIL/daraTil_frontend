import React, { useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import { AchievementManagementTab } from "@/features/achievements/ui/admin/AchievementManagementTab";
import { ActionRulesManagementTab } from "@/features/actionRules/ui/admin/ActionRulesManagementTab";
import { UserAchievementsManagementTab } from "@/features/achievements/ui/admin/UserAchievementsManagementTab";
import { useTranslation } from "react-i18next";

type AdminTab = "achievements" | "progress" | "rules";

const AchievementsAdminPage: React.FC = () => {
  const { t } = useTranslation("admin");
  const [tab, setTab] = useState<AdminTab>("achievements");

  return (
    <Box>
      <Paper
        sx={{
          mb: 2,
          px: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: AdminTab) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 800,
              minHeight: 48,
            },
          }}
        >
          <Tab
            value="achievements"
            label={t("achievementsAdmin.tabs.achievements", {
              defaultValue: "Achievements",
            })}
          />
          <Tab
            value="rules"
            label={t("achievementsAdmin.tabs.rules", {
              defaultValue: "Action rules",
            })}
          />
          <Tab
            value="progress"
            label={t("achievementsAdmin.tabs.progress", {
              defaultValue: "User progress",
            })}
          />
        </Tabs>
      </Paper>

      {tab === "achievements" ? (
        <AchievementManagementTab />
      ) : tab === "rules" ? (
        <ActionRulesManagementTab />
      ) : (
        <UserAchievementsManagementTab />
      )}
    </Box>
  );
};

export default AchievementsAdminPage;
