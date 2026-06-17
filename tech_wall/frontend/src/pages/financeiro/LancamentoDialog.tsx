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
export interface LancamentoModel {
  id: number;
  tipo: TipoLancamento;
  descricao: string;
  valorPendente: string;
  valorTotal?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  status?: string;
  venda?: {
    id: number;
    cliente?: { nome: string };
  };
}

interface LancamentoDialogProps {
  open: boolean;
  onClose: () => void;
  lancamento: LancamentoModel | null;
  mode?: "create" | "edit" | "pay";
  onSuccess: () => void;
}

// ===============================
// DIALOG COMPONENT
// ===============================
const LancamentoDialog: React.FC<LancamentoDialogProps> = ({
  open,
  onClose,
  lancamento,
  mode = "create",
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
        setDescricao(lancamento.descricao || "");
        setDataVencimento(
          lancamento.dataVencimento
            ? new Date(lancamento.dataVencimento).toISOString().split("T")[0]
            : "",
        );
      } else {
        setTipo(TipoLancamento.R);
        setDescricao("");
        setValorTotal("");
        setDataVencimento(new Date().toISOString().split("T")[0]);
      }
    }
  }, [open, lancamento, mode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "pay" && lancamento) {
        const payload = { valorPago: Number(valorPago) || 0 };
        await api.patch(`${ENDPOINTS.LANCAMENTOS}/${lancamento.id}`, payload);
        showSnackbar({
          message:
            lancamento.tipo === TipoLancamento.R
              ? "Recebimento registrado com sucesso!"
              : "Pagamento registrado com sucesso!",
          severity: "success",
        });
      } else if (mode === "edit" && lancamento) {
        const payload = {
          descricao,
          dataVencimento: dataVencimento
            ? new Date(dataVencimento).toISOString()
            : null,
        };
        await api.patch(`${ENDPOINTS.LANCAMENTOS}/${lancamento.id}`, payload);
        showSnackbar({
          message: "Lançamento editado com sucesso!",
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
        {mode === "create" && "Novo Lançamento"}
        {mode === "edit" && "Editar Lançamento"}
        {mode === "pay" &&
          (lancamento?.tipo === TipoLancamento.R
            ? "Registrar Recebimento / Estorno"
            : "Registrar Pagamento / Estorno")}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {mode === "pay" && lancamento && (
            // Form de Pagamento
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
                size="small"
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
          )}

          {mode === "edit" && lancamento && (
            // Form de Edição
            <>
              <TextField
                fullWidth
                label="Descrição"
                size="small"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <TextField
                fullWidth
                label="Data de Vencimento"
                size="small"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}

          {mode === "create" && (
            // Form de Criação
            <>
              <TextField
                select
                fullWidth
                label="Tipo"
                size="small"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoLancamento)}
              >
                <MenuItem value={TipoLancamento.R}>Receita (+)</MenuItem>
                <MenuItem value={TipoLancamento.D}>Despesa (-)</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Descrição"
                size="small"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <TextField
                fullWidth
                label="Valor Total"
                size="small"
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
                size="small"
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
            (mode === "pay" && valorPago === "") ||
            (mode === "edit" && !descricao) ||
            (mode === "create" && (!descricao || Number(valorTotal) <= 0))
          }
          startIcon={mode === "pay" ? <PaymentsIcon /> : <SaveIcon />}
        >
          {mode === "pay" ? "Confirmar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LancamentoDialog;
