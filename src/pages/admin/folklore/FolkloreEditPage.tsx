import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import FolkloreAdminService from "@/features/folklore/api/FolkloreAdminService";
import { useFolkloreAdminStore } from "@/features/folklore/store/useFolkloreAdminStore";
import type {
  Folklore,
  FolkloreUpdateDto,
} from "@/features/folklore/model/types";
import { useTranslation } from "react-i18next";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useUiStore } from "@/shared/store/useUiStore";

const TYPES = ["proverb", "story", "song", "legend", "aitys", "kui"];
const REGIONS = [
  "Almaty",
  "Astana",
  "Shymkent",
  "Batys",
  "Soltustik",
  "Ontustik",
];

const FolkloreEditPage: React.FC = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const folkloreId = useMemo(() => Number(id), [id]);

  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const loading = useFolkloreAdminStore((s) => s.loading);
  const update = useFolkloreAdminStore((s) => s.update);

  const [item, setItem] = useState<Folklore | null>(null);

  // опционально: добавим загрузку файлов (как в Create), чтобы Edit тоже умел Cloudinary
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  useEffect(() => {
    if (!folkloreId || Number.isNaN(folkloreId)) return;
    FolkloreAdminService.getById(folkloreId)
      .then(setItem)
      .catch(() => setItem(null));
  }, [folkloreId]);

  const patch = (k: keyof Folklore, v: any) =>
    setItem((s) => (s ? ({ ...s, [k]: v } as Folklore) : s));

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
    if (!imageFile) return item?.imageUrl ?? null;

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
      patch("imageUrl", res.secureUrl);
      return res.secureUrl;
    } catch {
      showSnackbar(t("folklore.validation.imageUploadFailed"), "error");
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const uploadMediaIfNeeded = async (): Promise<string | null> => {
    if (!mediaFile) return item?.mediaUrl ?? null;

    const err = validateFile(mediaFile, "media");
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setMediaUploading(true);
      const res = await uploadToCloudinary(mediaFile, {
        kind: "video",
        folder: "daratil/folklore/media",
      });
      patch("mediaUrl", res.secureUrl);
      return res.secureUrl;
    } catch {
      showSnackbar(t("folklore.validation.mediaUploadFailed"), "error");
      return null;
    } finally {
      setMediaUploading(false);
    }
  };

  if (!item) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={800}>
          {t("folklore.editTitle")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t("common.loading")}
        </Typography>
      </Box>
    );
  }

  const busy = loading || imageUploading || mediaUploading;

  const onSave = async (payload: FolkloreUpdateDto) => {
    const updated = await update(item.id, payload);
    if (updated) setItem((prev) => ({ ...(prev as Folklore), ...updated }));
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={800}>
          {t("folklore.editTitleWithId", { id: item.id })}
        </Typography>

        <Button variant="outlined" onClick={() => nav("/app/admin/folklore")}>
          {t("common.back")}
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack gap={2}>
          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              label={t("folklore.fields.type")}
              value={item.type}
              onChange={(e) => patch("type", e.target.value)}
              select
              fullWidth
            >
              {TYPES.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("folklore.fields.region")}
              value={item.region}
              onChange={(e) => patch("region", e.target.value)}
              select
              fullWidth
            >
              {REGIONS.map((x) => (
                <MenuItem key={x} value={x}>
                  {x}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("folklore.fields.author")}
              value={item.author}
              onChange={(e) => patch("author", e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label={t("folklore.fields.name")}
            value={item.name}
            onChange={(e) => patch("name", e.target.value)}
            fullWidth
          />

          <TextField
            label={t("folklore.fields.content")}
            value={item.content}
            onChange={(e) => patch("content", e.target.value)}
            fullWidth
            multiline
            minRows={6}
          />

          {/* IMAGE (url + file) */}
          <FileUploadField
            label={t("folklore.upload.imageLabel")}
            urlValue={item.imageUrl ?? ""}
            onUrlChange={(v) => patch("imageUrl", v.trim() ? v.trim() : null)}
            file={imageFile}
            onFileChange={(f) => setImageFile(f)}
            uploading={imageUploading}
            uploadedUrl={item.imageUrl}
            accept="image/*"
            helperText={t("folklore.helpers.image")}
          />

          {/* MEDIA (url + file) */}
          <FileUploadField
            label={t("folklore.upload.mediaLabel")}
            urlValue={item.mediaUrl ?? ""}
            onUrlChange={(v) => patch("mediaUrl", v.trim() ? v.trim() : null)}
            file={mediaFile}
            onFileChange={(f) => setMediaFile(f)}
            uploading={mediaUploading}
            uploadedUrl={item.mediaUrl}
            accept="audio/*,video/*"
            helperText={t("folklore.helpers.media")}
          />

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              disabled={busy}
              onClick={async () => {
                const img = await uploadImageIfNeeded();
                if (imageFile && !img) return;

                const media = await uploadMediaIfNeeded();
                if (mediaFile && !media) return;

                await onSave({
                  type: item.type,
                  region: item.region,
                  author: item.author,
                  mediaUrl: media ?? item.mediaUrl,
                  imageUrl: img ?? item.imageUrl,
                });
              }}
            >
              {t("folklore.actions.saveMetadata")}
            </Button>

            <Button
              variant="contained"
              disabled={busy || !item.name.trim() || !item.content.trim()}
              onClick={async () => {
                const img = await uploadImageIfNeeded();
                if (imageFile && !img) return;

                const media = await uploadMediaIfNeeded();
                if (mediaFile && !media) return;

                await onSave({
                  name: item.name.trim(),
                  content: item.content.trim(),
                  mediaUrl: media ?? item.mediaUrl,
                  imageUrl: img ?? item.imageUrl,
                });
              }}
            >
              {t("folklore.actions.saveAndRetranslate")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography fontWeight={800} mb={1}>
          {t("folklore.translations.title")}
        </Typography>

        {item.translations?.length ? (
          <Stack gap={1}>
            {item.translations.map((tr) => (
              <Paper key={tr.id} variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontWeight={700}>
                  {String(tr.language).toUpperCase()} - {tr.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
                >
                  {tr.content}
                </Typography>

                {!!tr.explanation && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap", mt: 1 }}
                  >
                    {tr.explanation}
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            {t("folklore.translations.empty")}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default FolkloreEditPage;
