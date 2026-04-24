// packages
import React, { useCallback, useMemo, useRef, useState } from "react";

// icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExtensionIcon from "@mui/icons-material/Extension";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
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
import FormDialog, { type PlacaModel } from "./Form";
import GerenciarProducaoDialog from "./GerenciarProducaoDialog";

const Placas: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gerenciarOpen, setGerenciarOpen] = useState(false);
  const [aplicarCorteOpen, setAplicarCorteOpen] = useState(false);
  const [placaParaCorte, setPlacaParaCorte] = useState<PlacaModel | null>(null);
  const [selectedPlaca, setSelectedPlaca] = useState<PlacaModel | null>(null);
  const tableRef = useRef<{ reload: () => void }>(null);
  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const columns = useMemo(
    () => [
      { data: "id", visible: false },
      { title: "Nome", data: "nome" },
      { title: "Dimensões (cm)", data: "dimensoes" },
      { title: "Espessura (cm)", data: "espessuraFormatada" },
      { title: "Status", data: "statusProducao" },
    ],
    [],
  );

  const handleFetchData = useCallback(async (data: any) => {
    const res = await api.post(
      `${ENDPOINTS.PLACAS}${ENDPOINTS.DATATABLE}`,
      data,
    );

    return {
      draw: res.data.draw,
      recordsTotal: res.data.recordsTotal,
      recordsFiltered: res.data.recordsFiltered,
      data: res.data.data,
    };
  }, []);

  const handleOpenDialog = async (placa: PlacaModel | null = null) => {
    if (placa) {
      try {
        const res = await api.get(`${ENDPOINTS.PLACAS}/${placa.id}`);
        const data = res.data;
        // Map backend relation 'materiaisPlaca' to frontend expected 'materiais'
        if (data.materiaisPlaca) {
          data.materiais = data.materiaisPlaca.map((m: any) => ({
            materiaPrimaId: m.materiaPrimaId,
            quantidade: m.quantidade,
            materiaPrima: m.materiaPrima,
          }));
        }
        setSelectedPlaca(data);
      } catch (error) {
        handleError(error);
      }
    } else {
      setSelectedPlaca(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPlaca(null);
  };

  const handleSubmit = async (values: any) => {
    // Sanitizar payload: Enviar apenas o que o DTO espera
    const { id, statusProducao, createdAt, updatedAt, ...rest } = values;

    const payload = {
      nome: rest.nome,
      descricao: rest.descricao,
      altura:
        rest.altura === "" || rest.altura === 0
          ? undefined
          : Number(rest.altura),
      largura:
        rest.largura === "" || rest.largura === 0
          ? undefined
          : Number(rest.largura),
      espessura:
        rest.espessura === "" || rest.espessura === 0
          ? undefined
          : Number(rest.espessura),
      retalhoDescartado: undefined,
      tramaEsquerdaAtiva: rest.tramaEsquerdaAtiva,
      tramaEsquerdaId: rest.tramaEsquerdaId || undefined,
      tramaDireitaAtiva: rest.tramaDireitaAtiva,
      tramaDireitaId: rest.tramaDireitaId || undefined,
      tramaSuperiorAtiva: rest.tramaSuperiorAtiva,
      tramaSuperiorId: rest.tramaSuperiorId || undefined,
      tramaInferiorAtiva: rest.tramaInferiorAtiva,
      tramaInferiorId: rest.tramaInferiorId || undefined,
      darBaixaImediata: rest.darBaixaImediata,
      materiais: rest.materiais?.map((m: any) => ({
        materiaPrimaId: Number(m.materiaPrimaId),
        quantidade: Number(m.quantidade),
      })),
    };

    let materiaisMudaram = false;
    const oldMateriais = selectedPlaca?.materiais || [];
    const newMateriais = payload.materiais || [];

    if (oldMateriais.length !== newMateriais.length) {
      materiaisMudaram = true;
    } else {
      for (const newMat of newMateriais) {
        const oldMat = oldMateriais.find(
          (m: any) => m.materiaPrimaId === newMat.materiaPrimaId,
        );
        if (
          !oldMat ||
          Number(oldMat.quantidade) !== Number(newMat.quantidade)
        ) {
          materiaisMudaram = true;
          break;
        }
      }
    }

    if (
      selectedPlaca &&
      selectedPlaca.statusProducao === "FINALIZADA" &&
      materiaisMudaram
    ) {
      showDialog({
        title: "Atenção: Placa já Finalizada",
        body: "Você alterou a receita de materiais de uma placa que já estava finalizada. Deseja que a diferença de material afete o estoque de matéria-prima?",
        actions: [
          <Button
            key="nao"
            onClick={async () => {
              closeDialog();
              try {
                await salvar({ ...payload, ajustarEstoqueConsumido: false });
              } catch (error) {
                handleError(error);
              }
            }}
          >
            Não, manter estoque
          </Button>,
          <Button
            key="sim"
            variant="contained"
            onClick={async () => {
              closeDialog();
              try {
                await salvar({ ...payload, ajustarEstoqueConsumido: true });
              } catch (error) {
                handleError(error);
              }
            }}
          >
            Sim, ajustar estoque
          </Button>,
        ],
      });
      return;
    } else {
      await salvar(payload);
    }
  };

  const salvar = async (payload: any) => {
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
          message: "Placa registrada com sucesso!",
          severity: "success",
        });
      }
      tableRef.current?.reload();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = (id: number) => {
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
  };

  const executeDelete = async (id: number) => {
    closeDialog();
    try {
      await api.delete(`${ENDPOINTS.PLACAS}/${id}`);
      showSnackbar({
        message: "Placa excluída com sucesso!",
        severity: "success",
      });
      tableRef.current?.reload();
    } catch (error) {
      handleError(error);
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
          Configuração de Placas
        </Typography>
        <Button
          variant="contained"
          startIcon={<ExtensionIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Placa
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataTable
          ref={tableRef}
          columns={columns}
          onFetchData={handleFetchData}
          rowActions={useCallback(
            (row: PlacaModel) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                {row.statusProducao === "AGUARDANDO" && (
                  <Tooltip title="Iniciar Produção">
                    <IconButton
                      color="secondary"
                      onClick={async () => {
                        try {
                          await api.post(
                            `${ENDPOINTS.PLACAS}/${row.id}/gerenciar-producao`,
                            { status: "EM_PRODUCAO" },
                          );
                          tableRef.current?.reload();
                        } catch (error) {
                          handleError(error);
                        }
                      }}
                    >
                      <PlayCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {row.statusProducao === "EM_PRODUCAO" && (
                  <Tooltip title="Finalizar Produção">
                    <IconButton
                      color="success"
                      onClick={() => {
                        setSelectedPlaca(row);
                        setGerenciarOpen(true);
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
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
                <Tooltip title="Editar Placa">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(row)}
                  >
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
            ),
            [],
          )}
        />
      </Paper>

      <FormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        item={selectedPlaca}
      />

      <GerenciarProducaoDialog
        open={gerenciarOpen}
        onClose={() => {
          setGerenciarOpen(false);
          setSelectedPlaca(null);
        }}
        placa={selectedPlaca}
        onSuccess={() => tableRef.current?.reload()}
      />

      <PlacasAplicarCorteDialog
        open={aplicarCorteOpen}
        onClose={() => {
          setAplicarCorteOpen(false);
          setPlacaParaCorte(null);
        }}
        placa={placaParaCorte}
        onSuccess={() => tableRef.current?.reload()}
      />
    </Box>
  );
};

export default Placas;
