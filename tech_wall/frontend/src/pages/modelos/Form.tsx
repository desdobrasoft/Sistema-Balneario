// react imports
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

// material-ui icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

// material-ui components
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import RequisitosEditor from "components/RequisitosEditor";
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

import type { MaterialRequeridoDto } from "types/dtos";
import type { RequisitoEditorItem } from "components/RequisitosEditor";

interface SuprimentoObra {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  momento: string;
  status: "PENDENTE" | "ADQUIRIDO";
}

export type MaterialRequerido = MaterialRequeridoDto & {
  materiaPrima?: { item: string, unidade?: string };
};

export type RequisitoRequerido = RequisitoEditorItem & {
  corte?: {
    id?: number;
    nome?: string;
    largura?: number;
    altura?: number;
    percurso?: { distancia: number }[];
  };
  tipoPlaca?: {
    id?: number;
    nome?: string;
    largura?: number;
    altura?: number;
    espessura?: number;
    reforco?: string;
    tramaEsquerdaAtiva?: boolean;
    tramaDireitaAtiva?: boolean;
    tramaSuperiorAtiva?: boolean;
    tramaInferiorAtiva?: boolean;
    tramaEsquerda?: { nome: string };
    tramaDireita?: { nome: string };
    tramaSuperior?: { nome: string };
    tramaInferior?: { nome: string };
  };
};

interface ModeloCasaModel {
  id?: number;
  nome: string;
  descricao?: string;
  tempoFabricacao: number;
  preco: number | string;
  imagemBase64?: string;
  materiais: MaterialRequerido[];
  requisitos: RequisitoRequerido[];
  suprimentosObra: SuprimentoObra[];
}

interface ModeloCasaFormValues {
  nome: string;
  descricao: string;
  tempoFabricacao: number;
  preco: string | number;
  imagemBase64?: string;
  requisitos: RequisitoRequerido[];
  materiais: MaterialRequerido[];
  suprimentosObra: SuprimentoObra[];
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ModeloCasaFormValues) => Promise<void>;
  item: ModeloCasaModel | null;
}

const validationSchema = yup.object({
  nome: yup.string().required("Campo obrigatório"),
  descricao: yup.string(),
  tempoFabricacao: yup
    .number()
    .min(1, "Mínimo 1 dia")
    .required("Campo obrigatório"),
  preco: yup
    .string()
    .required("Campo obrigatório")
    .test("is-valid-number", "Valor inválido", (value) => {
      if (!value) return false;
      const parsed = Number(value.replace(",", "."));
      return !isNaN(parsed) && parsed >= 0;
    }),
});

const initialValues = {
  nome: "",
  descricao: "",
  tempoFabricacao: 1,
  preco: "",
  imagemBase64: "",
  requisitos: [] as RequisitoRequerido[],
  materiais: [] as MaterialRequerido[],
  suprimentosObra: [] as SuprimentoObra[],
};

// ===============================
// MAIN COMPONENT
// ===============================

