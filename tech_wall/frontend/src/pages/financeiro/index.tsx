// packages
import React, { useState } from "react";

// material-ui
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

// project imports
import FinanceDashboard from "./FinanceDashboard";
import LancamentosTable from "./LancamentosTable";
import NotasFiscaisTab from "./NotasFiscaisTab";
import PedidosCompraTable from "./PedidosCompraTable";

// ===============================
// PAGE COMPONENT
// ===============================
const Financeiro: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Stack>
          <Typography
            variant="h4"
            sx={{ lineHeight: 1, fontWeight: "bold", mt: 0.5 }}
          >
            Módulo Financeiro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie suas finanças, contas a pagar/receber e notas fiscais
          </Typography>
        </Stack>
      </Stack>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2, pt: 1 }}
        >
          <Tab label="Painel Financeiro" />
          <Tab label="Lançamentos" />
          <Tab label="Pedidos de Compra" />
          <Tab label="Notas Fiscais" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && <FinanceDashboard />}
          {tabValue === 1 && <LancamentosTable />}
          {tabValue === 2 && <PedidosCompraTable />}
          {tabValue === 3 && <NotasFiscaisTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default Financeiro;
