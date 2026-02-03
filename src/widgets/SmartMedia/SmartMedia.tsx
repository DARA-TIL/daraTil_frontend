// src/shared/ui/SmartMedia.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "@/shared/lib/youtube";
import SmartAudioPlayer from "./SmartAudioPlayer";

type Props = {
  url?: string | null;
  caption?: string | null;
  typeHint?: "audio" | "video" | "image" | "unknown"; // можно передавать из block.type
  height?: number;
};

function guessKind(url: string, typeHint?: Props["typeHint"]) {
  if (typeHint && typeHint !== "unknown") return typeHint;

  const u = url.toLowerCase();
  if (u.match(/\.(png|jpg|jpeg|webp|gif)(\?|#|$)/)) return "image";
  if (u.match(/\.(mp3|wav|ogg|m4a|aac)(\?|#|$)/)) return "audio";
  if (u.match(/\.(mp4|webm|mov|m4v)(\?|#|$)/)) return "video";
  return "unknown";
}

export const SmartMedia: React.FC<Props> = ({
  url,
  caption,
  typeHint = "unknown",
  height = 360,
}) => {
  const src = (url || "").trim();
  if (!src) return null;

  // YouTube
  if (isYouTubeUrl(src)) {
    const embed = toYouTubeEmbedUrl(src);
    if (!embed) return null;

    return (
      <Box>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.25)",
            bgcolor: "rgba(2,6,23,0.04)",
          }}
        >
          <Box
            sx={{ position: "relative", width: "100%", paddingTop: "56.25%" }}
          >
            <iframe
              src={embed}
              title="YouTube"
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
  }

  // Non-YouTube
  const kind = guessKind(src, typeHint);

  if (kind === "image") {
    return (
      <Box>
        <Box
          component="img"
          src={src}
          alt={caption || "media"}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: height,
            objectFit: "cover",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        />
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
  }

  if (kind === "audio") {
    return <SmartAudioPlayer src={src} caption={caption} />;
  }

  // video или unknown - попробуем как video
  return (
    <Box>
      <video controls src={src} style={{ width: "100%", borderRadius: 12 }} />
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
