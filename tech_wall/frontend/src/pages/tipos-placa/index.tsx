// packages
import type { ConfigColumns } from "datatables.net-dt";
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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
import TiposPlacaForm from "./Form";

const TiposPlaca: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTipoPlaca, setSelectedTipoPlaca] = useState<Record<
    string,
    unknown
  > | null>(null);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns: ConfigColumns[] = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Nome", data: "nome" },
      { title: "Largura", data: "largura" },
      { title: "Altura", data: "altura" },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.TIPOS_PLACA}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = useCallback(
    async (tipoPlaca: Record<string, unknown> | null = null) => {
      if (tipoPlaca) {
        try {
          const res = await api.get(`${ENDPOINTS.TIPOS_PLACA}/${tipoPlaca.id}`);
          setSelectedTipoPlaca(res.data);
        } catch (error) {
          handleError(error);
        }
      } else {
        setSelectedTipoPlaca(null);
      }
      setDialogOpen(true);
    },
    [handleError],
  );

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTipoPlaca(null);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload = { ...values };
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.deletedAt;

    try {
      if (selectedTipoPlaca) {
        await api.patch(
          `${ENDPOINTS.TIPOS_PLACA}/${selectedTipoPlaca.id}`,
          payload,
        );
        showSnackbar({
          message: "Tipo de placa atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await api.post(ENDPOINTS.TIPOS_PLACA, payload);
        showSnackbar({
          message: "Tipo de placa registrado com sucesso!",
          severity: "success",
        });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const executeDelete = useCallback(
    async (id: number) => {
      try {
        await api.delete(`${ENDPOINTS.TIPOS_PLACA}/${id}`);
        showSnackbar({
          message: "Tipo de placa excluído com sucesso!",
          severity: "success",
        });
        tableRef.current?.reload();
      } catch (error) {
        handleError(error);
      } finally {
        closeDialog();
      }
    },
    [handleError, showSnackbar, closeDialog],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      showDialog({
        title: "Confirmar Exclusão",
        body: "Deseja realmente excluir este tipo de placa? Se ele estiver atrelado a uma placa o banco poderá bloquear a operação de exclusão.",
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
    },
    [showDialog, closeDialog, executeDelete],
  );

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
            Tipos de Placa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Defina as especificações padrão para cada modelo de placa.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<CategoryIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Tipo de Placa
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

      <TiposPlacaForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedTipoPlaca}
      />
    </Box>
  );
};

export default TiposPlaca;
