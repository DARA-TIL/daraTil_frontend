import React from "react";
import {
  Box,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import Replay10RoundedIcon from "@mui/icons-material/Replay10Rounded";
import Forward10RoundedIcon from "@mui/icons-material/Forward10Rounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";

type Props = {
  src: string;
  caption?: string | null;
};

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const SmartAudioPlayer: React.FC<Props> = ({ src, caption }) => {
  const theme = useTheme();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      if (a.paused) {
        await a.play();
      } else {
        a.pause();
      }
    } catch {
      // autoplay policies / network errors - silently ignore
    }
  };

  const seek = (next: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(duration) || duration <= 0) return;
    a.currentTime = Math.min(Math.max(0, next), duration);
  };

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = rect.width > 0 ? x / rect.width : 0;
    seek(ratio * duration);
  };

  return (
    <Box>
      <Box
        sx={{
          p: 1.25,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.25)",
          bgcolor:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.7)"
              : "rgba(15,23,42,0.55)",
          backdropFilter: "blur(8px)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 12px 30px rgba(15,23,42,0.06)"
              : "0 16px 40px rgba(0,0,0,0.55)",
        }}
      >
        {/* hidden native audio (we control it) */}
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadedMetadata={() => {
            const a = audioRef.current;
            if (!a) return;
            setDuration(a.duration || 0);
            setReady(true);
          }}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (!a) return;
            setCurrent(a.currentTime || 0);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onVolumeChange={() => {
            const a = audioRef.current;
            if (!a) return;
            setMuted(a.muted);
          }}
        />

        <Stack direction="row" alignItems="center" spacing={1.1}>
          <IconButton
            onClick={togglePlay}
            disabled={!ready}
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(37,99,235,0.10)"
                  : "rgba(37,99,235,0.25)",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(37,99,235,0.18)"
                  : "rgba(255,255,255,0.12)",
            }}
          >
            {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </IconButton>

          <IconButton
            onClick={() => seek(current - 10)}
            disabled={!ready}
            sx={{ borderRadius: 2.5 }}
            title="-10s"
          >
            <Replay10RoundedIcon />
          </IconButton>

          <IconButton
            onClick={() => seek(current + 10)}
            disabled={!ready}
            sx={{ borderRadius: 2.5 }}
            title="+10s"
          >
            <Forward10RoundedIcon />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.6 }}
            >
              <Typography variant="caption" color="text.secondary">
                {formatTime(current)} / {formatTime(duration)}
              </Typography>

              <IconButton
                size="small"
                disabled={!ready}
                onClick={() => {
                  const a = audioRef.current;
                  if (!a) return;
                  a.muted = !a.muted;
                }}
                sx={{ borderRadius: 2 }}
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeOffRoundedIcon fontSize="small" />
                ) : (
                  <VolumeUpRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Stack>

            {/* progress bar (clickable) */}
            <Box
              onClick={onBarClick}
              sx={{
                cursor: ready ? "pointer" : "default",
                borderRadius: 999,
                overflow: "hidden",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "light"
                    ? "rgba(148,163,184,0.25)"
                    : "rgba(255,255,255,0.10)",
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(148,163,184,0.10)"
                    : "rgba(148,163,184,0.16)",
              }}
            >
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, pct))}
                sx={{
                  height: 10,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                  },
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      {caption ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, whiteSpace: "pre-wrap" }}
        >
          {caption}
        </Typography>
      ) : null}
    </Box>
  );
};

export default SmartAudioPlayer;
