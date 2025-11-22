import React from "react";
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
// import { useAuthStore } from "@/store/useAuthStore"; // подключишь, когда будет бэкенд

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t("auth.errors.invalidEmail"))
        .required(t("auth.errors.required")),
      password: Yup.string()
        .min(8, t("auth.errors.min8"))
        .required(t("auth.errors.required")),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // ❗ Пока нет бэкенда - просто редиректим на главную
        // Если появится бэкенд:
        // const user = await login(values.email, values.password);
        // if (user) {
        //   const next = searchParams.get("next") || "/";
        //   navigate(next);
        //   return;
        // }

        const next = searchParams.get("next") || "/";
        navigate(next);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {t("auth.loginTitle")}
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              id="email"
              label={t("auth.email")}
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
              label={t("auth.password")}
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={formik.isSubmitting}
          >
            {t("auth.loginButton")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
