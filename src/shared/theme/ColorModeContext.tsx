import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { getAppTheme } from "./theme";

interface ColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined
);

export const useColorMode = () => {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
};

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
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
