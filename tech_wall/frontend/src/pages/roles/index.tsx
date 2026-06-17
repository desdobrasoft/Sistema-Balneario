// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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
import { type Role } from "types/user";
import RolesForm from "./Form";

const RolesList: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Cargo", data: "role", width: "15%" },
      { title: "Permissões", data: "permissions", width: "60%" },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(`${ENDPOINTS.ROLES}${ENDPOINTS.DATATABLE}`, data);

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = useCallback(async (role?: Role) => {
    if (role) {
      try {
        const res = await api.get(`${ENDPOINTS.ROLES}/${role.id}`);
        setSelectedRole(res.data);
      } catch (error) {
        handleError(error);
      }
    } else {
      setSelectedRole(null);
    }
    setDialogOpen(true);
  }, [handleError]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRole(null);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload = { ...values };
    delete payload.id;

    try {
      if (selectedRole) {
        await api.patch(`${ENDPOINTS.ROLES}/${selectedRole.id}`, payload);
        showSnackbar({ message: "Cargo atualizado com sucesso!", severity: "success" });
      } else {
        await api.post(ENDPOINTS.ROLES, payload);
        showSnackbar({ message: "Cargo criado com sucesso!", severity: "success" });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const executeDelete = useCallback(async (id: number) => {
    try {
      await api.delete(`${ENDPOINTS.ROLES}/${id}`);
      showSnackbar({ message: "Cargo excluído com sucesso!", severity: "success" });
      tableRef.current?.reload();
    } catch (error) {
      handleError(error);
    } finally {
      closeDialog();
    }
  }, [handleError, showSnackbar, closeDialog]);

  const confirmDelete = useCallback((id: number) => {
    showDialog({
      title: "Confirmar Exclusão",
      body: "Deseja realmente excluir este cargo? Usuários vinculados a ele perderão as permissões associadas.",
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
  }, [showDialog, closeDialog, executeDelete]);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", lineHeight: 1, mt: 0.5 }}
        >
          Cargos e Permissões
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Cargo
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: Role) => (
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
            [confirmDelete, handleOpenDialog],
          )}
        />
      </Paper>

      <RolesForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedRole}
      />
    </Box>
  );
};

export default RolesList;
