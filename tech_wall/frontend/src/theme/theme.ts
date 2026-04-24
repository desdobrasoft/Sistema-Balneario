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

// ===============================
// DARK THEME (default)
// ===============================
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9575CD",
      light: "#B39DDB",
      dark: "#7E57C2",
      contrastText: "#fff",
    },
    secondary: {
      main: "#7C4DFF",
    },
    background: {
      default: "#1a1a2e", // deep navy for content
      paper: "#16213e", // slightly lighter for cards
    },
    divider: "rgba(255,255,255,0.08)",
    text: {
      primary: "#E8E8E8",
      secondary: "#A0A0B0",
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
    primary: {
      main: "#7E57C2",
      light: "#B39DDB",
      dark: "#512DA8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#7C4DFF",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    divider: "rgba(0,0,0,0.08)",
    text: {
      primary: "#212121",
      secondary: "#757575",
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
