// packages
import React from "react";
import * as yup from "yup";

// material-ui
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

// project
import DataTableDialog from "components/datatable/DataTableDialog";

interface MateriaPrimaModel {
  id: number;
  item: string;
  quantidade: number;
  unidade: string;
  estoqueMinimo: number;
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MateriaPrimaModel) => Promise<void>;
  item: MateriaPrimaModel | null;
}

const getInitialValues = (item: MateriaPrimaModel | null): MateriaPrimaModel => {
  return (
    item || {
      id: 0,
      item: "",
      quantidade: 0,
      unidade: "un",
      estoqueMinimo: 5,
    }
  );
};

const validationSchema = yup.object({
  item: yup.string().required("Campo obrigatório"),
  quantidade: yup.number().min(0).required("Campo obrigatório"),
  unidade: yup.string().required("Campo obrigatório"),
  estoqueMinimo: yup.number().min(0).required("Campo obrigatório"),
});

const MateriaPrimaForm: React.FC<FormProps> = ({
  open,
  onClose,
  onSubmit,
  item,
}) => {
  return (
    <DataTableDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={item ? "Editar Matéria Prima" : "Nova Matéria Prima"}
      item={item}
      initialValues={getInitialValues(item)}
      maxWidth="md"
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              fullWidth
              name="item"
              label="Nome do Item"
              size="small"
              value={formik.values.item}
              onChange={formik.handleChange}
              error={formik.touched.item && Boolean(formik.errors.item)}
              helperText={formik.touched.item && (formik.errors.item as string)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              name="quantidade"
              label="Quantidade em Estoque"
              type="number"
              size="small"
              value={formik.values.quantidade}
              onChange={formik.handleChange}
              error={
                formik.touched.quantidade && Boolean(formik.errors.quantidade)
              }
              helperText={
                formik.touched.quantidade &&
                (formik.errors.quantidade as string)
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              name="unidade"
              label="Unidade"
              size="small"
              value={formik.values.unidade}
              onChange={formik.handleChange}
              placeholder="ex: un, kg, m"
              error={formik.touched.unidade && Boolean(formik.errors.unidade)}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              name="estoqueMinimo"
              label="Limite para Alerta de Baixo Estoque"
              type="number"
              size="small"
              value={formik.values.estoqueMinimo}
              onChange={formik.handleChange}
              error={
                formik.touched.estoqueMinimo &&
                Boolean(formik.errors.estoqueMinimo)
              }
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default MateriaPrimaForm;
export type { MateriaPrimaModel };
