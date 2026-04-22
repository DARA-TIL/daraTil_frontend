import React from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/shared/store/useUiStore";

const GlobalSnackbar: React.FC = () => {
  const navigate = useNavigate();
  const snackbarOpen = useUiStore((s) => s.snackbarOpen);
  const snackbarMessage = useUiStore((s) => s.snackbarMessage);
  const snackbarSeverity = useUiStore((s) => s.snackbarSeverity);
  const snackbarActionLabel = useUiStore((s) => s.snackbarActionLabel);
  const snackbarActionTo = useUiStore((s) => s.snackbarActionTo);
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
        action={
          snackbarActionLabel && snackbarActionTo ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                navigate(snackbarActionTo);
                hideSnackbar();
              }}
            >
              {snackbarActionLabel}
            </Button>
          ) : undefined
        }
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
