// packages
import React, { useEffect, useState } from "react";

// icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
import { ENDPOINTS } from "config/endpoints";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import type { PlacaModel } from "./Form";

interface FinalizarProducaoDialogProps {
  open: boolean;
  onClose: () => void;
  placa: PlacaModel | null;
  onSuccess: () => void;
}

const GerenciarProducaoDialog: React.FC<FinalizarProducaoDialogProps> = ({
  open,
  onClose,
  placa,
  onSuccess,
}) => {
  const { showSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [consumos, setConsumos] = useState<Record<string, number>>({});
  const [materiaisExpanded, setMateriaisExpanded] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: initializing consumos from placa data on dialog open */
  useEffect(() => {
    if (open && placa?.tipoPlaca?.materiais) {
      const initialConsumos: Record<string, number> = {};
      placa.tipoPlaca.materiais.forEach((mp) => {
        initialConsumos[mp.materiaPrimaId.toString()] = mp.quantidade;
      });
      setConsumos(initialConsumos);
    }
  }, [open, placa]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleConsumoChange = (materiaPrimaId: string, value: string) => {
    setConsumos((prev) => ({
      ...prev,
      [materiaPrimaId]: Number(value) || 0,
    }));
  };

  const hasDeviation = () => {
    if (!placa?.tipoPlaca?.materiais) return false;
    return placa.tipoPlaca.materiais.some(
      (mp) => consumos[mp.materiaPrimaId.toString()] !== mp.quantidade,
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`${ENDPOINTS.PLACAS}/${placa?.id}/gerenciar-producao`, {
        status: "FINALIZADA",
        materiaisConsumidos: consumos,
      });

      showSnackbar({
        title: "Produção Finalizada",
        message: "A placa foi marcada como Pronta e os materiais debitados.",
        severity: "success",
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Erro ao finalizar produção:", error);
      let errorMessage = "Não foi possível finalizar a placa.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (typeof error === "object" && error !== null && "response" in error) {
        errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || errorMessage;
      }
      showSnackbar({
        title: "Erro ao Finalizar",
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!placa) return null;

  const isDeviation = hasDeviation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircleIcon color="success" />
        Finalizar Produção - {placa.nome}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Confirme a quantidade de material que foi de fato consumida para a
          produção desta placa.
        </Typography>

        <Box
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        >
          <Button
            fullWidth
            onClick={() => setMateriaisExpanded(!materiaisExpanded)}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              textTransform: "none",
              color: "text.primary",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Consumo de Materiais
            </Typography>
            {materiaisExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
          <Collapse in={materiaisExpanded}>
            <Divider />
            <Box
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              {placa.tipoPlaca?.materiais?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Este tipo de placa não possui receita de materiais cadastrada.
                </Typography>
              ) : (
                placa.tipoPlaca?.materiais?.map((mp) => {
                  const idMp = mp.materiaPrimaId.toString();
                  const planejado = mp.quantidade;
                  const real = consumos[idMp] || 0;
                  const delta = real - planejado;
                  const emEstoque = mp.materiaPrima?.quantidade || 0;
                  const insuficiente = real > emEstoque;

                  return (
                    <Box
                      key={idMp}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {mp.materiaPrima?.item}{" "}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            ({mp.materiaPrima?.unidade || "un"})
                          </Typography>
                        </Typography>
                        {delta !== 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: delta > 0 ? "error.main" : "success.main",
                              fontWeight: "bold",
                            }}
                          >
                            {delta > 0 ? `+${delta}` : delta} (Desvio)
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flexGrow: 1 }}
                        >
                          Planejado: {planejado}
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={consumos[idMp] === 0 ? "" : consumos[idMp]}
                          onChange={(e) =>
                            handleConsumoChange(idMp, e.target.value)
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              style: { textAlign: "right" },
                            },
                          }}
                          sx={{ width: 100 }}
                          error={insuficiente}
                        />
                      </Box>

                      <Box
                        sx={{
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          mt: 0.5,
                          px: 1.5,
                          py: 0.75,
                        }}
                      >
                        {emEstoque} - {real} &rarr;{" "}
                        <Typography
                          component="span"
                          color={emEstoque - real < 0 ? "error" : "success"}
                        >
                          {emEstoque - real} {mp.materiaPrima?.unidade || "un"}{" "}
                          no estoque
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Collapse>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={isDeviation ? "warning" : "primary"}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? "Confirmando..."
            : isDeviation
              ? "Finalizar com Desvio"
              : "Finalizar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GerenciarProducaoDialog;
