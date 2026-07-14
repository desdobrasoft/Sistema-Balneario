// packages
import type { FormikProps } from "formik";
import React, { useEffect } from "react";
import * as yup from "yup";

// icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// material-ui
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
import DataTableDialog from "components/datatable/DataTableDialog";
import TramaPreview from "./TramaPreview";

export interface TramaModel {
  id: number;
  nome: string;
  alturaBase: number;
  profundidadeSaliencia: number;
  iniciaComSaliencia: boolean;
  direcionamento: string;
  padronizada: boolean;
  numeroDivisoes?: number;
  cortes: number[];
}

const validationSchema = yup.object().shape({
  nome: yup.string().required("Campo obrigatório"),
  alturaBase: yup.number().min(0).required("Campo obrigatório"),
  profundidadeSaliencia: yup.number().min(0).required("Campo obrigatório"),
  iniciaComSaliencia: yup.boolean(),
  direcionamento: yup.string().required("Campo obrigatório"),
  padronizada: yup.boolean(),
  numeroDivisoes: yup.number().when("padronizada", {
    is: true,
    then: (s) =>
      s
        .min(1, "Mínimo 1 divisão")
        .required("Requerido para tramas padronizadas"),
  }),
  cortes: yup
    .array()
    .of(
      yup
        .number()
        .min(0, "Tamanho inválido")
        .required("Corte não pode ser vazio"),
    )
    .min(2, "No mínimo 2 cortes para alternar")
    .test(
      "sum-matches-base",
      "A soma dos cortes deve ser exatamente igual à altura base",
      function (cortes: number[] | undefined) {
        const { alturaBase } = this.parent;
        const sum = (cortes || []).reduce(
          (acc, val) => acc + (Number(val) || 0),
          0,
        );
        return Math.round(sum * 100) === Math.round(alturaBase * 100);
      },
    ),
});

const initialValues = {
  nome: "",
  alturaBase: 200,
  profundidadeSaliencia: 9,
  iniciaComSaliencia: true,
  direcionamento: "DIREITA",
  padronizada: true,
  numeroDivisoes: 4,
  cortes: [50, 50, 50, 50],
};

type TramaFormValues = typeof initialValues;

