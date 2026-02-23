import React, { useState } from "react";
import { Grid, Stack, TextField, Typography, Button } from "@mui/material";
import ProfileSectionCard from "../ProfileSectionCard";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const ProfileSecurityTab: React.FC = () => {
  const show = useUiStore((s) => s.showSnackbar);

  const [password, setPassword] = useState("");

  const updateProfile = useAuthStore((s) => s.updateProfile);

  const onChangePassword = async () => {
    if (!password.trim()) {
      show("Password is required", "warning");
      return;
    }
    const ok = await updateProfile({ password: password.trim() });
    if (ok) show("Password updated", "success");
    setPassword("");
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            Change password
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Button variant="contained" onClick={onChangePassword}>
              Update password
            </Button>
          </Stack>
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            Security tips
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              - Use at least 8 characters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Mix letters, numbers and symbols
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Do not reuse passwords from other services
            </Typography>
          </Stack>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileSecurityTab;
