import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditNoteIcon from "@mui/icons-material/EditNote";
import InventoryIcon from "@mui/icons-material/Inventory";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useCallback, useMemo, useRef, useState } from "react";

import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import {
  StatusProducao,
  StatusProducaoColors,
  StatusProducaoLabels,
} from "types/enums";
import ProducaoForm from "./Form";
import IniciarProducaoDialog from "./IniciarProducaoDialog";
import { InternalOrderForm } from "./InternalOrderForm";
import SuprimentosDialog from "./SuprimentosDialog";

const Producao: React.FC = () => {
  const [selectedOrdem, setSelectedOrdem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [suprimentosOpen, setSuprimentosOpen] = useState(false);
  const [iniciarProducaoOpen, setIniciarProducaoOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Record<
    string,
    unknown
  > | null>(null);

  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Venda", data: "vendaId", render: (data: number) => `#${data}` },
      { title: "Cliente", data: "clienteNome" },
      { title: "Produto", data: "modeloNome" },
      {
        title: "Data Agendada",
        data: "dataAgendamento",
        render: (data: string) =>
          data ? new Date(data).toLocaleDateString("pt-BR") : "Não agendado",
      },
      {
        title: "Status do Kit",
        data: "status",
        render: (data: StatusProducao) => {
          const label = StatusProducaoLabels[data] || data;
          const color = StatusProducaoColors[data] || "#000000";
          return `<span style="display:inline-block;padding:2px 8px;border-radius:16px;font-size:0.75rem;font-weight:bold;background:${color}20;color:${color};border:1px solid ${color};">${label}</span>`;
        },
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post(
      `${ENDPOINTS.PRODUCAO}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenStatusUpdate = useCallback(
    async (ordem: { id: number }) => {
      try {
        const res = await api.get(`${ENDPOINTS.PRODUCAO}/${ordem.id}`);
        setSelectedOrdem(res.data);
        setUpdateStatusOpen(true);
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  const handleOpenSuprimentos = useCallback(
    async (vendaId: number) => {
      try {
        const res = await api.get(`${ENDPOINTS.VENDAS}/${vendaId}`);
        setSelectedVenda(res.data);
        setSuprimentosOpen(true);
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  const handleFinalizarProducao = useCallback(
    async (id: number) => {
      showDialog({
        title: "Finalizar Produção",
        body: "Tem certeza que deseja finalizar a produção desta ordem? Esta ação gerará o registro de entrega.",
        actions: [
          <Button key="cancel" onClick={closeDialog}>
            Cancelar
          </Button>,
          <Button
            key="confirm"
            color="success"
            variant="contained"
            onClick={async () => {
              closeDialog();
              try {
                await api.post(`${ENDPOINTS.PRODUCAO}/${id}/finalizar`);
                tableRef.current?.reload();
              } catch (error) {
                console.error("Erro ao finalizar produção:", error);
                handleError(error);
              }
            }}
          >
            Finalizar
          </Button>,
        ],
      });
    },
    [showDialog, closeDialog, handleError],
  );

  const handleRemoverOrdem = useCallback(
    async (id: number) => {
      showDialog({
        title: "Remover Ordem",
        body: "ATENÇÃO: Deseja realmente remover permanentemente esta ordem de produção? Esta ação não pode ser desfeita.",
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
                await api.delete(`${ENDPOINTS.PRODUCAO}/${id}`);
                tableRef.current?.reload();
              } catch (error) {
                console.error("Erro ao excluir ordem de produção:", error);
                handleError(error);
              }
            }}
          >
            Remover
          </Button>,
        ],
      });
    },
    [showDialog, closeDialog, handleError],
  );

  const handleOpenInternalOrderDialog = () => {
    // ... (mantenha a lógica de ordem interna)
    showDialog({
      title: "Criar Ordem de Produção Interna",
      body: (
        <InternalOrderForm
          onSuccess={() => {
            closeDialog();
            tableRef.current?.reload();
            showSnackbar({
              title: "Ordem Interna Criada",
              message:
                "A ordem de produção base foi gerada com sucesso e a reserva já consta no fluxo.",
              severity: "success",
            });
          }}
        />
      ),
      actions: [
        <Button key="cancel" onClick={() => closeDialog()} color="inherit">
          Cancelar
        </Button>,
        <Button
          key="save"
          type="submit"
          form="internal-order-form"
          color="primary"
          variant="contained"
        >
          Criar Ordem
        </Button>,
      ],
    });
  };

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
            Acompanhamento de Produção
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitore e atualize o status do preparo dos kits
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenInternalOrderDialog}
        >
          Nova Ordem Interna
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (
              row: Record<string, unknown> & {
                id: number;
                status: string;
                vendaId: number;
              },
            ) => {
              const actions = [];

              if (row.status === "MATERIAIS_PENDENTES") {
                actions.push(
                  <Tooltip title="Iniciar Produção" key="iniciar">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSelectedOrdem(row);
                        setIniciarProducaoOpen(true);
                      }}
                    >
                      <CheckCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>,
                );
              } else if (row.status !== "PRONTO_PARA_ENVIO") {
                actions.push(
                  <Tooltip title="Suprimentos de Obra" key="suprimentos">
                    <IconButton
                      color="warning"
                      onClick={() => handleOpenSuprimentos(row.vendaId)}
                      disabled={!row.vendaId}
                    >
                      <InventoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>,
                  <Tooltip title="Alterar Status" key="status">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenStatusUpdate(row)}
                    >
                      <EditNoteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>,
                  <Tooltip title="Finalizar Produção" key="finalizar">
                    <IconButton
                      color="success"
                      onClick={() => handleFinalizarProducao(row.id)}
                    >
                      <CheckCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>,
                );
              }

              actions.push(
                <Tooltip title="Remover Ordem" key="remover">
                  <IconButton
                    color="error"
                    onClick={() => handleRemoverOrdem(row.id)}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </Tooltip>,
              );

              return <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>;
            },
            [
              handleFinalizarProducao,
              handleOpenStatusUpdate,
              handleOpenSuprimentos,
              handleRemoverOrdem,
            ],
          )}
        />
      </Paper>

      {selectedOrdem && (
        <ProducaoForm
          open={updateStatusOpen}
          onClose={() => {
            setUpdateStatusOpen(false);
            setSelectedOrdem(null);
          }}
          item={selectedOrdem}
          onSubmit={async (values) => {
            try {
              await api.patch(`${ENDPOINTS.PRODUCAO}/${selectedOrdem.id}`, {
                status: values.status,
                notas: values.notas,
              });
              tableRef.current?.reload();
              setUpdateStatusOpen(false);
              setSelectedOrdem(null);
              showSnackbar({
                message: "Status atualizado com sucesso!",
                severity: "success",
              });
            } catch (error) {
              handleError(error);
            }
          }}
        />
      )}

      {selectedVenda && (
        <SuprimentosDialog
          open={suprimentosOpen}
          onClose={() => {
            setSuprimentosOpen(false);
            setSelectedVenda(null);
          }}
          venda={
            selectedVenda as unknown as {
              id: number;
              suprimentosObra?: Record<string, unknown>[];
              modeloCasa?: {
                nome: string;
                suprimentosObra?: Record<string, unknown>[];
              };
            }
          }
          onUpdate={() => {
            tableRef.current?.reload();
          }}
        />
      )}

      {selectedOrdem && (
        <IniciarProducaoDialog
          open={iniciarProducaoOpen}
          onClose={() => {
            setIniciarProducaoOpen(false);
            setSelectedOrdem(null);
          }}
          ordem={
            selectedOrdem as unknown as {
              id: number;
              modeloNome: string;
              status: string;
              notas?: string;
            }
          }
          onSuccess={() => tableRef.current?.reload()}
        />
      )}
    </Box>
  );
};

export default Producao;
