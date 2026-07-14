// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import VerifiedIcon from "@mui/icons-material/Verified";

import VisibilityIcon from "@mui/icons-material/Visibility";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// project imports
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import { StatusPedidoCompra } from "types/enums";
import ComprarPedidoForm from "./ComprarPedidoForm";
import NovoPedidoFinanceiroForm from "./NovoPedidoFinanceiroForm";
import PedidoCompraDetailsDialog from "./PedidoCompraDetailsDialog";

// ===============================
// COMPONENT
export interface PedidoCompraRow {
  id: number;
  status: string;
  fornecedor?: string;
  qtSolicitada?: number;
  materiaPrima?: { item: string };
  user?: { fullName: string };
  dataPedido?: string;
  qtEntregue?: number;
  valorUnitario?: string;
}

const PedidosCompraTable: React.FC = () => {
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // Comprar dialog
  const [comprarOpen, setComprarOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoCompraRow | null>(
    null,
  );

  // Novo pedido direto
  const [novoOpen, setNovoOpen] = useState(false);

  // Detalhes dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetailsPedido, setSelectedDetailsPedido] =
    useState<PedidoCompraRow | null>(null);

  // Resolver dialog
  const [resolverOpen, setResolverOpen] = useState(false);
  const [resolverPedido, setResolverPedido] = useState<PedidoCompraRow | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);

  // ===============================
  // COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      {
        title: "Data",
        data: "dataPedido",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "---",
      },
      {
        title: "Material",
        data: "materiaPrima.item",
        defaultContent: "N/A",
      },
      { title: "Qtd Solicitada", data: "qtSolicitada" },
      {
        title: "Qtd Entregue",
        data: "qtEntregue",
        render: (data: number | null) => data ?? "---",
      },
      {
        title: "Valor Total",
        data: "valorUnitario",
        render: (data: string | number | null) =>
          data
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(parseFloat(data as string))
            : "---",
      },
      {
        title: "Status",
        data: "status",
        reactRender: (data: unknown) => {
          const status = data as string;
          let label = status;
          let color = "#757575"; // default

          switch (status) {
            case "SOLICITADO":
              label = "Solicitado";
              color = "#ed6c02"; // warning
              break;
            case "COMPRADO":
              label = "Comprado";
              color = "#0288d1"; // info
              break;
            case "ENTREGUE":
              label = "Entregue";
              color = "#2e7d32"; // success
              break;
            case "ENTREGUE_COM_ALTERACAO":
              label = "Entregue c/ Alteração";
              color = "#1976d2"; // primary
              break;
            case "RESOLVIDO":
              label = "Resolvido";
              color = "#9c27b0"; // secondary
              break;
          }

          return (
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: `${color}20`,
                color: color,
                border: `1px solid ${color}`,
                fontWeight: "bold",
              }}
            />
          );
        },
      },
    ],
    [],
  );

  // ===============================
  // FETCH DATA (POST /datatable)
  // ===============================
  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.PEDIDOS_COMPRA}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  // ===============================
  // HANDLERS
  // ===============================
  const handleComprar = useCallback((pedido: PedidoCompraRow) => {
    setSelectedPedido(pedido);
    setComprarOpen(true);
  }, []);

  const handleResolverClick = useCallback((pedido: PedidoCompraRow) => {
    setResolverPedido(pedido);
    setResolverOpen(true);
  }, []);

  const confirmResolver = useCallback(async () => {
    if (!resolverPedido) return;
    setIsResolving(true);
    try {
      await api.patch(
        `${ENDPOINTS.PEDIDOS_COMPRA}/${resolverPedido.id}/resolver`,
      );
      showSnackbar({
        message: "Pedido marcado como resolvido!",
        severity: "success",
      });
      setResolverOpen(false);
      setResolverPedido(null);
      tableRef.current?.reload();
    } catch (error) {
      handleError(error);
    } finally {
      setIsResolving(false);
    }
  }, [resolverPedido, handleError, showSnackbar]);

  // ===============================
  // ROW ACTIONS
  // ===============================
  const renderRowActions = useCallback(
    (row: PedidoCompraRow) => {
      const actions = [
        <Tooltip title="Ver Detalhes" key="view">
          <IconButton
            color="info"
            onClick={() => {
              setSelectedDetailsPedido(row);
              setDetailsOpen(true);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      ];

      if (row.status === StatusPedidoCompra.SOLICITADO) {
        actions.push(
          <Tooltip title="Registrar Compra" key="comprar">
            <IconButton color="primary" onClick={() => handleComprar(row)}>
              <ShoppingCartCheckoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>,
        );
      }

      if (row.status === "ENTREGUE_COM_ALTERACAO") {
        actions.push(
          <Tooltip title="Marcar como Resolvido" key="resolver">
            <IconButton
              color="secondary"
              onClick={() => handleResolverClick(row)}
            >
              <VerifiedIcon fontSize="small" />
            </IconButton>
          </Tooltip>,
        );
      }

      if (actions.length === 0) return null;

      return <Box sx={{ display: "flex", gap: 0.5 }}>{actions}</Box>;
    },
    [handleComprar, handleResolverClick],
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          onClick={() => setNovoOpen(true)}
        >
          Novo Pedido de Compra
        </Button>
      </Box>

      <DataTable
        ref={tableRef}
        columns={columns}
        onFetchData={handleFetchData}
        rowActions={renderRowActions}
      />

      {/* Comprar dialog */}
      {selectedPedido && (
        <ComprarPedidoForm
          open={comprarOpen}
          onClose={() => {
            setComprarOpen(false);
            setSelectedPedido(null);
          }}
          pedido={selectedPedido}
          onSubmit={async (values) => {
            await api.patch(
              `${ENDPOINTS.PEDIDOS_COMPRA}/${selectedPedido.id}/comprar`,
              {
                fornecedor: values.fornecedor || undefined,
                valorUnitario: values.valorUnitario || undefined,
              },
            );
            showSnackbar({
              message: "Compra registrada com sucesso!",
              severity: "success",
            });
            setComprarOpen(false);
            setSelectedPedido(null);
            tableRef.current?.reload();
          }}
        />
      )}

      {/* Novo pedido direto pelo financeiro */}
      <NovoPedidoFinanceiroForm
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onSuccess={() => {
          setNovoOpen(false);
          tableRef.current?.reload();
        }}
      />

      {/* Detalhes do pedido */}
      <PedidoCompraDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedDetailsPedido(null);
        }}
        pedido={selectedDetailsPedido}
      />

      {/* Confirmação de Resolver */}
      <Dialog
        open={resolverOpen}
        onClose={() => !isResolving && setResolverOpen(false)}
      >
        <DialogTitle>Resolver Pedido</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja marcar este pedido como resolvido?
            <br />
            <br />
            Isso indica que as alterações ou pendências na entrega do pedido
            (Material:{" "}
            <strong>{resolverPedido?.materiaPrima?.item || "N/A"}</strong>)
            foram analisadas e o fluxo financeiro/estoque pode ser considerado
            concluído.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResolverOpen(false)}
            color="inherit"
            disabled={isResolving}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmResolver}
            color="secondary"
            variant="contained"
            disabled={isResolving}
          >
            {isResolving ? "Resolvendo..." : "Resolver Pedido"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PedidosCompraTable;
