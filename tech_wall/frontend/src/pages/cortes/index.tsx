// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddIcon from "@mui/icons-material/Add";
import ContentCutIcon from "@mui/icons-material/ContentCut";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project
import { DataTable } from "components/datatable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import FormCorte, { type CorteModel } from "./Form";

const Cortes: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCorte, setSelectedCorte] = useState<CorteModel | null>(null);

  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Nome", data: "nome", width: "300px" },
      { title: "Dimensões (cm)", data: "dimensoes", orderable: false },
    ],
    [],
  );

  const handleFetchData = useCallback(
    async (data: Record<string, any>) => {
      try {
        const res = await api.post(
          `${ENDPOINTS.CORTES}${ENDPOINTS.DATATABLE}`,
          data,
        );

        return {
          draw: data.draw || 1,
          recordsTotal: res.data.recordsTotal,
          recordsFiltered: res.data.recordsFiltered,
          data: res.data.data,
        };
      } catch (error) {
        handleError(error);
        return {
          draw: data.draw || 1,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: [],
        };
      }
    },
    [handleError],
  );

  const handleOpenForm = useCallback((corte?: CorteModel) => {
    setSelectedCorte(corte || null);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setSelectedCorte(null);
  }, []);

  const handleSubmit = async (values: CorteModel) => {
    try {
      const { id, ...payload } = values;

      if (id) {
        await api.patch(`${ENDPOINTS.CORTES}/${id}`, payload);
        showSnackbar({
          message: "Corte atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await api.post(ENDPOINTS.CORTES, payload);
        showSnackbar({
          message: "Corte registrado com sucesso!",
          severity: "success",
        });
      }
      tableRef.current?.reload();
      handleCloseForm();
    } catch (error) {
      handleError(error);
    }
  };

  const executeDelete = useCallback(async (id: number) => {
    closeDialog();
    try {
      await api.delete(`${ENDPOINTS.CORTES}/${id}`);
      showSnackbar({
        message: "Corte excluído com sucesso!",
        severity: "success",
      });
      tableRef.current?.reload();
    } catch (error) {
      handleError(error);
    }
  }, [closeDialog, showSnackbar, handleError]);

  const handleDelete = useCallback((id: number) => {
    showDialog({
      title: "Excluir Forma de Corte",
      body: "Deseja realmente excluir esta forma do catálogo?",
      actions: [
        <Button key="cancel" onClick={closeDialog}>
          Cancelar
        </Button>,
        <Button
          key="confirm"
          color="error"
          variant="contained"
          onClick={() => executeDelete(id)}
        >
          Excluir
        </Button>,
      ],
    });
  }, [showDialog, closeDialog, executeDelete]);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography
          variant="h4"
          sx={{
            lineHeight: 1,
            fontWeight: "bold",
            mt: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ContentCutIcon fontSize="large" color="primary" />
          Catálogo de Cortes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Novo Corte
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: CorteModel) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Editar">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenForm(row)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(row.id as number)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
            [handleDelete, handleOpenForm],
          )}
        />
      </Paper>

      {formOpen && (
        <FormCorte
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialValues={selectedCorte}
        />
      )}
    </Box>
  );
};

export default Cortes;
