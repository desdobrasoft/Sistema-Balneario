import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// material-ui icons
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ConstructionIcon from "@mui/icons-material/Construction";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExtensionIcon from "@mui/icons-material/Extension";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import LightModeIcon from "@mui/icons-material/LightMode";
import LineWeightIcon from "@mui/icons-material/LineWeight";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LockIcon from "@mui/icons-material/Lock";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MenuIcon from "@mui/icons-material/Menu";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";

// material-ui components
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import {
  type CSSObject,
  type Theme,
  styled,
  useTheme,
} from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

// project imports
import { ProfileSecurityForm } from "components/profile/ProfileSecurityForm";
import { ProfileSettingsForm } from "components/profile/ProfileSettingsForm";
import { useDialog } from "hooks/useDialog";
import { useSnackbar } from "hooks/useSnackbar";
import { useAuthStore } from "store/authStore";
import { useThemeStore } from "store/themeStore";

// ===============================
// CONSTANTS
// ===============================
const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

// ===============================
// MENU ITEMS
// ===============================
interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

const menuItems: NavItem[] = [
  { text: "Painel", icon: <DashboardIcon />, path: "/" },
  {
    text: "Usuários",
    icon: <PersonIcon />,
    path: "/usuarios",
    permission: "admin",
  },
  {
    text: "Cargos",
    icon: <ManageAccountsIcon />,
    path: "/cargos",
    permission: "admin",
  },
  {
    text: "Tramas",
    icon: <LineWeightIcon />,
    path: "/tramas",
    permission: "tramas",
  },
  {
    text: "Placas",
    icon: <ExtensionIcon />,
    path: "/placas",
    permission: "placas",
  },
  {
    text: "Cortes",
    icon: <ContentCutIcon />,
    path: "/cortes",
    permission: "cortes",
  },
  {
    text: "Catálogo de Modelos",
    icon: <HomeIcon />,
    path: "/modelos",
    permission: "modelos",
  },
  {
    text: "Clientes",
    icon: <PeopleIcon />,
    path: "/clientes",
    permission: "clientes",
  },
  {
    text: "Vendas",
    icon: <MonetizationOnIcon />,
    path: "/vendas",
    permission: "vendas",
  },
  {
    text: "Produção",
    icon: <ConstructionIcon />,
    path: "/producao",
    permission: "producao",
  },
  {
    text: "Entregas",
    icon: <LocalShippingIcon />,
    path: "/entregas",
    permission: "entregas",
  },
  {
    text: "Financeiro",
    icon: <AssessmentIcon />,
    path: "/financeiro",
    permission: "financeiro",
  },
  {
    text: "Matéria-Prima",
    icon: <InventoryIcon />,
    path: "/materia-prima",
    permission: "estoque",
  },
];

// Helper: derive page title from pathname
function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Painel";
  const item = menuItems.find((i) => i.path === pathname);
  return item?.text || "TechWall";
}

// ===============================
// STYLED DRAWER (mini variant)
// ===============================
const openedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH_COLLAPSED,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  }),
}));

// ===============================
// SIDEBAR COLORS (independent of theme mode for a consistently dark sidebar)
// ===============================
const sidebarBg = "#16213e";
const sidebarBgSelected = "rgba(179, 157, 219, 0.12)";
const sidebarTextColor = "#c0c0d0";
const sidebarTextActive = "#D1C4E9";
const sidebarAccent = "#B39DDB";

