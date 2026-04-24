// packages
import React, { useEffect, useMemo, useState } from "react";

// icons
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

// material-ui
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
import PlacaCortePreview, {
  type VetorCorte,
} from "pages/placas/PlacaCortePreview";

export interface CorteModel {
  id?: number;
  nome: string;
  percurso: VetorCorte[];
  largura?: number;
  altura?: number;
}

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CorteModel) => void;
  initialValues?: CorteModel | null;
}

const DIRECTION_ICONS: Record<string, React.ReactNode> = {
  UP: <ArrowUpwardIcon fontSize="small" />,
  DOWN: <ArrowDownwardIcon fontSize="small" />,
  LEFT: <ArrowLeftIcon fontSize="small" />,
  RIGHT: <ArrowRightIcon fontSize="small" />,
};

const FormCorte: React.FC<FormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [nome, setNome] = useState("");
  const [percurso, setPercurso] = useState<VetorCorte[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: resetting form state on dialog open */
  useEffect(() => {
    if (open) {
      if (initialValues) {
        setNome(initialValues.nome || "");
        setPercurso(initialValues.percurso || []);
      } else {
        setNome("");
        setPercurso([]);
      }
    }
  }, [open, initialValues]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAddVetor = () => {
    setPercurso([...percurso, { direcao: "RIGHT", distancia: 0 }]);
  };

  const handleRemoveVetor = (index: number) => {
    const newPercurso = [...percurso];
    newPercurso.splice(index, 1);
    setPercurso(newPercurso);
  };

  const handleChangeVetor = (
    index: number,
    field: keyof VetorCorte,
    value: string | number,
  ) => {
    const newPercurso = [...percurso];
    newPercurso[index] = { ...newPercurso[index], [field]: value };
    setPercurso(newPercurso);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPercurso = percurso.filter((v) => v.distancia > 0);
    onSubmit({
      id: initialValues?.id,
      nome,
      percurso: validPercurso,
    });
  };

  // Calcula tamanho ideal do preview
  const previewBox = useMemo(() => {
    let curX = 0,
      curY = 0;
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;

    for (const v of percurso) {
      const dist = Number(v.distancia) || 0;
      if (v.direcao === "UP") curY += dist;
      if (v.direcao === "DOWN") curY -= dist;
      if (v.direcao === "LEFT") curX -= dist;
      if (v.direcao === "RIGHT") curX += dist;
      if (curX < minX) minX = curX;
      if (curX > maxX) maxX = curX;
      if (curY < minY) minY = curY;
      if (curY > maxY) maxY = curY;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      plateWidth: Math.max(100, width + 40),
      plateHeight: Math.max(100, height + 40),
      origemX: Math.abs(minX) + 20,
      origemY: Math.abs(minY) + 20,
      calcWidth: width,
      calcHeight: height,
      isClosed: curX === 0 && curY === 0,
      curX,
      curY,
    };
  }, [percurso]);

  const isValid =
    nome.trim() !== "" &&
    percurso.filter((v) => v.distancia > 0).length >= 3 &&
    previewBox.isClosed;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: "calc(100vh - 64px)",
            maxHeight: "calc(100vh - 64px)",
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {initialValues?.id ? "Editar Corte" : "Novo Corte"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <Grid container spacing={3} sx={{ flex: 1, overflow: "hidden" }}>
            {/* Lado Esquerdo: Formulário */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ height: "100%", overflowY: "auto", pr: 1 }}
            >
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nome do Corte"
                  value={nome}
                  size="small"
                  onChange={(e) => setNome(e.target.value)}
                  required
                />

                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        Percurso Geométrico
                      </Typography>
                    </Stack>

                    {percurso.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 2 }}
                      >
                        Nenhum vetor adicionado.
                      </Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        {percurso.map((v, index) => (
                          <Grid
                            container
                            key={index}
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <Grid size={5}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Direção</InputLabel>
                                <Select
                                  value={v.direcao}
                                  label="Direção"
                                  onChange={(e) =>
                                    handleChangeVetor(
                                      index,
                                      "direcao",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <MenuItem value="UP">
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: "center" }}
                                    >
                                      {DIRECTION_ICONS["UP"]}{" "}
                                      <Typography>Cima</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="DOWN">
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: "center" }}
                                    >
                                      {DIRECTION_ICONS["DOWN"]}{" "}
                                      <Typography>Baixo</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="LEFT">
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: "center" }}
                                    >
                                      {DIRECTION_ICONS["LEFT"]}{" "}
                                      <Typography>Esquerda</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="RIGHT">
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: "center" }}
                                    >
                                      {DIRECTION_ICONS["RIGHT"]}{" "}
                                      <Typography>Direita</Typography>
                                    </Stack>
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid size="grow">
                              <TextField
                                fullWidth
                                size="small"
                                label="Tamanho (cm)"
                                type="number"
                                value={v.distancia === 0 ? "" : v.distancia}
                                onChange={(e) =>
                                  handleChangeVetor(
                                    index,
                                    "distancia",
                                    Number(e.target.value),
                                  )
                                }
                                slotProps={{
                                  htmlInput: { min: 0, step: "0.1" },
                                }}
                                sx={{ flexGrow: 1 }}
                              />
                            </Grid>

                            <Grid size="auto">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveVetor(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}
                      </Stack>
                    )}

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderStyle: "dashed", py: 1.5, mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={handleAddVetor}
                    >
                      Novo Vetor
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Lado Direito: Preview */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ height: "100%" }}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Visualização da Forma
                </Typography>

                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 0,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                  }}
                >
                  {percurso.length > 0 ? (
                    <PlacaCortePreview
                      plateWidth={previewBox.plateWidth}
                      plateHeight={previewBox.plateHeight}
                      percurso={percurso.filter((v) => v.distancia > 0)}
                      origemX={previewBox.origemX}
                      origemY={previewBox.origemY}
                    />
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      Adicione vetores para desenhar a forma.
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Largura Estimada: <strong>{previewBox.calcWidth} cm</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Altura Estimada: <strong>{previewBox.calcHeight} cm</strong>
                  </Typography>
                </Box>

                {!previewBox.isClosed &&
                  percurso.filter((v) => v.distancia > 0).length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      O percurso do corte deve ser fechado.
                      <br />
                      <b>
                        {" "}
                        X: {previewBox.curX > 0 ? "+" : ""}
                        {previewBox.curX.toLocaleString("pt-BR", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        , Y: {previewBox.curY > 0 ? "+" : ""}
                        {previewBox.curY.toLocaleString("pt-BR", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        cm{" "}
                      </b>
                      da origem.
                    </Alert>
                  )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid}>
            Salvar Corte
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormCorte;
