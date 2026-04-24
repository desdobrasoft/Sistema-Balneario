import * as yup from "yup";

// material-ui
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";

// ===============================
// TYPES
// ===============================
interface PedidoCompraFormValues {
  materiaPrimaId: number;
  qtSolicitada: number | "";
  fornecedor: string;
}

interface PedidoCompraFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PedidoCompraFormValues) => Promise<void>;
  material: any;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  materiaPrimaId: yup.number().required(),
  qtSolicitada: yup
    .number()
    .min(1, "Mínimo 1")
    .required("Informe a quantidade"),
  fornecedor: yup.string(),
});

// ===============================
// FORM COMPONENT
// ===============================
const PedidoCompraForm: React.FC<PedidoCompraFormProps> = ({
  open,
  onClose,
  onSubmit,
  material,
}) => {
  const initialValues: PedidoCompraFormValues = {
    materiaPrimaId: material?.id || 0,
    qtSolicitada: "",
    fornecedor: "",
  };

  return (
    <DataTableDialog<PedidoCompraFormValues>
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Abrir Pedido de Compra"
      maxWidth="sm"
      item={null}
      initialValues={{ ...initialValues, materiaPrimaId: material?.id || 0 }}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              Solicitando compra para:{" "}
              <strong>{material?.item || "Material"}</strong>
              {material?.quantidade != null && (
                <>
                  {" "}— Estoque atual:{" "}
                  <strong>
                    {material.quantidade} {material.unidade || ""}
                  </strong>
                </>
              )}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="qtSolicitada"
              label="Quantidade Solicitada"
              type="number"
              size="small"
              value={formik.values.qtSolicitada}
              onChange={formik.handleChange}
              error={
                formik.touched.qtSolicitada &&
                Boolean(formik.errors.qtSolicitada)
              }
              helperText={
                formik.touched.qtSolicitada &&
                (formik.errors.qtSolicitada as string)
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="fornecedor"
              label="Fornecedor (Opcional)"
              size="small"
              value={formik.values.fornecedor}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default PedidoCompraForm;
