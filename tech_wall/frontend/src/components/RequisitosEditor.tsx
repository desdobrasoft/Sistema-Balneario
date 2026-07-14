import React, { useCallback, useEffect, useRef, useState } from "react";

// icons
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpIcon from "@mui/icons-material/Help";

// material-ui
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

import Stack from "@mui/material/Stack";
import type { RequisitoDto } from "types/dtos";
import { TipoRequisito } from "types/schema";

// ===============================
// TYPES
// ===============================
export type RequisitoEditorItem = RequisitoDto & {
  quantidade?: number;
};

export interface OptionCorte {
  id: number;
  nome: string;
}

export interface OptionTipoPlaca {
  altura: number;
  id: number;
  largura: number;
  nome: string;
}

interface BatchAddState {
  corteId?: number;
  quantidade: number | "";
  tipo: TipoRequisito;
  tipoPlacaId: number;
}

interface RequisitosEditorProps {
  onChange: (requisitos: RequisitoEditorItem[]) => void;
  /** Fires whenever there are walls with no plates (only when showParedes=true). */
  onHasEmptyParedes?: (hasEmpty: boolean) => void;
  requisitos: RequisitoEditorItem[];
  showParedes?: boolean;
  showQuantidade?: boolean;
  disabled?: boolean;
}

const INITIAL_BATCH: BatchAddState = {
  corteId: undefined,
  quantidade: 1,
  tipo: TipoRequisito.PLACA_LISA,
  tipoPlacaId: 0,
};

