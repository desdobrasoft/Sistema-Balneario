// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";

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
import NotaFiscalForm from "./NotaFiscalForm";

// ===============================
// COMPONENT
// ===============================
const NotasFiscaisTab: React.FC = () => {
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showSnackbar } = useSnackbar();
  const { showDialog, closeDialog } = useDialog();
  const handleError = useErrorHandler();
  const [formOpen, setFormOpen] = useState(false);

  // ===============================
  // COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      { title: "Nome do Arquivo", data: "nomeArquivo" },
      {
        title: "Tipo",
        data: "tipoArquivo",
        render: (data: string) => {
          if (data?.includes("pdf")) return "PDF";
          if (data?.includes("xml")) return "XML";
          if (data?.includes("image")) return "Imagem";
          return data || "---";
        },
      },
      {
        title: "Lançamentos Vinculados",
        data: "_count",
        render: (data: any) => data?.lancamentos ?? 0,
      },
      {
        title: "Data Upload",
        data: "createdAt",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "---",
      },
    ],
    [],
  );

  // ===============================
  // FETCH DATA
  // ===============================
  const handleFetchData = useCallback(async (data: any) => {
    const res = await api.post(
      `${ENDPOINTS.NOTAS_FISCAIS}${ENDPOINTS.DATATABLE}`,
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
  const handleDownload = async (id: number) => {
    try {
      const res = await api.get(`${ENDPOINTS.NOTAS_FISCAIS}/${id}/download`);
      const { nomeArquivo, tipoArquivo, arquivoBase64 } = res.data;

      // Decode base64 and trigger download
      const byteCharacters = atob(arquivoBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: tipoArquivo });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = (id: number) => {
    showDialog({
      title: "Excluir Nota Fiscal",
      body: "Tem certeza de que deseja excluir esta nota fiscal? Os vínculos com lançamentos serão removidos.",
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
              await api.delete(`${ENDPOINTS.NOTAS_FISCAIS}/${id}`);
              showSnackbar({
                message: "Nota fiscal excluída com sucesso!",
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
        <Tooltip title="Baixar Arquivo">
          <IconButton color="primary" onClick={() => handleDownload(row.id)}>
            <DownloadIcon fontSize="small" />
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
          startIcon={<UploadFileIcon />}
          onClick={() => setFormOpen(true)}
        >
          Registrar Nota Fiscal
        </Button>
      </Box>

      <DataTable
        ref={tableRef}
        columns={columns}
        onFetchData={handleFetchData}
        rowActions={renderRowActions}
      />

      <NotaFiscalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          tableRef.current?.reload();
        }}
      />
    </Box>
  );
};

export default NotasFiscaisTab;
