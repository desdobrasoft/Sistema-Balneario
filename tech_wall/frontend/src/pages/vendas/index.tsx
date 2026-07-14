// packages
import type { ConfigColumns } from "datatables.net-dt";
import { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import HomeIcon from "@mui/icons-material/Home";
import IosShareIcon from "@mui/icons-material/IosShare";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

// material-ui
import PrintIcon from "@mui/icons-material/Print";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import DataTable from "../../components/datatable/DataTable";
import { ReportExportModal } from "../../components/ReportExportModal";
import { ENDPOINTS } from "../../config/endpoints";
import { useDialog } from "../../hooks/useDialog";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useSnackbar } from "../../hooks/useSnackbar";
import api from "../../services/api";
import {
  StatusPagamentoVenda,
  StatusPagamentoVendaLabels,
  StatusVenda,
  StatusVendaLabels,
} from "../../types/enums";
import { handleExportFormat, type ColumnDef } from "../../utils/exportUtils";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  printExport,
} from "../modelos/ExportUtils";
import VendaForm from "./Form";

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
  [StatusPagamentoVenda.ESTORNO_PENDENTE]: {
    bg: "#FFF3E0",
    text: "#E65100",
    border: "#FFB74D",
  },
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

// ===============================
// VENDAS PAGE
// ===============================
const Vendas = () => {
  const tableRef = useRef<{ reload: () => void }>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [mapExportModalOpen, setMapExportModalOpen] = useState(false);
  const [vendaToExportMap, setVendaToExportMap] = useState<number | null>(null);
  const [initialIsAvulso, setInitialIsAvulso] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const handleExportMap = useCallback(
    async (format: "PDF" | "CSV" | "XLSX" | "PRINT") => {
      if (!vendaToExportMap) return;

      setMapExportModalOpen(false);
      showSnackbar({ message: "Gerando exportação...", severity: "info" });
      try {
        // Fetch full venda to get vendaRequisitos
        const vendaRes = await api.get(
          `${ENDPOINTS.VENDAS}/${vendaToExportMap}`,
        );
        const fullVenda = vendaRes.data;

        // Fetch all tramas to get names (optional since ExportUtils now uses tipoPlaca)
        const tramasRes = await api.get(ENDPOINTS.TRAMAS);
        const allTramas = Array.isArray(tramasRes.data)
          ? tramasRes.data
          : tramasRes.data.data || [];

        // Convert VendaRequisito to the ExportModelo structure
        const modeloExportData = {
          nome: fullVenda.modeloCasa?.nome || "Modelo Customizado",
          requisitos: fullVenda.vendaRequisitos || [],
        };

        if (format === "PDF") {
          exportToPDF(modeloExportData, allTramas);
        } else if (format === "XLSX") {
          exportToExcel(modeloExportData, allTramas);
        } else if (format === "CSV") {
          exportToCSV(modeloExportData, allTramas);
        } else if (format === "PRINT") {
          printExport(modeloExportData, allTramas);
        }

        showSnackbar({
          message: "Exportação concluída com sucesso!",
          severity: "success",
        });
      } catch (error) {
        handleError(error);
      } finally {
        setVendaToExportMap(null);
      }
    },
    [vendaToExportMap, handleError, showSnackbar],
  );

  const columns = useMemo<ConfigColumns[]>(
    () => [
      { title: "ID", data: "id", width: "1px" },
      { title: "Cliente", data: "cliente.nome", defaultContent: "N/A" },
      { title: "Produto", data: "modeloCasa.nome", defaultContent: "N/A" },
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
        reactRender: (data: string) => {
          const label = StatusVendaLabels[data as StatusVenda] || data || "—";
          const colors = statusVendaColors[data] || {
            bg: "#F5F5F5",
            text: "#616161",
            border: "#BDBDBD",
          };
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                fontWeight: 500,
              }}
            />
          );
        },
      },
      {
        title: "Pagamento",
        data: "statusPagamento",
        reactRender: (data: string) => {
          const label =
            StatusPagamentoVendaLabels[data as StatusPagamentoVenda] ||
            data ||
            "—";
          const colors = statusPagamentoColors[data] || {
            bg: "#F5F5F5",
            text: "#616161",
            border: "#BDBDBD",
          };
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                fontWeight: 500,
              }}
            />
          );
        },
      },
      {
        title: "Data",
        data: "dataVenda",
        render: (data: string) =>
          data
            ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
            : "—",
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
      body: (
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <ButtonBase
            onClick={() => {
              closeDialog();
              setInitialIsAvulso(false);
              setSelectedItem(null);
              setFormOpen(true);
            }}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
          >
            <HomeIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Modelo de Casa
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Venda baseada em um projeto de modelo cadastrado
            </Typography>
          </ButtonBase>

          <ButtonBase
            onClick={() => {
              closeDialog();
              setInitialIsAvulso(true);
              setSelectedItem(null);
              setFormOpen(true);
            }}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "secondary.light"
                    : "secondary.main",
                bgcolor: "action.hover",
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
          >
            <ViewModuleIcon
              sx={{
                fontSize: 40,
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? "secondary.light"
                    : "secondary.main",
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Placas Avulsas
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Venda direta de placas sem modelo associado
            </Typography>
          </ButtonBase>
        </Stack>
      ),
      actions: [
        <Button key="close" onClick={closeDialog}>
          Fechar
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

  const handleCancel = useCallback(
    async (id: number) => {
      showDialog({
        title: "Cancelar Venda",
        body: "Deseja realmente cancelar esta venda? O status do pagamento constará como 'Estorno Pendente', de forma que você deverá estornar o lançamento financeiro manualmente, se houver.",
        actions: [
          <Button key="cancel" onClick={closeDialog}>
            Voltar
          </Button>,
          <Button
            key="confirm"
            color="error"
            variant="contained"
            onClick={async () => {
              closeDialog();
              try {
                await api.post(`${ENDPOINTS.VENDAS}/${id}/cancelar`);
                showSnackbar({
                  message: "Venda cancelada com sucesso!",
                  severity: "success",
                });
                tableRef.current?.reload();
              } catch (error) {
                handleError(error);
              }
            }}
          >
            Confirmar Cancelamento
          </Button>,
        ],
      });
    },
    [showDialog, closeDialog, handleError, showSnackbar],
  );

  const renderRowActions = useCallback(
    (row: Record<string, unknown> & { id: number }) => (
      <Stack direction="row">
        {(row.modeloCasaId || row.modeloCasa) && row.possuiCustomizacao ? (
          <Tooltip title="Exportar Mapa de Cortes">
            <IconButton
              color="secondary"
              size="small"
              onClick={() => {
                setVendaToExportMap(row.id);
                setMapExportModalOpen(true);
              }}
            >
              <IosShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ width: 30, height: 30 }} />
        )}

        <Tooltip title="Editar Venda">
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleOpenEdit(row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {row.status !== StatusVenda.CANCELADA ? (
          <Tooltip title="Cancelar Venda">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleCancel(row.id)}
            >
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ width: 30, height: 30 }} />
        )}
      </Stack>
    ),
    [handleOpenEdit, handleCancel],
  );

  const handleExport = async (
    format: "PDF" | "CSV" | "XLSX" | "PRINT",
    filters: { startDate: string; endDate: string },
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await api.get(
        `${ENDPOINTS.VENDAS}/report?${params.toString()}`,
      );

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
        const modeloObj = item.modeloCasa as
          | Record<string, unknown>
          | undefined;
        return {
          id: item.id,
          dataVenda: new Date(item.dataVenda as string).toLocaleDateString(
            "pt-BR",
          ),
          cliente: clienteObj?.nome || "-",
          modelo: modeloObj?.nome || "Venda de Placas",
          status: StatusVendaLabels[item.status as StatusVenda] || item.status,
          pagamento:
            StatusPagamentoVendaLabels[
              item.statusPagamento as StatusPagamentoVenda
            ] || item.statusPagamento,
          valor: new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
          }).format(Number(item.preco)),
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
      <ReportExportModal
        open={mapExportModalOpen}
        onClose={() => {
          setMapExportModalOpen(false);
          setVendaToExportMap(null);
        }}
        onExport={handleExportMap}
        hideDateFilters={true}
      />
    </Box>
  );
};

export default Vendas;
