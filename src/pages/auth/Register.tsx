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
// import { useAuthStore } from "@/store/useAuthStore"; // включишь позже, с бэком

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, t("auth.errors.nameMin2"))
        .max(15, t("auth.errors.nameMax15"))
        .required(t("auth.errors.required")),
      email: Yup.string()
        .email(t("auth.errors.invalidEmail"))
        .required(t("auth.errors.required")),
      password: Yup.string()
        .min(8, t("auth.errors.min8"))
        .required(t("auth.errors.required")),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], t("auth.errors.passwordsNotMatch"))
        .required(t("auth.errors.required")),
    }),
    onSubmit: async (_values, { setSubmitting }) => {
      try {
        // ❗ Пока нет бэкенда - просто редиректим на главную
        // Если появится бэкенд:
        // const user = await register(values.name, values.email, values.password);
        // if (user) navigate("/");

        navigate("/");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {t("auth.registerTitle")}
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              id="name"
              label={t("auth.name")}
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

          <Box sx={{ mb: 2 }}>
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

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id="confirm_password"
              label={t("auth.confirmPassword")}
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
                formik.touched.confirm_password && formik.errors.confirm_password
              }
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={formik.isSubmitting}
          >
            {t("auth.registerButton")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
