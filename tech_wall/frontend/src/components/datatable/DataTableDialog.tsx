import { Form, Formik, type FormikProps } from "formik";
import { useEffect, useMemo, useRef } from "react";
import * as yup from "yup";
import { isAxiosError } from "axios";

// icons
import CloseIcon from "@mui/icons-material/Close";

// material-ui
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// project imports
import { useSnackbar } from "hooks/useSnackbar";

export interface DataTableDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: T) => Promise<void> | void;
  item: T | null;
  validationSchema: yup.AnyObjectSchema;
  initialValues: T;
  renderForm: (props: FormikProps<T>) => React.ReactNode;
  title: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  isLoading?: boolean;
}

const DataTableDialog = <T extends object>({
  open,
  onClose,
  onSubmit,
  item,
  validationSchema,
  initialValues,
  renderForm,
  title,
  maxWidth = false,
}: DataTableDialogProps<T>) => {
  const formikRef = useRef<FormikProps<T>>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      formikRef.current?.resetForm();
    }
  }, [open]);

  const handleSubmit = async (
    values: T,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error: unknown) {
      console.error("Erro no DataTableDialog submit:", error);
      let message: string | string[] = "Ocorreu um erro ao processar sua solicitação.";
      
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string | string[] } | undefined;
        message = data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      showSnackbar({
        title: "Erro",
        message: Array.isArray(message) ? message.join(", ") : message,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentInitialValues = useMemo(() => {
    return item ? { ...initialValues, ...item } : initialValues;
  }, [item, initialValues]);

  return (
    <Formik
      innerRef={formikRef}
      initialValues={currentInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <Dialog
          open={open}
          onClose={(_, reason) => {
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            onClose();
          }}
          maxWidth={maxWidth}
          fullWidth
          scroll="paper"
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="inherit">
                {title}
              </Typography>
              <IconButton size="small" onClick={onClose} sx={{ p: 0.5 }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Form>{renderForm(formikProps)}</Form>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={formikProps.isSubmitting}>
              Cancelar
            </Button>
            <Button
              disabled={formikProps.isSubmitting}
              onClick={() => {
                formikRef.current?.submitForm();
              }}
              variant="contained"
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
};

export default DataTableDialog;
