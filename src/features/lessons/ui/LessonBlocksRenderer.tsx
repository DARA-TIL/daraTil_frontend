import React, { useMemo } from "react";
import { Stack } from "@mui/material";
import type { LessonBlock } from "../model/types";
import TextBlock from "./blocks/TextBlock";
import MediaBlock from "./blocks/MediaBlock";
import YoutubeBlock from "./blocks/YoutubeBlock";

type Props = { blocks: LessonBlock[] };

const LessonBlocksRenderer: React.FC<Props> = ({ blocks }) => {
  const sorted = useMemo(
    () =>
      [...(blocks ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [blocks],
  );

  return (
    <Stack gap={1.5}>
      {sorted.map((b) => {
        const t = String(b.type ?? "").toLowerCase();

        if (t === "text") {
          return <TextBlock key={b.id || `${b.position}`} block={b} />;
        }

        if (t === "youtube") {
          return <YoutubeBlock key={b.id || `${b.position}`} block={b} />;
        }

        return <MediaBlock key={b.id || `${b.position}`} block={b} />;
      })}
    </Stack>
  );
};

export default LessonBlocksRenderer;
