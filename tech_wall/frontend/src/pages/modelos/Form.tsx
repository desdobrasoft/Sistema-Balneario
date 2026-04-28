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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import api from "services/api";
import BatchRequisitosDialog from "./BatchRequisitosDialog";

interface SuprimentoObra {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  momento: string;
  status: "PENDENTE" | "ADQUIRIDO";
}

interface MaterialRequerido {
  materiaPrimaId: number;
  qtModelo: number;
  materiaPrima?: any;
}

export interface RequisitoRequerido {
  tipo: "PLACA_LISA" | "CORTE_ESPECIFICO";
  alias?: string;
  parede: string;
  largura?: number;
  altura?: number;
  espessura?: number;
  tramaEsquerdaId?: number | null;
  tramaDireitaId?: number | null;
  tramaSuperiorId?: number | null;
  tramaInferiorId?: number | null;
  corteId?: number | null;
  corte?: any;
}

interface ModeloCasaModel {
  id: number;
  nome: string;
  descricao: string;
  tempoFabricacao: number;
  preco: string | number;
  imagemBase64?: string;
  requisitos?: RequisitoRequerido[];
  materiaisModeloCasa?: MaterialRequerido[];
  suprimentosObra?: SuprimentoObra[];
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  item: ModeloCasaModel | null;
}

