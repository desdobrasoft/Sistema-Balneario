// package
import React, { useEffect, useState } from "react";
import * as yup from "yup";

// icons
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import { type MateriaPrimaModel } from "pages/materia-prima/Form";
import { type TramaModel } from "pages/tramas/Form";
import api from "services/api";

interface PlacaModel {
  id?: number;
  nome: string;
  descricao?: string;
  altura?: number;
  largura?: number;
  espessura?: number;
  statusProducao?: string;

  tramaEsquerdaAtiva?: boolean;
  tramaEsquerdaId?: number;

  tramaDireitaAtiva?: boolean;
  tramaDireitaId?: number;

  tramaSuperiorAtiva?: boolean;
  tramaSuperiorId?: number;

  tramaInferiorAtiva?: boolean;
  tramaInferiorId?: number;
  retalhoDescartado?: boolean;
  materiais?: {
    materiaPrimaId: number;
    quantidade: number;
    materiaPrima?: MateriaPrimaModel;
  }[];
  percursoCorte?: any[];
  _count?: {
    cortesOndeEPai: number;
    corteOndeEResult: number;
  };
  modoBatch?: boolean;
  prefixo?: string;
  sufixo?: string;
  valorInicial?: number | string;
  quantidade?: number | string;
  algarismos?: number | string;
  darBaixaImediata?: boolean;
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PlacaModel) => Promise<void>;
  item: PlacaModel | null;
}

export const validationSchema = yup.object({
  nome: yup.string().when("modoBatch", {
    is: false,
    then: (schema) => schema.required("Campo obrigatório"),
    otherwise: (schema) => schema.notRequired(),
  }),
  descricao: yup.string(),
  altura: yup.number(),
  largura: yup.number(),
  espessura: yup.number(),
  retalhoDescartado: yup.boolean(),

  tramaEsquerdaAtiva: yup.boolean(),
  tramaEsquerdaId: yup.number().nullable(),

  tramaDireitaAtiva: yup.boolean(),
  tramaDireitaId: yup.number().nullable(),

  tramaSuperiorAtiva: yup.boolean(),
  tramaSuperiorId: yup.number().nullable(),

  tramaInferiorAtiva: yup.boolean(),
  tramaInferiorId: yup.number().nullable(),
  materiais: yup.array().of(
    yup.object({
      materiaPrimaId: yup.number().required("Selecione o material"),
      quantidade: yup.number().required("Obrigatório").min(1, "Qtd mínima é 1"),
    }),
  ),
  modoBatch: yup.boolean(),
  prefixo: yup.string().when("modoBatch", {
    is: true,
    then: (schema) => schema.notRequired(),
  }),
  sufixo: yup.string().when("modoBatch", {
    is: true,
    then: (schema) => schema.notRequired(),
  }),
  valorInicial: yup.number().when("modoBatch", {
    is: true,
    then: (schema) => schema.min(1, "Mínimo 1").required("Obrigatório"),
  }),
  quantidade: yup.number().when("modoBatch", {
    is: true,
    then: (schema) => schema.min(1, "Mínimo 1").required("Obrigatório"),
  }),
  darBaixaImediata: yup.boolean(),
});

export const initialValues = {
  nome: "",
  descricao: "",
  altura: "" as unknown as number,
  largura: "" as unknown as number,
  espessura: "" as unknown as number,
  retalhoDescartado: false,

  tramaEsquerdaAtiva: false,
  tramaEsquerdaId: undefined,

  tramaDireitaAtiva: false,
  tramaDireitaId: undefined,

  tramaSuperiorAtiva: false,
  tramaSuperiorId: undefined,

  tramaInferiorAtiva: false,
  tramaInferiorId: undefined,
  materiais: [] as { materiaPrimaId: number; quantidade: number }[],
  modoBatch: false,
  prefixo: "",
  sufixo: "",
  valorInicial: "" as unknown as number,
  quantidade: "" as unknown as number,
  algarismos: "",
  darBaixaImediata: false,
};

