import * as yup from "yup";

// material-ui
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";

// ===============================
// TYPES
// ===============================
interface ComprarPedidoFormValues {
  fornecedor: string;
  valorUnitario: number | "";
}

interface ComprarPedidoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ComprarPedidoFormValues) => Promise<void>;
  pedido: any;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  fornecedor: yup.string(),
  valorUnitario: yup.number().min(0, "Valor inválido"),
});

// ===============================
// FORM COMPONENT
// ===============================
const ComprarPedidoForm: React.FC<ComprarPedidoFormProps> = ({
  open,
  onClose,
  onSubmit,
  pedido,
}) => {
  const initialValues: ComprarPedidoFormValues = {
    fornecedor: pedido?.fornecedor || "",
    valorUnitario: "",
  };

  return (
    <DataTableDialog<ComprarPedidoFormValues>
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Registrar Compra"
      maxWidth="sm"
      item={null}
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              Material: <strong>{pedido?.materiaPrima?.item || "N/A"}</strong>
              {" "}— Quantidade solicitada:{" "}
              <strong>{pedido?.qtSolicitada}</strong>
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="fornecedor"
              label="Fornecedor"
              size="small"
              value={formik.values.fornecedor}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="valorUnitario"
              label="Valor Unitário"
              type="number"
              size="small"
              value={formik.values.valorUnitario}
              onChange={formik.handleChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default ComprarPedidoForm;
