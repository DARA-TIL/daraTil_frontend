import React, { useRef } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  label: string;
  urlValue: string;
  onUrlChange: (v: string) => void;

  file: File | null;
  onFileChange: (f: File | null) => void;

  uploading: boolean;
  uploadedUrl?: string | null;

  accept?: string;
  helperText?: string;
};

const FileUploadField: React.FC<Props> = ({
  label,
  urlValue,
  onUrlChange,
  file,
  onFileChange,
  uploading,
  uploadedUrl,
  accept,
  helperText,
}) => {
  const { t } = useTranslation("admin");
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={2}
        alignItems="stretch"
      >
        <TextField
          label={t("fileUpload.urlLabel", { label })}
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
          fullWidth
          helperText={helperText}
        />

        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="flex-end"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onFileChange(f);
            }}
          />

          <Button
            variant="outlined"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {file ? t("fileUpload.changeFile") : t("fileUpload.uploadFile")}
          </Button>

          {file && (
            <Button
              variant="text"
              color="error"
              onClick={() => {
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={uploading}
            >
              {t("common.remove")}
            </Button>
          )}
        </Stack>
      </Stack>

      {file && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {t("fileUpload.selected", {
            name: file.name,
            sizeKb: Math.round(file.size / 1024),
          })}
        </Typography>
      )}

      {uploading && <LinearProgress sx={{ mt: 1.2 }} />}

      {!uploading && uploadedUrl && (
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          {t("fileUpload.uploaded", { url: uploadedUrl })}
        </Typography>
      )}
    </Box>
  );
};

export default FileUploadField;
