import React, { useEffect, useMemo, useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useUiStore } from "@/shared/store/useUiStore";
import { useUsersAdminStore } from "@/features/users/store/useUsersAdminStore";
import type { UserUpdateDto } from "@/features/users/model/types";

type UserEditForm = {
  username: string;
  role: string;
  avatar: string | null;
  password: string;
};

const UserEditAdminPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { id } = useParams();
  const userId = useMemo(() => Number(id), [id]);

  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const loading = useUsersAdminStore((s) => s.loading);
  const selected = useUsersAdminStore((s) => s.selected);
  const fetchById = useUsersAdminStore((s) => s.fetchById);
  const updateById = useUsersAdminStore((s) => s.updateById);

  const [form, setForm] = useState<UserEditForm>({
    username: "",
    role: "user",
    avatar: "" as string | null,
    password: "",
  });

  useEffect(() => {
    if (!userId || Number.isNaN(userId)) return;
    fetchById(userId);
  }, [userId, fetchById]);

  useEffect(() => {
    if (!selected) return;
    setForm({
      username: selected.username ?? "",
      role: selected.role ?? "user",
      avatar: selected.avatar ?? null,
      password: "",
    });
  }, [selected]);

  const set = <K extends keyof UserEditForm>(k: K, v: UserEditForm[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const validateAvatar = (file: File): string | null => {
    const maxMb = 5;
    const sizeMb = file.size / (1024 * 1024);
    const type = (file.type || "").toLowerCase();
    if (!type.startsWith("image/")) return "Please select an image file.";
    if (sizeMb > maxMb) return `Image is too large (max ${maxMb}MB).`;
    return null;
  };

  const uploadAvatarIfNeeded = async (): Promise<string | null> => {
    if (!avatarFile) return form.avatar ?? null;

    const err = validateAvatar(avatarFile);
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setAvatarUploading(true);
      const res = await uploadToCloudinary(avatarFile, {
        kind: "image",
        folder: "daratil/users/avatars",
      });
      set("avatar", res.secureUrl);
      return res.secureUrl;
    } catch {
      showSnackbar("Avatar upload failed. Please try again.", "error");
      return null;
    } finally {
      setAvatarUploading(false);
    }
  };

  const busy = loading || avatarUploading;

  if (!selected) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={900}>
          Edit user
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={900} noWrap>
            Edit user #{selected.id} - {selected.username}
          </Typography>
          <Typography color="text.secondary">{selected.email}</Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => nav("/app/admin/users")}
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
              label="Username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              fullWidth
            />

            <TextField
              label="Role"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              select
              sx={{ minWidth: { md: 220 } }}
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
          </Stack>

          <FileUploadField
            label="Avatar"
            urlValue={form.avatar ?? ""}
            onUrlChange={(v) => set("avatar", v.trim() ? v.trim() : null)}
            file={avatarFile}
            onFileChange={setAvatarFile}
            uploading={avatarUploading}
            uploadedUrl={form.avatar ?? null}
            accept="image/*"
            helperText="Paste URL or upload. Upload will be sent to Cloudinary."
          />

          <TextField
            label="Password (optional)"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            type="password"
            helperText="Leave empty to keep current password."
            fullWidth
          />

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="contained"
              disabled={busy}
              onClick={async () => {
                if (!form.username.trim()) {
                  showSnackbar("Username is required", "warning");
                  return;
                }

                const avatarUrl = await uploadAvatarIfNeeded();
                if (avatarFile && !avatarUrl) return;

                const payload: UserUpdateDto = {
                  username: form.username.trim(),
                  role: form.role,
                  avatar: avatarUrl ?? form.avatar ?? undefined,
                };

                if (form.password.trim()) payload.password = form.password;

                const ok = await updateById(selected.id, payload);
                if (!ok) return;

                showSnackbar("Saved", "success");
                nav("/app/admin/users");
              }}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UserEditAdminPage;
