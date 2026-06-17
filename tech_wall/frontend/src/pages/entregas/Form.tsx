import * as yup from "yup";

// material-ui
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { StatusEntrega } from "types/enums";

// ===============================
// TYPES
// ===============================
interface EntregaFormValues {
  status: StatusEntrega;
  transportadora: string;
  previsaoEntrega: string;
  notas: string;
}

export interface EntregaModel {
  id?: number;
  status?: StatusEntrega;
  transportadora?: string;
  previsaoEntrega?: string;
  notas?: string;
  venda?: {
    id: number;
    cliente?: { nome: string };
    modeloCasa?: { nome: string };
  };
}

interface EntregasFormProps {
  open: boolean;
  onClose: () => void;
  item: EntregaModel | null;
  onSubmit: (values: EntregaFormValues) => Promise<void>;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  status: yup.string().required("Obrigatório"),
  transportadora: yup.string(),
  previsaoEntrega: yup.string(),
  notas: yup.string(),
});

const initialValues: EntregaFormValues = {
  status: StatusEntrega.PENDENTE_TRANSPORTADORA,
  transportadora: "",
  previsaoEntrega: "",
  notas: "",
};

// ===============================
// FORM COMPONENT
// ===============================
const EntregasForm: React.FC<EntregasFormProps> = ({
  open,
  onClose,
  item,
  onSubmit,
}) => {
  const getInitialValues = (): EntregaFormValues => {
    if (item) {
      return {
        status: item.status || StatusEntrega.PENDENTE_TRANSPORTADORA,
        transportadora: item.transportadora || "",
        previsaoEntrega: item.previsaoEntrega
          ? new Date(item.previsaoEntrega).toISOString().split("T")[0]
          : "",
        notas: "",
      };
    }
    return initialValues;
  };

  return (
    <DataTableDialog<EntregaFormValues>
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={`Atualizar Entrega (Venda #${item?.venda?.id || ""})`}
      maxWidth="sm"
      item={item ? getInitialValues() : null}
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              name="status"
              label="Status da Entrega"
              size="small"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && (formik.errors.status as string)}
            >
              {Object.values(StatusEntrega).map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              name="transportadora"
              label="Transportadora"
              size="small"
              value={formik.values.transportadora}
              onChange={formik.handleChange}
              error={formik.touched.transportadora && Boolean(formik.errors.transportadora)}
              helperText={formik.touched.transportadora && (formik.errors.transportadora as string)}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              name="previsaoEntrega"
              label="Previsão de Entrega"
              type="date"
              size="small"
              value={formik.values.previsaoEntrega}
              onChange={formik.handleChange}
              error={formik.touched.previsaoEntrega && Boolean(formik.errors.previsaoEntrega)}
              helperText={formik.touched.previsaoEntrega && (formik.errors.previsaoEntrega as string)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="notas"
              label="Notas da Alteração (Opcional)"
              value={formik.values.notas}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default EntregasForm;
