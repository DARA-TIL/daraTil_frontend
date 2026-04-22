import React, { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFolkloreAdminStore } from "@/features/folklore/store/useFolkloreAdminStore";
import type { FolkloreCreateDto } from "@/features/folklore/model/types";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useUiStore } from "@/shared/store/useUiStore";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { useTranslation } from "react-i18next";

const TYPES = ["proverb", "story", "song", "legend", "aitys", "kui"];
const REGIONS = [
  "Almaty",
  "Astana",
  "Shymkent",
  "Batys",
  "Soltustik",
  "Ontustik",
];

const FolkloreCreatePage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tFolklore } = useTranslation("folklore");

  const create = useFolkloreAdminStore((s) => s.create);
  const loading = useFolkloreAdminStore((s) => s.loading);

  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const [form, setForm] = useState<FolkloreCreateDto>({
    type: "proverb",
    author: "",
    region: "Almaty",
    name: "",
    content: "",
    mediaUrl: null,
    imageUrl: null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  const set = <K extends keyof FolkloreCreateDto>(
    k: K,
    v: FolkloreCreateDto[K],
  ) =>
    setForm((s) => ({ ...s, [k]: v }));

  function validateFile(file: File, kind: "image" | "media"): string | null {
    const maxImageMb = 5;
    const maxMediaMb = 20;

    const sizeMb = file.size / (1024 * 1024);
    const type = (file.type || "").toLowerCase();

    if (kind === "image") {
      if (!type.startsWith("image/")) return t("folklore.validation.imageType");
      if (sizeMb > maxImageMb)
        return t("folklore.validation.imageTooLarge", { max: maxImageMb });
    } else {
      if (!(type.startsWith("audio/") || type.startsWith("video/")))
        return t("folklore.validation.mediaType");
      if (sizeMb > maxMediaMb)
        return t("folklore.validation.mediaTooLarge", { max: maxMediaMb });
    }

    return null;
  }

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!imageFile) return form.imageUrl ?? null;

    const err = validateFile(imageFile, "image");
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setImageUploading(true);
      const res = await uploadToCloudinary(imageFile, {
        kind: "image",
        folder: "daratil/folklore/images",
      });
      set("imageUrl", res.secureUrl);
      return res.secureUrl;
    } catch {
      showSnackbar(t("folklore.validation.imageUploadFailed"), "error");
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const uploadMediaIfNeeded = async (): Promise<string | null> => {
    if (!mediaFile) return form.mediaUrl ?? null;

    const err = validateFile(mediaFile, "media");
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setMediaUploading(true);
      // audio/video -> kind video (Cloudinary)
      const res = await uploadToCloudinary(mediaFile, {
        kind: "video",
        folder: "daratil/folklore/media",
      });
      set("mediaUrl", res.secureUrl);
      return res.secureUrl;
    } catch {
      showSnackbar(t("folklore.validation.mediaUploadFailed"), "error");
      return null;
    } finally {
      setMediaUploading(false);
    }
  };

  const busy = loading || imageUploading || mediaUploading;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={2}>
        {t("folklore.createTitle")}
      </Typography>

      <Paper
        sx={{
          p: 2.2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
        }}
      >
        <Stack gap={2}>
          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              label={t("folklore.fields.type")}
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              select
              fullWidth
            >
              {TYPES.map((x) => (
                <MenuItem key={x} value={x}>
                  {tFolklore(`types.${x}`, { defaultValue: x })}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("folklore.fields.region")}
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
              select
              fullWidth
            >
              {REGIONS.map((x) => (
                <MenuItem key={x} value={x}>
                  {tFolklore(`regions.${x}`, { defaultValue: x })}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("folklore.fields.author")}
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label={t("folklore.fields.name")}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            fullWidth
          />

          <TextField
            label={t("folklore.fields.content")}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            fullWidth
            multiline
            minRows={6}
          />

          {/* IMAGE */}
          <FileUploadField
            label={t("folklore.upload.imageLabel")}
            urlValue={form.imageUrl ?? ""}
            onUrlChange={(v) => set("imageUrl", v.trim() ? v.trim() : null)}
            file={imageFile}
            onFileChange={(f) => {
              setImageFile(f);
              // set("imageUrl", null);
            }}
            uploading={imageUploading}
            uploadedUrl={form.imageUrl}
            accept="image/*"
            helperText={t("folklore.helpers.image")}
          />

          {/* MEDIA */}
          <FileUploadField
            label={t("folklore.upload.mediaLabel")}
            urlValue={form.mediaUrl ?? ""}
            onUrlChange={(v) => set("mediaUrl", v.trim() ? v.trim() : null)}
            file={mediaFile}
            onFileChange={(f) => {
              setMediaFile(f);
              // set("mediaUrl", null);
            }}
            uploading={mediaUploading}
            uploadedUrl={form.mediaUrl}
            accept="audio/*,video/*"
            helperText={t("folklore.helpers.media")}
          />

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => nav("/app/admin/folklore")}
              disabled={busy}
            >
              {t("common.cancel")}
            </Button>

            <Button
              variant="contained"
              disabled={busy || !form.name.trim() || !form.content.trim()}
              onClick={async () => {
                if (!form.name.trim()) {
                  showSnackbar(
                    t("folklore.validation.requiredName"),
                    "warning",
                  );
                  return;
                }
                if (!form.content.trim()) {
                  showSnackbar(
                    t("folklore.validation.requiredContent"),
                    "warning",
                  );
                  return;
                }

                // 1) Upload files (if any)
                const img = await uploadImageIfNeeded();
                if (imageFile && !img) return;

                const media = await uploadMediaIfNeeded();
                if (mediaFile && !media) return;

                // 2) Create folklore with final urls
                const created = await create({
                  ...form,
                  author: form.author.trim(),
                  name: form.name.trim(),
                  content: form.content.trim(),
                  imageUrl: img ?? form.imageUrl ?? null,
                  mediaUrl: media ?? form.mediaUrl ?? null,
                });

                if (created) nav(`/app/admin/folklore/${created.id}/edit`);
              }}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              {t("common.create")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FolkloreCreatePage;
