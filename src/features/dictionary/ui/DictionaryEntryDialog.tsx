import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { DICTIONARY_LANGUAGES, type DictionaryCreateDto, type DictionaryEntry, type DictionaryLanguage, type DictionaryUpdateDto } from "../model/types";
import { compactDictionaryMap } from "../model/helpers";

type Mode = "create" | "edit";

type Props = {
  initialValue?: DictionaryEntry | null;
  loading: boolean;
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: DictionaryCreateDto | DictionaryUpdateDto) => Promise<void> | void;
};

type DraftMap = Record<DictionaryLanguage, string>;

function createEmptyMap(): DraftMap {
  return {
    KZ: "",
    RU: "",
    EN: "",
  };
}

function normalizeDraftMap(source?: Record<string, string>): DraftMap {
  return {
    KZ: String(source?.KZ ?? ""),
    RU: String(source?.RU ?? ""),
    EN: String(source?.EN ?? ""),
  };
}

export const DictionaryEntryDialog: React.FC<Props> = ({
  initialValue,
  loading,
  mode,
  open,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation("dictionary");
  const [originalWord, setOriginalWord] = useState("");
  const [context, setContext] = useState("");
  const [translations, setTranslations] = useState<DraftMap>(createEmptyMap);
  const [explanations, setExplanations] = useState<DraftMap>(createEmptyMap);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;

    setOriginalWord(initialValue?.originalWord ?? "");
    setContext(initialValue?.context ?? "");
    setTranslations(normalizeDraftMap(initialValue?.wordTranslations));
    setExplanations(
      normalizeDraftMap(initialValue?.wordExplainingTranslations),
    );
    setValidationError("");
  }, [initialValue, open]);

  const hasContent = useMemo(
    () =>
      Boolean(
        context.trim() ||
          Object.values(translations).some((value) => value.trim()) ||
          Object.values(explanations).some((value) => value.trim()),
      ),
    [context, explanations, translations],
  );

  const title =
    mode === "edit"
      ? t("dialog.editTitle", { defaultValue: "Edit dictionary entry" })
      : t("dialog.createTitle", { defaultValue: "Create dictionary entry" });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            label={t("dialog.fields.originalWord", { defaultValue: "Word" })}
            value={originalWord}
            onChange={(event) => setOriginalWord(event.target.value)}
            fullWidth
            autoFocus
          />

          <TextField
            label={t("dialog.fields.context", { defaultValue: "Context" })}
            value={context}
            onChange={(event) => setContext(event.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <Divider />

          <Stack spacing={1}>
            <Typography fontWeight={900}>
              {t("dialog.sections.translations", {
                defaultValue: "Translations",
              })}
            </Typography>
            <Grid container spacing={1.5}>
              {DICTIONARY_LANGUAGES.map((language) => (
                <Grid key={language} size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={language}
                    value={translations[language]}
                    onChange={(event) =>
                      setTranslations((current) => ({
                        ...current,
                        [language]: event.target.value,
                      }))
                    }
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Stack spacing={1}>
            <Typography fontWeight={900}>
              {t("dialog.sections.explanations", {
                defaultValue: "Explanations",
              })}
            </Typography>
            <Grid container spacing={1.5}>
              {DICTIONARY_LANGUAGES.map((language) => (
                <Grid key={language} size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={language}
                    value={explanations[language]}
                    onChange={(event) =>
                      setExplanations((current) => ({
                        ...current,
                        [language]: event.target.value,
                      }))
                    }
                    fullWidth
                    multiline
                    minRows={4}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>

          {validationError ? (
            <Typography color="error" variant="body2">
              {validationError}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>{t("common.cancel", { defaultValue: "Cancel" })}</Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={async () => {
            if (!originalWord.trim()) {
              setValidationError(
                t("validation.wordRequired", {
                  defaultValue: "Word is required.",
                }),
              );
              return;
            }

            if (!hasContent) {
              setValidationError(
                t("validation.contentRequired", {
                  defaultValue:
                    "Add context, translation, or explanation before saving.",
                }),
              );
              return;
            }

            setValidationError("");

            const payloadBase: DictionaryCreateDto = {
              context: context.trim(),
              originalWord: originalWord.trim(),
              wordTranslations: compactDictionaryMap(translations),
              wordExplainingTranslations: compactDictionaryMap(explanations),
            };

            if (mode === "edit" && initialValue) {
              await onSubmit({
                ...payloadBase,
                id: initialValue.id,
              });
              return;
            }

            await onSubmit(payloadBase);
          }}
        >
          {mode === "edit"
            ? t("actions.save", { defaultValue: "Save" })
            : t("actions.create", { defaultValue: "Create" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
