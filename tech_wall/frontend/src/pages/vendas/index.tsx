// packages
import { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PrintIcon from "@mui/icons-material/Print";

// project imports
import DataTable from "../../components/datatable/DataTable";
import { ENDPOINTS } from "../../config/endpoints";
import { useDialog } from "../../hooks/useDialog";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useSnackbar } from "../../hooks/useSnackbar";
import api from "../../services/api";
import {
  StatusPagamentoVenda,
  StatusVenda,
  StatusVendaLabels,
  StatusPagamentoVendaLabels,
} from "../../types/enums";
import VendaForm from "./Form";
import { ReportExportModal } from "../../components/ReportExportModal";
import { handleExportFormat, type ColumnDef } from "../../utils/exportUtils";

// ===============================
// STATUS COLOR HELPERS
// ===============================
const statusVendaColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  [StatusVenda.AGUARDANDO_AGENDAMENTO_PRODUCAO]: {
    bg: "#FFF3E0",
    text: "#E65100",
    border: "#FFB74D",
  },
  [StatusVenda.PRODUCAO_AGENDADA]: {
    bg: "#E3F2FD",
    text: "#1565C0",
    border: "#64B5F6",
  },
  [StatusVenda.KIT_EM_PREPARACAO]: {
    bg: "#FFF8E1",
    text: "#F57F17",
    border: "#FFD54F",
  },
  [StatusVenda.MATERIAIS_ALOCADOS]: {
    bg: "#E8F5E9",
    text: "#2E7D32",
    border: "#81C784",
  },
  [StatusVenda.PRONTO_PARA_ENVIO]: {
    bg: "#E0F7FA",
    text: "#00695C",
    border: "#4DB6AC",
  },
  [StatusVenda.ENVIADO]: { bg: "#EDE7F6", text: "#4527A0", border: "#9575CD" },
  [StatusVenda.ENTREGUE]: { bg: "#E8F5E9", text: "#1B5E20", border: "#66BB6A" },
  [StatusVenda.AGUARDANDO_REPOSICAO_ESTOQUE]: {
    bg: "#FBE9E7",
    text: "#BF360C",
    border: "#FF8A65",
  },
  [StatusVenda.CANCELADA]: {
    bg: "#FFEBEE",
    text: "#B71C1C",
    border: "#EF5350",
  },
};

const statusPagamentoColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  [StatusPagamentoVenda.PENDENTE]: {
    bg: "#FFF8E1",
    text: "#F57F17",
    border: "#FFD54F",
  },
  [StatusPagamentoVenda.PAGO_PARCIALMENTE]: {
    bg: "#E3F2FD",
    text: "#1565C0",
    border: "#64B5F6",
  },
  [StatusPagamentoVenda.PAGO]: {
    bg: "#E8F5E9",
    text: "#1B5E20",
    border: "#66BB6A",
  },
  [StatusPagamentoVenda.VENCIDO]: {
    bg: "#FFEBEE",
    text: "#B71C1C",
    border: "#EF5350",
  },
  [StatusPagamentoVenda.CANCELADO]: {
    bg: "#F3E5F5",
    text: "#6A1B9A",
    border: "#AB47BC",
  },
};

function chipHtml(
  label: string,
  colors: { bg: string; text: string; border: string },
) {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:16px;font-size:0.8125rem;font-weight:500;background:${colors.bg};color:${colors.text};border:1px solid ${colors.border};">${label}</span>`;
}

