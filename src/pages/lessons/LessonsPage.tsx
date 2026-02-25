import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLessonsStore } from "@/features/lessons/store/useLessonsStore";
import type { LessonStatus } from "@/features/lessons/model/types";

function statusLabel(s?: LessonStatus) {
  const v = String(s ?? "").toLowerCase();
  if (v === "passed") return "Passed";
  if (v === "locked") return "Locked";
  return "Available";
}

const LessonsPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();

  const items = useLessonsStore((s) => s.items);
  const loading = useLessonsStore((s) => s.loading);

  const [q, setQ] = React.useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;

    return items.filter((x) =>
      `${x.name} ${x.description ?? ""} ${x.author ?? ""}`
        .toLowerCase()
        .includes(t),
    );
  }, [items, q]);

  useEffect(() => {
    useLessonsStore.getState().fetchAll();
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Lessons
          </Typography>
          <Typography color="text.secondary">
            Learn step by step with blocks and finish with a test.
          </Typography>
        </Box>

        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search lessons..."
          size="small"
          sx={{ minWidth: { xs: "100%", md: 320 } }}
        />
      </Stack>

      <Paper
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
        }}
      >
        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary">No lessons yet</Typography>
        ) : (
          <Stack gap={1.2}>
            {filtered.map((x) => {
              const status = String(
                x.lessonStatus ?? "available",
              ).toLowerCase();
              const locked = status === "locked";

              const best = x.bestResult?.result;
              const bestPass = x.bestResult?.pass;

              return (
                <Paper
                  key={x.ID}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundImage: theme.gradients.cardSoft,
                    display: "flex",
                    alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                    opacity: locked ? 0.75 : 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack
                      direction="row"
                      gap={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Typography fontWeight={800} noWrap>
                        {x.name}
                      </Typography>

                      <Chip
                        size="small"
                        label={statusLabel(x.lessonStatus)}
                        sx={{
                          borderRadius: 999,
                          bgcolor:
                            status === "passed"
                              ? theme.palette.mode === "light"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(34,197,94,0.22)"
                              : status === "locked"
                                ? theme.palette.mode === "light"
                                  ? "rgba(148,163,184,0.25)"
                                  : "rgba(148,163,184,0.18)"
                                : theme.palette.mode === "light"
                                  ? "rgba(37,99,235,0.10)"
                                  : "rgba(37,99,235,0.20)",
                          border: "1px solid",
                          borderColor: theme.customColors.sidebarBorder,
                          fontWeight: 700,
                        }}
                      />

                      {typeof best === "number" && (
                        <Chip
                          size="small"
                          label={`Best: ${best}%${bestPass ? " ✓" : ""}`}
                          sx={{
                            borderRadius: 999,
                            bgcolor:
                              theme.palette.mode === "light"
                                ? "rgba(147,51,234,0.10)"
                                : "rgba(147,51,234,0.18)",
                            border: "1px solid",
                            borderColor: theme.customColors.sidebarBorder,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.4 }}
                      noWrap
                    >
                      Required level {x.requiredLevel} - Reward {x.reward} XP
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    disabled={!x.ID || locked}
                    onClick={() => nav(`/app/lessons/${x.ID}`)}
                    sx={{
                      flexShrink: 0,
                      boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
                    }}
                  >
                    {locked ? "Locked" : "Open"}
                  </Button>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default LessonsPage;
