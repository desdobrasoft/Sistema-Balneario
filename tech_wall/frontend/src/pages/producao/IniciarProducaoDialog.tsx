// packages
import React, { useCallback, useEffect, useState } from "react";

// icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ConstructionIcon from "@mui/icons-material/Construction";
import WarningIcon from "@mui/icons-material/Warning";

// material-ui
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";

interface Requisito {
  id: number;
  placaAlocada?: Placa;
  alias?: string;
  parede?: string;
  tipo?: string;
  corteId?: number;
  corte?: { nome: string; largura: number; altura: number };
  tipoPlacaId?: number;
  tipoPlaca?: {
    nome: string;
    largura: number;
    altura: number;
    tramaEsquerdaAtiva: boolean;
    tramaDireitaAtiva: boolean;
    tramaSuperiorAtiva: boolean;
    tramaInferiorAtiva: boolean;
    tramaEsquerda?: { nome: string };
    tramaDireita?: { nome: string };
    tramaSuperior?: { nome: string };
    tramaInferior?: { nome: string };
  };
}

interface Placa {
  id: number;
  nome: string;
  largura: number;
  altura: number;
}

interface Ordem {
  id: number;
  venda?: {
    id: number;
    modeloId?: number | null;
    modeloCasa?: {
      nome: string;
      materiaisModeloCasa?: {
        id: number;
        materiaPrima?: { item: string; quantidade: number };
        qtModelo: number;
      }[];
    };
    vendaRequisitos?: Requisito[];
    vendaItensOverride?: {
      id: number;
      materiaPrima?: { item: string; quantidade: number };
      qtFinal: number;
    }[];
  };
}

interface IniciarProducaoDialogProps {
  open: boolean;
  onClose: () => void;
  ordem: Ordem | null;
  onSuccess: () => void;
}

