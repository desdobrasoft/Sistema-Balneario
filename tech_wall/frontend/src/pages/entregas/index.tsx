// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import BlockIcon from "@mui/icons-material/Block";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

// material-ui
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import api from "services/api";
import { StatusEntrega, StatusEntregaLabels } from "types/enums";
import { ActionDialog } from "./ActionDialog";
import EntregasForm, { type EntregaModel } from "./Form";
import { HistoricoDialog } from "./HistoricoDialog";

// ===============================
// PAGE COMPONENT
// ===============================
const Entregas: React.FC = () => {
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaModel | null>(
    null,
  );

  // State for Form (Agendar Coleta / Editar)
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"agendar" | "editar">("agendar");

  // State for Action Dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogConfig, setActionDialogConfig] = useState({
    title: "",
    description: "",
    actionLabel: "",
    color: "primary" as "primary" | "error" | "success" | "warning",
    actionType: "" as "iniciar" | "finalizar" | "cancelar",
  });

  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const handleOpenHistorico = useCallback((row: EntregaModel) => {
    setSelectedEntrega(row);
    setHistoricoDialogOpen(true);
  }, []);

  const tableRef = useRef<{ reload: () => void }>(null);
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      {
        title: "Venda",
        data: "vendaId",
        width: "0px",
        render: (data: number) => (data ? `#${data}` : "N/A"),
      },
      {
        title: "Cliente",
        data: "venda.cliente.nome",
        defaultContent: "N/A",
      },
      {
        title: "Modelo",
        data: "venda.modeloCasa.nome",
        defaultContent: "N/A",
      },
      {
        title: "Transportadora",
        data: "transportadora",
        defaultContent: "–––",
      },
      {
        title: "Previsão",
        data: "previsaoEntrega",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "Não definido",
      },
      {
        title: "Status",
        data: "status",
        reactRender: (data: unknown) => {
          const status = data as StatusEntrega;
          let hexColor = "#607d8b"; // default greyish for PENDENTE

          switch (status) {
            case StatusEntrega.COLETA_AGENDADA:
              hexColor = "#0288d1"; // info
              break;
            case StatusEntrega.EM_TRANSITO:
              hexColor = "#1976d2"; // primary
              break;
            case StatusEntrega.ENTREGUE:
              hexColor = "#2e7d32"; // success
              break;
            case StatusEntrega.ATRASADA:
              hexColor = "#ed6c02"; // warning
              break;
            case StatusEntrega.CANCELADA:
              hexColor = "#d32f2f"; // error
              break;
          }

          const label = StatusEntregaLabels[status] || status;
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: `${hexColor}20`,
                color: hexColor,
                border: `1px solid ${hexColor}`,
                fontWeight: "bold",
              }}
            />
          );
        },
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.ENTREGAS}${ENDPOINTS.DATATABLE}`,
      data,
    );
    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenForm = useCallback(
    async (entrega: EntregaModel, mode: "agendar" | "editar") => {
      try {
        const res = await api.get(`${ENDPOINTS.ENTREGAS}/${entrega.id}`);
        setSelectedEntrega(res.data);
        setFormMode(mode);
        setFormOpen(true);
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  const handleOpenActionDialog = useCallback(
    async (
      entrega: EntregaModel,
      actionType: "iniciar" | "finalizar" | "cancelar",
    ) => {
      try {
        const res = await api.get(`${ENDPOINTS.ENTREGAS}/${entrega.id}`);
        setSelectedEntrega(res.data);

        let config: typeof actionDialogConfig = {
          title: "",
          description: "",
          actionLabel: "",
          color: "primary",
          actionType,
        };
        if (actionType === "iniciar") {
          config = {
            title: "Iniciar Entrega",
            description: "Deseja marcar esta entrega como 'Em Trânsito'?",
            actionLabel: "Iniciar",
            color: "primary",
            actionType,
          };
        } else if (actionType === "finalizar") {
          config = {
            title: "Finalizar Entrega",
            description: "Deseja confirmar que a entrega foi concluída?",
            actionLabel: "Finalizar",
            color: "success",
            actionType,
          };
        } else if (actionType === "cancelar") {
          config = {
            title: "Cancelar Entrega",
            description: "Deseja realmente cancelar esta entrega?",
            actionLabel: "Cancelar",
            color: "error",
            actionType,
          };
        }

        setActionDialogConfig(config);
        setActionDialogOpen(true);
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  const handleActionConfirm = async (notas: string) => {
    if (!selectedEntrega) return;
    try {
      if (actionDialogConfig.actionType === "iniciar") {
        await api.post(`${ENDPOINTS.ENTREGAS}/${selectedEntrega.id}/iniciar`, {
          notas,
        });
      } else if (actionDialogConfig.actionType === "finalizar") {
        await api.post(
          `${ENDPOINTS.ENTREGAS}/${selectedEntrega.id}/finalizar`,
          { notas },
        );
      } else if (actionDialogConfig.actionType === "cancelar") {
        await api.post(`${ENDPOINTS.ENTREGAS}/${selectedEntrega.id}/cancelar`, {
          notas,
        });
      }
      tableRef.current?.reload();
      setActionDialogOpen(false);
      setSelectedEntrega(null);
    } catch (error) {
      handleError(error);
    }
  };

  const getRowActions = useCallback(
    (row: EntregaModel) => {
      const isCancelada = row.status === StatusEntrega.CANCELADA;
      const isEntregue = row.status === StatusEntrega.ENTREGUE;
      const emptyBox = <Box sx={{ width: 36, height: 36 }} />;

      let action1 = emptyBox;
      let action2 = emptyBox;
      let action4 = emptyBox;

      // Action 1: State transition
      if (row.status === StatusEntrega.PENDENTE_TRANSPORTADORA) {
        action1 = (
          <Tooltip title="Agendar Coleta">
            <IconButton
              color="info"
              onClick={() => handleOpenForm(row, "agendar")}
            >
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      } else if (row.status === StatusEntrega.COLETA_AGENDADA) {
        action1 = (
          <Tooltip title="Iniciar Entrega">
            <IconButton
              color="primary"
              onClick={() => handleOpenActionDialog(row, "iniciar")}
            >
              <LocalShippingIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      } else if (
        row.status === StatusEntrega.EM_TRANSITO ||
        row.status === StatusEntrega.ATRASADA
      ) {
        action1 = (
          <Tooltip title="Finalizar Entrega">
            <IconButton
              color="success"
              onClick={() => handleOpenActionDialog(row, "finalizar")}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      }

      // Action 2: Editar (Available if not Cancelada and not Entregue and not Pendente)
      if (
        !isCancelada &&
        !isEntregue &&
        row.status !== StatusEntrega.PENDENTE_TRANSPORTADORA
      ) {
        action2 = (
          <Tooltip title="Editar Agendamento">
            <IconButton
              color="primary"
              onClick={() => handleOpenForm(row, "editar")}
            >
              <EditNoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      }

      // Action 3: Histórico
      const action3 = (
        <Tooltip title="Visualizar Histórico">
          <IconButton color="primary" onClick={() => handleOpenHistorico(row)}>
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );

      // Action 4: Cancelar (Available if not Cancelada and not Entregue)
      if (!isCancelada && !isEntregue) {
        action4 = (
          <Tooltip title="Cancelar Entrega">
            <IconButton
              color="error"
              onClick={() => handleOpenActionDialog(row, "cancelar")}
            >
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      }

      return (
        <Stack direction="row">
          {action1}
          {action2}
          {action3}
          {action4}
        </Stack>
      );
    },
    [handleOpenForm, handleOpenActionDialog, handleOpenHistorico],
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
            Gerenciamento de Entregas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe e atualize o status das entregas para seus clientes
          </Typography>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={getRowActions}
        />
      </Paper>

      {selectedEntrega && (
        <EntregasForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedEntrega(null);
          }}
          item={selectedEntrega}
          title={
            formMode === "agendar" ? "Agendar Coleta" : "Editar Agendamento"
          }
          onSubmit={async (values) => {
            try {
              if (formMode === "agendar") {
                await api.post(
                  `${ENDPOINTS.ENTREGAS}/${selectedEntrega.id}/agendar-coleta`,
                  values,
                );
              } else {
                await api.patch(
                  `${ENDPOINTS.ENTREGAS}/${selectedEntrega.id}/editar-agendamento`,
                  values,
                );
              }
              tableRef.current?.reload();
              setFormOpen(false);
              setSelectedEntrega(null);
            } catch (error) {
              handleError(error);
            }
          }}
        />
      )}

      {selectedEntrega && (
        <ActionDialog
          open={actionDialogOpen}
          onClose={() => {
            setActionDialogOpen(false);
            setSelectedEntrega(null);
          }}
          title={actionDialogConfig.title}
          description={actionDialogConfig.description}
          actionLabel={actionDialogConfig.actionLabel}
          color={actionDialogConfig.color}
          onConfirm={handleActionConfirm}
        />
      )}

      {selectedEntrega && (
        <HistoricoDialog
          open={historicoDialogOpen}
          onClose={() => setHistoricoDialogOpen(false)}
          historico={selectedEntrega.entregasHistorico || []}
        />
      )}
    </Box>
  );
};

export default Entregas;
