import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { LessonCreateDto } from "@/features/lessons/model/types";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useUiStore } from "@/shared/store/useUiStore";
import { useLessonsAdminStore } from "@/features/lessons/store/useLessonAdminStore";
import { useTranslation } from "react-i18next";

const LessonCreatePage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const create = useLessonsAdminStore((s) => s.create);
  const loading = useLessonsAdminStore((s) => s.loading);

  const [form, setForm] = useState<LessonCreateDto>({
    name: "",
    description: "",
    imageUrl: null,
    author: "",
    reward: 500,
    requiredLevel: 1,
  });

  const set = <K extends keyof LessonCreateDto>(k: K, v: LessonCreateDto[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const validateImage = (file: File): string | null => {
    const maxMb = 5;
    const sizeMb = file.size / (1024 * 1024);
    const type = (file.type || "").toLowerCase();
    if (!type.startsWith("image/")) return t("lessons.validation.imageType");
    if (sizeMb > maxMb)
      return t("lessons.validation.imageTooLarge", { max: maxMb });
    return null;
  };

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!imageFile) return form.imageUrl ?? null;

    const err = validateImage(imageFile);
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setImageUploading(true);
      const res = await uploadToCloudinary(imageFile, {
        kind: "image",
        folder: "daratil/lessons/images",
      });
      set("imageUrl", res.secureUrl);
      return res.secureUrl;
    } catch {
      showSnackbar(t("lessons.snackbar.imageUploadFailed"), "error");
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const busy = loading || imageUploading;

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={900}>
          {t("lessons.createTitle")}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => nav("/app/admin/lessons")}
          disabled={busy}
        >
          {t("common.back")}
        </Button>
      </Stack>

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
              label={t("lessons.fields.name")}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              fullWidth
            />
            <TextField
              label={t("lessons.fields.author")}
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label={t("lessons.fields.description")}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />

          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              label={t("lessons.fields.reward")}
              value={form.reward}
              onChange={(e) => set("reward", Number(e.target.value) || 0)}
              type="number"
              sx={{ minWidth: { md: 220 } }}
            />
            <TextField
              label={t("lessons.fields.requiredLevel")}
              value={form.requiredLevel}
              onChange={(e) =>
                set("requiredLevel", Number(e.target.value) || 0)
              }
              type="number"
              sx={{ minWidth: { md: 220 } }}
            />
          </Stack>

          <FileUploadField
            label={t("lessons.fields.image")}
            urlValue={form.imageUrl ?? ""}
            onUrlChange={(v) => set("imageUrl", v.trim() ? v.trim() : null)}
            file={imageFile}
            onFileChange={setImageFile}
            uploading={imageUploading}
            uploadedUrl={form.imageUrl}
            accept="image/*"
            helperText={t("lessons.helpers.upload")}
          />

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="contained"
              disabled={busy}
              onClick={async () => {
                if (!form.name.trim()) {
                  showSnackbar(t("lessons.validation.nameRequired"), "warning");
                  return;
                }
                if (!form.author.trim()) {
                  showSnackbar(
                    t("lessons.validation.authorRequired"),
                    "warning",
                  );
                  return;
                }

                const img = await uploadImageIfNeeded();
                if (imageFile && !img) return;

                const created = await create({
                  ...form,
                  name: form.name.trim(),
                  author: form.author.trim(),
                  description: form.description.trim(),
                  imageUrl: img ?? form.imageUrl ?? null,
                });

                if (!created) {
                  showSnackbar(t("lessons.snackbar.createFailed"), "error");
                  return;
                }

                showSnackbar(t("lessons.snackbar.created"), "success");
                nav(`/app/admin/lessons/${created.ID}/edit`);
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

export default LessonCreatePage;
