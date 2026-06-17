import React, { useEffect, useState } from "react";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { BarChart, PieChart } from "@mui/x-charts";

import { ENDPOINTS } from "config/endpoints";
import api from "services/api";
import {
  StatusProducao,
  StatusProducaoColors,
  StatusProducaoLabels
} from "types/enums";

interface DashboardStats {
  totalSalesValue: number;
  activeProdsCount: number;
  avgDeliveryTime: string;
  monthlySales: { month: string; sales: number }[];
  productionStatus: { label: string; value: number; color: string }[];
  deliveryAnalysis: { label: string; value: number; color: string }[];
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%", display: "flex", alignItems: "center", p: 1 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
        borderRadius: 2,
        backgroundColor: `${color}15`,
        color: color,
        m: 1,
      }}
    >
      {icon}
    </Box>
    <CardContent sx={{ p: "0 !important" }}>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        
        const res = await api.get(`${ENDPOINTS.DASHBOARD.STATS}?${params.toString()}`);
        const data = res.data;

        // Mapeia status de produção para labels e cores do frontend
        const productionStatusFormatted = data.productionStatus.map((s: { status: StatusProducao, count: number }) => ({
          label: StatusProducaoLabels[s.status as StatusProducao] || s.status,
          value: s.count,
          color: StatusProducaoColors[s.status as StatusProducao] || "#ccc",
        }));

        // Mapeia análise de entrega
        const deliveryAnalysisFormatted = [
          {
            label: "Adiantadas",
            value: data.deliveryAnalysis.early || 0,
            color: "#00C49F",
          },
          {
            label: "Em Dia",
            value: data.deliveryAnalysis.onTime || 0,
            color: "#0088FE",
          },
          {
            label: "Leve Atraso",
            value: data.deliveryAnalysis.slightlyLate || 0,
            color: "#FFBB28",
          },
          {
            label: "Atrasadas",
            value: data.deliveryAnalysis.late || 0,
            color: "#FF0000",
          },
        ];

        setStats({
          ...data,
          productionStatus: productionStatusFormatted,
          deliveryAnalysis: deliveryAnalysisFormatted,
        });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading || !stats) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Filtro de Período
          </Typography>
          <TextField
            label="Data Inicial"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
          />
          <TextField
            label="Data Final"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
          />
          <Button
            variant="outlined"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar
          </Button>
        </Paper>
      </Grid>
      
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Total em Vendas"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(stats.totalSalesValue)}
          icon={<TrendingUpIcon fontSize="large" />}
          color={theme.palette.primary.main}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Produções Ativas"
          value={stats.activeProdsCount}
          icon={<PrecisionManufacturingIcon fontSize="large" />}
          color={theme.palette.warning.main}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Tempo Médio de Entrega"
          value={stats.avgDeliveryTime}
          icon={<AccessTimeIcon fontSize="large" />}
          color={theme.palette.success.main}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, height: "100%" }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Visão Mensal de Vendas
          </Typography>
          <Box sx={{ width: "100%", height: 350 }}>
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: stats.monthlySales.map((d) => d.month),
                },
              ]}
              series={[
                {
                  data: stats.monthlySales.map((d) => d.sales),
                  label: "Vendas (R$)",
                  color: theme.palette.primary.main,
                },
              ]}
              height={350}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, height: "100%" }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Status de Produção
          </Typography>
          <Box sx={{ width: "100%", height: 350 }}>
            <PieChart
              series={[
                {
                  data: stats.productionStatus.map((s, i) => ({
                    id: i,
                    value: s.value,
                    label: s.label,
                    color: s.color,
                  })),
                  innerRadius: 60,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              height={300}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Análise de Pontualidade de Entregas
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 300,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <PieChart
              series={[
                {
                  data: stats.deliveryAnalysis.map((s, i) => ({
                    id: i,
                    value: s.value,
                    label: s.label,
                    color: s.color,
                  })),
                  highlightScope: { fade: "global", highlight: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                },
              ]}
              width={500}
              height={300}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
