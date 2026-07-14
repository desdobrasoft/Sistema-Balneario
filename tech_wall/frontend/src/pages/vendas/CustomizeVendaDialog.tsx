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
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

import RequisitosEditor, { type RequisitoEditorItem } from "components/RequisitosEditor";

// ===============================
// TYPES
// ===============================
export interface VendaItemOverride {
  materiaPrimaId: number;
  qtFinal: number;
  item?: string;
}

export type VendaRequisitoOverride = RequisitoEditorItem;

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

export interface OptionMaterial { id: number; item: string; unidade?: string }
export interface OptionCorte { id: number; nome: string }
export interface OptionTrama { id: number; nome: string }

interface CustomizeVendaDialogProps {
  open: boolean;
  onClose: () => void;
  baseModel: { id: number; nome?: string } | null;
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

  const [allMateriais, setAllMateriais] = useState<{ id: number; item: string; unidade: string }[]>([]);
  const [loading, setLoading] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: loading and initializing form state on dialog open */
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // 1. Busca recursos globais
          const [matRes] = await Promise.all([
            api.get(ENDPOINTS.MATERIA_PRIMA)
          ]);
          setAllMateriais(
            Array.isArray(matRes.data) ? matRes.data : matRes.data.data || [],
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
                rawMaterials.map((m: { id?: number; materiaPrima?: { item: string }; quantidade?: number, qtModelo?: number, materiaPrimaId?: number }) => ({
                  materiaPrimaId: Number(m.materiaPrimaId),
                  qtFinal: Number(m.qtModelo || m.quantidade || 1),
                  item: m.materiaPrima?.item || "Material",
                })),
              );
              setRequisitos(
                (fullModel.requisitos || []).map((r: Record<string, unknown>) => ({
                  tipo: r.tipo,
                  alias: r.alias,
                  parede: r.parede,
                  tipoPlacaId: r.tipoPlacaId ? Number(r.tipoPlacaId) : null,
                  corteId: r.corteId ? Number(r.corteId) : null,
                })),
              );
              setSuprimentos(
                (fullModel.suprimentosObra || []).map((s: Record<string, unknown>) => ({
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
                            options={allMateriais}
                            getOptionLabel={(o) => o.item}
                            value={
                              allMateriais.find(
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
              <RequisitosEditor
                requisitos={requisitos}
                onChange={setRequisitos}
                showParedes={true}
              />
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
