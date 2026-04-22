// src/pages/auth/ForgotPassword.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthService from "@/features/auth/api/AuthService";
import { useUiStore } from "@/shared/store/useUiStore";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";

type Step = 1 | 2 | 3;

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string>("");

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // 1) запрос кода
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");

    if (!email.trim()) {
      setFieldError(t("errors.required"));
      return;
    }

    setLoading(true);
    try {
      await AuthService.requestPasswordReset(email.trim());
      showSnackbar(t("forgot.codeSent"), "success");
      setStep(2);
    } catch (error: unknown) {
      let msg = t("forgot.genericError");

      msg = getApiErrorMessage(error) ?? msg;

      setFieldError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2) верификация кода
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");

    if (!code.trim()) {
      setFieldError(t("errors.required"));
      return;
    }

    setLoading(true);
    try {
      await AuthService.verifyPasswordReset(code.trim());
      showSnackbar(t("forgot.codeVerified"), "success");
      setStep(3);
    } catch (error: unknown) {
      let msg = t("forgot.genericError");

      msg = getApiErrorMessage(error) ?? msg;

      setFieldError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // 3) установка нового пароля
  const handleConfirmPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setFieldError(t("errors.required"));
      return;
    }

    if (password.length < 8) {
      setFieldError(t("errors.min8"));
      return;
    }

    if (password !== confirmPassword) {
      setFieldError(t("errors.passwordsNotMatch"));
      return;
    }

    setLoading(true);
    try {
      await AuthService.confirmPasswordReset(password);
      showSnackbar(t("forgot.passwordChanged"), "success");
      navigate("/login");
    } catch (error: unknown) {
      let msg = t("forgot.genericError");

      msg = getApiErrorMessage(error) ?? msg;

      setFieldError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <Box component="form" onSubmit={handleRequestCode} noValidate>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              type="email"
              id="email"
              label={t("email")}
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(fieldError)}
              helperText={fieldError || " "}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {t("forgot.requestButton")}
          </Button>
        </Box>
      );
    }

    if (step === 2) {
      return (
        <Box component="form" onSubmit={handleVerifyCode} noValidate>
          <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
            {t("resetCodeSubtitle", { email })}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              id="code"
              label={t("code")}
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={Boolean(fieldError)}
              helperText={fieldError || " "}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {t("forgot.verifyButton")}
          </Button>
        </Box>
      );
    }

    // step === 3
    return (
      <Box component="form" onSubmit={handleConfirmPassword} noValidate>
        <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
          {t("newPasswordSubtitle")}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            id="new-password"
            label={t("newPassword")}
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            id="confirm-new-password"
            label={t("confirmNewPassword")}
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError || " "}
          />
        </Box>

        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {t("forgot.changeButton")}
        </Button>
      </Box>
    );
  };

  const title =
    step === 1
      ? t("forgotPasswordTitle")
      : step === 2
      ? t("resetCodeTitle")
      : t("newPasswordTitle");

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {title}
        </Typography>

        <Box sx={{ mb: 3 }}>
          {step === 1 && (
            <Typography variant="body2" color="text.secondary" align="center">
              {t("forgotPasswordSubtitle")}
            </Typography>
          )}
        </Box>

        {renderStepContent()}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            size="small"
            onClick={handleBackToLogin}
            sx={{ textTransform: "none" }}
          >
            {t("backToLogin")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