// ===============================
// VENDAS PAGE
// ===============================
const Vendas = () => {
  const tableRef = useRef<{ reload: () => void }>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [initialIsAvulso, setInitialIsAvulso] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // All column render functions return plain strings/HTML – required by DataTables.net
  const columns = useMemo(
    () => [
      { title: "ID", data: "id", width: "1px" },
      { title: "Cliente", data: "clienteNome" },
      { title: "Produto", data: "modeloNome" },
      {
        title: "Preço",
        data: "preco",
        render: (data: string | number) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(parseFloat(String(data) || "0")),
      },
      {
        title: "Status",
        data: "status",
        render: (data: string) => {
          const label = StatusVendaLabels[data as StatusVenda] || data || "—";
          const colors = statusVendaColors[data] || {
            bg: "#F5F5F5",
            text: "#616161",
            border: "#BDBDBD",
          };
          return chipHtml(label, colors);
        },
      },
      {
        title: "Pagamento",
        data: "statusPagamento",
        render: (data: string) => {
          const label = data?.replace(/_/g, " ") || "—";
          const colors = statusPagamentoColors[data] || {
            bg: "#F5F5F5",
            text: "#616161",
            border: "#BDBDBD",
          };
          return chipHtml(label, colors);
        },
      },
      {
        title: "Data",
        data: "dataVenda",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "—",
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.VENDAS}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenAdd = () => {
    showDialog({
      title: "Nova Venda",
      body: "Escolha o tipo de venda que deseja registrar:",
      actions: [
        <Button key="cancel" onClick={closeDialog}>
          Cancelar
        </Button>,
        <Button
          key="modelo"
          variant="contained"
          onClick={() => {
            closeDialog();
            setInitialIsAvulso(false);
            setSelectedItem(null);
            setFormOpen(true);
          }}
        >
          Modelo de Casa
        </Button>,
        <Button
          key="avulsa"
          variant="contained"
          onClick={() => {
            closeDialog();
            setInitialIsAvulso(true);
            setSelectedItem(null);
            setFormOpen(true);
          }}
        >
          Placas
        </Button>,
      ],
    });
  };

  const handleOpenEdit = useCallback(
    async (item: { id: number }) => {
      try {
        const res = await api.get(`${ENDPOINTS.VENDAS}/${item.id}`);
        setSelectedItem(res.data);
        setFormOpen(true);
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedItem(null);
  };

  const handleSaveSuccess = () => {
    handleCloseForm();
    tableRef.current?.reload();
  };

  const handleDelete = useCallback(
    async (id: number) => {
      showDialog({
        title: "Excluir Venda",
        body: "Deseja realmente excluir esta venda?",
        actions: [
          <Button key="cancel" onClick={closeDialog}>
            Cancelar
          </Button>,
          <Button
            key="confirm"
            color="error"
            variant="contained"
            onClick={async () => {
              closeDialog();
              try {
                await api.post(`${ENDPOINTS.VENDAS}/${id}/estornar`);
                showSnackbar({
                  message: "Venda excluída/estornada com sucesso!",
                  severity: "success",
                });
                tableRef.current?.reload();
              } catch (error) {
                handleError(error);
              }
            }}
          >
            Excluir
          </Button>,
        ],
      });
    },
    [showDialog, closeDialog, handleError, showSnackbar],
  );

  const renderRowActions = useCallback(
    (row: Record<string, unknown> & { id: number }) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Editar Venda">
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleOpenEdit(row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir Venda">
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    [handleOpenEdit, handleDelete],
  );

  const handleExport = async (format: 'PDF' | 'CSV' | 'XLSX' | 'PRINT', filters: { startDate: string; endDate: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      
      const res = await api.get(`${ENDPOINTS.VENDAS}/report?${params.toString()}`);
      
      const columns: ColumnDef[] = [
        { header: "ID", key: "id", width: 10 },
        { header: "Data", key: "dataVenda", width: 20 },
        { header: "Cliente", key: "cliente", width: 30 },
        { header: "Modelo", key: "modelo", width: 30 },
        { header: "Status", key: "status", width: 20 },
        { header: "Pagamento", key: "pagamento", width: 20 },
        { header: "Valor (R$)", key: "valor", width: 20 },
      ];

      const data = res.data.map((item: Record<string, unknown>) => {
        const clienteObj = item.cliente as Record<string, unknown> | undefined;
        const modeloObj = item.modeloCasa as Record<string, unknown> | undefined;
        return {
          id: item.id,
          dataVenda: new Date(item.dataVenda as string).toLocaleDateString('pt-BR'),
          cliente: clienteObj?.nome || "-",
          modelo: modeloObj?.nome || "Venda de Placas",
          status: StatusVendaLabels[item.status as StatusVenda] || item.status,
          pagamento: StatusPagamentoVendaLabels[item.statusPagamento as StatusPagamentoVenda] || item.statusPagamento,
          valor: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(item.preco)),
        };
      });

      handleExportFormat(format, "Relatório de Vendas", columns, data);
      setReportModalOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

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
            Registro de Vendas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize e gerencie todas as transações de vendas
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            size="large"
            onClick={() => setReportModalOpen(true)}
          >
            Relatórios
          </Button>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlinedIcon />}
            size="large"
            onClick={handleOpenAdd}
          >
            Registrar Venda
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={renderRowActions}
        />
      </Paper>

      {formOpen && (
        <VendaForm
          open={formOpen}
          onClose={handleCloseForm}
          onSuccess={handleSaveSuccess}
          item={selectedItem}
          initialIsAvulso={initialIsAvulso}
        />
      )}

      <ReportExportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onExport={handleExport}
      />
    </Box>
  );
};

export default Vendas;
