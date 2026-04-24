// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import VerifiedIcon from "@mui/icons-material/Verified";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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

// ===============================
// COMPONENT
// ===============================
const PedidosCompraTable: React.FC = () => {
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // Comprar dialog
  const [comprarOpen, setComprarOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);

  // Novo pedido direto
  const [novoOpen, setNovoOpen] = useState(false);

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
        data: "materiaPrima",
        render: (data: any) => data?.item || "N/A",
      },
      {
        title: "Solicitante",
        data: "user",
        render: (data: any) => data?.fullName || "---",
      },
      { title: "Qtd Solicitada", data: "qtSolicitada" },
      {
        title: "Qtd Entregue",
        data: "qtEntregue",
        render: (data: number | null) => data ?? "---",
      },
      { title: "Fornecedor", data: "fornecedor" },
      {
        title: "Valor Unitário",
        data: "valorUnitario",
        render: (data: any) =>
          data
            ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(parseFloat(data))
            : "---",
      },
      {
        title: "Status",
        data: "status",
        render: (data: string) => {
          let bg = "#e0e0e0",
            text = "#000",
            border = "#bdbdbd";
          if (data === "SOLICITADO") {
            bg = "#fff3e0";
            text = "#e65100";
            border = "#ffb74d";
          } else if (data === "COMPRADO") {
            bg = "#e3f2fd";
            text = "#1565c0";
            border = "#64b5f6";
          } else if (data === "ENTREGUE") {
            bg = "#e8f5e9";
            text = "#2e7d32";
            border = "#81c784";
          } else if (data === "ENTREGUE_COM_ALTERACAO") {
            bg = "#fff3e0";
            text = "#e65100";
            border = "#ffb74d";
          } else if (data === "RESOLVIDO") {
            bg = "#f3e5f5";
            text = "#7b1fa2";
            border = "#ce93d8";
          }
          return `<span style="display:inline-block;padding:2px 10px;border-radius:16px;font-size:0.75rem;font-weight:500;background:${bg};color:${text};border:1px solid ${border};text-transform:uppercase;">${data}</span>`;
        },
      },
    ],
    [],
  );

  // ===============================
  // FETCH DATA (POST /datatable)
  // ===============================
  const handleFetchData = useCallback(async (data: any) => {
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
  const handleComprar = (pedido: any) => {
    setSelectedPedido(pedido);
    setComprarOpen(true);
  };

  const handleResolver = async (pedido: any) => {
    try {
      await api.patch(`${ENDPOINTS.PEDIDOS_COMPRA}/${pedido.id}/resolver`);
      showSnackbar({
        message: "Pedido marcado como resolvido!",
        severity: "success",
      });
      tableRef.current?.reload();
    } catch (error) {
      handleError(error);
    }
  };

  // ===============================
  // ROW ACTIONS
  // ===============================
  const renderRowActions = useCallback(
    (row: any) => {
      const actions = [];

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
            <IconButton color="secondary" onClick={() => handleResolver(row)}>
              <VerifiedIcon fontSize="small" />
            </IconButton>
          </Tooltip>,
        );
      }

      if (actions.length === 0) return null;

      return <Box sx={{ display: "flex", gap: 0.5 }}>{actions}</Box>;
    },
    [],
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
    </Box>
  );
};

export default PedidosCompraTable;
