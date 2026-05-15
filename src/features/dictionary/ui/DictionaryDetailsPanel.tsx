import React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import type { DictionaryEntry, DictionaryLanguage } from "../model/types";
import {
  DICTIONARY_LANGUAGES,
} from "../model/types";
import {
  getDictionaryCompletion,
} from "../model/helpers";
import { useTranslation } from "react-i18next";

export type DictionaryDetailsTab = "context" | "translations" | "explanations";

type Props = {
  desktop: boolean;
  favorite: boolean;
  item: DictionaryEntry | null;
  language: DictionaryLanguage;
  loading: boolean;
  tab: DictionaryDetailsTab;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onLanguageChange: (language: DictionaryLanguage) => void;
  onTabChange: (tab: DictionaryDetailsTab) => void;
  onToggleFavorite: () => void;
};

function DictionaryDetailsSkeleton() {
  return (
    <Stack spacing={1.5}>
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={44} />
      <Skeleton variant="rounded" height={88} />
      <Skeleton variant="rounded" height={140} />
    </Stack>
  );
}

export const DictionaryDetailsPanel: React.FC<Props> = ({
  desktop,
  favorite,
  item,
  language,
  loading,
  tab,
  onClose,
  onDelete,
  onEdit,
  onLanguageChange,
  onTabChange,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("dictionary");

  if (loading) {
    return (
      <Paper
        sx={{
          height: "100%",
          minWidth: 0,
          p: 2.25,
          borderRadius: 4,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundImage: theme.gradients.cardSoft,
        }}
      >
        <DictionaryDetailsSkeleton />
      </Paper>
    );
  }

  if (!item) {
    return (
      <Paper
        sx={{
          height: "100%",
          minWidth: 0,
          p: { xs: 2.2, md: 2.8 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundImage: theme.gradients.cardSoft,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -42,
            right: -42,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(37,99,235,0.18), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <Stack spacing={1.1} sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label={t("details.idleBadge", {
              defaultValue: "Personal dictionary",
            })}
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography variant="h5" fontWeight={900}>
            {t("details.emptyTitle", {
              defaultValue: "Select a saved word",
            })}
          </Typography>
          <Typography color="text.secondary">
            {t("details.emptyDescription", {
              defaultValue:
                "Review translations, explanation notes, and context for every word you keep in your personal dictionary.",
            })}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const completion = getDictionaryCompletion(item);
  const translationLanguages = [
    ...DICTIONARY_LANGUAGES,
    ...Object.keys(item.wordTranslations).filter(
      (itemLanguage) => !DICTIONARY_LANGUAGES.includes(itemLanguage as DictionaryLanguage),
    ),
  ];
  const explanationLanguages = [
    ...DICTIONARY_LANGUAGES,
    ...Object.keys(item.wordExplainingTranslations).filter(
      (itemLanguage) => !DICTIONARY_LANGUAGES.includes(itemLanguage as DictionaryLanguage),
    ),
  ];

  let content: React.ReactNode;

  if (tab === "context") {
    content = (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.8 }}>
          {t("details.contextTitle", {
            defaultValue: "Saved context",
          })}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {item.context ||
            t("details.noContext", {
              defaultValue: "No context is stored for this word yet.",
            })}
        </Typography>
      </Paper>
    );
  } else if (tab === "translations") {
    content = (
      <Stack spacing={1.15}>
        {translationLanguages.map((itemLanguage) => {
          const value = String(item.wordTranslations[itemLanguage] ?? "").trim();
          const active = itemLanguage === language;

          return (
            <Paper
              key={itemLanguage}
              variant="outlined"
              sx={{
                p: 1.4,
                borderRadius: 3,
                borderColor: active
                  ? alpha(theme.palette.primary.main, 0.55)
                  : undefined,
                backgroundColor: active
                  ? alpha(theme.palette.primary.main, 0.05)
                  : "transparent",
              }}
            >
              <Stack spacing={0.5}>
                <Typography fontWeight={800}>{itemLanguage}</Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {value ||
                    t("details.noTranslation", {
                      defaultValue: "No translation stored for this language yet.",
                    })}
                </Typography>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  } else {
    content = (
      <Stack spacing={1.15}>
        {explanationLanguages.map((itemLanguage) => {
          const value = String(
            item.wordExplainingTranslations[itemLanguage] ?? "",
          ).trim();
          const active = itemLanguage === language;

          return (
            <Paper
              key={itemLanguage}
              variant="outlined"
              sx={{
                p: 1.4,
                borderRadius: 3,
                borderColor: active
                  ? alpha(theme.palette.primary.main, 0.55)
                  : undefined,
                backgroundColor: active
                  ? alpha(theme.palette.primary.main, 0.05)
                  : "transparent",
              }}
            >
              <Stack spacing={0.5}>
                <Typography fontWeight={800}>{itemLanguage}</Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {value ||
                    t("details.noExplanation", {
                      defaultValue: "No explanation stored for this language yet.",
                    })}
                </Typography>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  return (
    <Paper
      sx={{
        height: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundImage: theme.gradients.cardSoft,
      }}
    >
      <Box
        sx={{
          px: 2.2,
          py: 2,
          color: "#fff",
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.94) 0%, rgba(37,99,235,0.9) 42%, rgba(30,64,175,0.9) 100%)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={t("details.wordBadge", {
                defaultValue: "Saved word",
              })}
              sx={{ backgroundColor: "rgba(255,255,255,0.16)", color: "#fff" }}
            />
            {favorite ? (
              <Chip
                label={t("details.favoriteBadge", {
                  defaultValue: "Favorite",
                })}
                sx={{ backgroundColor: "rgba(255,255,255,0.16)", color: "#fff" }}
              />
            ) : null}
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.14)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.24)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1} mt={3.2}>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {item.originalWord}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              maxWidth: desktop ? 460 : "100%",
              opacity: 0.92,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {item.context ||
              t("details.noContextShort", {
                defaultValue: "No context saved yet. Add one while editing this word.",
              })}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={1.4} sx={{ px: 2.2, pt: 1.8 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<TranslateRoundedIcon />}
            label={t("details.translationCount", {
              defaultValue: "{{count}} translations",
              count: completion.translations,
            })}
            variant="outlined"
          />
          <Chip
            icon={<AutoAwesomeRoundedIcon />}
            label={t("details.explanationCount", {
              defaultValue: "{{count}} explanations",
              count: completion.explanations,
            })}
            variant="outlined"
          />
          <Chip
            icon={<NotesRoundedIcon />}
            label={t("details.currentLanguage", {
              defaultValue: "Focused language: {{language}}",
              language,
            })}
            variant="outlined"
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
          sx={{ minWidth: 0 }}
        >
          <Tabs
            value={tab}
            onChange={(_, nextValue: DictionaryDetailsTab) => onTabChange(nextValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minWidth: 0,
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontWeight: 700,
              },
            }}
          >
            <Tab value="context" label={t("details.tabs.context", { defaultValue: "Context" })} />
            <Tab value="translations" label={t("details.tabs.translations", { defaultValue: "Translations" })} />
            <Tab value="explanations" label={t("details.tabs.explanations", { defaultValue: "Explanations" })} />
          </Tabs>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={language}
            onChange={(_, nextLanguage: DictionaryLanguage | null) => {
              if (nextLanguage) onLanguageChange(nextLanguage);
            }}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" }, flexShrink: 0 }}
          >
            {DICTIONARY_LANGUAGES.map((itemLanguage) => (
              <ToggleButton key={itemLanguage} value={itemLanguage}>
                {itemLanguage}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Tooltip
            title={favorite
              ? t("actions.removeFavorite", { defaultValue: "Remove from favorites" })
              : t("actions.addFavorite", { defaultValue: "Add to favorites" })}
          >
            <Button
              onClick={onToggleFavorite}
              variant={favorite ? "contained" : "outlined"}
              color={favorite ? "warning" : "primary"}
              startIcon={<StarRoundedIcon />}
              sx={{ borderRadius: 999 }}
            >
              {favorite
                ? t("actions.favorited", { defaultValue: "Favorited" })
                : t("actions.favorite", { defaultValue: "Favorite" })}
            </Button>
          </Tooltip>

          <Button
            onClick={onEdit}
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            sx={{ borderRadius: 999 }}
          >
            {t("actions.edit", { defaultValue: "Edit" })}
          </Button>

          <Button
            onClick={onDelete}
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            sx={{ borderRadius: 999 }}
          >
            {t("actions.delete", { defaultValue: "Delete" })}
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 1.6 }} />

      <Box
        sx={{
          px: 2.2,
          pb: 2.2,
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          minWidth: 0,
        }}
      >
        {content}
      </Box>
    </Paper>
  );
};
