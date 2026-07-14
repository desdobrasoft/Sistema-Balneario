import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import { AuthGuard, GuestGuard, PermissionGuard } from "components/AuthGuard";
import DashboardLayout from "layouts/DashboardLayout";
import Clientes from "pages/clientes";
import Cortes from "pages/cortes";
import Dashboard from "pages/dashboard";
import Entregas from "pages/entregas";
import Financeiro from "pages/financeiro";
import Login from "pages/login";
import MateriaPrima from "pages/materia-prima";
import Modelos from "pages/modelos";
import Placas from "pages/placas";
import Producao from "pages/producao";
import Roles from "pages/roles";
import SessionExpired from "pages/session-expired";
import TiposPlaca from "pages/tipos-placa";
import Tramas from "pages/tramas";
import Users from "pages/usuarios";
import Vendas from "pages/vendas";
import DialogProvider from "providers/DialogProvider";
import SnackbarProvider from "providers/SnackbarProvider";
import { useThemeStore } from "store/themeStore";
import { getTheme } from "theme/theme";

function App() {
  const { mode } = useThemeStore();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <DialogProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/sessao-expirada" element={<SessionExpired />} />

              <Route element={<GuestGuard />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route element={<AuthGuard />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />

                  <Route element={<PermissionGuard permission="admin" />}>
                    <Route path="usuarios" element={<Users />} />
                  </Route>

                  <Route element={<PermissionGuard permission="admin" />}>
                    <Route path="cargos" element={<Roles />} />
                  </Route>

                  <Route element={<PermissionGuard permission="clientes" />}>
                    <Route path="clientes" element={<Clientes />} />
                  </Route>

                  <Route element={<PermissionGuard permission="modelos" />}>
                    <Route path="modelos" element={<Modelos />} />
                  </Route>

                  <Route element={<PermissionGuard permission="vendas" />}>
                    <Route path="vendas" element={<Vendas />} />
                  </Route>

                  <Route element={<PermissionGuard permission="producao" />}>
                    <Route path="producao" element={<Producao />} />
                  </Route>

                  <Route element={<PermissionGuard permission="entregas" />}>
                    <Route path="entregas" element={<Entregas />} />
                  </Route>

                  <Route element={<PermissionGuard permission="financeiro" />}>
                    <Route path="financeiro" element={<Financeiro />} />
                  </Route>

                  <Route element={<PermissionGuard permission="estoque" />}>
                    <Route path="materia-prima" element={<MateriaPrima />} />
                  </Route>

                  <Route element={<PermissionGuard permission="placas" />}>
                    <Route path="tipos-placa" element={<TiposPlaca />} />
                  </Route>

                  <Route element={<PermissionGuard permission="placas" />}>
                    <Route path="placas" element={<Placas />} />
                  </Route>

                  <Route element={<PermissionGuard permission="cortes" />}>
                    <Route path="cortes" element={<Cortes />} />
                  </Route>

                  <Route element={<PermissionGuard permission="tramas" />}>
                    <Route path="tramas" element={<Tramas />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </DialogProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
