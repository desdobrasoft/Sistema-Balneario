// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import AddHomeIcon from "@mui/icons-material/AddHome";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GridOnIcon from "@mui/icons-material/GridOn";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

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
import { exportToExcel, exportToPDF } from "./ExportUtils";
import ModelosForm, { type ModeloCasaModel } from "./Form";

const Modelos: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<ModeloCasaModel | null>(
    null,
  );
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Modelo", data: "nome" },
      { title: "Descrição", data: "descricao" },
      {
        title: "Tempo Fabricação (dias)",
        data: "tempoFabricacao",
      },
      {
        title: "Preço Base",
        data: "preco",
        render: (data: string) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(parseFloat(data)),
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.MODELO_CASA}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = useCallback(async (modelo: ModeloCasaModel | null = null) => {
    if (modelo) {
      try {
        const res = await api.get(`${ENDPOINTS.MODELO_CASA}/${modelo.id}`);
        setSelectedModelo(res.data);
      } catch (error) {
        handleError(error);
      }
    } else {
      setSelectedModelo(null);
    }
    setDialogOpen(true);
  }, [handleError]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedModelo(null);
  };

  const handleSubmit = async (values: Partial<ModeloCasaModel> & Record<string, unknown>) => {
    try {
      const payload = { ...values };
      delete payload.id;
      delete payload.deletedAt;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.qtVendido;
      delete payload.materiaisModeloCasa;
      delete payload.placasModeloCasa;
      delete payload._count;

      if (selectedModelo) {
        await api.patch(
          `${ENDPOINTS.MODELO_CASA}/${selectedModelo.id}`,
          payload,
        );
        showSnackbar({
          message: "Modelo atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await api.post(ENDPOINTS.MODELO_CASA, payload);
        showSnackbar({
          message: "Modelo criado com sucesso!",
          severity: "success",
        });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = useCallback((id: number) => {
    showDialog({
      title: "Excluir Modelo",
      body: "Tem certeza de que deseja excluir este modelo? Esta ação não pode ser desfeita.",
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
              await api.delete(`${ENDPOINTS.MODELO_CASA}/${id}`);
              showSnackbar({
                message: "Modelo excluído com sucesso!",
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
  }, [showDialog, closeDialog, handleError, showSnackbar]);

  const handleExport = useCallback(async (row: ModeloCasaModel, type: "pdf" | "excel") => {
    showSnackbar({ message: "Gerando exportação...", severity: "info" });
    try {
      // Fetch full model with requisitos and corte included
      const modelRes = await api.get(`${ENDPOINTS.MODELO_CASA}/${row.id}`);
      const fullModel = modelRes.data;

      // Fetch all tramas to get names
      const tramasRes = await api.get(ENDPOINTS.TRAMAS);
      const allTramas = Array.isArray(tramasRes.data)
        ? tramasRes.data
        : tramasRes.data.data || [];

      if (type === "pdf") {
        exportToPDF(fullModel, allTramas);
      } else {
        exportToExcel(fullModel, allTramas);
      }
      showSnackbar({
        message: "Exportação concluída com sucesso!",
        severity: "success",
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleError, showSnackbar]);

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
          Catálogo de Modelos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddHomeIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Modelo
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: ModeloCasaModel) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  color="secondary"
                  title="Exportar PDF"
                  onClick={() => handleExport(row, "pdf")}
                >
                  <PictureAsPdfIcon fontSize="small" />
                </IconButton>
                <IconButton
                  color="success"
                  title="Exportar Excel"
                  onClick={() => handleExport(row, "excel")}
                >
                  <GridOnIcon fontSize="small" />
                </IconButton>
                <IconButton
                  color="primary"
                  title="Editar"
                  onClick={() => handleOpenDialog(row)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  title="Excluir"
                  onClick={() => handleDelete(row.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
            [handleExport, handleOpenDialog, handleDelete],
          )}
        />
      </Paper>

      <ModelosForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={(values) => handleSubmit(values as unknown as Partial<ModeloCasaModel> & Record<string, unknown>)}
        item={selectedModelo}
      />
    </Box>
  );
};

export default Modelos;
