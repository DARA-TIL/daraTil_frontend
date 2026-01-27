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

const LessonCreatePage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const create = useLessonsAdminStore((s) => s.create);
  const loading = useLessonsAdminStore((s) => s.loading);

  const [form, setForm] = useState<LessonCreateDto>({
    name: "",
    description: "",
    imageUrl: null,
    author: "",
    reward: 50,
    requiredLevel: 1,
    blocks: [],
  });

  const set = (k: keyof LessonCreateDto, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const validateImage = (file: File): string | null => {
    const maxMb = 5;
    const sizeMb = file.size / (1024 * 1024);
    const type = (file.type || "").toLowerCase();
    if (!type.startsWith("image/")) return "Please select an image file.";
    if (sizeMb > maxMb) return `Image is too large (max ${maxMb}MB).`;
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
      showSnackbar("Image upload failed. Please try again.", "error");
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
          Create lesson
        </Typography>

        <Button
          variant="outlined"
          onClick={() => nav("/app/admin/lessons")}
          disabled={busy}
        >
          Back
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
              label="Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              fullWidth
            />
            <TextField
              label="Author"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />

          <Stack direction={{ xs: "column", md: "row" }} gap={2}>
            <TextField
              label="Reward (XP)"
              value={form.reward}
              onChange={(e) => set("reward", Number(e.target.value) || 0)}
              type="number"
              sx={{ minWidth: { md: 220 } }}
            />
            <TextField
              label="Required level"
              value={form.requiredLevel}
              onChange={(e) =>
                set("requiredLevel", Number(e.target.value) || 0)
              }
              type="number"
              sx={{ minWidth: { md: 220 } }}
            />
          </Stack>

          <FileUploadField
            label="Image"
            urlValue={form.imageUrl ?? ""}
            onUrlChange={(v) => set("imageUrl", v.trim() ? v.trim() : null)}
            file={imageFile}
            onFileChange={setImageFile}
            uploading={imageUploading}
            uploadedUrl={form.imageUrl}
            accept="image/*"
            helperText="Paste URL or upload a file. Upload will be sent to Cloudinary."
          />

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="contained"
              disabled={busy}
              onClick={async () => {
                if (!form.name.trim()) {
                  showSnackbar("Name is required", "warning");
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
                  blocks: [],
                });

                console.log(created); 

                if (!created) {
                  showSnackbar("Create failed", "error");
                  return;
                }

                showSnackbar("Lesson created", "success");
                nav(`/app/admin/lessons/${created.ID}/edit`);
              }}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              Create
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LessonCreatePage;
