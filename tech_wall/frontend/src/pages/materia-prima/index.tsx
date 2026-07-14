// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import MateriaPrimaDashboard from "./Dashboard";
import MateriaPrimaForm, { type MateriaPrimaModel } from "./Form";
import MovimentacaoForm from "./MovimentacaoForm";
import PedidoCompraForm from "./PedidoCompraForm";
import RecebimentoTable from "./RecebimentoTable";

// ===============================
// PAGE COMPONENT
// ===============================
const MateriaPrima: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Material CRUD dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MateriaPrimaModel | null>(null);

  // Movimentação dialog
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [movPreSelected, setMovPreSelected] =
    useState<MateriaPrimaModel | null>(null);

  // Pedido de Compra dialog
  const [pedidoDialogOpen, setPedidoDialogOpen] = useState(false);
  const [pedidoMaterial, setPedidoMaterial] =
    useState<MateriaPrimaModel | null>(null);

  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // ===============================
  // COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      { title: "Item", data: "item" },
      {
        title: "Qtd",
        data: "quantidade",
        reactRender: (data: unknown, row: MateriaPrimaModel) => {
          const numData = Number(data);
          const isLow = numData <= (row.estoqueMinimo || 0);
          const formattedData = new Intl.NumberFormat("pt-BR", {
            maximumFractionDigits: 2,
          }).format(numData);

          return (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              {isLow && <WarningAmberIcon color="error" fontSize="small" />}
              <Box
                component="span"
                sx={{
                  color: isLow ? "error.main" : "inherit",
                  fontWeight: isLow ? "bold" : "inherit",
                }}
              >
                {formattedData} {row.unidade || ""}
              </Box>
            </Stack>
          );
        },
      },
      { title: "Lim. Baixo", data: "estoqueMinimo" },
    ],
    [],
  );

  // ===============================
  // FETCH DATA
  // ===============================
  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.MATERIA_PRIMA}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  // ===============================
  // MATERIAL CRUD HANDLERS
  // ===============================
  const handleOpenDialog = useCallback(
    async (material: MateriaPrimaModel | null = null) => {
      if (material) {
        try {
          const res = await api.get(
            `${ENDPOINTS.MATERIA_PRIMA}/${material.id}`,
          );
          setSelectedMaterial(res.data);
        } catch (error) {
          handleError(error);
        }
      } else {
        setSelectedMaterial(null);
      }
      setDialogOpen(true);
    },
    [handleError],
  );

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMaterial(null);
  };

  const handleSubmit = async (values: MateriaPrimaModel) => {
    const payload = { ...values } as Partial<MateriaPrimaModel> &
      Record<string, unknown>;
    delete payload.id;
    delete payload.deletedAt;
    
    if (selectedMaterial) {
      await api.patch(
        `${ENDPOINTS.MATERIA_PRIMA}/${selectedMaterial.id}`,
        payload,
      );
      showSnackbar({
        message: "Material atualizado com sucesso!",
        severity: "success",
      });
    } else {
      await api.post(ENDPOINTS.MATERIA_PRIMA, payload);
      showSnackbar({
        message: "Material criado com sucesso!",
        severity: "success",
      });
    }
    tableRef.current?.reload();
    handleCloseDialog();
  };

  const handleDelete = useCallback(
    (id: number) => {
      showDialog({
        title: "Excluir Material",
        body: "Tem certeza de que deseja excluir este material? Esta ação não pode ser desfeita.",
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
                await api.delete(`${ENDPOINTS.MATERIA_PRIMA}/${id}`);
                showSnackbar({
                  message: "Material excluído com sucesso!",
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

  // ===============================
  // MOVIMENTAÇÃO HANDLERS
  // ===============================
  const handleOpenMovimentacao = useCallback(
    (material: MateriaPrimaModel | null = null) => {
      setMovPreSelected(material);
      setMovDialogOpen(true);
    },
    [],
  );

  // ===============================
  // PEDIDO DE COMPRA HANDLERS
  // ===============================
  const handleOpenPedidoCompra = useCallback((material: MateriaPrimaModel) => {
    setPedidoMaterial(material);
    setPedidoDialogOpen(true);
  }, []);

  // ===============================
  // ROW ACTIONS
  // ===============================
  const renderRowActions = useCallback(
    (row: MateriaPrimaModel) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Registrar Movimentação">
          <IconButton
            color="secondary"
            onClick={() => handleOpenMovimentacao(row)}
          >
            <CompareArrowsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Abrir Pedido de Compra">
          <IconButton
            color="primary"
            onClick={() => handleOpenPedidoCompra(row)}
          >
            <ShoppingCartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar Material">
          <IconButton color="primary" onClick={() => handleOpenDialog(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir Material">
          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    [
      handleOpenMovimentacao,
      handleOpenPedidoCompra,
      handleOpenDialog,
      handleDelete,
    ],
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
            Matéria-Prima
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitore e gerencie os níveis de materiais da empresa
          </Typography>
        </Stack>
        {tabValue === 1 && (
          <Button
            variant="contained"
            startIcon={<InventoryIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Item
          </Button>
        )}
      </Stack>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2, pt: 1 }}
        >
          <Tab label="Painel" />
          <Tab label="Estoque" />
          <Tab label="Recebimento" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <MateriaPrimaDashboard
              onOpenPedidoCompra={
                handleOpenPedidoCompra as unknown as (material: {
                  id: number;
                  item: string;
                  quantidade: number;
                  estoqueMinimo: number;
                  unidade?: string;
                }) => void
              }
            />
          )}
          {tabValue === 1 && (
            <DataTable
              ref={tableRef}
              columns={columns}
              onFetchData={handleFetchData}
              rowActions={renderRowActions}
            />
          )}
          {tabValue === 2 && <RecebimentoTable />}
        </Box>
      </Paper>

      {/* Material CRUD Dialog */}
      <MateriaPrimaForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedMaterial}
      />

      {/* Movimentação Dialog */}
      <MovimentacaoForm
        open={movDialogOpen}
        onClose={() => {
          setMovDialogOpen(false);
          setMovPreSelected(null);
        }}
        preSelectedMaterial={movPreSelected}
        onSubmit={async (values) => {
          await api.post(ENDPOINTS.MOVIMENTACAO_MATERIAIS, {
            materiaPrimaId: values.materiaPrimaId,
            tipoMovimentacao: values.tipoMovimentacao,
            qtde: values.qtde,
            dataMovimentacao: values.dataMovimentacao,
            notas: values.notas || undefined,
          });
          showSnackbar({
            message: "Movimentação registrada com sucesso!",
            severity: "success",
          });
          tableRef.current?.reload();
          setMovDialogOpen(false);
          setMovPreSelected(null);
        }}
      />

      {/* Pedido de Compra Dialog */}
      {pedidoMaterial && (
        <PedidoCompraForm
          open={pedidoDialogOpen}
          onClose={() => {
            setPedidoDialogOpen(false);
            setPedidoMaterial(null);
          }}
          material={pedidoMaterial}
          onSubmit={async (values) => {
            await api.post(ENDPOINTS.PEDIDOS_COMPRA, {
              materiaPrimaId: values.materiaPrimaId,
              qtSolicitada: values.qtSolicitada,
            });
            showSnackbar({
              message: "Pedido de compra aberto com sucesso!",
              severity: "success",
            });
            setPedidoDialogOpen(false);
            setPedidoMaterial(null);
          }}
        />
      )}
    </Box>
  );
};

export default MateriaPrima;
