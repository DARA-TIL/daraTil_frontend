import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLessonsStore } from "@/features/lessons/store/useLessonsStore";

const LessonsPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();

  const items = useLessonsStore((s) => s.items);
  const loading = useLessonsStore((s) => s.loading);

  // простой поиск локально (быстро и без API)
  const [q, setQ] = React.useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((x) =>
      `${x.name} ${x.description} ${x.author}`.toLowerCase().includes(t),
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
            Learn step by step with blocks: text, media, and more.
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
            {filtered.map((x) => (
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
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800} noWrap>
                    {x.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                    noWrap
                  >
                    Level {x.requiredLevel} - Reward {x.reward} XP - Blocks{" "}
                    {x.blocks?.length ?? 0}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  disabled={!x.ID}
                  onClick={() => nav(`/app/lessons/${x.ID}`)}
                  sx={{
                    flexShrink: 0,
                    boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
                  }}
                >
                  Open
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default LessonsPage;
