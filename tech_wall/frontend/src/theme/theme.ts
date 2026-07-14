import { createTheme, type Theme } from "@mui/material/styles";

// ===============================
// SHARED CONFIG
// ===============================
const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 600 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: { textTransform: "none" as const, borderRadius: 8 },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 12, backgroundImage: "none" },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      body: { margin: 0 },
      "input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button":
        {
          WebkitAppearance: "none",
          margin: 0,
        },
      "input[type=number]": {
        MozAppearance: "textfield",
      },
    },
  },
};

const darkBase = createTheme({
  palette: { mode: "dark", contrastThreshold: 4.5, tonalOffset: 0.2 },
});

const lightBase = createTheme({
  palette: { mode: "light", contrastThreshold: 4.5, tonalOffset: 0.2 },
});

// ===============================
// DARK THEME (default)
// ===============================
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: darkBase.palette.augmentColor({ color: { main: "#4ECDC4" } }),
    secondary: darkBase.palette.augmentColor({ color: { main: "#1B2D4F" } }),
    background: {
      default: "#1a1a1a",
      paper: "#2c2c2c",
    },
    divider: "rgba(255,255,255,0.08)",
    text: {
      primary: "#E8E8E8",
      secondary: "#A0A0A0",
    },
  },
  typography: sharedTypography,
  components: {
    ...sharedComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

// ===============================
// LIGHT THEME
// ===============================
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: lightBase.palette.augmentColor({ color: { main: "#1B2D4F" } }),
    secondary: lightBase.palette.augmentColor({ color: { main: "#4ECDC4" } }),
    background: {
      default: "#FFFFFF",
      paper: "#F2F2F2",
    },
    divider: "rgba(0,0,0,0.08)",
    text: {
      primary: "#151515",
      secondary: "#444444",
    },
  },
  typography: sharedTypography,
  components: sharedComponents,
});

// ===============================
// EXPORTS
// ===============================
export function getTheme(mode: "light" | "dark"): Theme {
  return mode === "dark" ? darkTheme : lightTheme;
}
