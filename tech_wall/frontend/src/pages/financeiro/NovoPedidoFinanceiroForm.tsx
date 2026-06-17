// packages
import React, { useEffect, useState } from "react";
import * as yup from "yup";

// material-ui
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";

// ===============================
// TYPES
// ===============================
interface NovoPedidoFormValues {
  materiaPrimaId: number | "";
  qtSolicitada: number | "";
  fornecedor: string;
  valorUnitario: number | "";
}

interface NovoPedidoFinanceiroFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  materiaPrimaId: yup.number().required("Selecione um material"),
  qtSolicitada: yup
    .number()
    .min(1, "Mínimo 1")
    .required("Informe a quantidade"),
  fornecedor: yup.string(),
  valorUnitario: yup.number().min(0, "Valor inválido"),
});

// ===============================
// FORM COMPONENT
// ===============================
const NovoPedidoFinanceiroForm: React.FC<NovoPedidoFinanceiroFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const handleError = useErrorHandler();
  const { showSnackbar } = useSnackbar();
  const [materiais, setMateriais] = useState<{ id: number; item: string; unidade?: string }[]>([]);

  useEffect(() => {
    if (open) {
      api
        .get(ENDPOINTS.MATERIA_PRIMA)
        .then((res) => setMateriais(Array.isArray(res.data) ? res.data : []))
        .catch(handleError);
    }
  }, [open, handleError]);

  const initialValues: NovoPedidoFormValues = {
    materiaPrimaId: "",
    qtSolicitada: "",
    fornecedor: "",
    valorUnitario: "",
  };

  return (
    <DataTableDialog<NovoPedidoFormValues>
      open={open}
      onClose={onClose}
      onSubmit={async (values) => {
        await api.post(ENDPOINTS.PEDIDOS_COMPRA, {
          materiaPrimaId: values.materiaPrimaId,
          qtSolicitada: Number(values.qtSolicitada),
          fornecedor: values.fornecedor || undefined,
          valorUnitario: values.valorUnitario || undefined,
          isDirectPurchase: true,
        });
        showSnackbar({
          message: "Pedido de compra criado com sucesso!",
          severity: "success",
        });
        onSuccess();
      }}
      title="Novo Pedido de Compra"
      maxWidth="sm"
      item={null}
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Autocomplete
              options={materiais}
              getOptionLabel={(opt: { item: string; unidade?: string }) =>
                `${opt.item}${opt.unidade ? ` (${opt.unidade})` : ""}`
              }
              value={
                materiais.find(
                  (m: { id: number }) => m.id === formik.values.materiaPrimaId,
                ) || null
              }
              onChange={(_, value) =>
                formik.setFieldValue("materiaPrimaId", value?.id || "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Material"
                  size="small"
                  error={
                    formik.touched.materiaPrimaId &&
                    Boolean(formik.errors.materiaPrimaId)
                  }
                  helperText={
                    formik.touched.materiaPrimaId &&
                    (formik.errors.materiaPrimaId as string)
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              name="qtSolicitada"
              label="Quantidade"
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
              name="valorUnitario"
              label="Valor Total"
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

          <Grid size={12}>
            <TextField
              fullWidth
              name="fornecedor"
              label="Fornecedor"
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

export default NovoPedidoFinanceiroForm;
