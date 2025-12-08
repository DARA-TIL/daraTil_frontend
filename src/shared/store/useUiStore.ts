import { create } from "zustand";

export type SnackbarSeverity = "success" | "info" | "warning" | "error";

interface UiState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: SnackbarSeverity;

  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  hideSnackbar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  snackbarOpen: false,
  snackbarMessage: "",
  snackbarSeverity: "info",

  showSnackbar: (message, severity = "info") =>
    set({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity,
    }),

  hideSnackbar: () =>
    set({
      snackbarOpen: false,
      snackbarMessage: "",
    }),
}));