// ===============================
// COMPONENT
// ===============================
const RequisitosEditor: React.FC<RequisitosEditorProps> = ({
  onChange,
  onHasEmptyParedes,
  requisitos,
  showParedes = true,
  showQuantidade = false,
  disabled = false,
}) => {
  const [allCortes, setAllCortes] = useState<OptionCorte[]>([]);
  const [allTiposPlaca, setAllTiposPlaca] = useState<OptionTipoPlaca[]>([]);

  // ---- Paredes as independent entities ----
  const [paredesList, setParedesList] = useState<string[]>(() => {
    if (!showParedes) return [];
    const walls = [...new Set(requisitos.map((r) => r.parede || "Geral"))];
    return walls;
  });

  // Batch-add state: keyed by wall name, null = form closed
  const [batchByParede, setBatchByParede] = useState<
    Record<string, BatchAddState | null>
  >({});

  // ---- Notify parent about empty-wall validation ----
  const prevHasEmptyRef = useRef<boolean | null>(null);

  const notifyEmptyParedes = useCallback(
    (
      currentParedesList: string[],
      currentRequisitos: RequisitoEditorItem[],
    ) => {
      if (!onHasEmptyParedes || !showParedes) return;
      const hasEmpty = currentParedesList.some(
        (p) => !currentRequisitos.some((r) => r.parede === p),
      );
      if (prevHasEmptyRef.current !== hasEmpty) {
        prevHasEmptyRef.current = hasEmpty;
        onHasEmptyParedes(hasEmpty);
      }
    },
    [onHasEmptyParedes, showParedes],
  );

  useEffect(() => {
    notifyEmptyParedes(paredesList, requisitos);
  }, [paredesList, requisitos, notifyEmptyParedes]);

  // ---- Data fetching ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [corteRes, tipoPlacaRes] = await Promise.all([
          api.get(ENDPOINTS.CORTES),
          api.post(`${ENDPOINTS.TIPOS_PLACA}${ENDPOINTS.DATATABLE}`, {
            length: 500,
          }),
        ]);
        setAllCortes(
          Array.isArray(corteRes.data)
            ? corteRes.data
            : corteRes.data.data || [],
        );
        setAllTiposPlaca(
          Array.isArray(tipoPlacaRes.data)
            ? tipoPlacaRes.data
            : tipoPlacaRes.data.data || [],
        );
      } catch (error) {
        console.error("Erro ao carregar cortes e tipos de placa", error);
      }
    };
    fetchData();
  }, []);

  // ---- Grouping (for render only) ----
  const getRequisitosForParede = useCallback(
    (parede: string) => requisitos.filter((r) => r.parede === parede),
    [requisitos],
  );

  // For Vendas mode (no paredes), just use "Geral"
  const renderParedes = showParedes ? paredesList : ["Geral"];

  // ---- CRUD handlers ----
  const handleUpdate = (idx: number, updatedItem: RequisitoEditorItem) => {
    const newReqs = [...requisitos];
    newReqs[idx] = updatedItem;
    onChange(newReqs);
  };

  const handleRemove = (idx: number) => {
    const newReqs = [...requisitos];
    newReqs.splice(idx, 1);
    onChange(newReqs);
  };

  /** Vendas mode: adds a single row with quantidade field. */
  const handleAddSimple = (parede: string) => {
    const aliasStr = `P${requisitos.length + 1}`;
    onChange([
      ...requisitos,
      {
        alias: aliasStr,
        corteId: undefined,
        parede,
        quantidade: showQuantidade ? 1 : undefined,
        tipo: TipoRequisito.PLACA_LISA,
        tipoPlacaId: 0,
      },
    ]);
  };

  // ---- Parede management ----
  const handleAddParede = () => {
    let nextNum = 1;
    while (paredesList.includes(`Parede ${nextNum}`)) {
      nextNum++;
    }
    setParedesList((prev) => [...prev, `Parede ${nextNum}`]);
  };

  const handleRenameParede = (oldName: string, newName: string) => {
    setParedesList((prev) => prev.map((p) => (p === oldName ? newName : p)));
    const updated = requisitos.map((r) =>
      r.parede === oldName ? { ...r, parede: newName } : r,
    );
    onChange(updated);
  };

  const handleRemoveParede = (parede: string) => {
    if (
      !window.confirm(
        `Deseja realmente excluir a ${parede} e todos os seus requisitos?`,
      )
    )
      return;
    setParedesList((prev) => prev.filter((p) => p !== parede));
    const updated = requisitos.filter((r) => r.parede !== parede);
    onChange(updated);
  };

  // ---- Batch-add handlers (Modelos mode) ----
  const openBatchForm = (parede: string) => {
    setBatchByParede((prev) => ({
      ...prev,
      [parede]: { ...INITIAL_BATCH },
    }));
  };

  const closeBatchForm = (parede: string) => {
    setBatchByParede((prev) => ({ ...prev, [parede]: null }));
  };

  const updateBatchField = (
    parede: string,
    field: keyof BatchAddState,
    value: BatchAddState[keyof BatchAddState],
  ) => {
    setBatchByParede((prev) => ({
      ...prev,
      [parede]: prev[parede] ? { ...prev[parede], [field]: value } : null,
    }));
  };

  const confirmBatch = (parede: string) => {
    const batch = batchByParede[parede];
    const qty = typeof batch?.quantidade === "number" ? batch.quantidade : 0;
    if (!batch || batch.tipoPlacaId === 0 || qty < 1) return;

    const count = Math.max(1, Math.floor(qty));
    const startIdx = requisitos.length;
    const newEntries: RequisitoEditorItem[] = Array.from({
      length: count,
    }).map((_, i) => ({
      alias: `P${startIdx + i + 1}`,
      corteId: batch.corteId,
      parede,
      tipo: batch.tipo,
      tipoPlacaId: batch.tipoPlacaId,
    }));

    onChange([...requisitos, ...newEntries]);
    closeBatchForm(parede);
  };

  // ---- Batch-add form render ----
  const renderBatchForm = (parede: string) => {
    const batch = batchByParede[parede];
    if (!batch) return null;
    const isCorte = batch.tipo === TipoRequisito.CORTE_ESPECIFICO;

    return (
      <Stack direction="column" sx={{ width: "100%" }}>
        <Divider sx={{ mb: 1 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          Configuração de inserção em lote
        </Typography>

        <Grid container columns={24} spacing={1} sx={{ alignItems: "center" }}>
          {/* Tipo — always first */}
          <Grid
            size={{ xs: isCorte ? 7 : 10, md: isCorte ? 4 : 5 }}
            sx={{ order: 1 }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={batch.tipo}
                onChange={(e) =>
                  updateBatchField(parede, "tipo", e.target.value)
                }
              >
                <MenuItem value={TipoRequisito.PLACA_LISA}>Placa</MenuItem>
                <MenuItem value={TipoRequisito.CORTE_ESPECIFICO}>
                  Corte
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Corte (conditional) — always second */}
          {isCorte && (
            <Grid size={{ xs: 8, md: 4 }} sx={{ order: 2 }}>
              <Autocomplete
                getOptionLabel={(o) => o.nome}
                options={allCortes}
                size="small"
                value={allCortes.find((c) => c.id === batch.corteId) || null}
                onChange={(_, v) =>
                  updateBatchField(parede, "corteId", v?.id || undefined)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Corte" />
                )}
              />
            </Grid>
          )}

          {/* Tipo de Placa — xs: row 2 (order 4, grow), md: order 3 */}
          <Grid size={"grow"} sx={{ order: { xs: 4, md: 3 } }}>
            <Autocomplete
              getOptionLabel={(o) =>
                batch.tipo === TipoRequisito.PLACA_LISA
                  ? `${o.nome} (${Number(o.largura)} x ${Number(o.altura)})`
                  : o.nome
              }
              options={allTiposPlaca}
              size="small"
              value={
                allTiposPlaca.find((t) => t.id === batch.tipoPlacaId) || null
              }
              onChange={(_, v) =>
                updateBatchField(parede, "tipoPlacaId", v?.id || 0)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    isCorte ? (
                      <Box
                        component="span"
                        sx={{
                          alignItems: "center",
                          display: "inline-flex",
                          gap: 0.5,
                        }}
                      >
                        Placa
                        <Tooltip title="O tipo selecionado é apenas para controle das tramas e reforço estrutural, ignorando as dimensões que serão definidas pelo corte.">
                          <HelpIcon
                            sx={{
                              cursor: "help",
                              fontSize: 16,
                              mb: "2px",
                              pointerEvents: "auto",
                            }}
                          />
                        </Tooltip>
                      </Box>
                    ) : (
                      "Tipo de Placa"
                    )
                  }
                />
              )}
            />
          </Grid>

          {/* Quantidade — xs: row 1 (order 3), md: order 4 */}
          <Grid
            size={{ xs: isCorte ? 9 : 14, md: 4 }}
            sx={{ order: { xs: 3, md: 4 } }}
          >
            <TextField
              fullWidth
              label="Qtd"
              size="small"
              type="number"
              value={batch.quantidade}
              onChange={(e) => {
                const raw = e.target.value;
                updateBatchField(
                  parede,
                  "quantidade",
                  raw === "" ? "" : parseInt(raw, 10) || 0,
                );
              }}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>

          {/* Confirm / Cancel — always last */}
          <Grid size="auto" sx={{ order: 5 }}>
            <Tooltip title="Confirmar">
              <span>
                <IconButton
                  color="primary"
                  disabled={
                    batch.tipoPlacaId === 0 ||
                    batch.quantidade === "" ||
                    batch.quantidade < 1
                  }
                  size="small"
                  onClick={() => confirmBatch(parede)}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Cancelar">
              <IconButton size="small" onClick={() => closeBatchForm(parede)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Stack>
    );
  };

  // ---- Main render ----
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size="grow">
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Requisitos de Produção
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Defina as especificações abstratas de cada peça necessária.
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {renderParedes.map((pNome) => {
          const paredeReqs = showParedes
            ? getRequisitosForParede(pNome)
            : requisitos;
          const isEmpty = showParedes && paredeReqs.length === 0;

          return (
            <Grid size={12} key={pNome}>
              <Card variant="outlined" sx={{ bgcolor: "action.hover" }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  {showParedes && (
                    <Grid
                      container
                      spacing={2}
                      sx={{ alignItems: "center", mb: 2 }}
                    >
                      <Grid size={{ xs: 8, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Nome da Parede"
                          size="small"
                          value={pNome}
                          onChange={(e) =>
                            handleRenameParede(pNome, e.target.value)
                          }
                          sx={{ bgcolor: "background.paper" }}
                        />
                      </Grid>

                      <Grid size="grow">
                        <Typography variant="caption" color="text.secondary">
                          {paredeReqs.length} requisito(s)
                        </Typography>
                      </Grid>

                      <Grid size="auto">
                        {!disabled && (
                          <IconButton
                            color="error"
                            size="small"
                            title="Excluir Parede"
                            onClick={() => handleRemoveParede(pNome)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  )}

                  <Card sx={{ p: 1.5 }}>
                    <Grid container spacing={2}>
                      {/* Empty wall message */}
                      {isEmpty && (
                        <Grid size={12} sx={{ pt: 1 }}>
                          <Typography
                            variant="body2"
                            color="warning.main"
                            sx={{ fontStyle: "italic", textAlign: "center" }}
                          >
                            Nenhuma placa adicionada. Adicione ao menos uma
                            placa para salvar.
                          </Typography>
                        </Grid>
                      )}

                      {requisitos
                        .map((r, idx) => ({ ...r, originalIdx: idx }))
                        .filter((r) => !showParedes || r.parede === pNome)
                        .map((item, idx, filteredArr) => {
                          const isCorte =
                            item.tipo === TipoRequisito.CORTE_ESPECIFICO;
                          const isLast = idx === filteredArr.length - 1;

                          return (
                            <Grid size={12} key={item.originalIdx}>
                              <Grid spacing={1} sx={{ alignItems: "center" }}>
                                <Grid container size={12} spacing={1}>
                                  <Grid container size="grow">
                                    {/* Tipo — order 1 */}
                                    <Grid
                                      size={{
                                        xs: showQuantidade
                                          ? isCorte
                                            ? 6
                                            : "grow"
                                          : 6,
                                        md: isCorte ? 3 : 4,
                                      }}
                                      sx={
                                        showQuantidade
                                          ? { order: 1 }
                                          : undefined
                                      }
                                    >
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                          label="Tipo"
                                          value={item.tipo}
                                          disabled={disabled}
                                          onChange={(e) =>
                                            handleUpdate(item.originalIdx, {
                                              ...item,
                                              tipo: e.target.value as
                                                | "PLACA_LISA"
                                                | "CORTE_ESPECIFICO",
                                            })
                                          }
                                        >
                                          <MenuItem
                                            value={TipoRequisito.PLACA_LISA}
                                          >
                                            Placa
                                          </MenuItem>
                                          <MenuItem
                                            value={
                                              TipoRequisito.CORTE_ESPECIFICO
                                            }
                                          >
                                            Corte
                                          </MenuItem>
                                        </Select>
                                      </FormControl>
                                    </Grid>

                                    {/* Corte — order 2 */}
                                    {isCorte && (
                                      <Grid
                                        size={{
                                          xs: 6,
                                          md: 3,
                                        }}
                                        sx={
                                          showQuantidade
                                            ? { order: 2 }
                                            : undefined
                                        }
                                      >
                                        <Autocomplete
                                          getOptionLabel={(o) => o.nome}
                                          options={allCortes}
                                          size="small"
                                          disabled={disabled}
                                          value={
                                            allCortes.find(
                                              (c) => c.id === item.corteId,
                                            ) || null
                                          }
                                          onChange={(_, v) =>
                                            handleUpdate(item.originalIdx, {
                                              ...item,
                                              corteId: v?.id || null,
                                            })
                                          }
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Corte"
                                            />
                                          )}
                                        />
                                      </Grid>
                                    )}

                                    {/* Alias (modelos mode only) */}
                                    {showParedes && (
                                      <Grid
                                        size={{
                                          xs: isCorte ? 4 : 6,
                                          md: isCorte ? 3 : 4,
                                        }}
                                      >
                                        <TextField
                                          fullWidth
                                          label="Alias"
                                          placeholder="P01"
                                          size="small"
                                          disabled={disabled}
                                          value={item.alias || ""}
                                          onChange={(e) =>
                                            handleUpdate(item.originalIdx, {
                                              ...item,
                                              alias: e.target.value,
                                            })
                                          }
                                        />
                                      </Grid>
                                    )}

                                    {/* Tipo de Placa — xs: Placa=order 3 (row 2 full), Corte=order 4 (row 2 left). md: order 3. */}
                                    <Grid
                                      size={
                                        showQuantidade
                                          ? {
                                              xs: isCorte ? "grow" : 12,
                                              md: "grow",
                                            }
                                          : "grow"
                                      }
                                      sx={
                                        showQuantidade
                                          ? {
                                              order: {
                                                xs: isCorte ? 4 : 3,
                                                md: 3,
                                              },
                                            }
                                          : undefined
                                      }
                                    >
                                      <Autocomplete
                                        getOptionLabel={(o) =>
                                          item.tipo === TipoRequisito.PLACA_LISA
                                            ? `${o.nome} (${Number(o.largura)} x ${Number(o.altura)})`
                                            : o.nome
                                        }
                                        options={allTiposPlaca}
                                        size="small"
                                        disabled={disabled}
                                        value={
                                          allTiposPlaca.find(
                                            (t) => t.id === item.tipoPlacaId,
                                          ) || null
                                        }
                                        onChange={(_, v) =>
                                          handleUpdate(item.originalIdx, {
                                            ...item,
                                            tipoPlacaId: v?.id || 0,
                                          })
                                        }
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label={
                                              isCorte ? (
                                                <Box
                                                  component="span"
                                                  sx={{
                                                    alignItems: "center",
                                                    display: "inline-flex",
                                                    gap: 0.5,
                                                  }}
                                                >
                                                  Placa
                                                  <Tooltip title="O tipo selecionado é apenas para controle das tramas e reforço estrutural, ignorando as dimensões que serão definidas pelo corte.">
                                                    <HelpIcon
                                                      sx={{
                                                        cursor: "help",
                                                        fontSize: 16,
                                                        mb: "2px",
                                                        pointerEvents: "auto",
                                                      }}
                                                    />
                                                  </Tooltip>
                                                </Box>
                                              ) : (
                                                "Tipo de Placa"
                                              )
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {/* Qtd (vendas) — xs: Placa=order 2 (row 1 right), Corte=order 5 (row 2 right). md: order 4. */}
                                    {showQuantidade && (
                                      <Grid
                                        size={{ xs: 4, sm: 3, md: 2 }}
                                        sx={{
                                          order: { xs: isCorte ? 5 : 2, md: 4 },
                                        }}
                                      >
                                        <TextField
                                          fullWidth
                                          label="Qtd"
                                          size="small"
                                          type="number"
                                          disabled={disabled}
                                          value={item.quantidade ?? ""}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            handleUpdate(item.originalIdx, {
                                              ...item,
                                              quantidade:
                                                raw === ""
                                                  ? undefined
                                                  : parseFloat(raw) || 0,
                                            });
                                          }}
                                        />
                                      </Grid>
                                    )}
                                  </Grid>

                                  {/* Delete button — vendas: order 3 (xs row 1 end) */}
                                  {!disabled && (
                                    <Grid
                                      size="auto"
                                      sx={
                                        showQuantidade
                                          ? {
                                              order: { xs: 3, md: 5 },
                                              mt: "4px",
                                            }
                                          : { mt: "4px" }
                                      }
                                    >
                                      <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() =>
                                          handleRemove(item.originalIdx)
                                        }
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Grid>
                                  )}
                                </Grid>
                                {!isLast && (
                                  <Grid size={12} sx={{ mt: 1.5 }}>
                                    {" "}
                                    <Divider />
                                  </Grid>
                                )}
                              </Grid>
                            </Grid>
                          );
                        })}

                      {/* Batch-add form (Modelos mode) */}
                      {showParedes && !showQuantidade && renderBatchForm(pNome)}

                      {!disabled && (
                        <Grid size={12} sx={{ textAlign: "end" }}>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() =>
                              showParedes && !showQuantidade
                                ? openBatchForm(pNome)
                                : handleAddSimple(pNome)
                            }
                          >
                            Adicionar Placa
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Card>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {showParedes && (
          <Grid size={12}>
            <Button
              fullWidth
              startIcon={<AddIcon />}
              variant="outlined"
              sx={{ borderStyle: "dashed", py: 1.5 }}
              onClick={handleAddParede}
            >
              Nova Parede
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RequisitosEditor;
