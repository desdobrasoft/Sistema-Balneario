import React, { useEffect, useState } from "react";
import * as yup from "yup";

// material-ui
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

// ===============================
// Interfaces
// ===============================

interface TipoPlacaOption {
  id: number;
  nome: string;
  largura?: number;
  altura?: number;
  espessura?: number;
  materiais?: {
    materiaPrimaId: number;
    quantidade: number;
    materiaPrima?: {
      id: number;
      item: string;
      quantidade: number; // nível de estoque
      unidade: string;
    };
  }[];
}

export interface PlacaModel {
  id?: number;
  nome?: string;
  descricao?: string;
  tipoPlacaId?: number;
  tipoPlacaNome?: string;
  statusProducao?: string;
  statusPlaca?: string;
  statusExibicao?: string;
  retalhoDescartado?: boolean;
  // Campos apenas para criação
  quantidade?: number;
  jaFinalizada?: boolean;
  // Usado na relação TipoPlaca
  tipoPlaca?: {
    id?: number;
    nome?: string;
    largura?: number;
    altura?: number;
    espessura?: number;
    materiais?: {
      materiaPrimaId: number;
      quantidade: number;
      materiaPrima?: {
        id?: number;
        item: string;
        unidade?: string;
        quantidade?: number;
      };
    }[];
  };
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    values: PlacaModel,
    selectedTipo: TipoPlacaOption | null,
  ) => Promise<void>;
  item: PlacaModel | null;
}

// ===============================
// Validation Schemas
// ===============================

const createValidationSchema: yup.AnyObjectSchema = yup.object({
  tipoPlacaId: yup.number().required("Selecione um tipo de placa"),
  quantidade: yup.number().min(1, "Mínimo 1").required("Informe a quantidade"),
  jaFinalizada: yup.boolean(),
});

const editValidationSchema: yup.AnyObjectSchema = yup.object({
  descricao: yup.string(),
  retalhoDescartado: yup.boolean(),
  tipoPlacaId: yup.number().nullable(),
});

// ===============================
// Initial Values
// ===============================

const createInitialValues: PlacaModel = {
  tipoPlacaId: undefined,
  quantidade: 1,
  jaFinalizada: false,
};

const editInitialValues: PlacaModel = {
  descricao: "",
  retalhoDescartado: false,
  tipoPlacaId: undefined,
};

// ===============================
// Form Component
// ===============================

const PlacasForm: React.FC<FormProps> = ({ open, onClose, onSubmit, item }) => {
  const [tiposPlaca, setTiposPlaca] = useState<TipoPlacaOption[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<TipoPlacaOption | null>(
    null,
  );

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: loading data on dialog open */
  useEffect(() => {
    if (open) {
      api
        .get(ENDPOINTS.TIPOS_PLACA)
        .then((res) => {
          const data = Array.isArray(res.data)
            ? res.data
            : res.data?.data || [];
          setTiposPlaca(data);
          
          if (item && item.tipoPlacaId) {
            const found = data.find((t: TipoPlacaOption) => t.id === item.tipoPlacaId);
            if (found) setSelectedTipo(found);
          }
        })
        .catch((err) => console.error("Erro ao carregar tipos de placa:", err));
        
      if (!item) {
        setSelectedTipo(null);
      }
    }
  }, [open, item]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isEditing = Boolean(item);

  return (
    <DataTableDialog<PlacaModel>
      open={open}
      onClose={onClose}
      onSubmit={(values) => onSubmit(values, selectedTipo)}
      title={isEditing ? "Editar Placa" : "Nova Placa"}
      maxWidth="sm"
      item={item}
      initialValues={
        isEditing ? { ...editInitialValues, ...item } : createInitialValues
      }
      validationSchema={
        isEditing ? editValidationSchema : createValidationSchema
      }
      renderForm={(formik) => (
        <Box>
          {/* ===== CREATE MODE ===== */}
          {!isEditing && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Tipo de Placa */}
              <Grid size={{ xs: 12, sm: 9 }}>
                <Autocomplete
                  options={tiposPlaca}
                  getOptionLabel={(option) => {
                    const dims =
                      option.largura && option.altura
                        ? ` (${option.largura} x ${option.altura} cm)`
                        : "";
                    return `${option.nome}${dims}`;
                  }}
                  value={
                    tiposPlaca.find(
                      (t) => t.id === formik.values.tipoPlacaId,
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    setSelectedTipo(newValue);
                    formik.setFieldValue(
                      "tipoPlacaId",
                      newValue?.id || undefined,
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Placa"
                      size="small"
                      fullWidth
                      error={
                        formik.touched.tipoPlacaId &&
                        Boolean(formik.errors.tipoPlacaId)
                      }
                      helperText={
                        formik.touched.tipoPlacaId
                          ? (formik.errors.tipoPlacaId as string)
                          : undefined
                      }
                    />
                  )}
                />
              </Grid>

              {/* Quantidade */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  name="quantidade"
                  label="Quantidade"
                  type="number"
                  value={formik.values.quantidade}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.quantidade &&
                    Boolean(formik.errors.quantidade)
                  }
                  helperText={
                    formik.touched.quantidade
                      ? (formik.errors.quantidade as string)
                      : undefined
                  }
                  size="small"
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Já Finalizada */}
              <Grid size={12}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "rgba(46, 125, 50, 0.04)",
                    border: "1px dashed",
                    borderColor: "success.main",
                    borderRadius: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="jaFinalizada"
                        checked={formik.values.jaFinalizada}
                        onChange={formik.handleChange}
                        color="success"
                      />
                    }
                    label={
                      <Typography variant="body2" color="success.dark">
                        <strong>Já foi produzida?</strong> Marque se a placa já
                        está finalizada.
                      </Typography>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          )}

          {/* ===== EDIT MODE ===== */}
          {isEditing && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Autocomplete
                  options={tiposPlaca}
                  getOptionLabel={(option) => {
                    const dims =
                      option.largura && option.altura
                        ? ` (${option.largura} x ${option.altura} cm)`
                        : "";
                    return `${option.nome}${dims}`;
                  }}
                  value={
                    tiposPlaca.find(
                      (t) => t.id === formik.values.tipoPlacaId,
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    setSelectedTipo(newValue);
                    formik.setFieldValue(
                      "tipoPlacaId",
                      newValue?.id || undefined,
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Placa"
                      size="small"
                      fullWidth
                      error={
                        formik.touched.tipoPlacaId &&
                        Boolean(formik.errors.tipoPlacaId)
                      }
                      helperText={
                        formik.touched.tipoPlacaId
                          ? (formik.errors.tipoPlacaId as string)
                          : undefined
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="descricao"
                  label="Descrição / Observações"
                  value={formik.values.descricao}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="retalhoDescartado"
                      checked={formik.values.retalhoDescartado}
                      onChange={formik.handleChange}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Marcar como descartada
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    />
  );
};

export default PlacasForm;
export type { TipoPlacaOption };