const IniciarProducaoDialog: React.FC<IniciarProducaoDialogProps> = ({
  open,
  onClose,
  ordem,
  onSuccess,
}) => {
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullOrdem, setFullOrdem] = useState<Ordem | null>(null);
  const [compatiblePlatesMap, setCompatiblePlatesMap] = useState<
    Record<number, Placa[]>
  >({});
  const [localAllocations, setLocalAllocations] = useState<
    Record<number, Placa | null>
  >({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Busca a ordem com todos os detalhes (incluindo vendaRequisitos alocados)
      const res = await api.get(`${ENDPOINTS.PRODUCAO}/${ordem?.id || 0}`);
      const data = res.data;
      setFullOrdem(data);

      // Inicializa alocações locais com o que já está no banco
      const initialAllocations: Record<number, Placa | null> = {};
      data.venda?.vendaRequisitos?.forEach((r: Requisito) => {
        if (r.placaAlocada) {
          initialAllocations[r.id] = r.placaAlocada;
        }
      });
      setLocalAllocations(initialAllocations);

      // Busca placas compatíveis para cada requisito não alocado (ou todos para permitir trocar)
      if (data.venda?.vendaRequisitos) {
        const reqs = data.venda.vendaRequisitos;
        const reqIds = reqs.map((r: Requisito) => r.id);

        const compRes = await api.post(
          `${ENDPOINTS.PRODUCAO}/requisitos/compatible-plates-batch`,
          { reqIds },
        );
        const compatibleMap: Record<number, Placa[]> = compRes.data;

        setCompatiblePlatesMap(compatibleMap);

        // Auto-selecionar a primeira placa disponível para os requisitos pendentes
        const usedPlates = new Set<number>();
        Object.values(initialAllocations).forEach((p) => {
          if (p) usedPlates.add(p.id);
        });

        reqs.forEach((r: Requisito) => {
          if (!initialAllocations[r.id]) {
            const availablePlates = compatibleMap[r.id] || [];
            const firstAvailable = availablePlates.find(
              (p) => !usedPlates.has(p.id),
            );
            if (firstAvailable) {
              initialAllocations[r.id] = firstAvailable;
              usedPlates.add(firstAvailable.id);
            }
          }
        });
        setLocalAllocations({ ...initialAllocations });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [ordem, handleError]);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: fetchData sets state after async API calls */
  useEffect(() => {
    if (open && ordem) {
      fetchData();
    }
  }, [open, ordem, fetchData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleLocalAlocar = (requisitoId: number, placa: Placa | null) => {
    setLocalAllocations((prev) => ({
      ...prev,
      [requisitoId]: placa,
    }));
  };

  const handleSubmit = async () => {
    // Verifica se todos os requisitos têm placa alocada
    const reqs = fullOrdem?.venda?.vendaRequisitos || [];
    const pendentes = reqs.filter((r: Requisito) => !localAllocations[r.id]);

    if (pendentes.length > 0) {
      showSnackbar({
        title: "Atenção",
        message: `Existem ${pendentes.length} peças sem placa alocada. Aloque todas antes de iniciar.`,
        severity: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Executa alocação em lote
      const payload = Object.entries(localAllocations).map(
        ([reqId, placa]) => ({
          requisitoId: parseInt(reqId),
          placaId: placa?.id || null,
        }),
      );

      await api.post(`${ENDPOINTS.PRODUCAO}/bulk-alocar`, {
        itens: payload,
      });

      // 2. Inicia a produção
      await api.patch(`${ENDPOINTS.PRODUCAO}/${ordem?.id || 0}`, {
        status: "EM_ESPERA",
        notas: "Produção iniciada com materiais e placas alocados.",
      });

      showSnackbar({
        title: "Sucesso",
        message: "Ordem de produção iniciada. O estoque foi debitado.",
        severity: "success",
      });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Preparando Alocação</DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Analisando estoque e compatibilidade...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Prioriza materiais customizados da venda, caso existam (vendaItensOverride)
  const itensOverride = fullOrdem?.venda?.vendaItensOverride || [];
  const materiais =
    itensOverride.length > 0
      ? itensOverride.map(
          (it: {
            id: number;
            materiaPrima?: { item: string; quantidade: number };
            qtFinal: number;
          }) => ({
            id: it.id,
            materiaPrima: it.materiaPrima,
            qtModelo: it.qtFinal, // Na venda chamamos de qtFinal, mas aqui usamos qtModelo para compatibilidade com o layout
          }),
        )
      : fullOrdem?.venda?.modeloCasa?.materiaisModeloCasa || [];

  const requisitos = fullOrdem?.venda?.vendaRequisitos || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">
            Iniciar Produção - Venda #{ordem?.venda?.id}
          </Typography>
          <Chip
            label={
              fullOrdem?.venda?.modeloId === null
                ? "Venda de Placas"
                : fullOrdem?.venda?.modeloCasa?.nome || "N/A"
            }
            color="primary"
            variant="outlined"
          />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          Para iniciar a produção, você deve alocar uma placa física do estoque
          para cada peça da receita e validar os materiais brutos.
        </Typography>

        {/* MATERIAIS BRUTOS */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ConstructionIcon fontSize="small" /> Materiais Brutos (Estoque)
        </Typography>
        <List dense>
          {materiais.map(
            (m: {
              id: number;
              materiaPrima?: { item: string; quantidade: number };
              qtModelo: number;
            }) => {
              const hasEnough = (m.materiaPrima?.quantidade || 0) >= m.qtModelo;
              return (
                <ListItem key={m.id}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {hasEnough ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <WarningIcon color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={m.materiaPrima?.item}
                    secondary={`${m.qtModelo} un. necessários / ${m.materiaPrima?.quantidade || 0} em estoque`}
                    slotProps={{
                      secondary: {
                        sx: {
                          color: hasEnough ? "text.secondary" : "error.main",
                        },
                      },
                    }}
                  />
                </ListItem>
              );
            },
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* ALOCAÇÃO DE PLACAS */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
          Alocação de Placas (Mapa de Cortes)
        </Typography>

        <Stack spacing={3}>
          {Object.entries(
            requisitos.reduce((acc: Record<string, Requisito[]>, req: Requisito) => {
              const parede = req.parede || "Geral";
              if (!acc[parede]) acc[parede] = [];
              acc[parede].push(req);
              return acc;
            }, {})
          ).map(([parede, reqs]) => (
            <Box key={parede} sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  mb: 1.5,
                  borderBottom: "2px solid",
                  borderColor: "primary.main",
                  display: "inline-block",
                  pb: 0.5,
                }}
              >
                Parede: {parede}
              </Typography>
              <Stack spacing={2}>
                {reqs.map((req: Requisito) => {
                  const compatible = compatiblePlatesMap[req.id] || [];

                  return (
                    <Box
                      key={req.id}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Grid container spacing={2} sx={{ alignItems: "center" }}>
                        <Grid size={5}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                            {req.alias}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {req.tipo === "PLACA_LISA"
                              ? req.tipoPlaca
                                ? `${req.tipoPlaca.nome} (${Number(req.tipoPlaca.largura)}x${Number(req.tipoPlaca.altura)}cm)`
                                : "Placa Lisa"
                              : `${req.corte?.nome || "Corte Custom"} (${Number(req.corte?.largura || 0)}x${Number(req.corte?.altura || 0)}cm)`}
                          </Typography>

                          {/* Exibição das Tramas */}
                          {(req.tipoPlaca?.tramaEsquerdaAtiva ||
                            req.tipoPlaca?.tramaDireitaAtiva ||
                            req.tipoPlaca?.tramaSuperiorAtiva ||
                            req.tipoPlaca?.tramaInferiorAtiva) && (
                            <Box
                              sx={{
                                mt: 0.5,
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              {req.tipoPlaca?.tramaEsquerdaAtiva &&
                                req.tipoPlaca.tramaEsquerda && (
                                  <Chip
                                    label={`E: ${req.tipoPlaca.tramaEsquerda.nome}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.65rem", height: 20 }}
                                  />
                                )}
                              {req.tipoPlaca?.tramaDireitaAtiva &&
                                req.tipoPlaca.tramaDireita && (
                                  <Chip
                                    label={`D: ${req.tipoPlaca.tramaDireita.nome}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.65rem", height: 20 }}
                                  />
                                )}
                              {req.tipoPlaca?.tramaSuperiorAtiva &&
                                req.tipoPlaca.tramaSuperior && (
                                  <Chip
                                    label={`S: ${req.tipoPlaca.tramaSuperior.nome}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.65rem", height: 20 }}
                                  />
                                )}
                              {req.tipoPlaca?.tramaInferiorAtiva &&
                                req.tipoPlaca.tramaInferior && (
                                  <Chip
                                    label={`I: ${req.tipoPlaca.tramaInferior.nome}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.65rem", height: 20 }}
                                  />
                                )}
                            </Box>
                          )}
                        </Grid>

                        <Grid size={7}>
                          <Autocomplete
                            size="small"
                            options={compatible.filter(
                              (p) =>
                                !Object.entries(localAllocations).some(
                                  ([rid, aloc]) =>
                                    parseInt(rid) !== req.id && aloc?.id === p.id,
                                ),
                            )}
                            getOptionLabel={(o) =>
                              `${o.nome} (${o.largura}x${o.altura}cm)`
                            }
                            value={localAllocations[req.id] || null}
                            onChange={(_, v) => handleLocalAlocar(req.id, v)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Selecionar Placa do Estoque"
                                error={!localAllocations[req.id]}
                                helperText={
                                  !localAllocations[req.id]
                                    ? "Alocação obrigatória"
                                    : "Placa vinculada"
                                }
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || loading}
          startIcon={
            submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckCircleIcon />
            )
          }
        >
          {submitting ? "Iniciando..." : "Confirmar e Iniciar Produção"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IniciarProducaoDialog;