// ===============================
// LAYOUT COMPONENT
// ===============================
const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname],
  );

  const isAdmin = user?.roles?.includes("admin") ?? false;

  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          !item.permission ||
          isAdmin ||
          user?.permissions?.includes(item.permission),
      ),
    [user?.permissions, isAdmin],
  );

  const handleToggleDrawer = () => {
    if (isMobile) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setDrawerOpen((prev) => !prev);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setMobileDrawerOpen(false);
  };

  const handleOpenProfileSettings = () => {
    setAnchorEl(null);
    showDialog({
      title: "Meus Dados",
      body: (
        <ProfileSettingsForm
          onSuccess={() => {
            closeDialog();
            showSnackbar({
              title: "Sucesso",
              message: "Seus dados foram atualizados com sucesso.",
              severity: "success",
            });
          }}
        />
      ),
      actions: [
        <Button key="cancel" onClick={() => closeDialog()} color="inherit">
          Cancelar
        </Button>,
        <Button
          key="save"
          type="submit"
          form="profile-settings-form"
          color="primary"
          variant="contained"
        >
          Salvar Alterações
        </Button>,
      ],
    });
  };

  const handleOpenProfileSecurity = () => {
    setAnchorEl(null);
    showDialog({
      title: "Alterar Senha",
      body: (
        <ProfileSecurityForm
          onSuccess={() => {
            closeDialog();
            showSnackbar({
              title: "Sucesso",
              message: "Sua senha foi alterada com sucesso.",
              severity: "success",
            });
          }}
        />
      ),
      actions: [
        <Button key="cancel" onClick={() => closeDialog()} color="inherit">
          Cancelar
        </Button>,
        <Button
          key="save"
          type="submit"
          form="profile-security-form"
          color="primary"
          variant="contained"
        >
          Alterar Senha
        </Button>,
      ],
    });
  };

  const handleLogout = () => {
    setAnchorEl(null);
    showDialog({
      title: "Confirmar Saída",
      body: "Deseja realmente encerrar sua sessão e retornar ao login?",
      actions: [
        <Button key="cancel" onClick={() => closeDialog()} color="inherit">
          Cancelar
        </Button>,
        <Button
          key="confirm"
          onClick={() => {
            closeDialog();
            logout();
            navigate("/login");
          }}
          color="error"
          variant="contained"
          autoFocus
        >
          Sair
        </Button>,
      ],
      dismissable: true,
    });
  };

  // Compute current drawer width for AppBar offset
  const currentDrawerWidth = isMobile
    ? 0
    : drawerOpen
      ? DRAWER_WIDTH
      : DRAWER_WIDTH_COLLAPSED;

  // ===============================
  // DRAWER CONTENT
  // ===============================
  const drawerContent = (
    <Stack
      sx={{
        minHeight: "100%",
        bgcolor: sidebarBg,
        color: sidebarTextColor,
      }}
    >
      {/* Logo header */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: drawerOpen || isMobile ? "space-between" : "center",
          px: drawerOpen || isMobile ? 2 : 1,
          minHeight: "64px !important",
        }}
      >
        {(drawerOpen || isMobile) && (
          <Typography
            variant="h6"
            noWrap
            sx={{ color: "#fff", fontWeight: "bold", letterSpacing: 0.5 }}
          >
            TechWall
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleToggleDrawer}
            sx={{ color: sidebarTextColor }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      {/* Navigation items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {filteredMenuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <Tooltip
                title={!drawerOpen && !isMobile ? item.text : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    minHeight: 44,
                    justifyContent:
                      drawerOpen || isMobile ? "initial" : "center",
                    px: 2.5,
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.3,
                    color: isSelected ? sidebarTextActive : sidebarTextColor,
                    "&.Mui-selected": {
                      bgcolor: sidebarBgSelected,
                      borderLeft: `3px solid ${sidebarAccent}`,
                      "& .MuiListItemIcon-root": { color: sidebarAccent },
                      "& .MuiListItemText-primary": {
                        fontWeight: "bold",
                        color: sidebarTextActive,
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.04)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen || isMobile ? 2 : "auto",
                      justifyContent: "center",
                      color: isSelected ? sidebarAccent : sidebarTextColor,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: drawerOpen || isMobile ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      {/* Footer actions */}
      <List
        subheader={
          drawerOpen || isMobile ? (
            <ListSubheader
              sx={{
                bgcolor: "transparent",
                color: "rgba(255,255,255,0.3)",
                lineHeight: "32px",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Sistema
            </ListSubheader>
          ) : undefined
        }
      >
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={!drawerOpen && !isMobile ? "Sair do Sistema" : ""}
            placement="right"
            arrow
          >
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 44,
                justifyContent: drawerOpen || isMobile ? "initial" : "center",
                px: 2.5,
                mx: 1,
                borderRadius: 2,
                mb: 1,
                color: "#ef5350",
                "&:hover": { bgcolor: "rgba(239,83,80,0.08)" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen || isMobile ? 2 : "auto",
                  justifyContent: "center",
                  color: "#ef5350",
                }}
              >
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sair do Sistema"
                sx={{
                  opacity: drawerOpen || isMobile ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Stack>
  );

  // ===============================
  // RENDER
  // ===============================
  return (
    <Stack direction="row" sx={{ minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer - 1,
          pl: { md: `${currentDrawerWidth}px` },
          transition: theme.transitions.create("padding-left", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: mode === "dark" ? "#0f3460" : "primary.main",
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleToggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page title */}
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, fontWeight: 600, color: "#fff" }}
          >
            {pageTitle}
          </Typography>

          {/* Right side: user menu */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ display: { xs: "none", sm: "block" }, color: "#fff" }}
            >
              {user?.fullName || "Usuário"}
            </Typography>

            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              size="small"
            >
              <Avatar
                sx={{
                  bgcolor: "primary.light",
                  width: 34,
                  height: 34,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.charAt(0) || "U"}
              </Avatar>
            </IconButton>
          </Stack>

          {/* User dropdown menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: { minWidth: 180, mt: 1 },
              },
            }}
          >
            <MenuItem onClick={handleOpenProfileSettings}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Meus Dados
            </MenuItem>
            <MenuItem onClick={handleOpenProfileSecurity}>
              <ListItemIcon>
                <LockIcon fontSize="small" />
              </ListItemIcon>
              Alterar Senha
            </MenuItem>
            <MenuItem
              onClick={() => {
                toggleMode();
              }}
            >
              <ListItemIcon>
                {mode === "dark" ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </ListItemIcon>
              {mode === "dark" ? "Modo Claro" : "Modo Escuro"}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar — Desktop (persistent mini variant) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            "& .MuiDrawer-paper": {
              bgcolor: sidebarBg,
              borderRight: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Sidebar — Mobile (temporary overlay) */}
      {isMobile && (
        <MuiDrawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: sidebarBg,
            },
          }}
        >
          {drawerContent}
        </MuiDrawer>
      )}

      {/* Main content */}
      <Box
        sx={{
          bgcolor: "background.default",
          component: "main",
          flexGrow: 1,
          minHeight: "100vh",
          p: 2,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* spacer for fixed AppBar */}
        <Outlet />
      </Box>
    </Stack>
  );
};

export default DashboardLayout;
