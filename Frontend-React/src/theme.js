import { createTheme } from "@mui/material/styles";

/**
 * Tema MUI di base. Volutamente minimo per la Fase 1 (scaffold): la
 * rifinitura — dark mode, palette definitiva — è compito della Fase 7.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6f5c" },
    secondary: { main: "#b3432c" },
  },
  shape: { borderRadius: 8 },
});
