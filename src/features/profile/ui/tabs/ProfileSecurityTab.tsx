import React from "react";
import { Alert, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ProfileSectionCard from "../ProfileSectionCard";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const ProfileSecurityTab: React.FC = () => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={0.75}>
            {t("security.title", { defaultValue: "Change password" })}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("security.subtitle", {
              defaultValue:
                "We will send a verification code to your account email before changing the password.",
            })}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label={t("overview.email", { defaultValue: "Email" })}
              value={user.email}
              disabled
              fullWidth
            />

            {user.authProvider && user.authProvider !== "local" && (
              <Alert severity="info">
                {t("security.providerHint", {
                  defaultValue:
                    "This account uses {{provider}} sign-in. You can still request a password reset if a password is configured.",
                  provider: user.authProvider,
                })}
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={<LockResetOutlinedIcon />}
              onClick={() =>
                navigate(
                  `/forgot-password?email=${encodeURIComponent(
                    user.email,
                  )}&returnTo=${encodeURIComponent("/app/profile")}`,
                )
              }
            >
              {t("security.startPasswordReset", {
                defaultValue: "Send verification code",
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
