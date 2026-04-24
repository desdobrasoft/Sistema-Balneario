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

  const handleFetchData = useCallback(async (data: any) => {
    const res = await api.post(`${ENDPOINTS.ROLES}${ENDPOINTS.DATATABLE}`, data);

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = async (role: Role | null = null) => {
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
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRole(null);
  };

  const handleSubmit = async (values: any) => {
    const { id, ...payload } = values; // Strip id from payload

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

  const confirmDelete = (id: number) => {
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
  };

  const executeDelete = async (id: number) => {
    try {
      await api.delete(`${ENDPOINTS.ROLES}/${id}`);
      showSnackbar({ message: "Cargo excluído com sucesso!", severity: "success" });
      tableRef.current?.reload();
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
            [],
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
