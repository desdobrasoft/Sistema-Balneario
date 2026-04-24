// packages
import React, { useMemo } from "react";

// material-ui
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface TramaPreviewProps {
  values: {
    alturaBase: number;
    profundidadeSaliencia: number;
    iniciaComSaliencia: boolean;
    direcionamento: string;
    cortes: number[];
  };
}

const TramaPreview: React.FC<TramaPreviewProps> = ({ values }) => {
  const { profundidadeSaliencia, iniciaComSaliencia, direcionamento, cortes } =
    values;

  const totalHeight = useMemo(() => {
    const sum = cortes?.reduce((acc, val) => acc + (Number(val) || 0), 0) || 0;
    return sum > 0 ? sum : 100; // fallback to 100 se vazio
  }, [cortes]);

  const { pathD, labels } = useMemo(() => {
    let d = "";
    const baseWidth = 50;
    const salienciaSize = Number(profundidadeSaliencia) || 0;
    let isSaliencia = iniciaComSaliencia;
    const labelElements: React.ReactNode[] = [];

    if (!cortes || cortes.length === 0) {
      return {
        pathD: `M 0 ${totalHeight} L ${baseWidth} ${totalHeight} L ${baseWidth} 0 L 0 0 Z`,
        labels: [],
      };
    }

    let currentY = totalHeight;

    if (direcionamento === "DIREITA") {
      d += `M 0 ${totalHeight} L ${baseWidth} ${totalHeight} `;

      cortes.forEach((c, index) => {
        const h = Number(c) || 0;
        const newY = currentY - h;

        if (isSaliencia) {
          d += `L ${baseWidth + salienciaSize} ${currentY} `;
          d += `L ${baseWidth + salienciaSize} ${newY} `;
          d += `L ${baseWidth} ${newY} `;
        } else {
          // reentrância (cova)
          d += `L ${baseWidth} ${currentY} `;
          d += `L ${baseWidth} ${newY} `;
        }

        // Adiciona label no meio do corte
        const midY = currentY - h / 2;
        labelElements.push(
          <text
            key={index}
            x={baseWidth - 4}
            y={midY}
            fontSize={7}
            fontWeight="bold"
            fill="#555"
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {Number(h).toFixed(2)}cm
          </text>,
        );

        currentY = newY;
        isSaliencia = !isSaliencia;
      });

      d += `L 0 ${currentY} Z`;
    } else {
      // ESQUERDA
      const rightEdge = 100;
      d += `M ${rightEdge} ${totalHeight} L ${baseWidth} ${totalHeight} `;

      cortes.forEach((c, index) => {
        const h = Number(c) || 0;
        const newY = currentY - h;

        if (isSaliencia) {
          d += `L ${baseWidth - salienciaSize} ${currentY} `;
          d += `L ${baseWidth - salienciaSize} ${newY} `;
          d += `L ${baseWidth} ${newY} `;
        } else {
          // reentrância
          d += `L ${baseWidth} ${currentY} `;
          d += `L ${baseWidth} ${newY} `;
        }

        // Adiciona label no meio do corte
        const midY = currentY - h / 2;
        labelElements.push(
          <text
            key={index}
            x={baseWidth + 4}
            y={midY}
            fontSize={7}
            fontWeight="bold"
            fill="#555"
            textAnchor="start"
            alignmentBaseline="middle"
          >
            {Number(h).toFixed(2)}cm
          </text>,
        );

        currentY = newY;
        isSaliencia = !isSaliencia;
      });

      d += `L ${rightEdge} ${currentY} Z`;
    }
    // Adiciona label de Altura Total na borda reta
    if (direcionamento === "DIREITA") {
      labelElements.push(
        <text
          key="total-height"
          x={10}
          y={totalHeight / 2}
          fontSize={7}
          fontWeight="bold"
          fill="#555"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${totalHeight / 2})`}
        >
          {Number(totalHeight).toFixed(2)}cm
        </text>,
      );
    } else {
      labelElements.push(
        <text
          key="total-height"
          x={90}
          y={totalHeight / 2}
          fontSize={7}
          fontWeight="bold"
          fill="#555"
          textAnchor="middle"
          transform={`rotate(90, 90, ${totalHeight / 2})`}
        >
          {Number(totalHeight).toFixed(2)}cm
        </text>,
      );
    }

    // Adiciona label da Saliência na base
    const saliencyX =
      direcionamento === "DIREITA"
        ? baseWidth + salienciaSize / 2
        : baseWidth - salienciaSize / 2;
    labelElements.push(
      <text
        key="saliency-depth"
        x={saliencyX}
        y={totalHeight + 8}
        fontSize={7}
        fontWeight="bold"
        fill="#777"
        textAnchor="middle"
      >
        Saliência: {Number(salienciaSize).toFixed(2)}cm
      </text>,
    );

    return { pathD: d, labels: labelElements };
  }, [
    profundidadeSaliencia,
    iniciaComSaliencia,
    direcionamento,
    cortes,
    totalHeight,
  ]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.paper",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        minHeight: 520,
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: "bold", mb: 1 }}
      >
        Preview da Trama
      </Typography>
      <Box
        sx={{
          height: 450,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox={`0 0 100 ${totalHeight + 12}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            height: "100%",
            width: "100%",
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))",
          }}
        >
          <path
            d={pathD}
            fill="#e0e0e0"
            stroke="#9e9e9e"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {labels}
        </svg>
      </Box>
    </Box>
  );
};

export default TramaPreview;
