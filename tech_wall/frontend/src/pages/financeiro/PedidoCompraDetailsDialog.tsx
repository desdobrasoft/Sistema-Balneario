// packages
import React from "react";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

// project imports
import type { PedidoCompraRow } from "./PedidosCompraTable";

// ===============================
// TYPES
// ===============================
interface PedidoCompraDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  pedido: PedidoCompraRow | null;
}

// ===============================
// COMPONENT
// ===============================
const PedidoCompraDetailsDialog: React.FC<PedidoCompraDetailsDialogProps> = ({
  open,
  onClose,
  pedido,
}) => {
  if (!pedido) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SOLICITADO":
        return "Solicitado";
      case "COMPRADO":
        return "Comprado";
      case "ENTREGUE":
        return "Entregue";
      case "ENTREGUE_COM_ALTERACAO":
        return "Entregue c/ Alteração";
      case "RESOLVIDO":
        return "Resolvido";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SOLICITADO":
        return "#ed6c02"; // warning
      case "COMPRADO":
        return "#0288d1"; // info
      case "ENTREGUE":
        return "#2e7d32"; // success
      case "ENTREGUE_COM_ALTERACAO":
        return "#1976d2"; // primary
      case "RESOLVIDO":
        return "#9c27b0"; // secondary
      default:
        return "#757575"; // default
    }
  };

  const color = getStatusColor(pedido.status);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes do Pedido #{pedido.id}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Status:
          </Typography>
          <Chip
            label={getStatusLabel(pedido.status)}
            size="small"
            sx={{
              bgcolor: `${color}20`,
              color: color,
              border: `1px solid ${color}`,
              fontWeight: "bold",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Material
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {pedido.materiaPrima?.item || "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Data do Pedido
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {pedido.dataPedido
                ? new Date(pedido.dataPedido).toLocaleDateString("pt-BR")
                : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Quantidade Solicitada
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {pedido.qtSolicitada ?? "---"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Quantidade Entregue
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {pedido.qtEntregue ?? "---"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Solicitante
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {pedido.user?.fullName || "---"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Fornecedor
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {pedido.fornecedor || "---"}
            </Typography>
          </Box>

          <Box sx={{ gridColumn: { xs: "1 / -1" } }}>
            <Typography variant="body2" color="text.secondary">
              Valor Total
            </Typography>
            <Typography
              variant="body1"
              color={pedido.valorUnitario ? "success.main" : "text.primary"}
              sx={{ fontWeight: "medium" }}
            >
              {pedido.valorUnitario
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(parseFloat(pedido.valorUnitario as string))
                : "---"}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PedidoCompraDetailsDialog;
