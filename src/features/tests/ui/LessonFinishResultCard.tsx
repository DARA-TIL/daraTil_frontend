import React, { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography, useTheme, Zoom } from "@mui/material";
import type { FinishLessonResponse } from "@/features/lessons/model/types";
import { useTranslation } from "react-i18next";

const LessonFinishResultCard: React.FC<{ res: FinishLessonResponse }> = ({
  res,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("tests");

  const pass = Boolean(res.data?.pass);
  const progress = res.progress;

  const xp = progress?.xpGained ?? 0;
  const showXp = pass && xp > 0;

  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!showXp) return;
    setPulse(false);
    const t1 = window.setTimeout(() => setPulse(true), 10);
    const t2 = window.setTimeout(() => setPulse(false), 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [showXp, res.data?.result]);

  const score = Number(res.data?.result ?? 0);

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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* XP pop */}
      {showXp && (
        <Zoom in={pulse}>
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              px: 1.2,
              py: 0.7,
              borderRadius: 999,
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(34,197,94,0.14)"
                  : "rgba(34,197,94,0.22)",
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              fontWeight: 900,
            }}
          >
            {t("finish.xpBadge", { xp })}
          </Box>
        </Zoom>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ md: "center" }}
        gap={2}
      >
        <Box>
          <Typography fontWeight={900}>
            {pass
              ? t("finish.titlePassed", { score })
              : t("finish.titleFailed", { score })}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {pass
              ? xp > 0
                ? t("finish.desc.xpGrantedImproved")
                : t("finish.desc.passedNoXp")
              : t("finish.desc.noXp")}
          </Typography>
        </Box>

        {progress && (
          <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Typography variant="body2" fontWeight={900}>
              {t("finish.stats.xpGained", { xp: progress.xpGained ?? 0 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("finish.stats.level", {
                prev: progress.prevLevel ?? 0,
                current: progress.currentLevel ?? 0,
              })}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default LessonFinishResultCard;
