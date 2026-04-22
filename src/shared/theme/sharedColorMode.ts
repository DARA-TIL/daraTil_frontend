import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material";

export interface SharedColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const SharedColorModeContext =
  createContext<SharedColorModeContextValue | undefined>(undefined);

export function useColorMode() {
  const ctx = useContext(SharedColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}