const TramaFormContent = ({
  formik,
}: {
  formik: FormikProps<TramaFormValues>;
}) => {
  const { values, setFieldValue, handleChange, touched, errors } = formik;

  const currentSum: number = values.cortes.reduce(
    (acc: number, val: number) => acc + (Number(val) || 0),
    0,
  );
  const rawRemaining = values.alturaBase - currentSum;
  // Arredonda apenas para exibição
  const remainingHeight = Math.round(rawRemaining * 100) / 100;
  const progressValue =
    values.alturaBase > 0
      ? Math.min((currentSum / values.alturaBase) * 100, 100)
      : 0;
  const isLimitReached = rawRemaining <= 0;

  // Auto-calcular cortes se padronizada
  useEffect(() => {
    if (
      values.padronizada &&
      values.alturaBase > 0 &&
      values.numeroDivisoes > 0
    ) {
      const fracao = values.alturaBase / values.numeroDivisoes;
      const novosCortes = Array.from(
        { length: values.numeroDivisoes },
        () => fracao,
      );
      // Evitar updates infinitos se os cortes já estão idênticos
      const equals =
        novosCortes.length === values.cortes.length &&
        novosCortes.every((val, index) => val === values.cortes[index]);
      if (!equals) {
        setFieldValue("cortes", novosCortes);
      }
    }
  }, [
    values.padronizada,
    values.alturaBase,
    values.numeroDivisoes,
    values.cortes,
    setFieldValue,
  ]);

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              fullWidth
              name="nome"
              label="Nome da Trama"
              value={values.nome}
              onChange={handleChange}
              error={touched.nome && Boolean(errors.nome)}
              helperText={touched.nome && (errors.nome as string)}
              size="small"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              name="alturaBase"
              label="Altura Base (cm)"
              type="number"
              value={values.alturaBase || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setFieldValue("alturaBase", val);
              }}
              error={touched.alturaBase && Boolean(errors.alturaBase)}
              size="small"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              name="profundidadeSaliencia"
              label="Prof. da Saliência (cm)"
              type="number"
              value={values.profundidadeSaliencia || ""}
              size="small"
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setFieldValue("profundidadeSaliencia", val);
              }}
              error={
                touched.profundidadeSaliencia &&
                Boolean(errors.profundidadeSaliencia)
              }
            />
          </Grid>

          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel size="small" id="dir-label">
                Direcionamento
              </InputLabel>
              <Select
                labelId="dir-label"
                name="direcionamento"
                label="Direcionamento"
                size="small"
                value={values.direcionamento}
                onChange={handleChange}
              >
                <MenuItem value="DIREITA">Direita</MenuItem>
                <MenuItem value="ESQUERDA">Esquerda</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <FormControlLabel
              control={
                <Checkbox
                  name="iniciaComSaliencia"
                  checked={values.iniciaComSaliencia}
                  onChange={handleChange}
                />
              }
              label="Inicia com Saliência"
              sx={{ flex: 1 }}
            />
          </Grid>

          <Grid
            container
            size="grow"
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="padronizada"
                    checked={values.padronizada}
                    onChange={handleChange}
                  />
                }
                label="Divisões Padronizadas"
              />
            </Grid>

            {values.padronizada && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  name="numeroDivisoes"
                  label="Número de Divisões"
                  type="number"
                  size="small"
                  value={values.numeroDivisoes || ""}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? "" : Number(e.target.value);
                    setFieldValue("numeroDivisoes", val);
                  }}
                  error={
                    touched.numeroDivisoes && Boolean(errors.numeroDivisoes)
                  }
                  helperText={
                    touched.numeroDivisoes && (errors.numeroDivisoes as string)
                  }
                />
              </Grid>
            )}

            {!values.padronizada && (
              <Grid container sx={{ alignItems: "center" }}>
                <Grid size={12}>
                  <Typography
                    gutterBottom
                    variant="subtitle1"
                    sx={{ fontWeight: "bold" }}
                  >
                    Cortes Customizados
                  </Typography>
                </Grid>
                {values.cortes.map((corte: number, index: number) => (
                  <Grid container spacing={1} size={12}>
                    <Grid size="grow">
                      <TextField
                        fullWidth
                        size="small"
                        label={`Corte ${index + 1}`}
                        type="number"
                        value={corte || ""}
                        error={remainingHeight < 0}
                        onChange={(e) => {
                          const val =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          const novosCortes = [...values.cortes];
                          novosCortes[index] = val;
                          setFieldValue("cortes", novosCortes);
                        }}
                      />
                    </Grid>

                    <Grid size="auto">
                      <IconButton
                        color="error"
                        onClick={() => {
                          const novosCortes = values.cortes.filter(
                            (_: unknown, i: number) => i !== index,
                          );
                          setFieldValue("cortes", novosCortes);
                        }}
                        disabled={values.cortes.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Grid size="grow">
                  {typeof errors.cortes === "string" && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ display: "block", mb: 1, fontWeight: "bold" }}
                    >
                      {errors.cortes}
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", mb: 1 }}
                  >
                    <Typography
                      variant="caption"
                      color={remainingHeight < 0 ? "error" : "text.secondary"}
                      sx={{ fontWeight: "bold" }}
                    >
                      Progresso da Altura (
                      {currentSum.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      /{" "}
                      {Number(values.alturaBase).toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      cm)
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        remainingHeight < 0
                          ? "error"
                          : remainingHeight === 0
                            ? "success.main"
                            : "primary"
                      }
                      sx={{ fontWeight: "bold" }}
                    >
                      {remainingHeight < 0
                        ? "Ultrapassou!"
                        : remainingHeight === 0
                          ? "Completo"
                          : `Restante: ${remainingHeight.toFixed(2)} cm`}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    color={
                      remainingHeight < 0
                        ? "error"
                        : remainingHeight === 0
                          ? "success"
                          : "primary"
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Grid>

                <Grid size="auto">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const novosCortes = [...values.cortes, 0];
                      setFieldValue("cortes", novosCortes);
                    }}
                    disabled={isLimitReached}
                  >
                    Adicionar Corte
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <TramaPreview values={values} />
      </Grid>
    </Grid>
  );
};

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TramaFormValues) => Promise<void>;
  item: Record<string, unknown> | null;
}

const TramasForm: React.FC<FormProps> = ({ open, onClose, onSubmit, item }) => {
  return (
    <DataTableDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      maxWidth="md"
      title={item ? "Editar Trama" : "Nova Trama"}
      item={
        item
          ? (() => {
              const cortes = Array.isArray(item.cortes)
                ? item.cortes.map(Number)
                : [];
              const padronizada =
                cortes.length > 0 &&
                cortes.every((c: number) => c === cortes[0]);
              return {
                ...item,
                alturaBase: Number(item.alturaBase),
                profundidadeSaliencia: Number(item.profundidadeSaliencia),
                cortes,
                padronizada,
                numeroDivisoes: cortes.length || 4,
              } as unknown as TramaFormValues;
            })()
          : null
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => <TramaFormContent formik={formik} />}
    />
  );
};

export default TramasForm;
