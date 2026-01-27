import React from "react";
import { Box, Typography } from "@mui/material";
import type { LessonBlock } from "../../model/types";

function toYoutubeEmbed(url?: string | null) {
  if (!url) return null;

  try {
    const id = url.includes("youtu.be")
      ? url.split("youtu.be/")[1]?.split("?")[0]
      : new URL(url).searchParams.get("v");

    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

const YoutubeBlock: React.FC<{ block: LessonBlock }> = ({ block }) => {
  const embed = toYoutubeEmbed(block.contentUrl);

  if (!embed) {
    return <Typography color="error">Invalid YouTube URL</Typography>;
  }
console.log("YT block:", block);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          paddingTop: "56.25%", // 16:9
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <iframe
          src={embed}
          title={block.name}
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

      {block.contentText && (
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {block.contentText}
        </Typography>
      )}
    </Box>
  );
};

export default YoutubeBlock;
