import React from "react";
import {
  alpha,
  useTheme,
} from "@mui/material/styles";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import type { DictionaryEntry, DictionaryLanguage } from "../model/types";
import {
  getDictionaryCompletion,
  pickDictionaryValue,
} from "../model/helpers";
import { useTranslation } from "react-i18next";

type Props = {
  entry: DictionaryEntry;
  favorite: boolean;
  language: DictionaryLanguage;
  selected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

export const DictionaryEntryCard: React.FC<Props> = ({
  entry,
  favorite,
  language,
  selected,
  onSelect,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("dictionary");
  const translationPreview = pickDictionaryValue(entry.wordTranslations, language);
  const explanationPreview = pickDictionaryValue(
    entry.wordExplainingTranslations,
    language,
  );
  const completion = getDictionaryCompletion(entry);

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 1.8,
        minWidth: 0,
        borderRadius: 4,
        border: "1px solid",
        borderColor: selected
          ? alpha(theme.palette.primary.main, 0.72)
          : theme.customColors.sidebarBorder,
        backgroundImage: selected ? theme.gradients.cardSoft : "none",
        cursor: "pointer",
        overflow: "hidden",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 14px 30px rgba(15,23,42,0.08)"
              : "0 18px 36px rgba(0,0,0,0.3)",
        },
      }}
    >
      <Stack spacing={1.2}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={900} noWrap>
              {entry.originalWord}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entry.context ||
                t("list.noContext", {
                  defaultValue: "No context added yet.",
                })}
            </Typography>
          </Box>

          <Tooltip
            title={
              favorite
                ? t("actions.removeFavorite", {
                    defaultValue: "Remove from favorites",
                  })
                : t("actions.addFavorite", {
                    defaultValue: "Add to favorites",
                  })
            }
          >
            <IconButton
              color={favorite ? "warning" : "default"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite();
              }}
            >
              <StarRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            icon={<TranslateRoundedIcon />}
            label={t("list.translationCount", {
              defaultValue: "{{count}} translations",
              count: completion.translations,
            })}
          />
          <Chip
            size="small"
            icon={<AutoAwesomeRoundedIcon />}
            label={t("list.explanationCount", {
              defaultValue: "{{count}} explanations",
              count: completion.explanations,
            })}
          />
          {favorite ? (
            <Chip
              size="small"
              color="warning"
              label={t("list.favoriteBadge", {
                defaultValue: "Favorite",
              })}
            />
          ) : null}
        </Stack>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.35 }}
          >
            {t("list.translationPreview", {
              defaultValue: "Translation preview",
            })}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.55,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {translationPreview ||
              t("list.noTranslation", {
                defaultValue: "No translation for this language yet.",
              })}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.35 }}
          >
            {t("list.explanationPreview", {
              defaultValue: "Explanation preview",
            })}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {explanationPreview ||
              t("list.noExplanation", {
                defaultValue: "No explanation for this language yet.",
              })}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
