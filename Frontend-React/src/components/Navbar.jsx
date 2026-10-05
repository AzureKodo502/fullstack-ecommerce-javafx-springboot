import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { conteggio } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

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
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/prodotti">
            Catalogo
          </Button>
          <IconButton color="inherit" component={RouterLink} to="/carrello" aria-label={`Carrello, ${conteggio} articoli`}>
            <Badge badgeContent={conteggio} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
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
      </Toolbar>
    </AppBar>
  );
}
