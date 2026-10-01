import { useNavigate } from "react-router-dom";
import { Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Prima pagina protetta dell'app: dimostra che login/registrazione, il
 * token e ProtectedRoute funzionano insieme. Il Carrello e lo Storico
 * Ordini (Fasi 4-5) saranno protetti allo stesso modo.
 */
export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Il mio account
        </Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography>
            <strong>Nome:</strong> {user.nome} {user.cognome}
          </Typography>
          <Typography>
            <strong>Email:</strong> {user.email}
          </Typography>
        </Stack>
        <Button variant="outlined" color="error" onClick={handleLogout} fullWidth>
          Esci
        </Button>
      </Paper>
    </Container>
  );
}
