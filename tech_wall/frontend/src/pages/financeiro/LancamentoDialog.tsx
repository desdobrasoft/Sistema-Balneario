// packages
import React, { useEffect, useState } from "react";

// icons
import PaymentsIcon from "@mui/icons-material/Payments";
import SaveIcon from "@mui/icons-material/Save";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import { TipoLancamento } from "types/enums";

// ===============================
// TYPES
// ===============================
interface LancamentoDialogProps {
  open: boolean;
  onClose: () => void;
  lancamento: any;
  onSuccess: () => void;
}

// ===============================
// DIALOG COMPONENT
// ===============================
const LancamentoDialog: React.FC<LancamentoDialogProps> = ({
  open,
  onClose,
  lancamento,
  onSuccess,
}) => {
  const handleError = useErrorHandler();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  // States para criação
  const [tipo, setTipo] = useState<TipoLancamento>(TipoLancamento.R);
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState<number | "">("");
  const [dataVencimento, setDataVencimento] = useState(
    new Date().toISOString().split("T")[0],
  );

  // States para edição / pagamento
  const [valorPago, setValorPago] = useState<number | "">("");

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: resetting form state on dialog open */
  useEffect(() => {
    if (open) {
      if (lancamento) {
        setValorPago("");
      } else {
        setTipo(TipoLancamento.R);
        setDescricao("");
        setValorTotal("");
        setDataVencimento(new Date().toISOString().split("T")[0]);
      }
    }
  }, [open, lancamento]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (lancamento) {
        const payload = { valorPago: Number(valorPago) || 0 };
        await api.patch(`${ENDPOINTS.LANCAMENTOS}/${lancamento.id}`, payload);
        showSnackbar({
          message:
            lancamento.tipo === TipoLancamento.R
              ? "Recebimento registrado com sucesso!"
              : "Pagamento registrado com sucesso!",
          severity: "success",
        });
      } else {
        const vTotal = Number(valorTotal) || 0;
        const payload = {
          tipo,
          descricao,
          valorTotal: vTotal,
          valorPendente: vTotal,
          dataVencimento: dataVencimento
            ? new Date(dataVencimento).toISOString()
            : null,
        };
        await api.post(ENDPOINTS.LANCAMENTOS, payload);
        showSnackbar({
          message: "Lançamento criado com sucesso!",
          severity: "success",
        });
      }
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {lancamento
          ? lancamento.tipo === TipoLancamento.R
            ? "Registrar Recebimento"
            : "Registrar Pagamento"
          : "Novo Lançamento"}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {lancamento ? (
            // Form de Edição / Pagamento
            <>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Lançamento:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {lancamento.descricao}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Valor Pendente:
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    lancamento.tipo === TipoLancamento.R
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {formatCurrency(parseFloat(lancamento.valorPendente))}
                </Typography>
              </Box>

              <Divider />

              <TextField
                autoFocus
                fullWidth
                label={
                  lancamento.tipo === TipoLancamento.R
                    ? "Valor a Receber"
                    : "Valor a Pagar"
                }
                type="number"
                value={valorPago}
                onChange={(e) =>
                  setValorPago(
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  },
                }}
              />
            </>
          ) : (
            // Form de Criação
            <>
              <TextField
                select
                fullWidth
                label="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoLancamento)}
              >
                <MenuItem value={TipoLancamento.R}>Receita (+)</MenuItem>
                <MenuItem value={TipoLancamento.D}>Despesa (-)</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <TextField
                fullWidth
                label="Valor Total"
                type="number"
                value={valorTotal}
                onChange={(e) =>
                  setValorTotal(
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Data de Vencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading ||
            (lancamento
              ? Number(valorPago) <= 0
              : !descricao || Number(valorTotal) <= 0)
          }
          startIcon={lancamento ? <PaymentsIcon /> : <SaveIcon />}
        >
          {lancamento
            ? lancamento.tipo === TipoLancamento.R
              ? "Confirmar Recebimento"
              : "Confirmar Pagamento"
            : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LancamentoDialog;
