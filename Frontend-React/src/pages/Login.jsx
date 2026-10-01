import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Inserisci email e password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e.message || "Credenziali non valide.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper component="form" onSubmit={handleSubmit} elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Accedi
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            required
          />
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? "Accesso in corso…" : "Accedi"}
          </Button>
          <Typography variant="body2" align="center">
            Non hai un account? <RouterLink to="/registrazione">Registrati</RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
