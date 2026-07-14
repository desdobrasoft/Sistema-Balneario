// packages
import type { FormikProps } from "formik";
import React, { useEffect, useState } from "react";
import * as yup from "yup";

// icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// material-ui
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import api from "services/api";

interface TramaOption {
  id: number;
  nome: string;
}

interface MateriaPrimaOption {
  id: number;
  item: string;
}

interface MaterialItem {
  materiaPrimaId: number | "";
  quantidade: number | "";
}

const validationSchema = yup.object().shape({
  nome: yup.string().required("Campo obrigatório"),
  largura: yup.number().min(0, "Mínimo 0").required("Campo obrigatório"),
  altura: yup.number().min(0, "Mínimo 0").required("Campo obrigatório"),
  espessura: yup.number().min(0, "Mínimo 0").required("Campo obrigatório"),
  reforco: yup.string().required("Campo obrigatório"),
  tramaEsquerdaAtiva: yup.boolean(),
  tramaEsquerdaId: yup.number().nullable(),
  tramaDireitaAtiva: yup.boolean(),
  tramaDireitaId: yup.number().nullable(),
  tramaSuperiorAtiva: yup.boolean(),
  tramaSuperiorId: yup.number().nullable(),
  tramaInferiorAtiva: yup.boolean(),
  tramaInferiorId: yup.number().nullable(),
  materiais: yup.array().of(
    yup.object().shape({
      materiaPrimaId: yup.number().required("Selecione uma matéria-prima"),
      quantidade: yup
        .number()
        .min(0, "Mínimo 0")
        .required("Quantidade obrigatória"),
    }),
  ),
});

const initialValues = {
  nome: "",
  largura: 0,
  altura: 0,
  espessura: 0,
  reforco: "S_P",
  tramaEsquerdaAtiva: false,
  tramaEsquerdaId: null as number | null,
  tramaDireitaAtiva: false,
  tramaDireitaId: null as number | null,
  tramaSuperiorAtiva: false,
  tramaSuperiorId: null as number | null,
  tramaInferiorAtiva: false,
  tramaInferiorId: null as number | null,
  estoqueMinimo: undefined as number | undefined,
  materiais: [] as MaterialItem[],
};

type TipoPlacaFormValues = typeof initialValues;

const REFORCO_OPTIONS = [
  { value: "S_P", label: "S/P" },
  { value: "UM_P", label: "1P" },
  { value: "DOIS_P", label: "2P" },
];

const TRAMA_SECTIONS = [
  {
    ativaField: "tramaEsquerdaAtiva",
    idField: "tramaEsquerdaId",
    label: "Trama Esquerda",
  },
  {
    ativaField: "tramaDireitaAtiva",
    idField: "tramaDireitaId",
    label: "Trama Direita",
  },
  {
    ativaField: "tramaSuperiorAtiva",
    idField: "tramaSuperiorId",
    label: "Trama Superior",
  },
  {
    ativaField: "tramaInferiorAtiva",
    idField: "tramaInferiorId",
    label: "Trama Inferior",
  },
] as const;

