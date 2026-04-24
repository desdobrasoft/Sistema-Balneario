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

interface IniciarProducaoDialogProps {
  open: boolean;
  onClose: () => void;
  ordem: any;
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
  const [fullOrdem, setFullOrdem] = useState<any>(null);
  const [compatiblePlatesMap, setCompatiblePlatesMap] = useState<
    Record<number, any[]>
  >({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Busca a ordem com todos os detalhes (incluindo vendaRequisitos alocados)
      const res = await api.get(`${ENDPOINTS.PRODUCAO}/${ordem.id}`);
      const data = res.data;
      setFullOrdem(data);

      // Busca placas compatíveis para cada requisito não alocado (ou todos para permitir trocar)
      if (data.venda?.vendaRequisitos) {
        const reqs = data.venda.vendaRequisitos;
        const compatibleMap: Record<number, any[]> = {};

        await Promise.all(
          reqs.map(async (r: any) => {
            const compRes = await api.get(
              `${ENDPOINTS.PRODUCAO}/requisitos/${r.id}/compatible-plates`,
            );
            compatibleMap[r.id] = compRes.data;
          }),
        );
        setCompatiblePlatesMap(compatibleMap);
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

  const handleAlocar = async (requisitoId: number, placaId: number | null) => {
    try {
      if (placaId) {
        await api.post(`${ENDPOINTS.PRODUCAO}/alocar`, {
          requisitoId,
          placaId,
        });
        showSnackbar({
          title: "Alocação",
          message: "Placa alocada com sucesso",
          severity: "success",
        });
      } else {
        await api.post(`${ENDPOINTS.PRODUCAO}/desalocar`, { requisitoId });
        showSnackbar({
          title: "Alocação",
          message: "Alocação removida",
          severity: "info",
        });
      }
      // Refresh local state to show updated allocation
      fetchData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmit = async () => {
    // Verifica se todos os requisitos têm placa alocada
    const reqs = fullOrdem?.venda?.vendaRequisitos || [];
    const pendentes = reqs.filter((r: any) => !r.placaAlocadaId);

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
      await api.patch(`${ENDPOINTS.PRODUCAO}/${ordem.id}`, {
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
    } catch (error: any) {
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

  const materiais = fullOrdem?.venda?.modeloCasa?.materiaisModeloCasa || [];
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
            label={fullOrdem?.venda?.modeloCasa?.nome}
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
          {materiais.map((m: any) => {
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
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* ALOCAÇÃO DE PLACAS */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
          Alocação de Placas (Mapa de Cortes)
        </Typography>

        <Stack spacing={2}>
          {requisitos.map((req: any) => {
            const compatible = compatiblePlatesMap[req.id] || [];
            const alocada = req.placaAlocada;

            return (
              <Box
                key={req.id}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                  <Grid size={4}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {req.alias} - {req.parede}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {req.tipo === "PLACA_LISA"
                        ? `${req.largura}x${req.altura}cm (Placa)`
                        : `${req.corte?.nome || "Corte Custom"}`}
                    </Typography>
                  </Grid>

                  <Grid size={8}>
                    <Autocomplete
                      size="small"
                      options={compatible}
                      getOptionLabel={(o) =>
                        `${o.nome} (${o.largura}x${o.altura}cm)`
                      }
                      value={alocada || null}
                      onChange={(_, v) => handleAlocar(req.id, v?.id || null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Selecionar Placa do Estoque"
                          error={!alocada}
                          helperText={
                            !alocada
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
