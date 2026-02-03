import React, { useMemo, useState } from "react";
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
import YouTubeIcon from "@mui/icons-material/YouTube";
import type { LessonBlock } from "../../model/types";
import { detectMediaKind, toYouTubeEmbed, type MediaKind } from "./mediaUtils";
import SmartAudioPlayer from "@/widgets/SmartMedia/SmartAudioPlayer";

function iconForKind(kind: MediaKind) {
  if (kind === "youtube") return YouTubeIcon;
  if (kind === "image") return ImageIcon;
  if (kind === "audio") return AudiotrackIcon;
  if (kind === "video") return OndemandVideoIcon;
  return InsertLinkIcon;
}

function labelForKind(kind: MediaKind) {
  if (kind === "youtube") return "YouTube";
  if (kind === "image") return "Image";
  if (kind === "audio") return "Audio";
  if (kind === "video") return "Video";
  return "Link";
}

const MediaBlock: React.FC<{ block: LessonBlock }> = ({ block }) => {
  const theme = useTheme();
  const url = block.contentUrl?.trim() || "";

  const kind = useMemo(
    () => detectMediaKind(block.type, url),
    [block.type, url],
  );
  const Icon = iconForKind(kind);
  const label = labelForKind(kind);

  const [failed, setFailed] = useState(false);

  const embed = kind === "youtube" ? toYouTubeEmbed(url) : null;

  const showCaptionBelow = kind !== "audio";

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
        ) : kind === "youtube" ? (
          embed ? (
            <>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  backgroundColor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                  }}
                >
                  <iframe
                    src={embed}
                    title={block.name || "YouTube"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </Box>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.9 }}
              >
                <Link
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  Open on YouTube
                </Link>
              </Typography>
            </>
          ) : (
            <Typography color="error">Invalid YouTube URL</Typography>
          )
        ) : kind === "image" ? (
          failed ? (
            <Typography color="text.secondary">
              Image failed to load.{" "}
              <Link
                href={url}
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                Open link
              </Link>
            </Typography>
          ) : (
            <Box
              component="img"
              src={url}
              alt={block.name || "image"}
              sx={{
                width: "100%",
                maxHeight: 420,
                objectFit: "cover",
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
                backgroundColor: "background.paper",
              }}
              onError={() => setFailed(true)}
            />
          )
        ) : kind === "audio" ? (
          <SmartAudioPlayer src={url} />
        ) : kind === "video" ? (
          <Box
            component="video"
            controls
            src={url}
            style={{
              width: "100%",
              borderRadius: 12,
              border: `1px solid ${theme.customColors.sidebarBorder}`,
              background:
                theme.palette.mode === "light" ? "#fff" : "rgba(15,23,42,0.5)",
            }}
            onError={() => setFailed(true)}
          />
        ) : (
          <Typography>
            <Link href={url} target="_blank" rel="noreferrer" underline="hover">
              {url}
            </Link>
          </Typography>
        )}

        {showCaptionBelow && !!block.contentText?.trim() && (
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
