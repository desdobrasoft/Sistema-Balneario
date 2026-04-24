// packages
import React, { useMemo } from "react";

// material-ui
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

// project
import { GeometriaCorte, type Point } from "pages/cortes/utils/geometria";

export interface VetorCorte {
  direcao: "UP" | "DOWN" | "LEFT" | "RIGHT";
  distancia: number;
}

interface PlacaCortePreviewProps {
  plateWidth: number;
  plateHeight: number;
  percurso: VetorCorte[];
  origemX: number;
  origemY: number;
  irmaos?: {
    id: number;
    nome: string;
    percurso: VetorCorte[];
    origemX: number;
    origemY: number;
    pontos?: Point[];
  }[];
  editingCorteId?: number | null;
  tramaEsquerda?: boolean;
  tramaDireita?: boolean;
  tramaSuperior?: boolean;
  tramaInferior?: boolean;
}

const getPathData = (
  percurso: VetorCorte[],
  ox: number,
  oy: number,
  plateHeight: number,
) => {
  let d = `M ${ox} ${plateHeight - oy} `;
  let curX = Number(ox);
  let curY = Number(oy);
  let minX = curX,
    maxX = curX,
    minY = curY,
    maxY = curY;

  for (const v of percurso) {
    const dist = Number(v.distancia);
    if (!dist) continue;
    switch (v.direcao) {
      case "UP":
        curY += dist;
        break;
      case "DOWN":
        curY -= dist;
        break;
      case "LEFT":
        curX -= dist;
        break;
      case "RIGHT":
        curX += dist;
        break;
    }
    d += `L ${curX} ${plateHeight - curY} `;
    minX = Math.min(minX, curX);
    maxX = Math.max(maxX, curX);
    minY = Math.min(minY, curY);
    maxY = Math.max(maxY, curY);
  }

  return { d, bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
};

export const CUT_COLORS = [
  "#4caf50", // Green
  "#ff9800", // Orange
  "#9c27b0", // Purple
  "#f44336", // Red
  "#00bcd4", // Cyan
  "#ffeb3b", // Yellow
  "#3f51b5", // Indigo
  "#e91e63", // Pink
];

const PlacaCortePreview: React.FC<PlacaCortePreviewProps> = ({
  plateWidth,
  plateHeight,
  percurso,
  origemX,
  origemY,
  irmaos = [],
  editingCorteId = null,
  tramaEsquerda,
  tramaDireita,
  tramaSuperior,
  tramaInferior,
}) => {
  const theme = useTheme();

  const { pathD, isInvalid, isOverlapping } = useMemo(() => {
    const { d, bbox } = getPathData(percurso, origemX, origemY, plateHeight);
    const boxInvalid =
      bbox.x < 0 ||
      bbox.y < 0 ||
      bbox.x + bbox.w > plateWidth ||
      bbox.y + bbox.h > plateHeight;

    // Detecção de Sobreposição em Tempo Real
    let overlapDetected = false;
    const currentPoints = GeometriaCorte.percursoParaPontos(
      { x: origemX, y: origemY },
      percurso,
    );

    if (currentPoints.length >= 2) {
      for (const irmao of irmaos) {
        // Se estivermos editando este corte, ignora a versão antiga dele para evitar auto-sobreposição
        if (editingCorteId && Number(irmao.id) === Number(editingCorteId))
          continue;

        // Se o backend não mandou pontos (ex: recém carregado sem reload), calculamos no voo
        const pontosIrmao =
          irmao.pontos ||
          GeometriaCorte.percursoParaPontos(
            { x: irmao.origemX, y: irmao.origemY },
            irmao.percurso,
          );

        if (GeometriaCorte.detectarSobreposicao(currentPoints, pontosIrmao)) {
          overlapDetected = true;
          break;
        }
      }
    }

    return {
      pathD: d,
      bbox,
      isInvalid: boxInvalid,
      isOverlapping: overlapDetected,
    };
  }, [
    percurso,
    origemX,
    origemY,
    plateWidth,
    plateHeight,
    irmaos,
    editingCorteId,
  ]);

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 0.5,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={`-6 -6 ${plateWidth + 12} ${plateHeight + 12}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          backgroundColor:
            theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
        }}
      >
        {/* Placa Original */}
        <rect
          x={0}
          y={0}
          width={plateWidth}
          height={plateHeight}
          fill={theme.palette.mode === "dark" ? "#2a2a2a" : "#e0e0e0"}
          stroke={theme.palette.divider}
          strokeWidth={0.5}
        />

        {/* Indicadores de Trama */}
        {tramaEsquerda && (
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={plateHeight}
            stroke="#1976d2"
            strokeWidth={1.5}
            strokeDasharray="2 1"
          />
        )}
        {tramaDireita && (
          <line
            x1={plateWidth}
            y1={0}
            x2={plateWidth}
            y2={plateHeight}
            stroke="#1976d2"
            strokeWidth={1.5}
            strokeDasharray="2 1"
          />
        )}
        {tramaSuperior && (
          <line
            x1={0}
            y1={0}
            x2={plateWidth}
            y2={0}
            stroke="#1976d2"
            strokeWidth={1.5}
            strokeDasharray="2 1"
          />
        )}
        {tramaInferior && (
          <line
            x1={0}
            y1={plateHeight}
            x2={plateWidth}
            y2={plateHeight}
            stroke="#1976d2"
            strokeWidth={1.5}
            strokeDasharray="2 1"
          />
        )}

        {/* Cortes "Irmãos" (Já existentes na placa) em Cores Variadas */}
        {irmaos.map((irmao, index) => {
          const { d } = getPathData(
            irmao.percurso,
            Number(irmao.origemX),
            Number(irmao.origemY),
            plateHeight,
          );

          const color = CUT_COLORS[index % CUT_COLORS.length];

          return (
            <g key={irmao.id}>
              <path
                d={d}
                fill={`${color}44`} // 44 is ~25% alpha in hex
                stroke={color}
                strokeWidth={1}
              />
              <text
                x={Number(irmao.origemX) + 2}
                y={plateHeight - Number(irmao.origemY) - 2}
                fontSize={4}
                fill={color}
                fontWeight="bold"
              >
                {irmao.nome}
              </text>
            </g>
          );
        })}

        {/* Corte Atual em Azul (Com destaque) */}
        <path
          d={pathD}
          fill={
            isInvalid || isOverlapping
              ? "rgba(244, 67, 54, 0.2)"
              : "rgba(33, 150, 243, 0.3)"
          }
          stroke={isInvalid || isOverlapping ? "#f44336" : "#2196f3"}
          strokeWidth={1}
        />

        {/* Corte Atual em Azul (Com destaque) - AGORA POR CIMA */}
        <path
          d={pathD}
          fill="none"
          stroke={isInvalid || isOverlapping ? "#f44336" : "#2196f3"}
          strokeWidth={2}
          strokeDasharray="4"
        />

        {/* Ponto de Origem */}
        <circle cx={origemX} cy={plateHeight - origemY} r={2} fill="#ff9800" />

        {/* Indicações de Eixo */}
        <text x={2} y={plateHeight - 2} fontSize={4} fill="#aaa">
          0,0
        </text>
        <text x={plateWidth - 10} y={plateHeight - 2} fontSize={4} fill="#aaa">
          W,0
        </text>
        <text x={2} y={6} fontSize={4} fill="#aaa">
          0,H
        </text>
      </svg>
    </Box>
  );
};

export default PlacaCortePreview;
