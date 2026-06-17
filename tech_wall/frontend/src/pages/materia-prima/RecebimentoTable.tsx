// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// material-ui
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import ReceberPedidoForm from "./ReceberPedidoForm";

// ===============================
// COMPONENT
// ===============================
export interface RecebimentoRow {
  id: number;
  status: string;
  materiaPrima?: { item: string; unidade?: string };
  fornecedor?: string;
  qtSolicitada?: number;
  qtEntregue?: number;
  dataPedido?: string;
}

const RecebimentoTable: React.FC = () => {
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showSnackbar } = useSnackbar();

  const [receberOpen, setReceberOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<RecebimentoRow | null>(null);

  const columns = useMemo(
    () => [
      { title: "ID Pedido", data: "id" },
      {
        title: "Material",
        data: "materiaPrima",
        render: (data: { item?: string } | null) => data?.item || "N/A",
      },
      { title: "Fornecedor", data: "fornecedor" },
      {
        title: "Qtde Solicitada",
        data: "qtSolicitada",
        render: (data: number, _: unknown, row: RecebimentoRow) =>
          `${data} ${row.materiaPrima?.unidade || ""}`,
      },
      {
        title: "Qtde Entregue",
        data: "qtEntregue",
        render: (data: number | null, _: unknown, row: RecebimentoRow) =>
          `${data || 0} ${row.materiaPrima?.unidade || ""}`,
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
            bg = "#e3f2fd";
            text = "#1565c0";
            border = "#64b5f6";
          } else if (data === "RESOLVIDO") {
            bg = "#f3e5f5";
            text = "#7b1fa2";
            border = "#ce93d8";
          }
          return `<span style="display:inline-block;padding:2px 10px;border-radius:16px;font-size:0.75rem;font-weight:500;background:${bg};color:${text};border:1px solid ${border};text-transform:uppercase;">${data}</span>`;
        },
      },
      {
        title: "Data Pedido",
        data: "dataPedido",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "",
      },
    ],
    [],
  );

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

  const handleReceber = useCallback((pedido: RecebimentoRow) => {
    setSelectedPedido(pedido);
    setReceberOpen(true);
  }, []);



  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Pedidos de Compra
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhe e dê baixa nos pedidos de insumos recebidos na fábrica.
        </Typography>
      </Box>

      <DataTable
        ref={tableRef}
        columns={columns}
        onFetchData={handleFetchData}
        rowActions={useCallback(
          (row: RecebimentoRow) => {
            const actions = [];

            if (row.status === "COMPRADO") {
              actions.push(
                <Tooltip title="Receber Pedido" key="receber">
                  <IconButton
                    color="success"
                    onClick={() => handleReceber(row)}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>,
              );
            }

            if (actions.length === 0) return null;

            return (
              <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>
            );
          },
          [handleReceber],
        )}
      />

      {selectedPedido && (
        <ReceberPedidoForm
          open={receberOpen}
          onClose={() => {
            setReceberOpen(false);
            setSelectedPedido(null);
          }}
          pedido={selectedPedido}
          onSubmit={async (values) => {
            await api.patch(
              `${ENDPOINTS.PEDIDOS_COMPRA}/${selectedPedido.id}/receber`,
              {
                status: values.status,
                ...(values.status === "ENTREGUE_COM_ALTERACAO" && {
                  qtEntregue: values.qtEntregue,
                }),
              },
            );
            showSnackbar({
              message: "Pedido recebido com sucesso!",
              severity: "success",
            });
            setReceberOpen(false);
            setSelectedPedido(null);
            tableRef.current?.reload();
          }}
        />
      )}
    </Box>
  );
};

export default RecebimentoTable;
