// packages
import { useEffect, useMemo, useState } from "react";

// icons
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// material-ui
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import api from "services/api";
import { StatusPagamentoVenda, TipoLancamento } from "types/enums";

// ===============================
// STAT CARD
// ===============================
const FinanceStatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%", borderLeft: 6, borderColor: color }}>
    <CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: "bold" }}
        >
          {title}
        </Typography>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)}
      </Typography>
    </CardContent>
  </Card>
);

// ===============================
// DASHBOARD COMPONENT
// ===============================
interface LancamentoData {
  tipo: TipoLancamento;
  statusPagamento: StatusPagamentoVenda;
  valorTotal: string;
  valorPendente: string;
}



const FinanceDashboard: React.FC = () => {
  const theme = useTheme();
  const handleError = useErrorHandler();
  const [data, setData] = useState<LancamentoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resLancamentos = await api.get(ENDPOINTS.LANCAMENTOS);
        setData(Array.isArray(resLancamentos.data) ? resLancamentos.data : []);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [handleError]);

  const stats = useMemo(() => {
    const receitas = data.filter((d) => d.tipo === TipoLancamento.R);
    const despesas = data.filter((d) => d.tipo === TipoLancamento.D);

    const receitasAtivas = receitas.filter(
      (d) =>
        d.statusPagamento !== StatusPagamentoVenda.CANCELADO &&
        d.statusPagamento !== StatusPagamentoVenda.ESTORNO_PENDENTE,
    );

    const totalRecebido = receitasAtivas.reduce(
      (sum, d) =>
        sum + (parseFloat(d.valorTotal) - parseFloat(d.valorPendente)),
      0,
    );
    const totalPago = despesas.reduce(
      (sum, d) =>
        sum + (parseFloat(d.valorTotal) - parseFloat(d.valorPendente)),
      0,
    );

    const aReceber = receitasAtivas.reduce(
      (sum, d) => sum + parseFloat(d.valorPendente),
      0,
    );

    const receitasEstornoPendente = receitas.filter(
      (d) => d.statusPagamento === StatusPagamentoVenda.ESTORNO_PENDENTE,
    );

    const valorAEstornar = receitasEstornoPendente.reduce(
      (sum, d) => sum + (parseFloat(d.valorTotal) - parseFloat(d.valorPendente)),
      0,
    );

    const aPagar =
      despesas.reduce((sum, d) => sum + parseFloat(d.valorPendente), 0) +
      valorAEstornar;

    return { totalRecebido, totalPago, aReceber, aPagar };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 3 }}>
        <FinanceStatCard
          title="Total Recebido"
          value={stats.totalRecebido}
          icon={<TrendingUpIcon />}
          color={theme.palette.success.main}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FinanceStatCard
          title="Total Pago"
          value={stats.totalPago}
          icon={<TrendingDownIcon />}
          color={theme.palette.error.main}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FinanceStatCard
          title="A Receber"
          value={stats.aReceber}
          icon={<ArrowCircleDownIcon />}
          color={theme.palette.info.main}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FinanceStatCard
          title="A Pagar"
          value={stats.aPagar}
          icon={<ArrowCircleUpIcon />}
          color={theme.palette.warning.main}
        />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboard;
