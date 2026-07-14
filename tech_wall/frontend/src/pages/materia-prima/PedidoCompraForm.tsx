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
}

interface PedidoCompraFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PedidoCompraFormValues) => Promise<void>;
  material: {
    id: number;
    item: string;
    quantidade: number;
    unidade?: string;
  } | null;
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
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              Solicitando compra para:{" "}
              <strong>{material?.item || "Material"}</strong>
              {material?.quantidade != null && (
                <>
                  {" "}
                  — Estoque atual:{" "}
                  <strong>
                    {Intl.NumberFormat("pt-BR", {
                      maximumFractionDigits: 2,
                    }).format(material.quantidade)}{" "}
                    {material.unidade || ""}
                  </strong>
                </>
              )}
            </Typography>
          </Grid>

          <Grid size={12}>
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
        </Grid>
      )}
    />
  );
};

export default PedidoCompraForm;
