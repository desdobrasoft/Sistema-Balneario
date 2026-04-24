// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// project
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import { useAuthStore } from "store/authStore";
import { type UserModel } from "types/user";
import UsuariosForm from "./Form";

const Users: React.FC = () => {
  const { user: currentUser, setUser, logout } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Nome Completo", data: "fullName" },
      { title: "Usuário", data: "username" },
      { title: "Email", data: "email" },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: any) => {
    const res = await api.post(`${ENDPOINTS.USERS}${ENDPOINTS.DATATABLE}`, data);

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = async (user: UserModel | null = null) => {
    if (user) {
      try {
        const res = await api.get(`${ENDPOINTS.USERS}/${user.id}`);
        setSelectedUser(res.data);
      } catch (error) {
        handleError(error);
      }
    } else {
      setSelectedUser(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (values: any) => {
    const payload: any = {
      fullName: values.fullName,
      username: values.username,
      email: values.email,
      roles: values.roles,
    };

    if (values.password) {
      payload.password = values.password;
    }

    try {
      if (selectedUser) {
        await api.patch(`${ENDPOINTS.USERS}/${selectedUser.id}`, payload);
        if (currentUser?.id === selectedUser.id) {
          const userResponse = await api.get(ENDPOINTS.AUTH.CURRENT_USER);
          setUser(userResponse.data);
        }
        showSnackbar({ message: "Usuário atualizado com sucesso!", severity: "success" });
      } else {
        await api.post(ENDPOINTS.USERS, payload);
        showSnackbar({ message: "Usuário registrado com sucesso!", severity: "success" });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const confirmDelete = (id: number) => {
    const isSelf = currentUser?.id === id;

    showDialog({
      title: "Confirmar Exclusão",
      body: isSelf
        ? "ATENÇÃO: Você está prestes a excluir sua própria conta. Você será desconectado se continuar. Deseja realmente continuar?"
        : "Deseja realmente excluir este usuário? Esta ação não pode ser desfeita.",
      actions: [
        <Button key="cancel" onClick={closeDialog} color="inherit">
          Cancelar
        </Button>,
        <Button
          key="delete"
          onClick={() => executeDelete(id)}
          color="error"
          variant="contained"
        >
          Excluir
        </Button>,
      ],
    });
  };

  const executeDelete = async (id: number) => {
    try {
      await api.delete(`${ENDPOINTS.USERS}/${id}`);
      showSnackbar({ message: "Usuário excluído com sucesso!", severity: "success" });
      tableRef.current?.reload();

      if (currentUser?.id === id) {
        logout();
      }
    } catch (error) {
      handleError(error);
    } finally {
      closeDialog();
    }
  };

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
          Gerenciamento de Usuários
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Usuário
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: UserModel) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(row)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton color="error" onClick={() => confirmDelete(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
            [],
          )}
        />
      </Paper>

      <UsuariosForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedUser}
      />
    </Box>
  );
};

export default Users;
