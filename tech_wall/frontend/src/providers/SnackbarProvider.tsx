import React, { type ReactNode, useCallback, useState } from "react";

import Alert, { type AlertProps } from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import SnackbarContext, { type SnackbarOptions } from "contexts/SnackbarContext";

const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SnackbarOptions>({
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback((newOptions: SnackbarOptions) => {
    setOptions({
      severity: "info",
      autoHideDuration: 6000,
      ...newOptions,
    });
    setOpen(true);
  }, []);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
    if (options.onClose) options.onClose();
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={options.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={options.severity as AlertProps["severity"]}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
          action={options.action}
        >
          {options.title && <AlertTitle sx={{ fontWeight: "bold" }}>{options.title}</AlertTitle>}
          <Typography variant="body2">{options.message}</Typography>
          {options.details && (
            <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto', p: 0.5, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
              {Array.isArray(options.details) ? (
                options.details.map((detail, idx) => (
                  <Typography key={idx} variant="caption" sx={{ display: "block" }}>
                    • {detail}
                  </Typography>
                ))
              ) : (
                <Typography variant="caption">{options.details}</Typography>
              )}
            </Box>
          )}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
