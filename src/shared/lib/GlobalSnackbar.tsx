import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useUiStore } from "@/shared/store/useUiStore";

const GlobalSnackbar: React.FC = () => {
  const snackbarOpen = useUiStore((s) => s.snackbarOpen);
  const snackbarMessage = useUiStore((s) => s.snackbarMessage);
  const snackbarSeverity = useUiStore((s) => s.snackbarSeverity);
  const hideSnackbar = useUiStore((s) => s.hideSnackbar);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    hideSnackbar();
  };

  // если нет текста - вообще не рендерим компонент
  if (!snackbarOpen || !snackbarMessage) {
    return null;
  }

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbarSeverity}
        sx={{ width: "100%" }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
