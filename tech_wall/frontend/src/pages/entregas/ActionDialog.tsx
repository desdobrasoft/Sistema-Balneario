import React, { useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: (notas: string) => Promise<void>;
  color?: "primary" | "error" | "success" | "warning";
}

export const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  onClose,
  title,
  description,
  actionLabel,
  onConfirm,
  color = "primary",
}) => {
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(notas);
      setNotas("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Notas da Alteração (Opcional)"
          fullWidth
          multiline
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={color}
          disabled={loading}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
