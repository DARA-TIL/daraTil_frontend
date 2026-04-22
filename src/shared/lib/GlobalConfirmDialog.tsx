import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useConfirmDialogStore } from "@/shared/store/useConfirmDialogStore";

const GlobalConfirmDialog = () => {
  const theme = useTheme();
  const { t } = useTranslation("admin");
  const open = useConfirmDialogStore((state) => state.open);
  const options = useConfirmDialogStore((state) => state.options);
  const resolveConfirm = useConfirmDialogStore((state) => state.resolveConfirm);

  const isDanger = options?.variant === "danger";
  const Icon = isDanger ? WarningAmberRoundedIcon : HelpOutlineRoundedIcon;

  return (
    <Dialog
      open={open}
      onClose={() => resolveConfirm(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: "1px solid",
          borderColor: isDanger
            ? alpha(theme.palette.error.main, 0.32)
            : theme.customColors.sidebarBorder,
          backgroundImage: theme.gradients.cardSoft,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 42,
              height: 42,
              borderRadius: 999,
              color: isDanger ? "error.main" : "primary.main",
              backgroundColor: alpha(
                isDanger ? theme.palette.error.main : theme.palette.primary.main,
                0.12,
              ),
            }}
          >
            <Icon />
          </Stack>

          <Typography component="span" fontWeight={900}>
            {options?.title ??
              t("confirm.title", {
                defaultValue: "Confirm action",
              })}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ color: "text.secondary" }}>
          {options?.message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={() => resolveConfirm(false)}>
          {options?.cancelLabel ?? t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color={isDanger ? "error" : "primary"}
          onClick={() => resolveConfirm(true)}
          autoFocus
        >
          {options?.confirmLabel ??
            t("confirm.confirm", {
              defaultValue: "Confirm",
            })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalConfirmDialog;
