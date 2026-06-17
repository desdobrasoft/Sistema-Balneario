import { useEffect, useState } from "react";
import * as yup from "yup";

// material-ui
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

// ===============================
// TYPES
// ===============================
interface MovimentacaoFormValues {
  materiaPrimaId: number | "";
  tipoMovimentacao: "I" | "O";
  qtde: number | "";
  dataMovimentacao: string;
  notas: string;
}

interface MovimentacaoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MovimentacaoFormValues) => Promise<void>;
  preSelectedMaterial?: { id: number; item?: string } | null;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  materiaPrimaId: yup.number().required("Selecione um material"),
  tipoMovimentacao: yup
    .string()
    .oneOf(["I", "O"])
    .required("Selecione o tipo"),
  qtde: yup.number().min(1, "Mínimo 1").required("Informe a quantidade"),
  dataMovimentacao: yup.string().required("Informe a data"),
  notas: yup.string(),
});

const initialValues: MovimentacaoFormValues = {
  materiaPrimaId: "",
  tipoMovimentacao: "I",
  qtde: "",
  dataMovimentacao: new Date().toISOString().split("T")[0],
  notas: "",
};

// ===============================
// FORM COMPONENT
// ===============================
const MovimentacaoForm: React.FC<MovimentacaoFormProps> = ({
  open,
  onClose,
  onSubmit,
  preSelectedMaterial,
}) => {
  const [materiais, setMateriais] = useState<{ id: number; item: string; quantidade: number; unidade?: string }[]>([]);

  useEffect(() => {
    if (open) {
      const fetchMateriais = async () => {
        const res = await api.get(ENDPOINTS.MATERIA_PRIMA);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setMateriais(data);
      };
      fetchMateriais();
    }
  }, [open]);

  const getInitialValues = (): MovimentacaoFormValues => {
    if (preSelectedMaterial) {
      return {
        ...initialValues,
        materiaPrimaId: preSelectedMaterial.id,
      };
    }
    return initialValues;
  };

  return (
    <DataTableDialog<MovimentacaoFormValues>
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Registrar Movimentação"
      maxWidth="sm"
      item={preSelectedMaterial ? getInitialValues() : null}
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              name="materiaPrimaId"
              label="Material"
              size="small"
              value={formik.values.materiaPrimaId}
              onChange={formik.handleChange}
              error={
                formik.touched.materiaPrimaId &&
                Boolean(formik.errors.materiaPrimaId)
              }
              helperText={
                formik.touched.materiaPrimaId &&
                (formik.errors.materiaPrimaId as string)
              }
              disabled={!!preSelectedMaterial}
            >
              {materiais.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.item} ({m.quantidade} {m.unidade || ""})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              name="tipoMovimentacao"
              label="Tipo"
              size="small"
              value={formik.values.tipoMovimentacao}
              onChange={formik.handleChange}
            >
              <MenuItem value="I">📥 Entrada</MenuItem>
              <MenuItem value="O">📤 Saída</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="qtde"
              label="Quantidade"
              type="number"
              size="small"
              value={formik.values.qtde}
              onChange={formik.handleChange}
              error={formik.touched.qtde && Boolean(formik.errors.qtde)}
              helperText={
                formik.touched.qtde && (formik.errors.qtde as string)
              }
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              name="dataMovimentacao"
              label="Data da Movimentação"
              type="date"
              size="small"
              value={formik.values.dataMovimentacao}
              onChange={formik.handleChange}
              error={
                formik.touched.dataMovimentacao &&
                Boolean(formik.errors.dataMovimentacao)
              }
              helperText={
                formik.touched.dataMovimentacao &&
                (formik.errors.dataMovimentacao as string)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>



          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="notas"
              label="Notas (Opcional)"
              value={formik.values.notas}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default MovimentacaoForm;
