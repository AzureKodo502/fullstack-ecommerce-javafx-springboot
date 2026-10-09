import { createTheme } from "@mui/material/styles";

/**
 * Tema MUI con modalità chiara e scura. Di default segue il sistema operativo;
 * la scelta fatta col pulsante nella navbar viene ricordata da MUI in
 * localStorage. Nella modalità scura i verdi si schiariscono: il verde pino
 * della modalità chiara su sfondo scuro non raggiungerebbe un contrasto leggibile.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#1f6f5c" },
        secondary: { main: "#b3432c" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#62b89d" },
        secondary: { main: "#e08a71" },
      },
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        // In scuro MUI colora la barra come lo sfondo della pagina: senza un
        // bordo non si distingue dove finisce la navigazione.
        root: ({ theme }) =>
          theme.applyStyles("dark", {
            borderBottom: "1px solid",
            borderColor: theme.vars.palette.divider,
          }),
      },
    },
  },
});
