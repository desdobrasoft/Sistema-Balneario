import React, { useEffect, useState } from "react";

// icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";

export interface RequisitoOverride {
  tipo: "PLACA_LISA" | "CORTE_ESPECIFICO";
  alias?: string;
  parede: string;
  largura?: number;
  altura?: number;
  espessura?: number;
  tramaEsquerdaId?: number | null;
  tramaDireitaId?: number | null;
  tramaSuperiorId?: number | null;
  tramaInferiorId?: number | null;
  reforco?: string;
  corteId?: number | null;
  quantidade?: number;
}

export interface OptionCorte {
  id: number;
  nome: string;
}

export interface OptionTrama {
  id: number;
  nome: string;
}

interface RequisitosEditorProps {
  requisitos: RequisitoOverride[];
  onChange: (requisitos: RequisitoOverride[]) => void;
  showParedes?: boolean;
  showQuantidade?: boolean;
}

const RequisitosEditor: React.FC<RequisitosEditorProps> = ({
  requisitos,
  onChange,
  showParedes = true,
  showQuantidade = false,
}) => {
  const [allCortes, setAllCortes] = useState<OptionCorte[]>([]);
  const [allTramas, setAllTramas] = useState<OptionTrama[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [corteRes, tramaRes] = await Promise.all([
          api.get(ENDPOINTS.CORTES),
          api.post(`${ENDPOINTS.TRAMAS}${ENDPOINTS.DATATABLE}`, {
            length: 500,
          }),
        ]);
        setAllCortes(
          Array.isArray(corteRes.data)
            ? corteRes.data
            : corteRes.data.data || [],
        );
        setAllTramas(
          Array.isArray(tramaRes.data)
            ? tramaRes.data
            : tramaRes.data.data || [],
        );
      } catch (error) {
        console.error("Erro ao carregar cortes e tramas", error);
      }
    };
    fetchData();
  }, []);

  const getGroupedRequisitos = () => {
    const groups: Record<string, RequisitoOverride[]> = {};
    if (!showParedes) {
      groups["Geral"] = requisitos;
      return groups;
    }

    requisitos.forEach((r) => {
      const p = r.parede || "Geral";
      if (!groups[p]) groups[p] = [];
      groups[p].push(r);
    });
    return groups;
  };

  const groupedRequisitos = getGroupedRequisitos();
  const paredes = Object.keys(groupedRequisitos);

  const handleUpdate = (idx: number, updatedItem: RequisitoOverride) => {
    const newReqs = [...requisitos];
    newReqs[idx] = updatedItem;
    onChange(newReqs);
  };

  const handleRemove = (idx: number) => {
    const newReqs = [...requisitos];
    newReqs.splice(idx, 1);
    onChange(newReqs);
  };

  const handleAddReq = (parede: string) => {
    onChange([
      ...requisitos,
      {
        tipo: "PLACA_LISA",
        parede,
        alias: "",
        largura: 100,
        altura: 200,
        espessura: 5,
        reforco: "S_P",
        quantidade: showQuantidade ? 1 : undefined,
      },
    ]);
  };

  const handleAddParede = () => {
    const currentParedes = Object.keys(groupedRequisitos);
    let nextNum = 1;
    while (currentParedes.includes(`Parede ${nextNum}`)) {
      nextNum++;
    }
    handleAddReq(`Parede ${nextNum}`);
  };

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
        {paredes.map((pNome) => (
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
                        size="small"
                        label="Nome da Parede"
                        value={pNome}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          const updated = requisitos.map((r) =>
                            r.parede === pNome ? { ...r, parede: newVal } : r,
                          );
                          onChange(updated);
                        }}
                        sx={{ bgcolor: "background.paper" }}
                      />
                    </Grid>
                    <Grid size="grow">
                      <Typography variant="caption" color="text.secondary">
                        {groupedRequisitos[pNome]?.length || 0} requisito(s)
                      </Typography>
                    </Grid>
                    <Grid size="auto">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja realmente excluir a ${pNome} e todos os seus requisitos?`,
                            )
                          ) {
                            const updated = requisitos.filter(
                              (r) => r.parede !== pNome,
                            );
                            onChange(updated);
                          }
                        }}
                        title="Excluir Parede"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                )}

                <Grid container spacing={2}>
                  {requisitos
                    .map((r, idx) => ({ ...r, originalIdx: idx }))
                    .filter((r) => !showParedes || r.parede === pNome)
                    .map((item) => (
                      <Grid size={12} key={item.originalIdx}>
                        <Card
                          variant="outlined"
                          sx={{ p: 1.5, bgcolor: "background.paper" }}
                        >
                          <Grid
                            container
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Grid container size={12}>
                              <Grid container size="grow">
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                      value={item.tipo}
                                      label="Tipo"
                                      onChange={(e) =>
                                        handleUpdate(item.originalIdx, {
                                          ...item,
                                          tipo: e.target.value as
                                            | "PLACA_LISA"
                                            | "CORTE_ESPECIFICO",
                                        })
                                      }
                                    >
                                      <MenuItem value="PLACA_LISA">
                                        Placa
                                      </MenuItem>
                                      <MenuItem value="CORTE_ESPECIFICO">
                                        Corte
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>

                                {showParedes && (
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Alias"
                                      placeholder="P01"
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

                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Reforço</InputLabel>
                                    <Select
                                      value={item.reforco || "S_P"}
                                      label="Reforço"
                                      onChange={(e) =>
                                        handleUpdate(item.originalIdx, {
                                          ...item,
                                          reforco: e.target.value,
                                        })
                                      }
                                    >
                                      <MenuItem value="S_P">S/P</MenuItem>
                                      <MenuItem value="UM_P">1P</MenuItem>
                                      <MenuItem value="DOIS_P">2P</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>

                                {showQuantidade && (
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Qtd"
                                      type="number"
                                      value={item.quantidade || ""}
                                      onChange={(e) =>
                                        handleUpdate(item.originalIdx, {
                                          ...item,
                                          quantidade:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </Grid>
                                )}
                              </Grid>

                              <Grid size="auto">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemove(item.originalIdx)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Grid>
                            </Grid>

                            {item.tipo === "PLACA_LISA" && (
                              <>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Largura (cm)"
                                    type="number"
                                    value={item.largura || ""}
                                    onChange={(e) =>
                                      handleUpdate(item.originalIdx, {
                                        ...item,
                                        largura:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Altura (cm)"
                                    type="number"
                                    value={item.altura || ""}
                                    onChange={(e) =>
                                      handleUpdate(item.originalIdx, {
                                        ...item,
                                        altura: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Espessura (cm)"
                                    type="number"
                                    value={item.espessura || ""}
                                    onChange={(e) =>
                                      handleUpdate(item.originalIdx, {
                                        ...item,
                                        espessura:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </Grid>
                              </>
                            )}

                            {item.tipo === "CORTE_ESPECIFICO" && (
                              <Grid size={12}>
                                <Autocomplete
                                  size="small"
                                  options={allCortes}
                                  getOptionLabel={(o) => o.nome}
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
                                      label="Corte do Catálogo"
                                    />
                                  )}
                                />
                              </Grid>
                            )}

                            <>
                              <Divider sx={{ width: "100%", my: 1 }} />
                              {/* TRAMAS */}
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Autocomplete
                                  size="small"
                                  options={allTramas}
                                  getOptionLabel={(o) => o.nome}
                                  value={
                                    allTramas.find(
                                      (t) => t.id === item.tramaEsquerdaId,
                                    ) || null
                                  }
                                  onChange={(_, v) =>
                                    handleUpdate(item.originalIdx, {
                                      ...item,
                                      tramaEsquerdaId: v?.id || null,
                                    })
                                  }
                                  renderInput={(params) => (
                                    <TextField {...params} label="Trama Esq." />
                                  )}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Autocomplete
                                  size="small"
                                  options={allTramas}
                                  getOptionLabel={(o) => o.nome}
                                  value={
                                    allTramas.find(
                                      (t) => t.id === item.tramaDireitaId,
                                    ) || null
                                  }
                                  onChange={(_, v) =>
                                    handleUpdate(item.originalIdx, {
                                      ...item,
                                      tramaDireitaId: v?.id || null,
                                    })
                                  }
                                  renderInput={(params) => (
                                    <TextField {...params} label="Trama Dir." />
                                  )}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Autocomplete
                                  size="small"
                                  options={allTramas}
                                  getOptionLabel={(o) => o.nome}
                                  value={
                                    allTramas.find(
                                      (t) => t.id === item.tramaSuperiorId,
                                    ) || null
                                  }
                                  onChange={(_, v) =>
                                    handleUpdate(item.originalIdx, {
                                      ...item,
                                      tramaSuperiorId: v?.id || null,
                                    })
                                  }
                                  renderInput={(params) => (
                                    <TextField {...params} label="Trama Sup." />
                                  )}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Autocomplete
                                  size="small"
                                  options={allTramas}
                                  getOptionLabel={(o) => o.nome}
                                  value={
                                    allTramas.find(
                                      (t) => t.id === item.tramaInferiorId,
                                    ) || null
                                  }
                                  onChange={(_, v) =>
                                    handleUpdate(item.originalIdx, {
                                      ...item,
                                      tramaInferiorId: v?.id || null,
                                    })
                                  }
                                  renderInput={(params) => (
                                    <TextField {...params} label="Trama Inf." />
                                  )}
                                />
                              </Grid>
                            </>
                          </Grid>
                        </Card>
                      </Grid>
                    ))}
                  <Grid size={12} sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddReq(pNome)}
                    >
                      {showParedes ? "Adicionar Requisito" : "Adicionar Item"}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {showParedes && (
          <Grid size={12}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ borderStyle: "dashed", py: 1.5 }}
              startIcon={<AddIcon />}
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
