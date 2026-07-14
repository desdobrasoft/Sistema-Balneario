import React, { useCallback, useEffect, useState, type ReactNode } from "react";

import Close from "@mui/icons-material/Close";
import Alert, { type AlertProps } from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import ErrorDetailDialog from "components/ErrorDetailDialog";
import SnackbarContext, {
  type SnackbarOptions,
} from "contexts/SnackbarContext";
import { ErrorNotifier, type ErrorNotification } from "utils/ErrorNotifier";

const snackbarSx = {
  maxWidth: { md: "50%", xs: "none" },
  width: { md: "50%", xs: "calc(100% - 32px)" },
};

const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // General snackbar state (for success/info/warning via context)
  const [generalOpen, setGeneralOpen] = useState(false);
  const [generalOptions, setGeneralOptions] = useState<SnackbarOptions>({
    message: "",
    severity: "info",
  });

  // Error snackbar state (from ErrorNotifier)
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorNotification, setErrorNotification] =
    useState<ErrorNotification | null>(null);

  // Error detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Subscribe to ErrorNotifier
  useEffect(() => {
    ErrorNotifier.subscribe((notification) => {
      setErrorOpen(false);
      setTimeout(() => {
        setErrorNotification(notification);
        setErrorOpen(true);
      }, 100);
    });
    return () => ErrorNotifier.unsubscribe();
  }, []);

  // General snackbar handler (context API)
  const showSnackbar = useCallback((newOptions: SnackbarOptions) => {
    setGeneralOptions({
      autoHideDuration: 6000,
      severity: "info",
      ...newOptions,
    });
    setGeneralOpen(true);
  }, []);

  const handleGeneralClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setGeneralOpen(false);
    if (generalOptions.onClose) generalOptions.onClose();
  };

  const handleErrorClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setErrorOpen(false);
  };

  const hasErrorDetails =
    errorNotification != null &&
    (!!errorNotification.detalhes ||
      (errorNotification.mensagens != null &&
        errorNotification.mensagens.length > 0));

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {/* General snackbar (success/info/warning) */}
      <Snackbar
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        autoHideDuration={generalOptions.autoHideDuration}
        disableWindowBlurListener
        onClose={handleGeneralClose}
        open={generalOpen}
        sx={snackbarSx}
      >
        <Alert
          action={generalOptions.action}
          onClose={handleGeneralClose}
          severity={generalOptions.severity as AlertProps["severity"]}
          sx={{ boxShadow: 3, width: "100%" }}
          variant="filled"
        >
          {generalOptions.title && (
            <AlertTitle sx={{ fontWeight: "bold" }}>
              {generalOptions.title}
            </AlertTitle>
          )}
          <Typography variant="body2">{generalOptions.message}</Typography>
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        autoHideDuration={generalOptions.autoHideDuration}
        disableWindowBlurListener
        onClose={handleErrorClose}
        open={errorOpen}
        sx={snackbarSx}
      >
        <Alert
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {hasErrorDetails && (
                <Button
                  color="inherit"
                  onClick={() => {
                    setErrorOpen(false);
                    setDetailDialogOpen(true);
                  }}
                  size="small"
                  sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                >
                  DETALHES
                </Button>
              )}
              <IconButton
                aria-label="fechar"
                color="inherit"
                onClick={handleErrorClose}
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          }
          severity="error"
          sx={{ boxShadow: 3, width: "100%" }}
          variant="filled"
        >
          <AlertTitle sx={{ fontWeight: "bold" }}>Algo deu errado</AlertTitle>
          <Typography variant="body2">
            {errorNotification?.erro ?? "Erro desconhecido"}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Error detail dialog */}
      <ErrorDetailDialog
        notification={errorNotification}
        onClose={() => setDetailDialogOpen(false)}
        open={detailDialogOpen}
      />
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
