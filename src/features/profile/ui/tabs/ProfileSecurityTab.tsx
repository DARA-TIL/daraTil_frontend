import React, { useState } from "react";
import { Grid, Stack, TextField, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import ProfileSectionCard from "../ProfileSectionCard";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const ProfileSecurityTab: React.FC = () => {
  const { t } = useTranslation("profile");
  const show = useUiStore((s) => s.showSnackbar);

  const [password, setPassword] = useState("");

  const updateProfile = useAuthStore((s) => s.updateProfile);

  const onChangePassword = async () => {
    if (!password.trim()) {
      show(
        t("security.passwordRequired", {
          defaultValue: "Password is required",
        }),
        "warning",
      );
      return;
    }
    await updateProfile({ password: password.trim() });
    setPassword("");
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            {t("security.title", { defaultValue: "Change password" })}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label={t("security.newPassword", { defaultValue: "New password" })}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Button variant="contained" onClick={onChangePassword}>
              {t("security.updatePassword", {
                defaultValue: "Update password",
              })}
            </Button>
          </Stack>
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            {t("security.tipsTitle", { defaultValue: "Security tips" })}
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              -{" "}
              {t("security.tip1", {
                defaultValue: "Use at least 8 characters",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              -{" "}
              {t("security.tip2", {
                defaultValue: "Mix letters, numbers, and symbols",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              -{" "}
              {t("security.tip3", {
                defaultValue: "Do not reuse passwords from other services",
              })}
            </Typography>
          </Stack>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileSecurityTab;
