import { create } from "zustand";

export type SnackbarSeverity = "success" | "info" | "warning" | "error";

interface UiState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: SnackbarSeverity;
  snackbarActionLabel?: string;
  snackbarActionTo?: string;

  showSnackbar: (
    message: string,
    severity?: SnackbarSeverity,
    options?: {
      actionLabel?: string;
      actionTo?: string;
    },
  ) => void;
  hideSnackbar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  snackbarOpen: false,
  snackbarMessage: "",
  snackbarSeverity: "info",
  snackbarActionLabel: undefined,
  snackbarActionTo: undefined,

  showSnackbar: (message, severity = "info", options = {}) =>
    set({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity,
      snackbarActionLabel: options.actionLabel,
      snackbarActionTo: options.actionTo,
    }),

  hideSnackbar: () =>
    set({
      snackbarOpen: false,
      snackbarMessage: "",
      snackbarActionLabel: undefined,
      snackbarActionTo: undefined,
    }),
}));
