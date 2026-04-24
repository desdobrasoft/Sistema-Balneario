// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// project imports
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import { StatusPagamentoVenda, TipoLancamento } from "types/enums";
import LancamentoDialog from "./LancamentoDialog";

// ===============================
// COMPONENT
// ===============================
const LancamentosTable: React.FC = () => {
  const [selectedLancamento, setSelectedLancamento] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // ===============================
  // CHIP HELPER
  // ===============================
  const chipHtml = (label: string, type: "success" | "error" | "warning") => {
    const colors = {
      success: { bg: "#E8F5E9", text: "#1B5E20", border: "#A5D6A7" },
      error: { bg: "#FFEBEE", text: "#B71C1C", border: "#EF9A9A" },
      warning: { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
    }[type];
    return `<span style="display:inline-block;padding:2px 8px;border-radius:16px;font-size:0.75rem;font-weight:500;background:${colors.bg};color:${colors.text};border:1px solid ${colors.border};">${label}</span>`;
  };

  // ===============================
  // COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      { title: "Descrição", data: "descricao" },
      {
        title: "Tipo",
        data: "tipo",
        render: (data: TipoLancamento) =>
          chipHtml(
            data === TipoLancamento.R ? "Receita" : "Despesa",
            data === TipoLancamento.R ? "success" : "error",
          ),
      },
      {
        title: "Vlr Total",
        data: "valorTotal",
        render: (data: any) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(parseFloat(data)),
      },
      {
        title: "Pendente",
        data: "valorPendente",
        render: (data: any) =>
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
        render: (data: StatusPagamentoVenda) =>
          chipHtml(
            data,
            data === StatusPagamentoVenda.PAGO ? "success" : "warning",
          ),
      },
    ],
    [],
  );

  // ===============================
  // FETCH DATA (POST /datatable)
  // ===============================
  const handleFetchData = useCallback(async (data: any) => {
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
  const handleOpenDialog = async (lancamento: any = null) => {
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
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    showDialog({
      title: "Excluir Lançamento",
      body: "Tem certeza de que deseja excluir este lançamento? Esta ação não pode ser desfeita.",
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
              await api.delete(`${ENDPOINTS.LANCAMENTOS}/${id}`);
              showSnackbar({
                message: "Lançamento excluído com sucesso!",
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
  };

  // ===============================
  // ROW ACTIONS
  // ===============================
  const renderRowActions = useCallback(
    (row: any) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Editar / Dar Baixa">
          <IconButton color="primary" onClick={() => handleOpenDialog(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    [],
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
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
    </Box>
  );
};

export default LancamentosTable;
