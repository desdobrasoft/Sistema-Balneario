import React, { forwardRef } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import * as yup from "yup";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import DataTableDialog from "components/datatable/DataTableDialog";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ClienteModel {
  id: number;
  nome: string;
  email?: string;
  nroContato?: string;
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ClienteModel) => Promise<void>;
  item: ClienteModel | null;
}

// ─── Validation / Initial Values ─────────────────────────────────────────────

const validationSchema = yup.object({
  nome: yup.string().required("Campo obrigatório"),
  email: yup.string().email("Email inválido"),
  nroContato: yup.string(),
});

const getInitialValues = (item: ClienteModel | null): ClienteModel => ({
  id: item?.id ?? 0,
  nome: item?.nome ?? "",
  email: item?.email ?? "",
  nroContato: item?.nroContato ?? "",
});

// ─── Custom Phone Input (MUI TextField wrapper) ─────────────────────────────

const PhoneTextField = forwardRef<HTMLInputElement, React.ComponentProps<typeof TextField>>(
  function PhoneTextField(props, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        fullWidth
        size="small"
        label="Contato"
        variant="outlined"
      />
    );
  },
);

// ─── Component ───────────────────────────────────────────────────────────────

const ClientesForm: React.FC<FormProps> = ({ open, onClose, onSubmit, item }) => {
  return (
    <DataTableDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      maxWidth="md"
      title={item ? "Editar Cliente" : "Novo Cliente"}
      item={item}
      initialValues={getInitialValues(item)}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="nome"
              label="Nome"
              size="small"
              value={formik.values.nome}
              onChange={formik.handleChange}
              error={formik.touched.nome && Boolean(formik.errors.nome)}
              helperText={formik.touched.nome && (formik.errors.nome as string)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="email"
              label="E-mail"
              type="email"
              size="small"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && (formik.errors.email as string)}
            />
          </Grid>
          <Grid size={12}>
            <PhoneInput
              defaultCountry="BR"
              value={formik.values.nroContato || ""}
              onChange={(value) => formik.setFieldValue("nroContato", value || "")}
              inputComponent={PhoneTextField}
              displayInitialValueAsLocalNumber
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default ClientesForm;
export type { ClienteModel };
