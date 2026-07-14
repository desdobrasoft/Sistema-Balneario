// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import PaymentsIcon from "@mui/icons-material/Payments";

// material-ui
import PrintIcon from "@mui/icons-material/Print";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// project imports
import DataTable from "components/datatable/DataTable";
import { ReportExportModal } from "components/ReportExportModal";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import { StatusPagamentoVenda, TipoLancamento } from "types/enums";
import { handleExportFormat, type ColumnDef } from "utils/exportUtils";
import LancamentoDialog, { type LancamentoModel } from "./LancamentoDialog";

// ===============================
// COMPONENT
// ===============================
const LancamentosTable: React.FC = () => {
  const theme = useTheme();

  const [selectedLancamento, setSelectedLancamento] =
    useState<LancamentoModel | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "pay">(
    "create",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // ===============================
  // COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      { title: "Descrição", data: "descricao" },
      {
        title: "Tipo",
        data: "tipo",
        reactRender: (data: unknown) => {
          const type = data as TipoLancamento;
          const label = type === TipoLancamento.R ? "Receita" : "Despesa";
          const color =
            type === TipoLancamento.R
              ? theme.palette.success.main
              : theme.palette.error.main;

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
      {
        title: "Vlr Total",
        data: "valorTotal",
        render: (data: string) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(parseFloat(data)),
      },
      {
        title: "Pendente",
        data: "valorPendente",
        render: (data: string) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(parseFloat(data)),
      },
      {
        title: "Vencimento",
        data: "dataVencimento",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "---",
      },
      {
        title: "Status",
        data: "statusPagamento",
        reactRender: (data: unknown) => {
          const status = data as StatusPagamentoVenda;
          let label = "Desconhecido";
          let color = "#757575"; // default

          switch (status) {
            case StatusPagamentoVenda.PAGO:
              label = "Pago";
              color = theme.palette.success.main;
              break;
            case StatusPagamentoVenda.PENDENTE:
              label = "Pendente";
              color = theme.palette.warning.main;
              break;
            case StatusPagamentoVenda.PAGO_PARCIALMENTE:
              label = "Pago Parcialmente";
              color = theme.palette.info.main;
              break;
            case StatusPagamentoVenda.CANCELADO:
              label = "Cancelado";
              color = "#9c27b0"; // purple
              break;
            case StatusPagamentoVenda.ESTORNO_PENDENTE:
              label = "Estorno Pendente";
              color = "#e65100"; // deep orange
              break;
            case StatusPagamentoVenda.VENCIDO:
              label = "Vencido";
              color = theme.palette.error.main;
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
      `${ENDPOINTS.LANCAMENTOS}${ENDPOINTS.DATATABLE}`,
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
  const handleOpenDialog = useCallback(
    async (
      lancamento: LancamentoModel | null = null,
      mode: "create" | "edit" | "pay" = "create",
    ) => {
      if (lancamento) {
        try {
          const res = await api.get(
            `${ENDPOINTS.LANCAMENTOS}/${lancamento.id}`,
          );
          setSelectedLancamento(res.data);
        } catch (error) {
          handleError(error);
          return;
        }
      } else {
        setSelectedLancamento(null);
      }
      setDialogMode(mode);
      setDialogOpen(true);
    },
    [handleError],
  );

  const handleCancel = useCallback(
    (id: number) => {
      showDialog({
        title: "Cancelar Lançamento",
        body: "Tem certeza de que deseja cancelar este lançamento? Esta ação não pode ser desfeita.",
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
                await api.patch(`${ENDPOINTS.LANCAMENTOS}/${id}`, {
                  statusPagamento: StatusPagamentoVenda.CANCELADO,
                });
                showSnackbar({
                  message: "Lançamento cancelado com sucesso!",
                  severity: "success",
                });
                tableRef.current?.reload();
              } catch (error) {
                handleError(error);
              }
            }}
          >
            Cancelar Lançamento
          </Button>,
        ],
      });
    },
    [showDialog, closeDialog, handleError, showSnackbar],
  );

  // ===============================
  // ROW ACTIONS
  // ===============================
  const renderRowActions = useCallback(
    (row: LancamentoModel) => {
      if (row.statusPagamento === StatusPagamentoVenda.CANCELADO) {
        return <Box sx={{ display: "flex", gap: 0.5 }} />;
      }
      return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Registrar Pagamento / Estorno">
            <IconButton
              color="success"
              onClick={() => handleOpenDialog(row, "pay")}
            >
              <PaymentsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              color="primary"
              onClick={() => handleOpenDialog(row, "edit")}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancelar">
            <IconButton color="error" onClick={() => handleCancel(row.id)}>
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    [handleCancel, handleOpenDialog],
  );

  const handleExport = async (
    format: "PDF" | "CSV" | "XLSX" | "PRINT",
    filters: { startDate: string; endDate: string; tipo?: string },
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.tipo) params.append("tipo", filters.tipo);

      const res = await api.get(
        `${ENDPOINTS.LANCAMENTOS}/report?${params.toString()}`,
      );

      const columns: ColumnDef[] = [
        { header: "Data Pag.", key: "dataUltimoPagamento", width: 15 },
        { header: "Tipo", key: "tipo", width: 15 },
        { header: "Descrição", key: "descricao", width: 40 },
        { header: "Vlr. Total", key: "valorTotal", width: 15 },
        { header: "Saldo Final", key: "saldo", width: 15 },
      ];

      let saldoFinal = 0;

      const data = res.data.map((item: Record<string, unknown>) => {
        const valorNum = Number(item.valorTotal);
        // Receitas incrementam o saldo, despesas subtraem
        if (item.tipo === "R") {
          saldoFinal += valorNum;
        } else {
          saldoFinal -= valorNum;
        }

        return {
          dataUltimoPagamento: item.dataUltimoPagamento
            ? new Date(item.dataUltimoPagamento as string).toLocaleDateString(
                "pt-BR",
              )
            : "---",
          tipo: item.tipo === "R" ? "Receita" : "Despesa",
          descricao: item.descricao,
          valorTotal: new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
          }).format(valorNum),
          saldo: new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
          }).format(saldoFinal),
        };
      });

      // Se for apenas Receita ou apenas Despesa, removemos a coluna de Saldo e a coluna Tipo
      let finalColumns = columns;
      if (filters.tipo && filters.tipo !== "ALL") {
        finalColumns = columns.filter(
          (c) => c.key !== "saldo" && c.key !== "tipo",
        );
      } else {
        // Se for Ambos, adicionamos uma linha de totais no final
        data.push({
          dataUltimoPagamento: "TOTAL",
          tipo: "",
          descricao: saldoFinal >= 0 ? "SALDO POSITIVO" : "SALDO NEGATIVO",
          valorTotal: "",
          saldo: new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
          }).format(saldoFinal),
        });
      }

      handleExportFormat(format, "Relatório Financeiro", finalColumns, data);
      setReportModalOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => setReportModalOpen(true)}
        >
          Relatórios
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null, "create")}
        >
          Adicionar Lançamento
        </Button>
      </Box>

      <DataTable
        ref={tableRef}
        columns={columns}
        onFetchData={handleFetchData}
        rowActions={renderRowActions}
      />

      <LancamentoDialog
        open={dialogOpen}
        mode={dialogMode}
        onClose={() => {
          setDialogOpen(false);
          setSelectedLancamento(null);
        }}
        lancamento={selectedLancamento}
        onSuccess={() => {
          tableRef.current?.reload();
          setDialogOpen(false);
          setSelectedLancamento(null);
        }}
      />

      <ReportExportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onExport={handleExport}
        showTipoFilter={true}
      />
    </Box>
  );
};

export default LancamentosTable;
