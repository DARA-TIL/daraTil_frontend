import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { DICTIONARY_LANGUAGES, type DictionaryFavoriteWordRequest, type DictionaryLanguage } from "../model/types";

type Props = {
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: DictionaryFavoriteWordRequest) => Promise<void> | void;
};

export const DictionaryQuickFavoriteDialog: React.FC<Props> = ({
  loading,
  open,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation("dictionary");
  const [word, setWord] = useState("");
  const [block, setBlock] = useState("");
  const [language, setLanguage] = useState<DictionaryLanguage>("KZ");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;
    setWord("");
    setBlock("");
    setLanguage("KZ");
    setValidationError("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("quickFavorite.title", {
          defaultValue: "Quick save favorite word",
        })}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography color="text.secondary">
            {t("quickFavorite.subtitle", {
              defaultValue:
                "Use the AI-assisted backend route to generate and immediately favorite a dictionary entry from a word inside its original text block.",
            })}
          </Typography>

          <TextField
            label={t("quickFavorite.fields.word", { defaultValue: "Word" })}
            value={word}
            onChange={(event) => setWord(event.target.value)}
            fullWidth
            autoFocus
          />

          <TextField
            label={t("quickFavorite.fields.language", {
              defaultValue: "Source language",
            })}
            value={language}
            onChange={(event) => setLanguage(event.target.value as DictionaryLanguage)}
            select
            fullWidth
          >
            {DICTIONARY_LANGUAGES.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t("quickFavorite.fields.block", {
              defaultValue: "Original text block",
            })}
            value={block}
            onChange={(event) => setBlock(event.target.value)}
            fullWidth
            multiline
            minRows={5}
          />

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
            if (!word.trim()) {
              setValidationError(
                t("validation.wordRequired", {
                  defaultValue: "Word is required.",
                }),
              );
              return;
            }

            if (!block.trim()) {
              setValidationError(
                t("quickFavorite.validation.blockRequired", {
                  defaultValue: "Original text block is required.",
                }),
              );
              return;
            }

            setValidationError("");
            await onSubmit({
              block: block.trim(),
              lang: language,
              word: word.trim(),
            });
          }}
        >
          {t("quickFavorite.submit", {
            defaultValue: "Generate and favorite",
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
