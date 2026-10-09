import { useState } from "react";
import { AppBar, Badge, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { conteggio } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  // Sotto i 900px i link non starebbero in una riga: si raccolgono in un menu.
  const compatta = useMediaQuery(theme.breakpoints.down("md"));
  const [ancora, setAncora] = useState(null);

  const chiudiMenu = () => setAncora(null);

  function handleLogout() {
    chiudiMenu();
    logout();
    navigate("/");
  }

  // Il carrello resta sempre visibile, anche su schermi piccoli: è l'azione principale.
  const carrello = (
    <IconButton color="inherit" component={RouterLink} to="/carrello" aria-label={`Carrello, ${conteggio} articoli`}>
      <Badge badgeContent={conteggio} color="secondary">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );

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

        {compatta ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {carrello}
            <ThemeToggle />
            <IconButton
              color="inherit"
              onClick={(e) => setAncora(e.currentTarget)}
              aria-label="Apri il menu"
              aria-haspopup="true"
              aria-controls={ancora ? "menu-principale" : undefined}
              aria-expanded={ancora ? "true" : undefined}
            >
              <MenuIcon />
            </IconButton>
            <Menu id="menu-principale" anchorEl={ancora} open={Boolean(ancora)} onClose={chiudiMenu}>
              <MenuItem component={RouterLink} to="/" onClick={chiudiMenu}>
                Home
              </MenuItem>
              <MenuItem component={RouterLink} to="/prodotti" onClick={chiudiMenu}>
                Catalogo
              </MenuItem>
              {isAuthenticated && (
                <MenuItem component={RouterLink} to="/ordini" onClick={chiudiMenu}>
                  Ordini
                </MenuItem>
              )}
              {isAuthenticated && (
                <MenuItem component={RouterLink} to="/account" onClick={chiudiMenu}>
                  Account ({user.nome})
                </MenuItem>
              )}
              {isAuthenticated ? (
                <MenuItem onClick={handleLogout}>Esci</MenuItem>
              ) : (
                <MenuItem component={RouterLink} to="/login" onClick={chiudiMenu}>
                  Accedi
                </MenuItem>
              )}
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box component="nav" aria-label="Principale" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button color="inherit" component={RouterLink} to="/">
                Home
              </Button>
              <Button color="inherit" component={RouterLink} to="/prodotti">
                Catalogo
              </Button>
              {carrello}
              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/ordini">
                    Ordini
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/account">
                    {user.nome}
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    Esci
                  </Button>
                </>
              ) : (
                <Button color="inherit" component={RouterLink} to="/login">
                  Accedi
                </Button>
              )}
            </Box>
            <ThemeToggle />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
