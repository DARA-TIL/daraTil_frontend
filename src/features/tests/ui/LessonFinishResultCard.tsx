import React from "react";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import type { FinishLessonResponse } from "@/features/lessons/model/types";

const LessonFinishResultCard: React.FC<{ res: FinishLessonResponse }> = ({
  res,
}) => {
  const theme = useTheme();
  const pass = Boolean(res.data?.pass);
  const progress = res.progress;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundColor: pass
          ? theme.palette.mode === "light"
            ? "rgba(34,197,94,0.08)"
            : "rgba(34,197,94,0.16)"
          : theme.palette.mode === "light"
            ? "rgba(239,68,68,0.08)"
            : "rgba(239,68,68,0.16)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography fontWeight={900}>
            {pass ? "Passed" : "Failed"} - score {res.data?.result ?? 0}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pass
              ? "XP is granted only if you improved your best result."
              : "No XP granted."}
          </Typography>
        </Box>

        {progress && (
          <Box>
            <Typography variant="body2" fontWeight={800}>
              XP gained: {progress.xpGained ?? 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Level: {progress.prevLevel ?? 0} - {progress.currentLevel ?? 0}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default LessonFinishResultCard;
