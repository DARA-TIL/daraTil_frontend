import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import { useTranslation } from "react-i18next";
import OAuthButtons from "@/features/auth/ui/OAuthButtons";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUiStore } from "@/shared/store/useUiStore";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation("auth");

  const login = useAuthStore((state) => state.login);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuth = useAuthStore((state) => state.isAuth);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const oauth = searchParams.get("oauth");
  const oauthError = searchParams.get("error");

  // 1) Ошибка от OAuth (?oauth=error&error=...)
  useEffect(() => {
    if (oauth === "error" && oauthError) {
      showSnackbar(oauthError, "error");
    }
  }, [oauth, oauthError, showSnackbar]);

  // 2) Успешный OAuth (google / github) → дергаем /auth/refresh
  useEffect(() => {
    if (oauth !== "google" && oauth !== "github") return;
    if (isAuth) return;

    (async () => {
      const user = await checkAuth();

      if (user) {
        showSnackbar(t("loginSuccess"), "success");
        navigate("/app", { replace: true });
      } else {
        showSnackbar(t("errors.serverError"), "error");
      }
    })();
  }, [oauth, isAuth, checkAuth, navigate, showSnackbar, t]);

  // 3) обычный логин по email/password
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    initialStatus: "",
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t("errors.invalidEmail"))
        .required(t("errors.required")),
      password: Yup.string()
        .min(8, t("errors.min8"))
        .required(t("errors.required")),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setStatus("");

      try {
        const user = await login(values.email, values.password);

        if (user) {
          const rawNext = searchParams.get("next");
          const decodedNext = rawNext ? decodeURIComponent(rawNext) : null;

          const next =
            decodedNext && decodedNext !== "/register" ? decodedNext : "/app";

          showSnackbar(t("loginSuccess"), "success");
          navigate(next);
          return;
        }

        const msg = t("errors.invalidCredentials");
        setStatus(msg);
        showSnackbar(msg, "error");
      } catch (error: unknown) {
        let key: string = "errors.serverError";

        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          if (status === 400 || status === 401) {
            key = "errors.invalidCredentials";
          }
        }

        const msg = t(key);
        setStatus(msg);
        showSnackbar(msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {t("loginTitle")}
        </Typography>

        {formik.status && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mb: 2, textAlign: "center" }}
          >
            {formik.status}
          </Typography>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              id="email"
              label={t("email")}
              variant="outlined"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id="password"
              label={t("password")}
              type="password"
              variant="outlined"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Box>

          <Box sx={{ mb: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              onClick={() => navigate("/forgot-password")}
              sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
            >
              {t("forgotPasswordLink")}
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={formik.isSubmitting}
          >
            {t("loginButton")}
          </Button>

          <OAuthButtons />
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