const TipoPlacaFormContent = ({
  formik,
}: {
  formik: FormikProps<TipoPlacaFormValues>;
}) => {
  const { values, setFieldValue, handleChange, touched, errors } = formik;
  const [tramas, setTramas] = useState<TramaOption[]>([]);
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrimaOption[]>(
    [],
  );
  const handleError = useErrorHandler();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tramasRes, materiasRes] = await Promise.all([
          api.get(ENDPOINTS.TRAMAS),
          api.get(ENDPOINTS.MATERIA_PRIMA),
        ]);
        setTramas(tramasRes.data);
        setMateriasPrimas(materiasRes.data);
      } catch (error) {
        handleError(error);
      }
    };
    fetchOptions();
  }, [handleError]);

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Basic fields */}
      <Grid size={9}>
        <TextField
          fullWidth
          name="nome"
          label="Nome"
          value={values.nome}
          onChange={handleChange}
          error={touched.nome && Boolean(errors.nome)}
          helperText={touched.nome && (errors.nome as string)}
          size="small"
        />
      </Grid>

      <Grid size={3}>
        <TextField
          fullWidth
          name="estoqueMinimo"
          label="Estoque Mínimo"
          type="number"
          value={values.estoqueMinimo ?? ""}
          onChange={(e) => {
            const val =
              e.target.value === "" ? undefined : Number(e.target.value);
            setFieldValue("estoqueMinimo", val);
          }}
          error={touched.estoqueMinimo && Boolean(errors.estoqueMinimo)}
          helperText={touched.estoqueMinimo && (errors.estoqueMinimo as string)}
          size="small"
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          fullWidth
          name="largura"
          label="Largura"
          type="number"
          value={values.largura || ""}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : Number(e.target.value);
            setFieldValue("largura", val);
          }}
          error={touched.largura && Boolean(errors.largura)}
          helperText={touched.largura && (errors.largura as string)}
          size="small"
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          fullWidth
          name="altura"
          label="Altura"
          type="number"
          value={values.altura || ""}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : Number(e.target.value);
            setFieldValue("altura", val);
          }}
          error={touched.altura && Boolean(errors.altura)}
          helperText={touched.altura && (errors.altura as string)}
          size="small"
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          fullWidth
          name="espessura"
          label="Espessura"
          type="number"
          value={values.espessura || ""}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : Number(e.target.value);
            setFieldValue("espessura", val);
          }}
          error={touched.espessura && Boolean(errors.espessura)}
          helperText={touched.espessura && (errors.espessura as string)}
          size="small"
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="reforco-label">Reforço</InputLabel>
          <Select
            labelId="reforco-label"
            name="reforco"
            label="Reforço"
            value={values.reforco}
            onChange={handleChange}
          >
            {REFORCO_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Tramas Section */}
      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Tramas
        </Typography>
      </Grid>

      {TRAMA_SECTIONS.map((section) => (
        <Grid size={{ xs: 12, sm: 6 }} key={section.ativaField}>
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  name={section.ativaField}
                  checked={values[section.ativaField] as boolean}
                  onChange={(e) => {
                    setFieldValue(section.ativaField, e.target.checked);
                    if (!e.target.checked) {
                      setFieldValue(section.idField, null);
                    }
                  }}
                />
              }
              label={section.label}
            />
            {values[section.ativaField] && (
              <Autocomplete
                size="small"
                sx={{ mt: 1 }}
                options={tramas}
                getOptionLabel={(option) => option.nome}
                value={
                  tramas.find((t) => t.id === values[section.idField]) || null
                }
                onChange={(_, newValue) => {
                  setFieldValue(section.idField, newValue ? newValue.id : null);
                }}
                noOptionsText="Nenhuma trama cadastrada"
                renderInput={(params) => (
                  <TextField {...params} label="Selecionar Trama" />
                )}
              />
            )}
          </Box>
        </Grid>
      ))}

      {/* Materiais Section */}
      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Materiais
        </Typography>
      </Grid>

      {values.materiais.map((material: MaterialItem, index: number) => (
        <Grid
          container
          spacing={1}
          size={12}
          key={index}
          sx={{ alignItems: "center" }}
        >
          <Grid size="grow">
            <FormControl fullWidth size="small">
              <InputLabel id={`material-${index}-label`}>
                Matéria-Prima
              </InputLabel>
              <Select
                labelId={`material-${index}-label`}
                label="Matéria-Prima"
                value={material.materiaPrimaId}
                onChange={(e) => {
                  const novos = [...values.materiais];
                  novos[index] = {
                    ...novos[index],
                    materiaPrimaId: Number(e.target.value),
                  };
                  setFieldValue("materiais", novos);
                }}
              >
                {materiasPrimas.map((mp) => (
                  <MenuItem key={mp.id} value={mp.id}>
                    {mp.item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 3, sm: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Qtd"
              type="number"
              value={material.quantidade}
              onChange={(e) => {
                const novos = [...values.materiais];
                novos[index] = {
                  ...novos[index],
                  quantidade:
                    e.target.value === "" ? "" : Number(e.target.value),
                };
                setFieldValue("materiais", novos);
              }}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>

          <Grid size="auto">
            <IconButton
              color="error"
              onClick={() => {
                const novos = values.materiais.filter(
                  (_: unknown, i: number) => i !== index,
                );
                setFieldValue("materiais", novos);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Grid size={12}>
        <Stack direction="row" sx={{ justifyContent: "flex-start" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              const novos = [
                ...values.materiais,
                {
                  materiaPrimaId: "" as unknown as number,
                  quantidade: "" as unknown as number,
                },
              ];
              setFieldValue("materiais", novos);
            }}
          >
            Adicionar Material
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TipoPlacaFormValues) => Promise<void>;
  item: Record<string, unknown> | null;
}

const TiposPlacaForm: React.FC<FormProps> = ({
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
      maxWidth="md"
      title={item ? "Editar Tipo de Placa" : "Novo Tipo de Placa"}
      item={
        item
          ? (() => {
              const materiais = Array.isArray(item.materiais)
                ? (item.materiais as MaterialItem[]).map((m) => ({
                    materiaPrimaId: m.materiaPrimaId,
                    quantidade: m.quantidade,
                  }))
                : [];
              return {
                ...item,
                largura: Number(item.largura),
                altura: Number(item.altura),
                espessura: Number(item.espessura),
                reforco: (item.reforco as string) || "S_P",
                tramaEsquerdaAtiva: Boolean(item.tramaEsquerdaAtiva),
                tramaEsquerdaId:
                  item.tramaEsquerdaId != null
                    ? Number(item.tramaEsquerdaId)
                    : null,
                tramaDireitaAtiva: Boolean(item.tramaDireitaAtiva),
                tramaDireitaId:
                  item.tramaDireitaId != null
                    ? Number(item.tramaDireitaId)
                    : null,
                tramaSuperiorAtiva: Boolean(item.tramaSuperiorAtiva),
                tramaSuperiorId:
                  item.tramaSuperiorId != null
                    ? Number(item.tramaSuperiorId)
                    : null,
                tramaInferiorAtiva: Boolean(item.tramaInferiorAtiva),
                tramaInferiorId:
                  item.tramaInferiorId != null
                    ? Number(item.tramaInferiorId)
                    : null,
                materiais,
              } as unknown as TipoPlacaFormValues;
            })()
          : null
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => <TipoPlacaFormContent formik={formik} />}
    />
  );
};

export default TiposPlacaForm;