const PlacasForm: React.FC<FormProps> = ({ open, onClose, onSubmit, item }) => {
  const [tramas, setTramas] = useState<TramaModel[]>([]);
  const [estoque, setEstoque] = useState<MateriaPrimaModel[]>([]);
  const [tab, setTab] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: loading data and resetting tab on dialog open */
  useEffect(() => {
    if (open) {
      // Fetch Tramas
      api
        .post(`${ENDPOINTS.TRAMAS}${ENDPOINTS.DATATABLE}`, { length: 100 })
        .then((res) => {
          setTramas(res.data.data || []);
        })
        .catch((err) => console.error("Erro ao carregar tramas:", err));

      // Fetch Stock Materials
      api
        .get(ENDPOINTS.MATERIA_PRIMA, { params: { length: 500 } })
        .then((res) => {
          setEstoque(Array.isArray(res.data) ? res.data : res.data?.data || []);
        })
        .catch((err) => console.error("Erro ao carregar estoque:", err));

      setTab(0);
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Adjust initial materials for editing
  const getInitialValues = () => {
    if (item) {
      return {
        ...initialValues,
        ...item,
        algarismos: (item as any).algarismos ?? "",
        materiais:
          (item as any).materiais?.map((m: any) => ({
            materiaPrimaId: m.materiaPrimaId,
            quantidade: m.quantidade,
          })) || [],
      };
    }
    return initialValues;
  };

  return (
    <DataTableDialog<PlacaModel>
      open={open}
      onClose={onClose}
      onSubmit={async (values) => {
        if (values.modoBatch && !item) {
          const { nome, modoBatch, ...batchData } = values;

          // Limpa campos opcionais se estiverem vazios
          if (batchData.algarismos === "" || batchData.algarismos === null) {
            delete batchData.algarismos;
          }

          // Garante que os campos numéricos sejam números
          const payload = {
            ...batchData,
            valorInicial: Number(batchData.valorInicial),
            quantidade: Number(batchData.quantidade),
            algarismos: batchData.algarismos
              ? Number(batchData.algarismos)
              : undefined,
          };

          return api
            .post(`${ENDPOINTS.PLACAS}/batch`, payload)
            .then(() => onClose());
        }
        return onSubmit(values);
      }}
      title={item ? "Editar Placa" : "Nova Placa"}
      maxWidth="lg"
      item={item}
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Box>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 2,
              minHeight: 36,
            }}
          >
            <Tab
              label="Geral"
              icon={<InfoIcon />}
              iconPosition="start"
              sx={{ minHeight: 36, py: 1 }}
            />
            <Tab
              label="Materiais"
              icon={<InventoryIcon />}
              iconPosition="start"
              sx={{ minHeight: 36, py: 1 }}
            />
            <Tab
              label="Tramas"
              icon={<DesignServicesIcon />}
              iconPosition="start"
              sx={{ minHeight: 36, py: 1 }}
            />
          </Tabs>

          {/* TAB 0: GERAL */}
          {tab === 0 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {!item && (
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="modoBatch"
                        checked={formik.values.modoBatch}
                        onChange={formik.handleChange}
                      />
                    }
                    label={
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        Cadastrar em Lote (Geração Automática de Nomes)
                      </Typography>
                    }
                  />
                  <Divider sx={{ my: 1 }} />
                </Grid>
              )}

              {!formik.values.modoBatch ? (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    name="nome"
                    label="Nome da Placa"
                    value={formik.values.nome}
                    onChange={formik.handleChange}
                    error={formik.touched.nome && Boolean(formik.errors.nome)}
                    size="small"
                  />
                </Grid>
              ) : (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      name="prefixo"
                      label="Prefixo"
                      value={formik.values.prefixo}
                      onChange={formik.handleChange}
                      placeholder="Ex: P"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      name="sufixo"
                      label="Sufixo"
                      value={formik.values.sufixo}
                      onChange={formik.handleChange}
                      placeholder="Ex: X"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      name="valorInicial"
                      label="Valor Inicial"
                      type="number"
                      value={formik.values.valorInicial}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.valorInicial &&
                        Boolean(formik.errors.valorInicial)
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      name="quantidade"
                      label="Quantidade do Lote"
                      type="number"
                      value={formik.values.quantidade}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.quantidade &&
                        Boolean(formik.errors.quantidade)
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      name="algarismos"
                      label="Mín. Algarismos"
                      type="number"
                      value={formik.values.algarismos ?? ""}
                      onChange={formik.handleChange}
                      placeholder="Automático"
                      size="small"
                    />
                  </Grid>
                  <Grid size={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                </>
              )}

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="descricao"
                  label="Descrição"
                  value={formik.values.descricao}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  name="altura"
                  label="Altura"
                  type="number"
                  value={formik.values.altura}
                  onChange={formik.handleChange}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  name="largura"
                  label="Largura"
                  type="number"
                  value={formik.values.largura}
                  onChange={formik.handleChange}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  name="espessura"
                  label="Espessura"
                  type="number"
                  value={formik.values.espessura}
                  onChange={formik.handleChange}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    },
                  }}
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
                    <Typography variant="body2">
                      <strong>Marcar como concluído/descartado</strong> (Não
                      sugerir como retalho em futuros cortes)
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          )}

          {/* TAB 1: MATERIAIS */}
          {tab === 1 && (
            <Box>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Composição de Materiais
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    * A quantidade definida aqui é gasta para produzir{" "}
                    <strong>1 (uma) única placa</strong>.
                  </Typography>
                </Box>
              </Stack>

              {!formik.values.materiais?.length && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", mb: 2 }}
                >
                  Nenhum material adicionado a esta placa.
                </Typography>
              )}

              {formik.values.materiais?.map((material, index) => {
                const selectedMaterialIds = formik.values.materiais
                  ?.map((m) => m.materiaPrimaId)
                  .filter((id) => id !== material.materiaPrimaId);

                const availableEstoque = estoque.filter(
                  (e) => !selectedMaterialIds?.includes(e.id),
                );

                return (
                  <Grid
                    container
                    spacing={1}
                    key={index}
                    sx={{ mb: 1.5, alignItems: "flex-start" }}
                  >
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={
                          formik.touched.materiais?.[index]?.materiaPrimaId &&
                          Boolean(
                            (formik.errors.materiais?.[index] as any)
                              ?.materiaPrimaId,
                          )
                        }
                      >
                        <InputLabel>Material no Estoque</InputLabel>
                        <Select
                          name={`materiais[${index}].materiaPrimaId`}
                          value={material.materiaPrimaId || ""}
                          label="Material no Estoque"
                          onChange={formik.handleChange}
                        >
                          {/* Fallback temporário enquanto o estoque carrega para evitar Select vazio */}
                          {availableEstoque.length === 0 &&
                            material.materiaPrima && (
                              <MenuItem value={material.materiaPrimaId}>
                                {material.materiaPrima.item} (
                                {material.materiaPrima.unidade})
                              </MenuItem>
                            )}
                          {availableEstoque.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.item} ({item.unidade})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 10, sm: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Qtd"
                        name={`materiais[${index}].quantidade`}
                        value={material.quantidade}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.materiais?.[index]?.quantidade &&
                          Boolean(
                            (formik.errors.materiais?.[index] as any)
                              ?.quantidade,
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      size={{ xs: 2, sm: 1 }}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        pt: 0.5,
                      }}
                    >
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => {
                          const newMateriais = [
                            ...(formik.values.materiais || []),
                          ];
                          newMateriais.splice(index, 1);
                          formik.setFieldValue("materiais", newMateriais);
                        }}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}

              <Grid size={12} sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ borderStyle: "dashed", py: 1.5 }}
                  startIcon={<AddCircleOutlinedIcon />}
                  onClick={() => {
                    const currentMateriais = formik.values.materiais || [];
                    formik.setFieldValue("materiais", [
                      ...currentMateriais,
                      { materiaPrimaId: "", quantidade: 1 },
                    ]);
                  }}
                >
                  Adicionar Material
                </Button>
              </Grid>
            </Box>
          )}

          {/* TAB 2: TRAMAS */}
          {tab === 2 && (
            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Tramas por Extremidade
              </Typography>

              <Grid container spacing={2}>
                {[
                  { side: "Esquerda", key: "tramaEsquerda" },
                  { side: "Direita", key: "tramaDireita" },
                  { side: "Superior", key: "tramaSuperior" },
                  { side: "Inferior", key: "tramaInferior" },
                ].map((config) => {
                  const ativaKey = `${config.key}Ativa`;
                  const idKey = `${config.key}Id`;
                  const isAtiva = (formik.values as any)[ativaKey];

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={config.key}>
                      <Box
                        sx={{
                          p: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          bgcolor: isAtiva ? "action.hover" : "transparent",
                          transition: "all 0.2s",
                        }}
                      >
                        <Grid
                          container
                          spacing={2}
                          sx={{ alignItems: "center" }}
                        >
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name={ativaKey}
                                  checked={isAtiva}
                                  onChange={formik.handleChange}
                                />
                              }
                              label={config.side}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 8 }}>
                            <FormControl
                              size="small"
                              fullWidth
                              disabled={!isAtiva}
                              error={
                                isAtiva &&
                                (formik.touched as any)[idKey] &&
                                Boolean((formik.errors as any)[idKey])
                              }
                            >
                              <InputLabel>Trama</InputLabel>
                              <Select
                                name={idKey}
                                value={(formik.values as any)[idKey] || ""}
                                label="Trama"
                                onChange={formik.handleChange}
                              >
                                {tramas.map((trama) => (
                                  <MenuItem key={trama.id} value={trama.id}>
                                    {trama.nome}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {!item && (
            <Box sx={{ mt: 2 }}>
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
                      name="darBaixaImediata"
                      checked={formik.values.darBaixaImediata}
                      onChange={formik.handleChange}
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="body2" color="success.dark">
                      <strong>Dar baixa imediatamente:</strong> Esta opção já
                      cadastra a placa como <strong>Finalizada</strong> e
                      consome imediatamente o material do estoque.
                    </Typography>
                  }
                />
              </Box>
            </Box>
          )}
        </Box>
      )}
    />
  );
};

export default PlacasForm;
export type { PlacaModel };
