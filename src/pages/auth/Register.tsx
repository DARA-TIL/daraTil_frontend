import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const registerFn = useAuthStore((state) => state.register);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    initialStatus: "",
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, t("errors.nameMin2"))
        .max(15, t("errors.nameMax15"))
        .required(t("errors.required")),
      email: Yup.string()
        .email(t("errors.invalidEmail"))
        .required(t("errors.required")),
      password: Yup.string()
        .min(8, t("errors.min8"))
        .required(t("errors.required")),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], t("errors.passwordsNotMatch"))
        .required(t("errors.required")),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setStatus("");

      try {
        const user = await registerFn(
          values.name,
          values.email,
          values.password
        );

        if (user) {
          // успех
          showSnackbar(t("registerSuccess"), "success");
          navigate("/app");
          return;
        }

        // если registerFn вернул null
        const msg = t("errors.registerFailed");
        setStatus(msg);
        showSnackbar(msg, "error");
      } catch (error: any) {
        console.log("register error:", error.response?.data || error);

        let msg = t("errors.serverError");

        if (axios.isAxiosError(error) && error.response?.data) {
          const backendError = (error.response.data as any).error;
          if (backendError) {
            msg = backendError;
          }
        }

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
          {t("registerTitle")}
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
              id="name"
              label={t("name")}
              variant="outlined"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Box>

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

          <Box sx={{ mb: 2 }}>
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

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id="confirm_password"
              label={t("confirmPassword")}
              type="password"
              variant="outlined"
              name="confirm_password"
              value={formik.values.confirm_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirm_password &&
                Boolean(formik.errors.confirm_password)
              }
              helperText={
                formik.touched.confirm_password &&
                formik.errors.confirm_password
              }
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={formik.isSubmitting}
          >
            {t("registerButton")}
          </Button>

          <OAuthButtons />
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
