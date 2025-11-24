import React, { useMemo, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import NavBar from "@/widgets/navBar/NavBar";
import { AppErrorBoundary } from "@/widgets/errorBoundary/AppErrorBoundary";
import Footer from "@/widgets/footer/Footer";
import { ColorModeContext } from "./ColorModeContext";

const THEME_STORAGE_KEY = "themeMode";

const getInitialMode = (): PaletteMode => {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
};

const RootLayout: React.FC = () => {
  const [mode, setMode] = useState<PaletteMode>(() => getInitialMode());

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#1976d2",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 8,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AppErrorBoundary>
          <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            bgcolor="background.default"
          >
            <NavBar />

            <Box
              component="main"
              sx={{
                flex: 1,
                py: 2,
                px: { xs: 2, md: 4 },
              }}
            >
              <Outlet />
            </Box>

            <Footer />
          </Box>
        </AppErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default RootLayout;
