import React, { useMemo } from "react";
import {
  Box,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import type { LessonBlock } from "../../model/types";

function kindFromBlock(
  block: LessonBlock,
): "image" | "audio" | "video" | "link" {
  const t = String(block.type ?? "").toLowerCase();
  const url = String(block.contentUrl ?? "").toLowerCase();

  if (t.includes("image") || /\.(png|jpg|jpeg|webp|gif)$/.test(url))
    return "image";
  if (t.includes("audio") || /\.(mp3|wav|ogg|m4a)$/.test(url)) return "audio";
  if (t.includes("video") || /\.(mp4|webm|mov|mkv)$/.test(url)) return "video";

  // если тип неизвестный - попробуем догадаться
  if (url) return "link";
  return "link";
}

const MediaBlock: React.FC<{ block: LessonBlock }> = ({ block }) => {
  const theme = useTheme();
  const kind = useMemo(() => kindFromBlock(block), [block]);

  const Icon =
    kind === "image"
      ? ImageIcon
      : kind === "audio"
        ? AudiotrackIcon
        : kind === "video"
          ? OndemandVideoIcon
          : InsertLinkIcon;

  const label =
    kind === "image"
      ? "Image"
      : kind === "audio"
        ? "Audio"
        : kind === "video"
          ? "Video"
          : "Link";

  const url = block.contentUrl?.trim() || "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundImage: theme.gradients.cardSoft,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Stack direction="row" gap={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 3,
              backgroundImage: theme.gradients.sidebarActive,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 22px rgba(15,23,42,0.22)",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900} noWrap>
              {block.position}. {block.name || "Media block"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>

        <Chip
          size="small"
          label={`#${block.position}`}
          sx={{
            borderRadius: 999,
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(147,51,234,0.10)"
                : "rgba(147,51,234,0.22)",
            border: "1px solid",
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(147,51,234,0.20)"
                : "rgba(255,255,255,0.10)",
            fontWeight: 700,
          }}
        />
      </Stack>

      <Box sx={{ mt: 1.2 }}>
        {!url ? (
          <Typography color="text.secondary">No media URL provided.</Typography>
        ) : kind === "image" ? (
          <Box
            component="img"
            src={url}
            alt={block.name}
            sx={{
              width: "100%",
              maxHeight: 420,
              objectFit: "cover",
              borderRadius: 3,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              backgroundColor: "background.paper",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : kind === "audio" ? (
          <Box component="audio" controls src={url} sx={{ width: "100%" }} />
        ) : kind === "video" ? (
          <Box
            component="video"
            controls
            src={url}
            style={{ width: "100%", borderRadius: 12 }}
          />
        ) : (
          <Typography>
            <Link href={url} target="_blank" rel="noreferrer" underline="hover">
              {url}
            </Link>
          </Typography>
        )}

        {!!block.contentText?.trim() && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.1, whiteSpace: "pre-wrap" }}
          >
            {block.contentText}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MediaBlock;
