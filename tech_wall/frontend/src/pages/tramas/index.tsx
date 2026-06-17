// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LineWeightIcon from "@mui/icons-material/LineWeight";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { DataTable } from "components/datatable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import TramasForm from "./Form";

const Tramas: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrama, setSelectedTrama] = useState<Record<string, unknown> | null>(null);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Nome", data: "nome" },
      { title: "Altura Base (cm)", data: "alturaBase" },
      { title: "Prof. da Saliência (cm)", data: "profundidadeSaliencia" },
      { title: "Lado", data: "direcionamento" },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(`${ENDPOINTS.TRAMAS}${ENDPOINTS.DATATABLE}`, data);

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = useCallback(async (trama: Record<string, unknown> | null = null) => {
    if (trama) {
      try {
        const res = await api.get(`${ENDPOINTS.TRAMAS}/${trama.id}`);
        setSelectedTrama(res.data);
      } catch (error) {
        handleError(error);
      }
    } else {
      setSelectedTrama(null);
    }
    setDialogOpen(true);
  }, [handleError]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTrama(null);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload = { ...values };
    delete payload.id;
    delete payload.padronizada;
    delete payload.numeroDivisoes;
    delete payload.createdAt;
    delete payload.updatedAt;

    try {
      if (selectedTrama) {
        await api.patch(`${ENDPOINTS.TRAMAS}/${selectedTrama.id}`, payload);
        showSnackbar({ message: "Trama atualizada com sucesso!", severity: "success" });
      } else {
        await api.post(ENDPOINTS.TRAMAS, payload);
        showSnackbar({ message: "Trama registrada com sucesso!", severity: "success" });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const executeDelete = useCallback(async (id: number) => {
    try {
      await api.delete(`${ENDPOINTS.TRAMAS}/${id}`);
      showSnackbar({ message: "Trama excluída com sucesso!", severity: "success" });
      tableRef.current?.reload();
    } catch (error) {
      handleError(error);
    } finally {
      closeDialog();
    }
  }, [handleError, showSnackbar, closeDialog]);

  const handleDelete = useCallback(async (id: number) => {
    showDialog({
      title: "Confirmar Exclusão",
      body: "Deseja realmente excluir esta trama? Se ela estiver atrelada a uma placa o banco poderá bloquear a operação de exclusão.",
      actions: [
        <Button key="cancel" onClick={closeDialog} color="inherit">
          Cancelar
        </Button>,
        <Button
          key="confirm"
          onClick={() => executeDelete(id)}
          color="error"
          variant="contained"
          autoFocus
        >
          Excluir
        </Button>,
      ],
      dismissable: true,
    });
  }, [showDialog, closeDialog, executeDelete]);

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
            Tramas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie e idealize os recortes em cadeia de suas placas.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<LineWeightIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Trama
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: Record<string, unknown> & { id: number }) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(row)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
            [handleDelete, handleOpenDialog],
          )}
        />
      </Paper>

      <TramasForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedTrama}
      />
    </Box>
  );
};

export default Tramas;
