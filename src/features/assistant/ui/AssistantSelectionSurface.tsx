import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import AssistantService from "../api/AssistantService";
import DictionaryService from "@/features/dictionary/api/DictionaryService";
import {
  clearBrowserSelection,
  normalizeAssistantLanguage,
  sanitizeSelectedWord,
  selectionBelongsToRoot,
} from "../model/helpers";
import type {
  AssistantActionKind,
  AssistantLanguage,
  AssistantResponseState,
} from "../model/types";
import { WordAssistantPopover } from "./WordAssistantPopover";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import { showPremiumRequired } from "@/features/subscriptions/lib/premiumRequired";

type Props = {
  block: string;
  children: React.ReactNode;
  component?: React.ElementType;
  language: AssistantLanguage | string;
  disabled?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
};

export const AssistantSelectionSurface: React.FC<Props> = ({
  block,
  children,
  component = "div",
  language,
  disabled = false,
  className,
  sx,
}) => {
  const { t } = useTranslation("assistant");
  const showSnackbar = useUiStore((state) => state.showSnackbar);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const requestIdRef = useRef(0);

  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [selectedWord, setSelectedWord] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [loadingAction, setLoadingAction] = useState<AssistantActionKind | null>(null);
  const [result, setResult] = useState<AssistantResponseState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const closeAssistant = useCallback((clearSelection = false) => {
    requestIdRef.current += 1;
    setAnchorRect(null);
    setSelectedWord("");
    setFavoriteLoading(false);
    setFavoriteSaved(false);
    setLoadingAction(null);
    setResult(null);
    setError(null);

    if (clearSelection) {
      clearBrowserSelection();
    }
  }, []);

  const updateSelection = useCallback(() => {
    if (
      disabled ||
      !block.trim() ||
      !surfaceRef.current ||
      typeof window === "undefined"
    ) {
      closeAssistant();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      closeAssistant();
      return;
    }

    if (!selectionBelongsToRoot(selection, surfaceRef.current)) {
      return;
    }

    const word = sanitizeSelectedWord(selection.toString());
    if (!word) {
      closeAssistant();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      return;
    }

    setAnchorRect(rect);
    setSelectedWord(word);
    setFavoriteLoading(false);
    setFavoriteSaved(false);
    setLoadingAction(null);
    setResult(null);
    setError(null);
  }, [block, closeAssistant, disabled]);

  const scheduleSelectionUpdate = useCallback(() => {
    window.setTimeout(updateSelection, 0);
  }, [updateSelection]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAssistant(true);
      }
    };

    const handleViewportChange = () => {
      closeAssistant();
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeAssistant]);

  const runAction = useCallback(
    async (kind: AssistantActionKind, requestLanguage: AssistantLanguage) => {
      if (!selectedWord) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoadingAction(kind);
      setError(null);

      try {
        const payload = {
          block,
          lang: requestLanguage,
          word: selectedWord,
        };

        if (kind === "translate") {
          const response = await AssistantService.translateWord(payload);

          if (requestIdRef.current !== requestId) return;

          setResult({
            kind,
            text: response.result,
            context: response.context,
            targetLanguage: requestLanguage,
          });
        } else {
          const response = await AssistantService.explainWord(payload);

          if (requestIdRef.current !== requestId) return;

          setResult({
            kind,
            text: response.result,
            translationPreview: response.translation,
          });
        }
      } catch (requestError) {
        if (requestIdRef.current !== requestId) return;

        if (showPremiumRequired(requestError)) {
          setError(
            t("errors.premiumRequired", {
              defaultValue:
                "Free daily limit reached. Open subscriptions to continue.",
            }),
          );
        } else {
          setError(
            getApiErrorMessage(requestError) ??
              t("errors.requestFailed", {
                defaultValue:
                  "Could not process the selected word. Please try again.",
              }),
          );
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoadingAction(null);
        }
      }
    },
    [block, selectedWord, t],
  );

  const resolvedLanguage = normalizeAssistantLanguage(language);

  const handleFavorite = useCallback(async () => {
    if (!selectedWord) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setFavoriteLoading(true);
    setError(null);

    try {
      await DictionaryService.favoriteWord({
        block,
        lang: resolvedLanguage,
        word: selectedWord,
      });

      if (requestIdRef.current !== requestId) return;

      setFavoriteSaved(true);
      showSnackbar(
        t("snackbar.favorited", {
          defaultValue: "Word added to favorites.",
        }),
        "success",
        {
          actionLabel: t("snackbar.openDictionary", {
            defaultValue: "Open dictionary",
          }),
          actionTo: "/app/dictionary",
        },
      );
    } catch (requestError) {
      if (requestIdRef.current !== requestId) return;

      setError(
        getApiErrorMessage(requestError) ??
          t("errors.requestFailed", {
            defaultValue:
              "Could not process the selected word. Please try again.",
          }),
      );
    } finally {
      if (requestIdRef.current === requestId) {
        setFavoriteLoading(false);
      }
    }
  }, [block, resolvedLanguage, selectedWord, showSnackbar, t]);

  if (disabled || !block.trim()) {
    return <>{children}</>;
  }

  return (
    <Box
      ref={surfaceRef}
      component={component}
      className={className}
      sx={{ userSelect: "text", ...sx }}
      onClickCapture={(event: React.MouseEvent<HTMLElement>) => {
        if (typeof window === "undefined" || !surfaceRef.current) return;
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          return;
        }

        if (!selectionBelongsToRoot(selection, surfaceRef.current)) return;

        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseUp={scheduleSelectionUpdate}
      onDoubleClick={scheduleSelectionUpdate}
      onTouchEnd={scheduleSelectionUpdate}
      data-assistant-surface="true"
    >
      {children}

      <WordAssistantPopover
        anchorRect={anchorRect}
        error={error}
        favoriteLoading={favoriteLoading}
        favoriteSaved={favoriteSaved}
        loadingAction={loadingAction}
        open={Boolean(anchorRect && selectedWord)}
        result={result}
        selectedWord={selectedWord}
        onClose={() => closeAssistant(true)}
        onExplain={() => {
          void runAction("explain", resolvedLanguage);
        }}
        onFavorite={() => {
          void handleFavorite();
        }}
        onTranslate={(targetLanguage) => {
          void runAction("translate", targetLanguage);
        }}
      />
    </Box>
  );
};
