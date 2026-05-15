import React from "react";
import { Box, Typography } from "@mui/material";

type Props = {
  text: string;
  color?: string;
};

type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "code"; value: string };

function parseInlineTokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    const value = match[0];

    if (index > lastIndex) {
      tokens.push({
        type: "text",
        value: text.slice(lastIndex, index),
      });
    }

    if (value.startsWith("**") && value.endsWith("**")) {
      tokens.push({
        type: "strong",
        value: value.slice(2, -2),
      });
    } else if (value.startsWith("`") && value.endsWith("`")) {
      tokens.push({
        type: "code",
        value: value.slice(1, -1),
      });
    }

    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return tokens.length > 0 ? tokens : [{ type: "text", value: text }];
}

function renderInline(text: string) {
  return parseInlineTokens(text).map((token, index) => {
    if (token.type === "strong") {
      return (
        <Box key={index} component="strong" sx={{ fontWeight: 800 }}>
          {token.value}
        </Box>
      );
    }

    if (token.type === "code") {
      return (
        <Box
          key={index}
          component="code"
          sx={(theme) => ({
            px: 0.55,
            py: 0.15,
            borderRadius: 1,
            fontSize: "0.92em",
            fontFamily: '"IBM Plex Mono", "Consolas", monospace',
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(15,23,42,0.06)"
                : "rgba(148,163,184,0.14)",
          })}
        >
          {token.value}
        </Box>
      );
    }

    return <React.Fragment key={index}>{token.value}</React.Fragment>;
  });
}

function renderTextBlock(block: string, key: string, color: string | undefined) {
  const trimmedBlock = block.trim();
  if (!trimmedBlock) return null;

  const codeMatch = trimmedBlock.match(/^```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```$/);
  if (codeMatch) {
    return (
      <Box
        key={key}
        component="pre"
        sx={(theme) => ({
          m: 0,
          px: 1.4,
          py: 1.15,
          borderRadius: 2.4,
          overflowX: "auto",
          fontSize: 13,
          lineHeight: 1.65,
          fontFamily: '"IBM Plex Mono", "Consolas", monospace',
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(15,23,42,0.05)"
              : "rgba(2,6,23,0.5)",
          border: "1px solid",
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(148,163,184,0.18)"
              : "rgba(71,85,105,0.3)",
        })}
      >
        {codeMatch[1].trim()}
      </Box>
    );
  }

  const lines = trimmedBlock.split("\n").map((line) => line.trim()).filter(Boolean);

  if (lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line))) {
    return (
      <Box key={key} component="ul" sx={{ m: 0, pl: 2.4 }}>
        {lines.map((line, index) => (
          <Box key={`${key}-li-${index}`} component="li" sx={{ mb: 0.55, color }}>
            <Typography component="span" sx={{ lineHeight: 1.7, color }}>
              {renderInline(line.replace(/^[-*•]\s+/, ""))}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (lines.length > 0 && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
    return (
      <Box key={key} component="ol" sx={{ m: 0, pl: 2.4 }}>
        {lines.map((line, index) => (
          <Box key={`${key}-li-${index}`} component="li" sx={{ mb: 0.55, color }}>
            <Typography component="span" sx={{ lineHeight: 1.7, color }}>
              {renderInline(line.replace(/^\d+[.)]\s+/, ""))}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (/^#{1,3}\s+/.test(trimmedBlock)) {
    const level = trimmedBlock.match(/^#{1,3}/)?.[0].length ?? 1;
    const heading = trimmedBlock.replace(/^#{1,3}\s+/, "");

    return (
      <Typography
        key={key}
        sx={{
          lineHeight: 1.45,
          fontWeight: 800,
          fontSize: level === 1 ? 18 : level === 2 ? 16 : 15,
          color,
        }}
      >
        {renderInline(heading)}
      </Typography>
    );
  }

  return (
    <Typography
      key={key}
      sx={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: 1.72,
        color,
      }}
    >
      {renderInline(trimmedBlock)}
    </Typography>
  );
}

const AiChatFormattedMessage: React.FC<Props> = ({ text, color }) => {
  const normalizedText = text.replace(/\r\n/g, "\n").trim();
  const blocks = normalizedText
    ? normalizedText
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
    : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.15 }}>
      {(blocks.length > 0 ? blocks : [text]).map((block, index) =>
        renderTextBlock(block, `block-${index}`, color),
      )}
    </Box>
  );
};

export default AiChatFormattedMessage;
