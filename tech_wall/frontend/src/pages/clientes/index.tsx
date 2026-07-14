import React, { useCallback, useMemo, useRef, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import { formatPhoneNumber } from "react-phone-number-input";
import api from "services/api";
import ClientesForm, { type ClienteModel } from "./Form";

const Clientes: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteModel | null>(
    null,
  );
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Nome", data: "nome" },
      { title: "Email", data: "email" },
      {
        title: "Contato",
        data: "nroContato",
        render: (data: string) => (data ? formatPhoneNumber(data) : ""),
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.CLIENTES}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = useCallback(
    async (cliente: ClienteModel | null = null) => {
      if (cliente) {
        try {
          const res = await api.get(`${ENDPOINTS.CLIENTES}/${cliente.id}`);
          setSelectedCliente(res.data);
        } catch (error) {
          handleError(error);
        }
      } else {
        setSelectedCliente(null);
      }
      setDialogOpen(true);
    },
    [handleError],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedCliente(null);
  }, []);

  const handleSubmit = async (values: ClienteModel) => {
    try {
      const payload = {
        nome: values.nome,
        email: values.email,
        nroContato: values.nroContato,
      };

      if (selectedCliente) {
        await api.patch(`${ENDPOINTS.CLIENTES}/${selectedCliente.id}`, payload);
        showSnackbar({
          message: "Cliente atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await api.post(ENDPOINTS.CLIENTES, payload);
        showSnackbar({
          message: "Cliente cadastrado com sucesso!",
          severity: "success",
        });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = useCallback(
    (id: number) => {
      showDialog({
        title: "Excluir Cliente",
        body: "Deseja realmente excluir este cliente? Esta ação não pode ser desfeita.",
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
                await api.delete(`${ENDPOINTS.CLIENTES}/${id}`);
                showSnackbar({
                  message: "Cliente excluído com sucesso!",
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

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography
          variant="h4"
          sx={{ lineHeight: 1, fontWeight: "bold", mt: 0.5 }}
        >
          Gerenciamento de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Cliente
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: ClienteModel) => (
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

      <ClientesForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedCliente}
      />
    </Box>
  );
};

export default Clientes;
