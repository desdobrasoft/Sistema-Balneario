import React, { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import InventoryIcon from "@mui/icons-material/Inventory";
import SaveIcon from "@mui/icons-material/Save";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

// ===============================
// TYPES
// ===============================
export interface VendaItemOverride {
  materiaPrimaId: number;
  qtFinal: number;
  item?: string;
}

export interface VendaRequisitoOverride {
  tipo: "PLACA_LISA" | "CORTE_ESPECIFICO";
  alias: string;
  parede: string;
  largura?: number;
  altura?: number;
  espessura?: number;
  tramaEsquerdaId?: number | null;
  tramaDireitaId?: number | null;
  tramaSuperiorId?: number | null;
  tramaInferiorId?: number | null;
  corteId?: number | null;
}

export interface VendaSuprimentoOverride {
  nome: string;
  quantidade: number;
  unidade: string;
  momento?: string;
}

export interface VendaFullCustomization {
  itens: VendaItemOverride[];
  requisitos: VendaRequisitoOverride[];
  suprimentos: VendaSuprimentoOverride[];
}

interface CustomizeVendaDialogProps {
  open: boolean;
  onClose: () => void;
  baseModel: any;
  currentCustomization: VendaFullCustomization | null;
  onSave: (customization: VendaFullCustomization) => void;
}

// ===============================
// COMPONENT
// ===============================
const CustomizeVendaDialog: React.FC<CustomizeVendaDialogProps> = ({
  open,
  onClose,
  baseModel,
  currentCustomization,
  onSave,
}) => {
  const [tab, setTab] = useState(0);
  const [itens, setItens] = useState<VendaItemOverride[]>([]);
  const [requisitos, setRequisitos] = useState<VendaRequisitoOverride[]>([]);
  const [suprimentos, setSuprimentos] = useState<VendaSuprimentoOverride[]>([]);

  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [allCortes, setAllCortes] = useState<any[]>([]);
  const [allTramas, setAllTramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: loading and initializing form state on dialog open */
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // 1. Busca recursos globais
          const [matRes, corteRes, tramaRes] = await Promise.all([
            api.get(ENDPOINTS.MATERIA_PRIMA),
            api.get(ENDPOINTS.CORTES),
            api.get(ENDPOINTS.TRAMAS),
          ]);
          setAllMaterials(
            Array.isArray(matRes.data) ? matRes.data : matRes.data.data || [],
          );
          setAllCortes(
            Array.isArray(corteRes.data)
              ? corteRes.data
              : corteRes.data.data || [],
          );
          setAllTramas(
            Array.isArray(tramaRes.data)
              ? tramaRes.data
              : tramaRes.data.data || [],
          );

          // 2. Se temos um baseModel mas não temos customização atual,
          // precisamos garantir que temos os DETALHES do modelo (materiais, requisitos, etc)
          if (!currentCustomization && baseModel?.id) {
            const modelRes = await api.get(
              `${ENDPOINTS.MODELO_CASA}/${baseModel.id}`,
            );
            const fullModel = modelRes.data;

            if (fullModel) {
              const rawMaterials =
                fullModel.materiaisModeloCasa || fullModel.materiais || [];
              setItens(
                rawMaterials.map((m: any) => ({
                  materiaPrimaId: Number(m.materiaPrimaId),
                  qtFinal: Number(m.qtModelo || m.quantidade || 1),
                  item: m.materiaPrima?.item || "Material",
                })),
              );
              setRequisitos(
                (fullModel.requisitos || []).map((r: any) => ({
                  tipo: r.tipo,
                  alias: r.alias,
                  parede: r.parede,
                  largura: r.largura ? Number(r.largura) : undefined,
                  altura: r.altura ? Number(r.altura) : undefined,
                  espessura: r.espessura ? Number(r.espessura) : undefined,
                  tramaEsquerdaId: r.tramaEsquerdaId
                    ? Number(r.tramaEsquerdaId)
                    : null,
                  tramaDireitaId: r.tramaDireitaId
                    ? Number(r.tramaDireitaId)
                    : null,
                  tramaSuperiorId: r.tramaSuperiorId
                    ? Number(r.tramaSuperiorId)
                    : null,
                  tramaInferiorId: r.tramaInferiorId
                    ? Number(r.tramaInferiorId)
                    : null,
                  corteId: r.corteId ? Number(r.corteId) : null,
                })),
              );
              setSuprimentos(
                (fullModel.suprimentosObra || []).map((s: any) => ({
                  nome: s.nome || "",
                  quantidade: Number(s.quantidade || 0),
                  unidade: s.unidade || "",
                  momento: s.momento || "",
                })),
              );
            }
          }
        } catch (error) {
          console.error("Erro ao carregar recursos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      if (currentCustomization) {
        setItens(currentCustomization.itens || []);
        setRequisitos(currentCustomization.requisitos || []);
        setSuprimentos(currentCustomization.suprimentos || []);
      }
    }
  }, [open, baseModel?.id, currentCustomization]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    onSave({ itens, requisitos, suprimentos });
  };

  const getGroupedRequisitos = (reqs: VendaRequisitoOverride[]) => {
    const groups: Record<string, VendaRequisitoOverride[]> = {};
    reqs.forEach((r) => {
      if (!groups[r.parede]) groups[r.parede] = [];
      groups[r.parede].push(r);
    });
    return groups;
  };

  const groupedRequisitos = getGroupedRequisitos(requisitos);
  const paredes = Object.keys(groupedRequisitos);
  if (paredes.length === 0) {
    // Se não houver requisitos, garante pelo menos uma parede padrão (apenas para exibição)
    // Mas no modo de customização, talvez seja melhor deixar vazio se o modelo for vazio.
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditNoteIcon color="primary" />
          <Typography variant="h6">
            Customizar Projeto: {baseModel?.nome}
          </Typography>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2, minHeight: 36 }}
        >
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
      </Box>

      <DialogContent dividers sx={{ bgcolor: "action.hover", minHeight: 500 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 400,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ABA 0: MATERIA-PRIMA */}
            {tab === 0 && (
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
                  {itens.map((item, idx) => (
                    <Grid size={12} key={idx}>
                      <Grid container spacing={1} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 8, sm: 9 }}>
                          <Autocomplete
                            fullWidth
                            size="small"
                            options={allMaterials}
                            getOptionLabel={(o) =>
                              `${o.item} (${o.unidade || ""})`
                            }
                            value={
                              allMaterials.find(
                                (m) => m.id === item.materiaPrimaId,
                              ) || null
                            }
                            onChange={(_, newValue) => {
                              const updated = [...itens];
                              updated[idx].materiaPrimaId = newValue
                                ? newValue.id
                                : 0;
                              updated[idx].item = newValue
                                ? newValue.item
                                : "Material";
                              setItens(updated);
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
                            value={item.qtFinal}
                            onChange={(e) => {
                              const updated = [...itens];
                              updated[idx].qtFinal =
                                parseFloat(e.target.value) || 0;
                              setItens(updated);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setItens(itens.filter((_, i) => i !== idx));
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  {itens.length === 0 && (
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
                        setItens([
                          ...itens,
                          { materiaPrimaId: 0, qtFinal: 1, item: "Material" },
                        ]);
                      }}
                    >
                      Adicionar Material
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ABA 1: PAREDES (REQUISITOS) */}
            {tab === 1 && (
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
                                  const updated = requisitos.map((r) =>
                                    r.parede === pNome
                                      ? { ...r, parede: newVal }
                                      : r,
                                  );
                                  setRequisitos(updated);
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
                                  if (
                                    window.confirm(
                                      `Deseja realmente excluir a ${pNome} e todos os seus requisitos?`,
                                    )
                                  ) {
                                    const updated = requisitos.filter(
                                      (r) => r.parede !== pNome,
                                    );
                                    setRequisitos(updated);
                                  }
                                }}
                                title="Excluir Parede"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>

                          <Grid container spacing={2}>
                            {requisitos
                              .map((r, idx) => ({ ...r, originalIdx: idx }))
                              .filter((r) => r.parede === pNome)
                              .map((item) => (
                                <Grid size={12} key={item.originalIdx}>
                                  <Card
                                    variant="outlined"
                                    sx={{ p: 1.5, bgcolor: "background.paper" }}
                                  >
                                    <Grid
                                      container
                                      spacing={1.5}
                                      sx={{ alignItems: "center" }}
                                    >
                                      <Grid size={4}>
                                        <FormControl fullWidth size="small">
                                          <InputLabel>Tipo</InputLabel>
                                          <Select
                                            value={item.tipo}
                                            label="Tipo"
                                            onChange={(e) => {
                                              const updated = [...requisitos];
                                              updated[item.originalIdx].tipo = e
                                                .target.value as any;
                                              setRequisitos(updated);
                                            }}
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
                                          onChange={(e) => {
                                            const updated = [...requisitos];
                                            updated[item.originalIdx].alias =
                                              e.target.value;
                                            setRequisitos(updated);
                                          }}
                                        />
                                      </Grid>

                                      <Grid size="grow" />

                                      <Grid size="auto">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => {
                                            setRequisitos(
                                              requisitos.filter(
                                                (_, i) =>
                                                  i !== item.originalIdx,
                                              ),
                                            );
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Grid>

                                      {item.tipo === "PLACA_LISA" && (
                                        <>
                                          <Grid size={{ xs: 4, sm: 4 }}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label="Largura (cm)"
                                              type="number"
                                              value={item.largura || ""}
                                              onChange={(e) => {
                                                const updated = [...requisitos];
                                                updated[
                                                  item.originalIdx
                                                ].largura =
                                                  parseFloat(e.target.value) ||
                                                  0;
                                                setRequisitos(updated);
                                              }}
                                            />
                                          </Grid>
                                          <Grid size={{ xs: 4, sm: 4 }}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label="Altura (cm)"
                                              type="number"
                                              value={item.altura || ""}
                                              onChange={(e) => {
                                                const updated = [...requisitos];
                                                updated[
                                                  item.originalIdx
                                                ].altura =
                                                  parseFloat(e.target.value) ||
                                                  0;
                                                setRequisitos(updated);
                                              }}
                                            />
                                          </Grid>
                                          <Grid size={{ xs: 4, sm: 4 }}>
                                            <TextField
                                              fullWidth
                                              size="small"
                                              label="Espessura (cm)"
                                              type="number"
                                              value={item.espessura || ""}
                                              onChange={(e) => {
                                                const updated = [...requisitos];
                                                updated[
                                                  item.originalIdx
                                                ].espessura =
                                                  parseFloat(e.target.value) ||
                                                  0;
                                                setRequisitos(updated);
                                              }}
                                            />
                                          </Grid>
                                        </>
                                      )}

                                      {item.tipo === "CORTE_ESPECIFICO" && (
                                        <Grid size={{ xs: 12, sm: 12 }}>
                                          <Autocomplete
                                            size="small"
                                            options={allCortes}
                                            getOptionLabel={(o) => o.nome}
                                            value={
                                              allCortes.find(
                                                (c) => c.id === item.corteId,
                                              ) || null
                                            }
                                            onChange={(_, v) => {
                                              const updated = [...requisitos];
                                              updated[
                                                item.originalIdx
                                              ].corteId = v?.id || null;
                                              setRequisitos(updated);
                                            }}
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label="Corte do Catálogo"
                                              />
                                            )}
                                          />
                                        </Grid>
                                      )}

                                      <Divider sx={{ width: "100%", my: 1 }} />

                                      {/* TRAMAS */}
                                      <Grid size={{ xs: 6, sm: 3 }}>
                                        <Autocomplete
                                          size="small"
                                          options={allTramas}
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaEsquerdaId,
                                            ) || null
                                          }
                                          onChange={(_, v) => {
                                            const updated = [...requisitos];
                                            updated[
                                              item.originalIdx
                                            ].tramaEsquerdaId = v?.id || null;
                                            setRequisitos(updated);
                                          }}
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
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaDireitaId,
                                            ) || null
                                          }
                                          onChange={(_, v) => {
                                            const updated = [...requisitos];
                                            updated[
                                              item.originalIdx
                                            ].tramaDireitaId = v?.id || null;
                                            setRequisitos(updated);
                                          }}
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
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaSuperiorId,
                                            ) || null
                                          }
                                          onChange={(_, v) => {
                                            const updated = [...requisitos];
                                            updated[
                                              item.originalIdx
                                            ].tramaSuperiorId = v?.id || null;
                                            setRequisitos(updated);
                                          }}
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
                                          getOptionLabel={(o) => o.nome}
                                          value={
                                            allTramas.find(
                                              (t) =>
                                                t.id === item.tramaInferiorId,
                                            ) || null
                                          }
                                          onChange={(_, v) => {
                                            const updated = [...requisitos];
                                            updated[
                                              item.originalIdx
                                            ].tramaInferiorId = v?.id || null;
                                            setRequisitos(updated);
                                          }}
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
                                  setRequisitos([
                                    ...requisitos,
                                    {
                                      tipo: "PLACA_LISA",
                                      parede: pNome,
                                      alias: "",
                                      largura: 100,
                                      altura: 200,
                                      espessura: 5,
                                    },
                                  ]);
                                }}
                              >
                                Adicionar Requisito
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  <Grid size={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderStyle: "dashed", py: 1.5 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const currentParedes = Object.keys(
                          getGroupedRequisitos(requisitos),
                        );
                        let nextNum = 1;
                        while (currentParedes.includes(`Parede ${nextNum}`)) {
                          nextNum++;
                        }
                        const newParede = `Parede ${nextNum}`;
                        setRequisitos([
                          ...requisitos,
                          {
                            tipo: "PLACA_LISA",
                            parede: newParede,
                            alias: "",
                            largura: 100,
                            altura: 200,
                            espessura: 5,
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

            {/* ABA 2: INSUMOS */}
            {tab === 2 && (
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
                  {suprimentos.map((item, idx) => (
                    <Grid size={12} key={idx}>
                      <Grid container spacing={1} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nome do Item"
                            value={item.nome}
                            onChange={(e) => {
                              const updated = [...suprimentos];
                              updated[idx].nome = e.target.value;
                              setSuprimentos(updated);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Qtd"
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => {
                              const updated = [...suprimentos];
                              updated[idx].quantidade =
                                parseFloat(e.target.value) || 0;
                              setSuprimentos(updated);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Un"
                            value={item.unidade}
                            onChange={(e) => {
                              const updated = [...suprimentos];
                              updated[idx].unidade = e.target.value;
                              setSuprimentos(updated);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 10, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Momento de Aquisição"
                            value={item.momento}
                            onChange={(e) => {
                              const updated = [...suprimentos];
                              updated[idx].momento = e.target.value;
                              setSuprimentos(updated);
                            }}
                            placeholder="Ex: Fundação"
                          />
                        </Grid>
                        <Grid size={{ xs: 2, sm: 1 }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSuprimentos(
                                suprimentos.filter((_, i) => i !== idx),
                              );
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  {suprimentos.length === 0 && (
                    <Grid size={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 4 }}
                      >
                        Nenhum suprimento cadastrado para esta venda.
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
                        setSuprimentos([
                          ...suprimentos,
                          {
                            nome: "",
                            quantidade: 1,
                            unidade: "un",
                            momento: "Obra",
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
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Confirmar Customização
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeVendaDialog;
