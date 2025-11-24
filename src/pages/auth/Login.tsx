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
import OAuthButtons from "@/components/auth/OAuthButtons";
// import { useAuthStore } from "@/store/useAuthStore"; // uncomment when backend is ready

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation("auth");

  // const login = useAuthStore((state) => state.login); // use when backend is ready

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t("errors.invalidEmail"))
        .required(t("errors.required")),
      password: Yup.string()
        .min(8, t("errors.min8"))
        .required(t("errors.required")),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // -------------------------
        // VERSION 1 - with backend (for later)
        // -------------------------
        // const user = await login(values.email, values.password);
        //
        // if (user) {
        //   const rawNext = searchParams.get("next");
        //   const decodedNext = rawNext ? decodeURIComponent(rawNext) : null;
        //
        //   const next =
        //     decodedNext && decodedNext !== "/register" ? decodedNext : "/";
        //
        //   navigate(next);
        //   return;
        // }

        // -------------------------
        // VERSION 2 - current (no backend yet)
        // just redirect after "successful" login
        // -------------------------
        const rawNext = searchParams.get("next");
        const decodedNext = rawNext ? decodeURIComponent(rawNext) : null;

        const next =
          decodedNext && decodedNext !== "/register" ? decodedNext : "/";

        navigate(next);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // When you add OAuth backend, you can use this:
  // useEffect(() => {
  //   const provider = searchParams.get("provider");
  //   const accessToken = searchParams.get("accessToken");
  //
  //   if (provider && accessToken) {
  //     localStorage.setItem("token", accessToken);
  //     // TODO: fetch user from backend and save via Zustand
  //     navigate("/");
  //   }
  // }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {t("loginTitle")}
        </Typography>

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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={formik.isSubmitting}
          >
            {t("loginButton")}
          </Button>

          {/* OAuth Social buttons */}
          <OAuthButtons />
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
