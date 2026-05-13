import React, { useEffect, useMemo, useState } from "react";
import type { VirtualElement } from "@popperjs/core";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Collapse,
  Divider,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import type {
  AssistantLanguage,
  AssistantResponseState,
} from "../model/types";
import { useTranslation } from "react-i18next";

const TRANSLATE_LANGUAGES: AssistantLanguage[] = ["KZ", "RU", "EN"];

type Props = {
  anchorRect: DOMRect | null;
  error: string | null;
  favoriteLoading: boolean;
  favoriteSaved: boolean;
  loadingAction: "explain" | "translate" | null;
  open: boolean;
  result: AssistantResponseState | null;
  selectedWord: string;
  onClose: () => void;
  onExplain: () => void;
  onFavorite: () => void;
  onTranslate: (language: AssistantLanguage) => void;
};

export const WordAssistantPopover: React.FC<Props> = ({
  anchorRect,
  error,
  favoriteLoading,
  favoriteSaved,
  loadingAction,
  open,
  result,
  selectedWord,
  onClose,
  onExplain,
  onFavorite,
  onTranslate,
}) => {
  const { t } = useTranslation("assistant");
  const [translateOptionsOpen, setTranslateOptionsOpen] = useState(false);

  const keepSelectionAlive = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const keepInteraction = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleKeyboardClick =
    (handler: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        handler();
      }
    };

  const handleMouseAction =
    (handler: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
      keepSelectionAlive(event);
      handler();
    };

  const handleMouseTranslateAction =
    (language: AssistantLanguage) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      keepSelectionAlive(event);
      onTranslate(language);
    };

  useEffect(() => {
    if (!open) {
      setTranslateOptionsOpen(false);
    }
  }, [open]);

  const anchorEl = useMemo<VirtualElement | null>(() => {
    if (!anchorRect) return null;

    return {
      getBoundingClientRect: () => anchorRect,
    };
  }, [anchorRect]);

  const resultTitle =
    result?.kind === "translate"
      ? t("popover.resultTranslate", {
          language: result.targetLanguage
            ? t(`popover.languageNames.${result.targetLanguage}`, {
                defaultValue: result.targetLanguage,
              })
            : "",
        })
      : t("popover.resultExplain", {
          defaultValue: "Explanation",
        });

  return (
    <Popper
      open={open && Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom"
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 12],
          },
        },
        {
          name: "preventOverflow",
          options: {
            padding: 16,
          },
        },
      ]}
      sx={{ zIndex: 1600 }}
    >
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={onClose}
      >
        <Paper
          elevation={0}
          onMouseDown={keepSelectionAlive}
          onMouseUp={keepInteraction}
          onClick={keepInteraction}
          sx={{
            width: 360,
            maxWidth: "min(calc(100vw - 32px), 360px)",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            boxShadow: "0 20px 42px rgba(15,23,42,0.22)",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(14,165,233,0.08))",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <AutoAwesomeRoundedIcon color="primary" sx={{ mt: 0.15 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  {t("popover.title", { defaultValue: "Word assistant" })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("popover.dictionaryHint", {
                    defaultValue:
                      "Any explanation or translation automatically adds the word to your dictionary.",
                  })}
                </Typography>
              </Box>
              <Button
                onClick={onClose}
                onMouseDown={keepSelectionAlive}
                size="small"
                color="inherit"
                sx={{ minWidth: 36, px: 0.75 }}
              >
                <CloseRoundedIcon fontSize="small" />
              </Button>
            </Stack>

            <Chip
              label={selectedWord}
              color="primary"
              sx={{ mt: 1.15, fontWeight: 700, maxWidth: "100%" }}
            />
          </Box>

          <Stack spacing={1.2} sx={{ p: 1.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                onClick={handleKeyboardClick(onExplain)}
                onMouseDown={handleMouseAction(onExplain)}
                variant="contained"
                startIcon={<AutoAwesomeRoundedIcon />}
                disabled={Boolean(loadingAction) || favoriteLoading}
                sx={{ flex: 1.05, borderRadius: 999 }}
              >
                {t("popover.explain", { defaultValue: "Explain" })}
              </Button>

              <Box
                sx={{ flex: 1, minWidth: 0 }}
                onMouseEnter={() => setTranslateOptionsOpen(true)}
                onMouseLeave={() => setTranslateOptionsOpen(false)}
              >
                <Button
                  onClick={() => setTranslateOptionsOpen((current) => !current)}
                  onMouseDown={keepSelectionAlive}
                  variant="outlined"
                  startIcon={<TranslateRoundedIcon />}
                  endIcon={
                    <KeyboardArrowDownRoundedIcon
                      sx={{
                        transform: translateOptionsOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 180ms ease",
                      }}
                    />
                  }
                  disabled={Boolean(loadingAction) || favoriteLoading}
                  sx={{ width: "100%", borderRadius: 999 }}
                >
                  {t("popover.translate", { defaultValue: "Translate" })}
                </Button>

                <Collapse in={translateOptionsOpen} unmountOnExit>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.9 }}>
                    {TRANSLATE_LANGUAGES.map((language) => (
                      <Button
                        key={language}
                        onClick={handleKeyboardClick(() => onTranslate(language))}
                        onMouseDown={handleMouseTranslateAction(language)}
                        size="small"
                        variant="text"
                        disabled={Boolean(loadingAction) || favoriteLoading}
                        sx={{
                          minWidth: 0,
                          flex: 1,
                          borderRadius: 999,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {language}
                      </Button>
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            </Stack>

            <Button
              onClick={handleKeyboardClick(onFavorite)}
              onMouseDown={handleMouseAction(onFavorite)}
              variant={favoriteSaved ? "contained" : "text"}
              color={favoriteSaved ? "success" : "inherit"}
              startIcon={
                favoriteSaved ? <CheckRoundedIcon /> : <FavoriteRoundedIcon />
              }
              disabled={Boolean(loadingAction) || favoriteLoading || favoriteSaved}
              sx={{
                alignSelf: "stretch",
                borderRadius: 999,
                border: "1px solid",
                borderColor: favoriteSaved ? "success.main" : "divider",
              }}
            >
              {favoriteSaved
                ? t("popover.favoriteSaved", { defaultValue: "Saved" })
                : t("popover.favorite", { defaultValue: "Add to favorites" })}
            </Button>

            {loadingAction || favoriteLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  {favoriteLoading
                    ? t("popover.loadingFavorite", {
                        defaultValue: "Saving to favorites...",
                      })
                    : loadingAction === "translate"
                      ? t("popover.loadingTranslate", {
                          defaultValue: "Translating word...",
                        })
                      : t("popover.loadingExplain", {
                          defaultValue: "Generating explanation...",
                        })}
                </Typography>
              </Stack>
            ) : null}

            {error ? <Alert severity="error">{error}</Alert> : null}

            {result ? (
              <>
                <Divider />
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {resultTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                  >
                    {result.text}
                  </Typography>

                  {result.context ? (
                    <Box
                      sx={{
                        mt: 0.5,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(15,23,42,0.04)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.35 }}
                      >
                        {t("popover.contextLabel", {
                          defaultValue: "Context",
                        })}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}
                      >
                        {result.context}
                      </Typography>
                    </Box>
                  ) : null}
                </Stack>
              </>
            ) : null}
          </Stack>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};
