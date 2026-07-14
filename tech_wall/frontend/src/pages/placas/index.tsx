// packages
import type { CustomConfigColumns } from "components/datatable/DataTable";
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExtensionIcon from "@mui/icons-material/Extension";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project
import DataTable from "components/datatable/DataTable";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import PlacasAplicarCorteDialog from "./AplicarCorteDialog";
import ConfirmacaoDeducaoDialog from "./ConfirmacaoDeducaoDialog";
import FormDialog, { type PlacaModel, type TipoPlacaOption } from "./Form";
import GerenciarProducaoDialog from "./GerenciarProducaoDialog";
import ModificarEconomiaDialog, {
  type EconomiaItem,
} from "./ModificarEconomiaDialog";

// ===============================
// Interfaces
// ===============================

interface EstoqueRow {
  id: number;
  nome: string;
  largura: number;
  altura: number;
  quantidade: number;
  estoqueMinimo?: number;
}

// ===============================
// Main Component
// ===============================

const Placas: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gerenciarOpen, setGerenciarOpen] = useState(false);
  const [aplicarCorteOpen, setAplicarCorteOpen] = useState(false);
  const [placaParaCorte, setPlacaParaCorte] = useState<PlacaModel | null>(null);
  const [selectedPlaca, setSelectedPlaca] = useState<PlacaModel | null>(null);
  const [filtroTipoPlacaId, setFiltroTipoPlacaId] = useState<number | null>(
    null,
  );

  // Estado dos novos dialogs de dedução/economia
  const [confirmDeducaoOpen, setConfirmDeducaoOpen] = useState(false);
  const [modificarEconomiaOpen, setModificarEconomiaOpen] = useState(false);
  const [pendingCreatePayload, setPendingCreatePayload] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [pendingTipoPlaca, setPendingTipoPlaca] =
    useState<TipoPlacaOption | null>(null);
  const [pendingQuantidade, setPendingQuantidade] = useState(0);

  const estoqueTableRef = useRef<{ reload: () => void }>(null);
  const producaoTableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // ===============================
  // Estoque Tab - Columns & Fetch
  // ===============================

  const estoqueColumns = useMemo(
    () => [
      { data: "id", visible: false },
      { data: "estoqueMinimo", visible: false },
      { title: "Nome", data: "nome" },
      { title: "Largura (cm)", data: "largura" },
      { title: "Altura (cm)", data: "altura" },
      {
        title: "Quantidade",
        data: "quantidade",
        reactRender: (data: unknown, row: EstoqueRow) => {
          const isLow = Number(row.quantidade || 0) <= Number(row.estoqueMinimo || 0);
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
                {String(data)}
              </Box>
            </Stack>
          );
        },
      },
    ],
    [],
  );

  const handleFetchEstoque = useCallback(
    async (data: Record<string, unknown>) => {
      const res = await api.post(
        `${ENDPOINTS.PLACAS}/estoque${ENDPOINTS.DATATABLE}`,
        data,
      );

      return {
        draw: res.data.draw,
        recordsTotal: res.data.recordsTotal,
        recordsFiltered: res.data.recordsFiltered,
        data: res.data.data,
      };
    },
    [],
  );

  // ===============================
  // Produção Tab - Columns & Fetch
  // ===============================

  const producaoColumns = useMemo<CustomConfigColumns[]>(
    () => [
      { data: "id", visible: false },
      { data: "statusPlaca", visible: false },
      { data: "statusProducao", visible: false },
      { title: "Nome", data: "nome" },
      { title: "Tipo", data: "tipoPlaca.nome" },
      {
        title: "Dimensões (cm)",
        data: "dimensoes",
        orderable: false,
        searchable: false,
      },
      {
        title: "Status",
        data: "statusExibicao",
        width: "0px",
        reactRender: (data: unknown) => {
          const status = data as string;
          let color:
            | "default"
            | "success"
            | "secondary"
            | "warning"
            | "info"
            | "error" = "default";
          if (status === "Finalizada") color = "success";
          else if (status === "Em Produção") color = "secondary";
          else if (status === "Aguardando") color = "warning";
          else if (status === "Alocada") color = "info";
          else if (status === "Descartada") color = "error";

          return <Chip label={status} color={color} size="small" />;
        },
      },
    ],
    [],
  );

  const handleFetchProducao = useCallback(
    async (data: Record<string, unknown>) => {
      const payload = { ...data };
      if (filtroTipoPlacaId) {
        (payload as Record<string, unknown>).filter = {
          tipoPlacaId: filtroTipoPlacaId,
        };
      }

      const res = await api.post(
        `${ENDPOINTS.PLACAS}${ENDPOINTS.DATATABLE}`,
        payload,
      );

      return {
        draw: res.data.draw,
        recordsTotal: res.data.recordsTotal,
        recordsFiltered: res.data.recordsFiltered,
        data: res.data.data,
      };
    },
    [filtroTipoPlacaId],
  );

  // ===============================
  // Dialog handlers
  // ===============================

  const handleOpenDialog = useCallback(
    async (placa: PlacaModel | null = null) => {
      if (placa) {
        try {
          const res = await api.get(`${ENDPOINTS.PLACAS}/${placa.id}`);
          const data = res.data;
          // Mapa status para checkbox retalhoDescartado
          data.retalhoDescartado = data.statusPlaca === "DESCARTADA";
          setSelectedPlaca(data);
        } catch (error) {
          handleError(error);
        }
      } else {
        setSelectedPlaca(null);
      }
      setDialogOpen(true);
    },
    [handleError],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedPlaca(null);
  }, []);

  const salvar = useCallback(
    async (payload: Record<string, unknown>) => {
      try {
        if (selectedPlaca) {
          await api.patch(`${ENDPOINTS.PLACAS}/${selectedPlaca.id}`, payload);
          showSnackbar({
            message: "Placa atualizada com sucesso!",
            severity: "success",
          });
        } else {
          await api.post(ENDPOINTS.PLACAS, payload);
          showSnackbar({
            message: "Placa(s) registrada(s) com sucesso!",
            severity: "success",
          });
        }
        estoqueTableRef.current?.reload();
        producaoTableRef.current?.reload();
        handleCloseDialog();
      } catch (error) {
        handleError(error);
      }
    },
    [selectedPlaca, showSnackbar, handleCloseDialog, handleError],
  );

  const handleSubmit = useCallback(
    async (values: PlacaModel, selectedTipo: TipoPlacaOption | null) => {
      if (selectedPlaca) {
        // Modo edição — enviar apenas descrição + retalhoDescartado
        const payload: Record<string, unknown> = {
          descricao: values.descricao,
          retalhoDescartado: values.retalhoDescartado,
        };
        await salvar(payload);
      } else {
        // Modo criação
        const payload: Record<string, unknown> = {
          tipoPlacaId: Number(values.tipoPlacaId),
          quantidade: Number(values.quantidade),
          jaFinalizada: values.jaFinalizada,
        };

        if (values.jaFinalizada) {
          // Placa já finalizada → abrir dialog de confirmação de dedução
          setPendingCreatePayload(payload);
          setPendingTipoPlaca(selectedTipo);
          setPendingQuantidade(Number(values.quantidade) || 0);
          setConfirmDeducaoOpen(true);
        } else {
          // Placa não finalizada → salvar diretamente
          await salvar(payload);
        }
      }
    },
    [selectedPlaca, salvar],
  );

  // ===============================
  // Confirmação de Dedução - Callbacks
  // ===============================

  const handleConfirmDeducaoCancelar = useCallback(() => {
    // Cancelar → fechar dialog de confirmação, usuário volta ao formulário
    setConfirmDeducaoOpen(false);
    setPendingCreatePayload(null);
    setPendingTipoPlaca(null);
    setPendingQuantidade(0);
  }, []);

  const handleConfirmDeducaoConfirmar = useCallback(async () => {
    // Confirmar → deduzir sem economia
    setConfirmDeducaoOpen(false);
    if (pendingCreatePayload) {
      const payload = {
        ...pendingCreatePayload,
        deduzirMateriaPrima: true,
      };
      await salvar(payload);
    }
    setPendingCreatePayload(null);
    setPendingTipoPlaca(null);
    setPendingQuantidade(0);
  }, [pendingCreatePayload, salvar]);

  const handleConfirmDeducaoModificar = useCallback(() => {
    // Modificar → fechar confirmação, abrir dialog de economia
    setConfirmDeducaoOpen(false);
    setModificarEconomiaOpen(true);
  }, []);

  // ===============================
  // Modificar Economia - Callbacks
  // ===============================

  const handleModificarEconomiaCancelar = useCallback(() => {
    // Cancelar → fechar dialog de economia, usuário volta ao formulário
    setModificarEconomiaOpen(false);
    setPendingCreatePayload(null);
    setPendingTipoPlaca(null);
    setPendingQuantidade(0);
  }, []);

  const handleModificarEconomiaConfirmar = useCallback(
    async (itens: EconomiaItem[]) => {
      // Salvar → enviar payload com dedução e economiaInfo
      setModificarEconomiaOpen(false);
      if (pendingCreatePayload) {
        const economiaInfo = {
          modo: "total" as const,
          itens: itens.map((item) => {
            const val = Number(item.valor) || 0;
            return {
              materiaPrimaId: item.materiaPrimaId,
              // economia → valor positivo (reduz dedução)
              // gasto → valor negativo (aumenta dedução)
              quantidade: item.tipo === "economia" ? val : -val,
            };
          }),
        };
        const payload = {
          ...pendingCreatePayload,
          deduzirMateriaPrima: true,
          economiaInfo,
        };
        await salvar(payload);
      }
      setPendingCreatePayload(null);
      setPendingTipoPlaca(null);
      setPendingQuantidade(0);
    },
    [pendingCreatePayload, salvar],
  );

  // ===============================
  // Delete handler
  // ===============================

  const executeDelete = useCallback(
    async (id: number) => {
      closeDialog();
      try {
        await api.delete(`${ENDPOINTS.PLACAS}/${id}`);
        showSnackbar({
          message: "Placa excluída com sucesso!",
          severity: "success",
        });
        estoqueTableRef.current?.reload();
        producaoTableRef.current?.reload();
      } catch (error) {
        handleError(error);
      }
    },
    [closeDialog, showSnackbar, handleError],
  );

  const handleDelete = useCallback(
    (id: number) => {
      showDialog({
        title: "Excluir Placa",
        body: "Deseja realmente excluir esta placa?",
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
    },
    [showDialog, closeDialog, executeDelete],
  );

  // ===============================
  // Navigate from Estoque to Produção
  // ===============================

  const handleVerNaProducao = useCallback((tipoPlacaId: number) => {
    setFiltroTipoPlacaId(tipoPlacaId);
    setActiveTab(1);
  }, []);

  const handleLimparFiltro = useCallback(() => {
    setFiltroTipoPlacaId(null);
  }, []);

  // ===============================
  // Row Actions
  // ===============================

  const estoqueRowActions = useCallback(
    (row: EstoqueRow) => (
      <Tooltip title="Ver na Produção">
        <IconButton color="primary" onClick={() => handleVerNaProducao(row.id)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
    [handleVerNaProducao],
  );

  const producaoRowActions = useCallback(
    (row: PlacaModel) => {
      if (row.statusPlaca === "ALOCADA") return null;

      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          {row.statusPlaca === "DISPONIVEL" &&
            row.statusProducao === "AGUARDANDO" && (
              <Tooltip title="Iniciar Produção">
                <IconButton
                  color="secondary"
                  onClick={async () => {
                    try {
                      await api.post(
                        `${ENDPOINTS.PLACAS}/${row.id}/gerenciar-producao`,
                        { status: "EM_PRODUCAO" },
                      );
                      producaoTableRef.current?.reload();
                      estoqueTableRef.current?.reload();
                    } catch (error) {
                      handleError(error);
                    }
                  }}
                >
                  <PlayCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          {row.statusPlaca === "DISPONIVEL" &&
            row.statusProducao === "EM_PRODUCAO" && (
              <Tooltip title="Finalizar Produção">
                <IconButton
                  color="success"
                  onClick={async () => {
                    try {
                      const res = await api.get(
                        `${ENDPOINTS.PLACAS}/${row.id}`,
                      );
                      setSelectedPlaca(res.data);
                      setGerenciarOpen(true);
                    } catch (error) {
                      handleError(error);
                    }
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          {row.statusPlaca === "DISPONIVEL" && (
            <Tooltip title="Aplicar Corte">
              <IconButton
                color="warning"
                onClick={() => {
                  setPlacaParaCorte(row);
                  setAplicarCorteOpen(true);
                }}
              >
                <ContentCutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Editar Placa">
            <IconButton color="primary" onClick={() => handleOpenDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir Placa">
            <IconButton
              color="error"
              onClick={() => handleDelete(row.id as number)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    [handleError, handleOpenDialog, handleDelete],
  );

  // ===============================
  // Render
  // ===============================

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
            Placas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie o estoque e a produção de suas placas.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<ExtensionIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Placa
        </Button>
      </Stack>

      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, v) => {
            setActiveTab(v);
            if (v === 0) {
              setFiltroTipoPlacaId(null);
            }
          }}
          sx={{ px: 2, pt: 1 }}
        >
          <Tab label="Estoque" />
          <Tab label="Produção" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          {/* ===== ESTOQUE TAB ===== */}
          {activeTab === 0 && (
            <DataTable
              ref={estoqueTableRef}
              columns={estoqueColumns}
              onFetchData={handleFetchEstoque}
              rowActions={estoqueRowActions}
            />
          )}

          {/* ===== PRODUÇÃO TAB ===== */}
          {activeTab === 1 && (
            <>
              {filtroTipoPlacaId && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", mb: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Filtrando por tipo de placa ID: {filtroTipoPlacaId}
                  </Typography>
                  <Button size="small" onClick={handleLimparFiltro}>
                    Limpar filtro
                  </Button>
                </Stack>
              )}
              <DataTable
                ref={producaoTableRef}
                columns={producaoColumns}
                onFetchData={handleFetchProducao}
                rowActions={producaoRowActions}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog de criação/edição de placa */}
      <FormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={(values, selectedTipo) => handleSubmit(values, selectedTipo)}
        item={selectedPlaca}
      />

      {/* Dialog de confirmação de dedução de matéria-prima */}
      <ConfirmacaoDeducaoDialog
        open={confirmDeducaoOpen}
        onClose={handleConfirmDeducaoCancelar}
        onConfirm={handleConfirmDeducaoConfirmar}
        onModify={handleConfirmDeducaoModificar}
        quantidade={pendingQuantidade}
        tipoPlaca={pendingTipoPlaca}
      />

      {/* Dialog de modificar economia de material */}
      <ModificarEconomiaDialog
        open={modificarEconomiaOpen}
        onClose={handleModificarEconomiaCancelar}
        onConfirm={handleModificarEconomiaConfirmar}
        quantidade={pendingQuantidade}
        tipoPlaca={pendingTipoPlaca}
      />

      <GerenciarProducaoDialog
        open={gerenciarOpen}
        onClose={() => {
          setGerenciarOpen(false);
          setSelectedPlaca(null);
        }}
        placa={selectedPlaca}
        onSuccess={() => {
          producaoTableRef.current?.reload();
          estoqueTableRef.current?.reload();
        }}
      />
      <PlacasAplicarCorteDialog
        open={aplicarCorteOpen}
        onClose={() => {
          setAplicarCorteOpen(false);
          setPlacaParaCorte(null);
        }}
        placa={placaParaCorte}
        onSuccess={() => {
          producaoTableRef.current?.reload();
          estoqueTableRef.current?.reload();
        }}
      />
    </Box>
  );
};

export default Placas;
