import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * Barra di navigazione. Per ora ha solo il link alla Home: Catalogo, Carrello
 * e Login arrivano con le fasi che introducono quelle pagine (3, 4, 2).
 */
export default function Navbar() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontWeight: 700 }}
        >
          Stride Style
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
