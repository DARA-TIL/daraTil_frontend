// src/shared/theme/theme.ts
import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

// 1) Расширяем тему MUI своими полями
declare module "@mui/material/styles" {
  interface Theme {
    customColors: {
      sidebarBg: string;
      sidebarBorder: string;
      sidebarActiveBg: string;
      sidebarActiveText: string;
      layoutBg: string;
    };
    gradients: {
      dashboardHeader: string;
      cardSoft: string;
      sidebarActive: string;
      challenge: string;
    };
  }

  interface ThemeOptions {
    customColors?: {
      sidebarBg?: string;
      sidebarBorder?: string;
      sidebarActiveBg?: string;
      sidebarActiveText?: string;
      layoutBg?: string;
    };
    gradients?: {
      dashboardHeader?: string;
      cardSoft?: string;
      sidebarActive?: string;
      challenge?: string;
    };
  }
}

// 2) Фабрика темы по режиму
export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#2563eb",
        light: "#60a5fa",
        dark: "#1d4ed8",
      },
      secondary: {
        main: "#a855f7",
        light: "#c084fc",
        dark: "#7e22ce",
      },
      success: {
        main: "#22c55e",
      },
      error: {
        main: "#ef4444",
      },
      warning: {
        main: "#f97316",
      },
      info: {
        main: "#0ea5e9",
      },
      background:
        mode === "light"
          ? {
              default: "#f3f4f6",
              paper: "#ffffff",
            }
          : {
              default: "#020617",
              paper: "#020617",
            },
      text:
        mode === "light"
          ? {
              primary: "#0f172a",
              secondary: "#6b7280",
            }
          : {
              primary: "#e5e7eb",
              secondary: "#9ca3af",
            },
    },

    customColors: {
      sidebarBg: mode === "light" ? "#ffffff" : "#020617",
      sidebarBorder:
        mode === "light" ? "rgba(148,163,184,0.35)" : "rgba(15,23,42,0.9)",
      sidebarActiveBg:
        mode === "light" ? "rgba(37,99,235,0.08)" : "rgba(37,99,235,0.32)",
      sidebarActiveText: "#2563eb",
      layoutBg: mode === "light" ? "#f3f4f6" : "#020617",
    },

    gradients: {
      dashboardHeader:
        mode === "light"
          ? "linear-gradient(135deg,#22c1c3 0%,#2563eb 45%,#9333ea 100%)"
          : "linear-gradient(135deg,#020617 0%,#0f172a 40%,#1f2937 100%)",
      cardSoft:
        mode === "light"
          ? "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(147,51,234,0.10))"
          : "linear-gradient(135deg,rgba(37,99,235,0.25),rgba(147,51,234,0.35))",
      sidebarActive:
        mode === "light"
          ? "linear-gradient(135deg,#2563eb,#4f46e5)"
          : "linear-gradient(135deg,#1d4ed8,#7c3aed)",
      challenge:
        mode === "light"
          ? "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 40%,#e9d5ff 100%)"
          : "linear-gradient(135deg,#0f172a 0%,#1d4ed8 40%,#4c1d95 100%)",
    },

    typography: {
      fontFamily:
        '"Noto Sans","Segoe UI","Helvetica Neue","Arial",sans-serif',
      h4: {
        fontWeight: 700,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 24,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
          },
        },
      },
    },
  });

export const appTheme = getAppTheme("light");
