import { useEffect, useState } from "react";

// icons
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import MoveDownIcon from "@mui/icons-material/MoveDown";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// material-ui
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// project imports
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import api from "services/api";

// ===============================
// STAT CARD (same pattern as FinanceDashboard)
// ===============================
const StatCard: React.FC<{
  title: string;
  value: string | number;
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
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// ===============================
// TYPES
// ===============================
interface DashboardStats {
  itensDistintos: number;
  estoqueBaixo: number;
  ultimaEntrada: string | null;
  ultimaSaida: string | null;
}

interface LowStockItem {
  id: number;
  item: string;
  quantidade: number;
  unidade?: string;
  estoqueMinimo: number;
}

interface MateriaPrimaDashboardProps {
  onOpenPedidoCompra?: (material: LowStockItem) => void;
}

// ===============================
// DASHBOARD COMPONENT
// ===============================
const MateriaPrimaDashboard: React.FC<MateriaPrimaDashboardProps> = ({
  onOpenPedidoCompra,
}) => {
  const theme = useTheme();
  const handleError = useErrorHandler();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, materiaisRes] = await Promise.all([
          api.get(`${ENDPOINTS.MATERIA_PRIMA}/dashboard-stats`),
          api.get(ENDPOINTS.MATERIA_PRIMA),
        ]);
        setStats(statsRes.data);

        // filter low stock items
        const allItems = Array.isArray(materiaisRes.data)
          ? materiaisRes.data
          : materiaisRes.data.data || [];
        const low = allItems.filter(
          (m: { estoqueMinimo?: number; quantidade: number }) => m.estoqueMinimo != null && m.quantidade < m.estoqueMinimo,
        );
        setLowStockItems(low);
      } catch (error) {
        handleError(error);
      }
    };
    fetchData();
  }, [handleError]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  if (!stats) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Stat Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Itens Distintos"
            value={stats.itensDistintos}
            icon={<InventoryIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Estoque Baixo"
            value={stats.estoqueBaixo}
            icon={<WarningAmberIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Última Entrada"
            value={formatDate(stats.ultimaEntrada)}
            icon={<MoveDownIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Última Saída"
            value={formatDate(stats.ultimaSaida)}
            icon={<MoveUpIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ "& .MuiAlert-message": { width: "100%" } }}
        >
          <AlertTitle sx={{ fontWeight: "bold" }}>
            Materiais com Estoque Abaixo do Limite
          </AlertTitle>
          <List dense disablePadding>
            {lowStockItems.map((item: LowStockItem) => (
              <ListItem
                key={item.id}
                disableGutters
                secondaryAction={
                  onOpenPedidoCompra && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => onOpenPedidoCompra(item)}
                    >
                      Abrir Pedido
                    </Button>
                  )
                }
              >
                <ListItemText
                  primary={<strong>{item.item}</strong>}
                  secondary={
                    <Typography component="span" variant="body2" color="warning.dark">
                      {`Em estoque: ${item.quantidade} ${item.unidade || ""} — Mínimo: ${item.estoqueMinimo}`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {lowStockItems.length === 0 && (
        <Alert severity="success" variant="outlined">
          Todos os materiais estão com estoque acima do limite mínimo.
        </Alert>
      )}
    </Box>
  );
};

export default MateriaPrimaDashboard;