export const validationSchema = yup.object({
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

export const initialValues = {
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
  const { showDialog, closeDialog } = useDialog();
  const [tab, setTab] = useState(0);
  const [allCortes, setAllCortes] = useState<any[]>([]);
  const [allTramas, setAllTramas] = useState<any[]>([]);
  const [allMateriais, setAllMateriais] = useState<any[]>([]);
  const [loadingCortes, setLoadingCortes] = useState(false);
  const [loadingTramas, setLoadingTramas] = useState(false);
  const [loadingMateriais, setLoadingMateriais] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchParede, setBatchParede] = useState("");

  const fetchCortes = useCallback(async () => {
    setLoadingCortes(true);
    try {
      const res = await api.get(ENDPOINTS.CORTES);
      setAllCortes(res.data);
    } catch (error) {
      console.error("Erro ao carregar cortes:", error);
    } finally {
      setLoadingCortes(false);
    }
  }, []);

  const fetchTramas = useCallback(async () => {
    setLoadingTramas(true);
    try {
      const res = await api.get(ENDPOINTS.TRAMAS);
      setAllTramas(res.data);
    } catch (error) {
      console.error("Erro ao carregar tramas:", error);
    } finally {
      setLoadingTramas(false);
    }
  }, []);

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
      fetchCortes();
      fetchTramas();
      fetchMateriais();
      setTab(0);
    }
  }, [open, fetchCortes, fetchTramas, fetchMateriais]);
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
      open={open}
      onClose={onClose}
      onSubmit={(values) => {
        const formattedValues = {
          ...values,
          tempoFabricacao: Number(values.tempoFabricacao),
          preco: Number(String(values.preco).replace(",", ".")),
          requisitos: values.requisitos.map((r: any) => ({
            tipo: r.tipo,
            alias: r.alias || null,
            parede: r.parede,
            largura: r.largura ? Number(r.largura) : null,
            altura: r.altura ? Number(r.altura) : null,
            espessura: r.espessura ? Number(r.espessura) : null,
            tramaEsquerdaId: r.tramaEsquerdaId || null,
            tramaDireitaId: r.tramaDireitaId || null,
            tramaSuperiorId: r.tramaSuperiorId || null,
            tramaInferiorId: r.tramaInferiorId || null,
            corteId: r.corteId || null,
          })),
          materiais: values.materiais.map((m: any) => ({
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
              materiais: item.materiaisModeloCasa || [],
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
                  {formik.values.materiais.map((item: any, idx: number) => (
                    <Grid size={12} key={idx}>
                      <Grid container spacing={1} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 8, sm: 9 }}>
                          <Autocomplete
                            fullWidth
                            size="small"
                            options={allMateriais}
                            loading={loadingMateriais}
                            getOptionLabel={(option) =>
                              `${option.item} (${option.unidade})`
                            }
                            value={
                              allMateriais.find(
                                (m) => m.id === item.materiaPrimaId,
                              ) || null
                            }
                            onChange={(_, newValue) => {
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
                                (_: any, i: number) => i !== idx,
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
              <Box>
                <Grid
                  container
                  spacing={2}
                  sx={{ alignItems: "center", mb: 2 }}
                >
                  <Grid size="grow">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Requisitos de Produção
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Defina as especificações abstratas de cada peça
                      necessária.
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  {paredes.map((pNome) => (
                    <Grid size={12} key={pNome}>
                      <Card variant="outlined" sx={{ bgcolor: "action.hover" }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Grid
                            container
                            spacing={2}
                            sx={{ alignItems: "center", mb: 2 }}
                          >
                            <Grid size={{ xs: 8, sm: 6 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Nome da Parede"
                                value={pNome}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  const updated = formik.values.requisitos.map(
                                    (r: any) =>
                                      r.parede === pNome
                                        ? { ...r, parede: newVal }
                                        : r,
                                  );
                                  formik.setFieldValue("requisitos", updated);
                                }}
                                sx={{ bgcolor: "background.paper" }}
                              />
                            </Grid>
                            <Grid size="grow">
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {groupedRequisitos[pNome]?.length || 0}{" "}
                                requisito(s)
                              </Typography>
                            </Grid>
                            <Grid size="auto">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  showDialog({
                                    title: "Excluir Parede",
                                    body: `Deseja realmente excluir a ${pNome} e todos os seus requisitos?`,
                                    actions: [
                                      <Button
                                        key="cancel"
                                        onClick={closeDialog}
                                      >
                                        Cancelar
                                      </Button>,
                                      <Button
                                        key="confirm"
                                        color="error"
                                        variant="contained"
                                        onClick={() => {
                                          const updated =
                                            formik.values.requisitos.filter(
                                              (r: any) => r.parede !== pNome,
                                            );
                                          formik.setFieldValue(
                                            "requisitos",
                                            updated,
                                          );
                                          closeDialog();
                                        }}
                                      >
                                        Excluir
                                      </Button>,
                                    ],
                                  });
                                }}
                                title="Excluir Parede"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>

                          <Grid container spacing={2}>
                            {formik.values.requisitos
                              .map((r: any, idx: number) => ({
                                ...r,
                                originalIdx: idx,
                              }))
                              .filter((r: any) => r.parede === pNome)
                              .map((item: any) => (
                                <Grid size={12} key={item.originalIdx}>
                                  <Card
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      bgcolor: "background.paper",
                                    }}
                                  >
                                    {/* CABEÇALHO DO REQUISITO: TIPO + ALIAS + DELETE */}
                                    <Grid
                                      container
                                      spacing={1.5}
                                      size={12}
                                      sx={{ alignItems: "center" }}
                                    >
                                      <Grid size={4}>
                                        <FormControl
                                          fullWidth
                                          size="small"
                                          sx={{ minWidth: 150 }}
                                        >
                                          <InputLabel>Tipo</InputLabel>
                                          <Select
                                            value={item.tipo}
                                            label="Tipo"
                                            onChange={(e) =>
                                              formik.setFieldValue(
                                                `requisitos[${item.originalIdx}].tipo`,
                                                e.target.value,
                                              )
                                            }
                                          >
                                            <MenuItem value="PLACA_LISA">
                                              Placa Lisa
                                            </MenuItem>
                                            <MenuItem value="CORTE_ESPECIFICO">
                                              Corte Específico
                                            </MenuItem>
                                          </Select>
                                        </FormControl>
                                      </Grid>

                                      <Grid size={4}>
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Alias"
                                          placeholder="P01"
                                          value={item.alias || ""}
                                          onChange={(e) =>
                                            formik.setFieldValue(
                                              `requisitos[${item.originalIdx}].alias`,
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </Grid>

                                      <Grid size="grow" />

                                      <Grid size="auto">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => {
                                            const updated =
                                              formik.values.requisitos.filter(
                                                (_: any, i: number) =>
                                                  i !== item.originalIdx,
                                              );
                                            formik.setFieldValue(
                                              "requisitos",
                                              updated,
                                            );
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Grid>

                                      {/* CORPO DO REQUISITO: CAMPOS ESPECÍFICOS */}
                                      {item.tipo === "PLACA_LISA" && (
                                        <>
                                          <Grid size={{ xs: 4, sm: 4 }}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label="Largura (cm)"
                                              type="number"
                                              value={item.largura || ""}
                                              onChange={(e) =>
                                                formik.setFieldValue(
                                                  `requisitos[${item.originalIdx}].largura`,
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </Grid>
                                          <Grid size={{ xs: 4, sm: 4 }}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label="Altura (cm)"
                                              type="number"
                                              value={item.altura || ""}
                                              onChange={(e) =>
                                                formik.setFieldValue(
                                                  `requisitos[${item.originalIdx}].altura`,
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </Grid>
                                          <Grid size={{ xs: 4, sm: 4 }}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label="Espessura (cm)"
                                              type="number"
                                              value={item.espessura || ""}
                                              onChange={(e) =>
                                                formik.setFieldValue(
                                                  `requisitos[${item.originalIdx}].espessura`,
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </Grid>
                                        </>
                                      )}

                                      {item.tipo === "CORTE_ESPECIFICO" && (
                                        <Grid size={{ xs: 12, sm: 12 }}>
                                          <Autocomplete
                                            size="small"
                                            options={allCortes}
                                            loading={loadingCortes}
                                            getOptionLabel={(o) => o.nome}
                                            value={
                                              allCortes.find(
                                                (c) => c.id === item.corteId,
                                              ) || null
                                            }
                                            onChange={(_, v) =>
                                              formik.setFieldValue(
                                                `requisitos[${item.originalIdx}].corteId`,
                                                v ? v.id : null,
                                              )
                                            }
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label="Corte do Catálogo"
                                              />
                                            )}
                                          />
                                        </Grid>
                                      )}

                                      {/* TRAMAS (Visível para ambos os tipos) */}
                                      <Grid size={{ xs: 6, sm: 3 }}>
                                        <Autocomplete
                                          size="small"
                                          options={allTramas}
                                          loading={loadingTramas}
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaEsquerdaId,
                                            ) || null
                                          }
                                          onChange={(_, v) =>
                                            formik.setFieldValue(
                                              `requisitos[${item.originalIdx}].tramaEsquerdaId`,
                                              v ? v.id : null,
                                            )
                                          }
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Trama Esq."
                                            />
                                          )}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 6, sm: 3 }}>
                                        <Autocomplete
                                          size="small"
                                          options={allTramas}
                                          loading={loadingTramas}
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaDireitaId,
                                            ) || null
                                          }
                                          onChange={(_, v) =>
                                            formik.setFieldValue(
                                              `requisitos[${item.originalIdx}].tramaDireitaId`,
                                              v ? v.id : null,
                                            )
                                          }
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Trama Dir."
                                            />
                                          )}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 6, sm: 3 }}>
                                        <Autocomplete
                                          size="small"
                                          options={allTramas}
                                          loading={loadingTramas}
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaSuperiorId,
                                            ) || null
                                          }
                                          onChange={(_, v) =>
                                            formik.setFieldValue(
                                              `requisitos[${item.originalIdx}].tramaSuperiorId`,
                                              v ? v.id : null,
                                            )
                                          }
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Trama Sup."
                                            />
                                          )}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 6, sm: 3 }}>
                                        <Autocomplete
                                          size="small"
                                          options={allTramas}
                                          loading={loadingTramas}
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaInferiorId,
                                            ) || null
                                          }
                                          onChange={(_, v) =>
                                            formik.setFieldValue(
                                              `requisitos[${item.originalIdx}].tramaInferiorId`,
                                              v ? v.id : null,
                                            )
                                          }
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Trama Inf."
                                            />
                                          )}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Card>
                                </Grid>
                              ))}
                            <Grid size={12} sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  formik.setFieldValue("requisitos", [
                                    ...formik.values.requisitos,
                                    {
                                      tipo: "PLACA_LISA" as const,
                                      parede: pNome,
                                      alias: "",
                                      largura: undefined,
                                      altura: undefined,
                                      espessura: undefined,
                                      tramaEsquerdaId: null,
                                      tramaDireitaId: null,
                                      tramaSuperiorId: null,
                                      tramaInferiorId: null,
                                      corteId: null,
                                    },
                                  ]);
                                }}
                              >
                                Adicionar Requisito
                              </Button>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                color="secondary"
                                onClick={() => {
                                  setBatchParede(pNome);
                                  setBatchOpen(true);
                                }}
                              >
                                Adicionar em Lote
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  <BatchRequisitosDialog
                    open={batchOpen}
                    onClose={() => setBatchOpen(false)}
                    parede={batchParede}
                    onSubmit={(novos) => {
                      formik.setFieldValue("requisitos", [
                        ...formik.values.requisitos,
                        ...novos,
                      ]);
                    }}
                  />
                  <Grid size={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderStyle: "dashed", py: 1.5 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newReqs = [...formik.values.requisitos];
                        const grouped = getGroupedRequisitos(newReqs);
                        const currentParedes = Object.keys(grouped);
                        let nextNum = 1;
                        while (currentParedes.includes(`Parede ${nextNum}`)) {
                          nextNum++;
                        }
                        const newParede = `Parede ${nextNum}`;
                        formik.setFieldValue("requisitos", [
                          ...newReqs,
                          {
                            tipo: "PLACA_LISA" as const,
                            parede: newParede,
                            alias: "",
                            largura: undefined,
                            altura: undefined,
                            espessura: undefined,
                            tramaEsquerdaId: null,
                            tramaDireitaId: null,
                            tramaSuperiorId: null,
                            tramaInferiorId: null,
                            corteId: null,
                          },
                        ]);
                      }}
                    >
                      Nova Parede
                    </Button>
                  </Grid>
                </Grid>
              </Box>
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
                                    (_: any, i: number) => i !== idx,
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
