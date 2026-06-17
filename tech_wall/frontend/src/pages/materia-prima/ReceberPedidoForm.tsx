import * as yup from "yup";

// material-ui
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";

// ===============================
// TYPES
// ===============================
interface ReceberPedidoFormValues {
  status: "ENTREGUE" | "ENTREGUE_COM_ALTERACAO";
  qtEntregue: number | "";
}

interface ReceberPedidoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ReceberPedidoFormValues) => Promise<void>;
  pedido: { id: number; materiaPrima?: { item: string }; qtSolicitada?: number; fornecedor?: string } | null;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(["ENTREGUE", "ENTREGUE_COM_ALTERACAO"])
    .required("Selecione o status"),
  qtEntregue: yup.number().when("status", {
    is: "ENTREGUE_COM_ALTERACAO",
    then: (schema) =>
      schema.min(1, "Mínimo 1").required("Informe a quantidade recebida"),
    otherwise: (schema) => schema.optional().nullable(),
  }),
});

const initialValues: ReceberPedidoFormValues = {
  status: "ENTREGUE",
  qtEntregue: "",
};

// ===============================
// FORM COMPONENT
// ===============================
const ReceberPedidoForm: React.FC<ReceberPedidoFormProps> = ({
  open,
  onClose,
  onSubmit,
  pedido,
}) => {
  return (
    <DataTableDialog<ReceberPedidoFormValues>
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Receber Pedido de Compra"
      maxWidth="sm"
      item={null}
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              Material: <strong>{pedido?.materiaPrima?.item || "—"}</strong>
              {" "}— Qt. Solicitada:{" "}
              <strong>{pedido?.qtSolicitada || 0}</strong>
              {pedido?.fornecedor && (
                <>
                  {" "}— Fornecedor: <strong>{pedido.fornecedor}</strong>
                </>
              )}
            </Typography>
          </Grid>

          <Grid size={12}>
            <TextField
              select
              fullWidth
              name="status"
              label="Status do Recebimento"
              size="small"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              <MenuItem value="ENTREGUE">
                ✅ Entregue (quantidade conforme pedido)
              </MenuItem>
              <MenuItem value="ENTREGUE_COM_ALTERACAO">
                ⚠️ Entregue com alteração
              </MenuItem>
            </TextField>
          </Grid>

          {formik.values.status === "ENTREGUE_COM_ALTERACAO" && (
            <Grid size={12}>
              <TextField
                fullWidth
                name="qtEntregue"
                label="Quantidade Efetivamente Recebida"
                type="number"
                size="small"
                value={formik.values.qtEntregue}
                onChange={formik.handleChange}
                error={
                  formik.touched.qtEntregue &&
                  Boolean(formik.errors.qtEntregue)
                }
                helperText={
                  formik.touched.qtEntregue &&
                  (formik.errors.qtEntregue as string)
                }
              />
            </Grid>
          )}
        </Grid>
      )}
    />
  );
};

export default ReceberPedidoForm;
