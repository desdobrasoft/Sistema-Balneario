// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import EditNoteIcon from "@mui/icons-material/EditNote";

// material-ui
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import api from "services/api";
import { StatusEntrega } from "types/enums";
import EntregasForm, { type EntregaModel } from "./Form";

// ===============================
// PAGE COMPONENT
// ===============================
const Entregas: React.FC = () => {
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaModel | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const tableRef = useRef<{ reload: () => void }>(null);
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      {
        title: "Venda #",
        data: "venda.id",
        render: (_: unknown, __: unknown, row: EntregaModel) => row.venda?.id || "N/A",
      },
      {
        title: "Cliente",
        data: "venda.cliente.nome",
        render: (_: unknown, __: unknown, row: EntregaModel) =>
          row.venda?.cliente?.nome || "N/A",
      },
      {
        title: "Modelo",
        data: "venda.modeloCasa.nome",
        render: (_: unknown, __: unknown, row: EntregaModel) =>
          row.venda?.modeloCasa?.nome || "N/A",
      },
      { title: "Transportadora", data: "transportadora" },
      {
        title: "Previsão",
        data: "previsaoEntrega",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "Não definido",
      },
      {
        title: "Status",
        data: "status",
        render: (data: StatusEntrega) => {
          const isSuccess = data === StatusEntrega.ENTREGUE;
          const color = isSuccess ? "#2e7d32" : "#1976d2";
          const label =
            typeof data === "string" ? data.replace(/_/g, " ") : "PENDENTE";
          return `<span style="display:inline-block;padding:2px 8px;border-radius:16px;font-size:0.75rem;font-weight:bold;background:${color}20;color:${color};border:1px solid ${color};">${label}</span>`;
        },
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.ENTREGAS}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenUpdate = useCallback(async (entrega: EntregaModel) => {
    try {
      const res = await api.get(`${ENDPOINTS.ENTREGAS}/${entrega.id}`);
      setSelectedEntrega(res.data);
      setUpdateOpen(true);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Stack>
          <Typography
            variant="h4"
            sx={{ lineHeight: 1, fontWeight: "bold", mt: 0.5 }}
          >
            Gerenciamento de Entregas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe e atualize o status das entregas para seus clientes
          </Typography>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: EntregaModel) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Atualizar Entrega">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenUpdate(row)}
                  >
                    <EditNoteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
            [handleOpenUpdate],
          )}
        />
      </Paper>

      {selectedEntrega && (
        <EntregasForm
          open={updateOpen}
          onClose={() => {
            setUpdateOpen(false);
            setSelectedEntrega(null);
          }}
          item={selectedEntrega}
          onSubmit={async (values) => {
            try {
              await api.patch(`${ENDPOINTS.ENTREGAS}/${selectedEntrega.id}`, {
                status: values.status,
                transportadora: values.transportadora,
                previsaoEntrega: values.previsaoEntrega
                  ? new Date(values.previsaoEntrega).toISOString()
                  : null,
                notas: values.notas,
              });
              tableRef.current?.reload();
              setUpdateOpen(false);
              setSelectedEntrega(null);
            } catch (error) {
              handleError(error);
            }
          }}
        />
      )}
    </Box>
  );
};

export default Entregas;
