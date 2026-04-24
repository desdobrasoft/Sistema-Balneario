// packages
import React, { type ReactNode, useCallback, useState } from "react";

// icons
import CloseIcon from "@mui/icons-material/Close";

// material-ui
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

// project imports
import type { DialogOptions } from "contexts/DialogContext";
import DialogContext from "contexts/DialogContext";

const DialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({
    title: "",
    body: "",
    actions: [],
    dismissable: true,
  });

  const showDialog = useCallback((newOptions: DialogOptions) => {
    setOptions({
      dismissable: true, // default value
      ...newOptions,
    });
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClose = (_event: object, _reason: "backdropClick" | "escapeKeyDown") => {
    if (options.dismissable === false) {
      return;
    }
    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="global-dialog-title"
        aria-describedby="global-dialog-description"
      >
        <DialogTitle id="global-dialog-title" sx={{ m: 0, p: 2, pr: 6 }}>
          {options.title}
          {options.dismissable !== false && (
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {typeof options.body === "string" ? (
            <DialogContentText id="global-dialog-description">
              {options.body}
            </DialogContentText>
          ) : (
            options.body
          )}
        </DialogContent>
        {options.actions && options.actions.length > 0 && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            {options.actions.map((action, index) => (
              <React.Fragment key={index}>{action}</React.Fragment>
            ))}
          </DialogActions>
        )}
      </Dialog>
    </DialogContext.Provider>
  );
};

export default DialogProvider;
