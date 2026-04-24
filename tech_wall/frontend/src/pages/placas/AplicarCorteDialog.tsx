// react imports
import React, { useCallback, useEffect, useMemo, useState } from "react";

// material-ui icons
import CloseIcon from "@mui/icons-material/Close";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";

// material-ui components
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import {
  GeometriaCorte,
  type Point,
  type VetorCorte,
} from "../cortes/utils/geometria";
import type { PlacaModel } from "./Form";

// ===============================
// INTERFACES
// ===============================

interface CorteOption {
  id: number;
  nome: string;
  percurso: VetorCorte[];
}

interface PlacaDerivada {
  id: number;
  nome: string;
  corteOrigemX: number | null;
  corteOrigemY: number | null;
  corteRotacao: number | null;
  formaCorte: CorteOption | null;
}

export interface AplicarCorteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  placa: PlacaModel | null;
}

export const CUT_COLORS = [
  "#2196f3", // Blue
  "#ff9800", // Orange
  "#9c27b0", // Purple
  "#00bcd4", // Cyan
  "#ffeb3b", // Yellow
  "#3f51b5", // Indigo
  "#e91e63", // Pink
  "#795548", // Brown
];

// ===============================
// MAIN COMPONENT
// ===============================

const PlacasAplicarCorteDialog: React.FC<AplicarCorteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  placa,
}) => {
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  // ===============================
  // STATE
  // ===============================

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cortes, setCortes] = useState<CorteOption[]>([]);
  const [cortesAplicados, setCortesAplicados] = useState<PlacaDerivada[]>([]);

  const [selectedCorte, setSelectedCorte] = useState<CorteOption | null>(null);
  const [origemX, setOrigemX] = useState<number>(0);
  const [origemY, setOrigemY] = useState<number>(0);
  const [rotacao, setRotacao] = useState<number>(0);
  const [nomePlacaFilha, setNomePlacaFilha] = useState("");
  const [placaCompleta, setPlacaCompleta] = useState<any>(null);

  // Dimensões derivadas da placa completa (buscada via GET)
  const placaLargura = placaCompleta?.largura
    ? Number(placaCompleta.largura)
    : 0;
  const placaAltura = placaCompleta?.altura ? Number(placaCompleta.altura) : 0;
  const placaReady = placaLargura > 0 && placaAltura > 0;

  // ===============================
  // DATA LOADING
  // ===============================

  const carregarDados = useCallback(async () => {
    if (!placa?.id) return;
    setLoading(true);
    try {
      const [resPlaca, resCortes, resAplicados] = await Promise.all([
        api.get(`${ENDPOINTS.PLACAS}/${placa.id}`),
        api.get(ENDPOINTS.CORTES),
        api.get(`${ENDPOINTS.PLACAS}/${placa.id}/cortes-aplicados`),
      ]);
      setPlacaCompleta(resPlaca.data);
      setCortes(resCortes.data);
      setCortesAplicados(resAplicados.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [placa, handleError]);

  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: resetting state on dialog open */
  useEffect(() => {
    if (open && placa) {
      carregarDados();
      setNomePlacaFilha("");
      setOrigemX(0);
      setOrigemY(0);
      setRotacao(0);
      setSelectedCorte(null);
      setPlacaCompleta(null);
    }
  }, [open, placa, carregarDados]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ===============================
  // GEOMETRY CALCULATIONS
  // ===============================

  const calcularPontosCorte = useCallback(
    (corte: CorteOption, ox: number, oy: number, rot: number): Point[] => {
      const percursoRot = GeometriaCorte.rotacionarPercurso(
        corte.percurso,
        rot,
      );
      return GeometriaCorte.percursoParaPontos({ x: ox, y: oy }, percursoRot);
    },
    [],
  );

  const calcularPontosDerivada = useCallback(
    (derivada: PlacaDerivada): Point[] => {
      if (!derivada.formaCorte) return [];
      return calcularPontosCorte(
        derivada.formaCorte,
        Number(derivada.corteOrigemX || 0),
        Number(derivada.corteOrigemY || 0),
        Number(derivada.corteRotacao || 0),
      );
    },
    [calcularPontosCorte],
  );

  const placaPontos = useMemo(() => {
    if (!placaCompleta?.formaCorte || !placaReady) return null;

    // Calcula os pontos da forma de corte original que gerou esta placa
    const pontosOriginais = calcularPontosCorte(
      placaCompleta.formaCorte,
      0,
      0,
      Number(placaCompleta.corteRotacao || 0),
    );

    // Calcula o bounding box para normalizar a origem para (0,0) local
    const bbox = GeometriaCorte.calcularBoundingBox(pontosOriginais);

    // Desloca os pontos para que o bounding box comece em (0,0)
    return pontosOriginais.map((p) => ({
      x: p.x - bbox.x,
      y: p.y - bbox.y,
    }));
  }, [placaCompleta, placaReady, calcularPontosCorte]);

  const { pontosCorte, bboxCorte, foraDosLimites, overlaps } = useMemo(() => {
    const vazio = {
      pontosCorte: [] as Point[],
      bboxCorte: { x: 0, y: 0, width: 0, height: 0 },
      foraDosLimites: false,
      overlaps: false,
    };
    if (!selectedCorte || !placaReady) return vazio;

    const pontos = calcularPontosCorte(
      selectedCorte,
      origemX,
      origemY,
      rotacao,
    );
    const bbox = GeometriaCorte.calcularBoundingBox(pontos);

    let fora =
      bbox.x < -0.01 ||
      bbox.y < -0.01 ||
      bbox.x + bbox.width > placaLargura + 0.01 ||
      bbox.y + bbox.height > placaAltura + 0.01;

    // Se a placa for irregular (filha), validação geométrica rigorosa contra o polígono
    if (!fora && placaPontos) {
      // 1. Verifica se todos os vértices do corte estão dentro ou na borda da placa
      for (const p of pontos) {
        const noPoligono = GeometriaCorte.pontoNoPoligono(p, placaPontos);
        const naBorda = GeometriaCorte.pontoNaBorda(p, placaPontos);
        if (!noPoligono && !naBorda) {
          fora = true;
          break;
        }
      }

      // 2. Verifica se algum segmento do corte cruza as bordas da placa
      if (!fora) {
        const segsCorte = GeometriaCorte.pontosParaSegmentos(pontos);
        const segsPlaca = GeometriaCorte.pontosParaSegmentos(placaPontos);
        for (const sc of segsCorte) {
          for (const sp of segsPlaca) {
            if (GeometriaCorte.segmentosCruzam(sc, sp)) {
              fora = true;
              break;
            }
          }
          if (fora) break;
        }
      }
    }

    let isOverlapping = false;
    for (const aplicado of cortesAplicados) {
      const ptsAplicado = calcularPontosDerivada(aplicado);
      if (ptsAplicado.length === 0) continue;
      if (GeometriaCorte.detectarSobreposicao(pontos, ptsAplicado)) {
        isOverlapping = true;
        break;
      }
    }

    return {
      pontosCorte: pontos,
      bboxCorte: bbox,
      foraDosLimites: fora,
      overlaps: isOverlapping,
    };
  }, [
    selectedCorte,
    origemX,
    origemY,
    rotacao,
    placaReady,
    placaLargura,
    placaAltura,
    cortesAplicados,
    calcularPontosCorte,
    calcularPontosDerivada,
    placaPontos,
  ]);

  const isInvalid = foraDosLimites || overlaps;

  // ===============================
  // HANDLERS
  // ===============================

  const handleRotateLeft = () => {
    setRotacao((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotacao((prev) => (prev + 90) % 360);
  };

  const handleXChange = (val: string) => {
    const clean = val.replace(",", ".");
    const n = parseFloat(clean);
    if (!isNaN(n)) setOrigemX(n);
    else if (val === "") setOrigemX(0);
  };

  const handleYChange = (val: string) => {
    const clean = val.replace(",", ".");
    const n = parseFloat(clean);
    if (!isNaN(n)) setOrigemY(n);
    else if (val === "") setOrigemY(0);
  };

  const cortesFiltrados = useMemo(() => {
    if (!placaCompleta?.formaCorteId) return cortes;
    return cortes.filter((c) => c.id !== placaCompleta.formaCorteId);
  }, [cortes, placaCompleta]);

  // ===============================
  // SVG HELPERS
  // ===============================

  const toSvgPath = useCallback(
    (pontos: Point[]): string => {
      if (pontos.length === 0) return "";
      const parts = pontos.map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${placaAltura - p.y}`,
      );
      return parts.join(" ") + " Z";
    },
    [placaAltura],
  );

  const placaPath = useMemo(() => {
    if (!placaPontos) return "";
    return toSvgPath(placaPontos);
  }, [placaPontos, toSvgPath]);

  const handleApply = async () => {
    if (!placa || !selectedCorte || !nomePlacaFilha.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`${ENDPOINTS.PLACAS}/${placa.id}/aplicar-corte`, {
        corteId: selectedCorte.id,
        origemX,
        origemY,
        rotacao,
        nomePlacaFilha: nomePlacaFilha.trim(),
      });

      showSnackbar({
        message: "Corte aplicado com sucesso!",
        severity: "success",
      });
      onSuccess();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // SVG HELPERS
  // ===============================

  // ===============================
  // RENDER
  // ===============================

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
      <DialogTitle>
        Aplicar Corte
        {placa && placaReady && (
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            — Placa {placa.nome || placaCompleta?.nome} ({placaLargura} x{" "}
            {placaAltura} cm)
          </Typography>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ overflow: "hidden", display: "flex", p: 2 }}
      >
        {loading || !placa || !placaReady ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            {!placaReady && placa && !loading ? (
              <Alert severity="warning">
                Placa sem dimensões válidas (largura ou altura = 0).
              </Alert>
            ) : (
              <CircularProgress />
            )}
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ flex: 1, overflow: "hidden" }}>
            {/* ===== ESQUERDA: Controles (Form) ===== */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ overflow: "auto" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Sliders em L + botões de rotação dentro de um "quadrado" */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {/* Corpo: Slider Y à esquerda + centro com botões */}
                  <Box sx={{ display: "flex", flex: 1 }}>
                    {/* Slider Y vertical */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: 40,
                        mr: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Y
                      </Typography>
                      <Slider
                        orientation="vertical"
                        value={origemY}
                        min={0}
                        max={placaAltura}
                        step={0.1}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) =>
                          v.toLocaleString("pt-BR", {
                            maximumFractionDigits: 1,
                          })
                        }
                        onChange={(_, val) => setOrigemY(val as number)}
                        disabled={!selectedCorte}
                        sx={{ minHeight: 120 }}
                      />
                      <TextField
                        size="small"
                        value={origemY}
                        onChange={(e) => handleYChange(e.target.value)}
                        disabled={!selectedCorte}
                        slotProps={{
                          htmlInput: {
                            step: 0.1,
                            type: "number",
                            style: {
                              textAlign: "center",
                              padding: "4px",
                              fontSize: "12px",
                            },
                          },
                        }}
                        sx={{ mt: 1, width: 50 }}
                      />
                    </Box>

                    {/* Centro: botões de rotação */}
                    <Box
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Tooltip title="Rotacionar 90° anti-horário">
                        <span>
                          <IconButton
                            onClick={handleRotateLeft}
                            disabled={!selectedCorte || submitting}
                            color="primary"
                            size="large"
                          >
                            <RotateLeftIcon fontSize="large" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ minWidth: 40, textAlign: "center" }}
                      >
                        {rotacao}°
                      </Typography>
                      <Tooltip title="Rotacionar 90° horário">
                        <span>
                          <IconButton
                            onClick={handleRotateRight}
                            disabled={!selectedCorte || submitting}
                            color="primary"
                            size="large"
                          >
                            <RotateRightIcon fontSize="large" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Slider X horizontal (borda inferior do "quadrado") */}
                  <Box sx={{ mt: 1, ml: "40px" }}>
                    <Slider
                      value={origemX}
                      min={0}
                      max={placaLargura}
                      step={0.1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) =>
                        v.toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })
                      }
                      onChange={(_, val) => setOrigemX(val as number)}
                      disabled={!selectedCorte}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        X: 0
                      </Typography>
                      <TextField
                        size="small"
                        value={origemX}
                        onChange={(e) => handleXChange(e.target.value)}
                        disabled={!selectedCorte}
                        slotProps={{
                          htmlInput: {
                            step: 0.1,
                            type: "number",
                            style: {
                              textAlign: "center",
                              padding: "4px",
                              fontSize: "12px",
                            },
                          },
                        }}
                        sx={{ width: 60 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {placaLargura}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Seletor de Corte */}
                <Autocomplete
                  options={cortesFiltrados}
                  getOptionLabel={(option) => option.nome}
                  value={selectedCorte}
                  onChange={(_, newValue) => {
                    setSelectedCorte(newValue);
                    setOrigemX(0);
                    setOrigemY(0);
                    setRotacao(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Selecionar Corte"
                      size="small"
                      fullWidth
                    />
                  )}
                  disabled={loading || submitting}
                />

                {/* Nome da Placa Filha */}
                <TextField
                  label="Nome da Placa Filha"
                  size="small"
                  fullWidth
                  value={nomePlacaFilha}
                  onChange={(e) => setNomePlacaFilha(e.target.value)}
                  disabled={submitting}
                  required
                  helperText="Deve ser único no sistema"
                />

                {/* Info/Alertas */}
                {selectedCorte && (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      sx={{ display: "block" }}
                    >
                      Bounding Box do Corte
                    </Typography>
                    <Typography variant="body2">
                      {bboxCorte.width.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      x{" "}
                      {bboxCorte.height.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      cm
                    </Typography>
                  </Box>
                )}

                {foraDosLimites && (
                  <Alert severity="error" variant="outlined">
                    O corte ultrapassa os limites da placa.
                  </Alert>
                )}
                {overlaps && (
                  <Alert severity="error" variant="outlined">
                    Sobreposição com corte já aplicado.
                  </Alert>
                )}
                {cortesAplicados.length > 0 && (
                  <Alert severity="info" variant="outlined">
                    {cortesAplicados.length} corte(s) já aplicado(s).
                  </Alert>
                )}
              </Box>
            </Grid>

            {/* ===== DIREITA: Workspace SVG ===== */}
            <Grid
              size={{ xs: 12, md: 8 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                minHeight: 0,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  bgcolor: "grey.100",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  aspectRatio: `${placaLargura} / ${placaAltura}`,
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${placaLargura} ${placaAltura}`}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ display: "block" }}
                >
                  {/* Placa Mãe (fundo) */}
                  {placaPath ? (
                    <path
                      d={placaPath}
                      fill="#e8e8e8"
                      stroke="#999"
                      strokeWidth={0.5}
                    />
                  ) : (
                    <rect
                      x={0}
                      y={0}
                      width={placaLargura}
                      height={placaAltura}
                      fill="#e8e8e8"
                      stroke="#999"
                      strokeWidth={0.5}
                    />
                  )}

                  {/* Cortes já aplicados */}
                  {cortesAplicados.map((aplicado, index) => {
                    const pts = calcularPontosDerivada(aplicado);
                    if (pts.length === 0) return null;
                    const color = CUT_COLORS[index % CUT_COLORS.length];
                    const bbox = GeometriaCorte.calcularBoundingBox(pts);

                    return (
                      <g key={aplicado.id}>
                        <path
                          d={toSvgPath(pts)}
                          fill={`${color}44`}
                          stroke={color}
                          strokeWidth={0.8}
                        />
                        <text
                          x={bbox.x + bbox.width / 2}
                          y={placaAltura - (bbox.y + bbox.height / 2)}
                          fontSize={Math.max(2, placaAltura / 40)}
                          fill={color}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ pointerEvents: "none" }}
                        >
                          {aplicado.nome}
                        </text>
                      </g>
                    );
                  })}

                  {/* Corte atual sendo posicionado */}
                  {selectedCorte && pontosCorte.length > 0 && (
                    <path
                      d={toSvgPath(pontosCorte)}
                      fill={
                        isInvalid
                          ? "rgba(244, 67, 54, 0.45)"
                          : "rgba(76, 175, 80, 0.45)"
                      }
                      stroke={isInvalid ? "#d32f2f" : "#2e7d32"}
                      strokeWidth={1.5}
                      strokeDasharray={isInvalid ? "4 2" : "none"}
                    />
                  )}
                </svg>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={
            !selectedCorte || isInvalid || submitting || !nomePlacaFilha.trim()
          }
        >
          {submitting ? <CircularProgress size={24} /> : "Aplicar Corte"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlacasAplicarCorteDialog;
