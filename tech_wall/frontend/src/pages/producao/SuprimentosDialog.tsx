import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";

interface Suprimento {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  status: "PENDENTE" | "ADQUIRIDO";
  precoPago?: number;
  dataCompra?: string;
}

interface SuprimentosDialogProps {
  open: boolean;
  onClose: () => void;
  venda: { id: number; suprimentosObra?: Record<string, unknown>[]; modeloCasa?: { nome: string; suprimentosObra?: Record<string, unknown>[] } } | null;
  onUpdate: () => void;
}

const SuprimentosDialog: React.FC<SuprimentosDialogProps> = ({
  open,
  onClose,
  venda,
  onUpdate,
}) => {
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();
  const [buyingItem, setBuyingItem] = useState<Suprimento | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [suprimentos, setSuprimentos] = useState<Suprimento[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: initializing suprimentos from venda on dialog open */
  useEffect(() => {
    if (open && venda) {
      // Prioriza suprimentos da venda, fallback para o modelo da casa
      const list =
        venda.suprimentosObra && venda.suprimentosObra.length > 0
          ? venda.suprimentosObra
          : venda.modeloCasa?.suprimentosObra || [];

      // Normaliza para garantir que todos tenham um ID (usa nome como fallback)
      const normalized = list.map((s: Record<string, unknown>) => ({
        ...s,
        id: s.id?.toString() || s.nome || "sem-id",
      })) as Suprimento[];

      setSuprimentos(normalized);
    }
  }, [open, venda]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleOpenBuy = (item: Suprimento) => {
    setBuyingItem(item);
    setPrice("");
  };

  const handleConfirmPurchase = async () => {
    if (!buyingItem || !price) return;

    setLoading(true);
    try {
      await api.post(`${ENDPOINTS.VENDAS}/${venda?.id}/suprimentos/comprar`, {
        suprimentoId: buyingItem.id,
        precoPago: parseFloat(price),
      });

      showSnackbar({
        title: "Sucesso",
        message: `Compra de ${buyingItem.nome} registrada com sucesso.`,
        severity: "success",
      });

      // Atualização otimista na UI local do diálogo
      setSuprimentos((prev) =>
        prev.map((s) =>
          s.id === buyingItem.id
            ? { ...s, status: "ADQUIRIDO", precoPago: parseFloat(price) }
            : s,
        ),
      );

      setBuyingItem(null);
      onUpdate(); // Recarrega a tabela no background
    } catch (error) {
      console.error("Erro ao registrar compra:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <InventoryIcon color="primary" />
        Suprimentos de Obra - Venda #{venda?.id}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gerencie os materiais externos necessários para a construção deste
          modelo ({venda?.modeloCasa?.nome}).
        </Typography>

        <Stack spacing={2}>
          {suprimentos.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor:
                  item.status === "ADQUIRIDO"
                    ? "action.hover"
                    : "background.paper",
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {item.nome}
                </Typography>
                <Typography variant="body2">
                  {item.quantidade} {item.unidade}
                </Typography>
                {item.status === "ADQUIRIDO" && item.precoPago && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "block" }}
                  >
                    Comprado por:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.precoPago)}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  alignItems: "flex-end",
                }}
              >
                <Chip
                  size="small"
                  label={item.status === "ADQUIRIDO" ? "ADQUIRIDO" : "PENDENTE"}
                  color={item.status === "ADQUIRIDO" ? "success" : "warning"}
                  icon={
                    item.status === "ADQUIRIDO" ? (
                      <CheckCircleIcon />
                    ) : undefined
                  }
                />
                {item.status !== "ADQUIRIDO" && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleOpenBuy(item)}
                  >
                    Informar Compra
                  </Button>
                )}
              </Box>
            </Box>
          ))}

          {suprimentos.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ py: 4 }}
            >
              Não há suprimentos de obra cadastrados para este modelo.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
      </DialogActions>

      {/* Mini Diálogo de Preço */}
      <Dialog
        open={!!buyingItem}
        onClose={() => setBuyingItem(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Registrar Compra</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Informe o valor total pago por: <strong>{buyingItem?.nome}</strong>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Preço Pago"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyingItem(null)}>Cancelar</Button>
          <Button
            onClick={handleConfirmPurchase}
            disabled={!price || loading}
            variant="contained"
            color="primary"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default SuprimentosDialog;