const ModelosForm: React.FC<FormProps> = ({
  open,
  onClose,
  onSubmit,
  item,
}) => {
  const [tab, setTab] = useState(0);
  const [allMateriais, setAllMateriais] = useState<{ id: number; item: string; unidade: string }[]>([]);
  const [hasEmptyParedes, setHasEmptyParedes] = useState(false);
  const [loadingMateriais, setLoadingMateriais] = useState(false);

  const fetchMateriais = useCallback(async () => {
    setLoadingMateriais(true);
    try {
      const res = await api.get(ENDPOINTS.MATERIA_PRIMA);
      setAllMateriais(res.data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    } finally {
      setLoadingMateriais(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: loading data and resetting tab on dialog open */
  useEffect(() => {
    if (open) {
      fetchMateriais();
      setTab(0);
    }
  }, [open, fetchMateriais]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Agrupamento de requisitos por parede
  const getGroupedRequisitos = (requisitos: RequisitoRequerido[]) => {
    const groups: { [key: string]: RequisitoRequerido[] } = {};
    requisitos.forEach((r) => {
      if (!groups[r.parede]) groups[r.parede] = [];
      groups[r.parede].push(r);
    });
    return groups;
  };

  return (
    <DataTableDialog
      disableSubmit={hasEmptyParedes}
      open={open}
      onClose={onClose}
      onSubmit={(values) => {
        const formattedValues = {
          ...values,
          tempoFabricacao: Number(values.tempoFabricacao),
          preco: Number(String(values.preco).replace(",", ".")),
          requisitos: values.requisitos.flatMap((r: RequisitoRequerido & { quantidade?: number }) => {
            const count = r.quantidade && r.quantidade > 1 ? r.quantidade : 1;
            return Array.from({ length: count }).map(() => ({
              tipo: r.tipo,
              alias: r.alias || undefined,
              parede: r.parede,
              tipoPlacaId: r.tipoPlacaId || 0,
              corteId: r.corteId || undefined,
            }));
          }),
          materiais: values.materiais.map((m: MaterialRequerido) => ({
            materiaPrimaId: Number(m.materiaPrimaId),
            qtModelo: Number(m.qtModelo),
          })),
        };
        return onSubmit(formattedValues);
      }}
      title={item ? "Editar Modelo" : "Novo Modelo"}
      item={
        item
          ? {
              ...item,
              descricao: item.descricao || "",
              preco: Number(item.preco).toFixed(2).replace(".", ","),
              imagemBase64: item.imagemBase64 || "",
              requisitos: item.requisitos || [],
              materiais: (item as ModeloCasaModel & { materiaisModeloCasa?: MaterialRequerido[] }).materiaisModeloCasa || [],
              suprimentosObra: item.suprimentosObra || [],
            }
          : null
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      maxWidth="md"
      renderForm={(formik) => {
        const groupedRequisitos = getGroupedRequisitos(
          formik.values.requisitos,
        );
        const paredes = Object.keys(groupedRequisitos);
        if (paredes.length === 0) {
          paredes.push("Parede 1");
        }

        return (
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
              <Tab label="Geral" sx={{ minHeight: 36, py: 1 }} />
              <Tab
                label="Matéria-Prima"
                icon={<InventoryIcon />}
                iconPosition="start"
                sx={{ minHeight: 36, py: 1 }}
              />
              <Tab
                label="Paredes"
                icon={<ViewInArIcon />}
                iconPosition="start"
                sx={{ minHeight: 36, py: 1 }}
              />
              <Tab
                label="Insumos Obra"
                icon={<AddIcon />}
                iconPosition="start"
                sx={{ minHeight: 36, py: 1 }}
              />
            </Tabs>

            {/* ABA 0: GERAL */}
            {tab === 0 && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    name="nome"
                    label="Nome do Modelo"
                    value={formik.values.nome}
                    onChange={formik.handleChange}
                    error={formik.touched.nome && Boolean(formik.errors.nome)}
                    helperText={
                      formik.touched.nome && (formik.errors.nome as string)
                    }
                    size="small"
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="descricao"
                    label="Descrição"
                    value={formik.values.descricao}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Imagem de Capa (Opcional)
                  </Typography>
                  {formik.values.imagemBase64 ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 150,
                        mb: 1,
                      }}
                    >
                      <img
                        src={formik.values.imagemBase64}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255,255,255,0.8)",
                        }}
                        onClick={() => formik.setFieldValue("imagemBase64", "")}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ height: 150, borderStyle: "dashed" }}
                    >
                      Carregar Imagem
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              formik.setFieldValue(
                                "imagemBase64",
                                reader.result as string,
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Button>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ alignSelf: "center" }}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        name="tempoFabricacao"
                        label="Tempo de Fabricação"
                        type="number"
                        value={formik.values.tempoFabricacao}
                        onChange={formik.handleChange}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                dias
                              </InputAdornment>
                            ),
                          },
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        name="preco"
                        label="Preço Base"
                        type="text"
                        placeholder="0,00"
                        value={formik.values.preco}
                        size="small"
                        onChange={(e) => {
                          let val = e.target.value;
                          val = val.replace(/\./g, ",");
                          val = val.replace(/[^0-9,]/g, "");

                          const parts = val.split(",");
                          if (parts.length > 2) {
                            val = parts[0] + "," + parts.slice(1).join("");
                          }

                          if (val.includes(",")) {
                            const [intPart, decPart] = val.split(",");
                            val = `${intPart},${decPart.slice(0, 2)}`;
                          }

                          formik.setFieldValue("preco", val);
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                R$
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* ABA 1: MATERIA-PRIMA */}
            {tab === 1 && (
              <Box>
                <Grid
                  container
                  spacing={2}
                  sx={{ alignItems: "center", mb: 2 }}
                >
                  <Grid size="grow">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Matéria-Prima Estrutural
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Materiais básicos utilizados na fabricação deste modelo.
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  {formik.values.materiais.map((item: MaterialRequerido, idx: number) => (
                    <Grid size={12} key={idx}>
                      <Grid container spacing={1} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 8, sm: 9 }}>
                          <Autocomplete
                            fullWidth
                            size="small"
                            options={allMateriais}
                            loading={loadingMateriais}
                            getOptionLabel={(option: { item: string; unidade: string }) =>
                              `${option.item} (${option.unidade})`
                            }
                            value={
                              allMateriais.find(
                                (m) => m.id === item.materiaPrimaId,
                              ) || null
                            }
                            onChange={(_, newValue: { id: number; item: string; unidade: string } | null) => {
                              formik.setFieldValue(
                                `materiais[${idx}].materiaPrimaId`,
                                newValue ? newValue.id : "",
                              );
                            }}
                            renderInput={(params) => (
                              <TextField {...params} label="Material" />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 3, sm: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Qtd"
                            type="number"
                            value={item.qtModelo}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `materiais[${idx}].qtModelo`,
                                e.target.value,
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const updated = formik.values.materiais.filter(
                                (_: unknown, i: number) => i !== idx,
                              );
                              formik.setFieldValue("materiais", updated);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  {formik.values.materiais.length === 0 && (
                    <Grid size={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 4 }}
                      >
                        Nenhuma matéria-prima vinculada.
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={12} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderStyle: "dashed", py: 1.5 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        formik.setFieldValue("materiais", [
                          ...formik.values.materiais,
                          { materiaPrimaId: "", qtModelo: 1 },
                        ]);
                      }}
                    >
                      Adicionar Material
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ABA 2: REQUISITOS (PAREDES) */}
            {tab === 2 && (
              <RequisitosEditor
                onChange={(novos) => formik.setFieldValue("requisitos", novos)}
                onHasEmptyParedes={setHasEmptyParedes}
                requisitos={formik.values.requisitos}
                showParedes={true}
              />
            )}

            {/* ABA 3: INSUMOS */}
            {tab === 3 && (
              <Box>
                <Grid
                  container
                  spacing={2}
                  sx={{ alignItems: "center", mb: 2 }}
                >
                  <Grid size="grow">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Insumos de Obra Imprevisíveis
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Materiais de construção e acabamento (comprados no ato da
                      obra).
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  {formik.values.suprimentosObra.map(
                    (item: SuprimentoObra, idx: number) => (
                      <Grid size={12} key={item.id}>
                        <Grid
                          container
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nome do Item"
                              value={item.nome}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `suprimentosObra[${idx}].nome`,
                                  e.target.value,
                                )
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 4, sm: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Qtd"
                              type="number"
                              value={item.quantidade}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `suprimentosObra[${idx}].quantidade`,
                                  e.target.value,
                                )
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 4, sm: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Un"
                              value={item.unidade}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `suprimentosObra[${idx}].unidade`,
                                  e.target.value,
                                )
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 10, sm: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Momento de Aquisição"
                              value={item.momento}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `suprimentosObra[${idx}].momento`,
                                  e.target.value,
                                )
                              }
                              placeholder="Ex: Fundação"
                            />
                          </Grid>
                          <Grid size={{ xs: 2, sm: 1 }}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated =
                                  formik.values.suprimentosObra.filter(
                                    (_: unknown, i: number) => i !== idx,
                                  );
                                formik.setFieldValue(
                                  "suprimentosObra",
                                  updated,
                                );
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    ),
                  )}
                  {formik.values.suprimentosObra.length === 0 && (
                    <Grid size={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 4 }}
                      >
                        Nenhum suprimento cadastrado para este modelo.
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={12} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderStyle: "dashed", py: 1.5 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        formik.setFieldValue("suprimentosObra", [
                          ...formik.values.suprimentosObra,
                          {
                            id: uuidv4(),
                            nome: "",
                            quantidade: 1,
                            unidade: "Un",
                            momento: "Abertura de Obra",
                            status: "PENDENTE",
                          },
                        ]);
                      }}
                    >
                      Novo Item
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
};

export default ModelosForm;
export type { ModeloCasaModel, SuprimentoObra };
