import React, {
  useMemo,
  useState,
  useEffect,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { getAppTheme } from "./theme";
import { SharedColorModeContext } from "./sharedColorMode";

const STORAGE_KEY = "daratil-color-mode";

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<PaletteMode>("light");

  // читаем сохранённый режим из localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          window.localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [mode]
  );

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <SharedColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SharedColorModeContext.Provider>
  );
};
