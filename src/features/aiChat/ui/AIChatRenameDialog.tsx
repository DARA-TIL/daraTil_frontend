import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  initialValue: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

const AIChatRenameDialog: React.FC<Props> = ({
  open,
  initialValue,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation("aiChat");
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, open]);

  const trimmed = value.trim();

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {t("rename.title", { defaultValue: "Rename chat" })}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label={t("rename.label", { defaultValue: "Chat name" })}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("common.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          variant="contained"
          disabled={!trimmed || loading}
          onClick={() => onSubmit(trimmed)}
        >
          {t("rename.confirm", { defaultValue: "Save" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIChatRenameDialog;
