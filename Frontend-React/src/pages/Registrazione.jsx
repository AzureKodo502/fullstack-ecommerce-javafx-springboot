import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth.js";

const CAMPI_INIZIALI = { nome: "", cognome: "", email: "", password: "", confermaPassword: "" };

export default function Registrazione() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(CAMPI_INIZIALI);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function aggiorna(campo) {
    return (event) => setForm((f) => ({ ...f, [campo]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const { nome, cognome, email, password, confermaPassword } = form;

    // Stessa validazione client-side del RegistrazioneController in JavaFX.
    if (!nome || !cognome || !email || !password || !confermaPassword) {
      setError("Compila tutti i campi.");
      return;
    }
    if (password !== confermaPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    try {
      await register(nome, cognome, email, password);
      navigate("/", { replace: true });
    } catch (e) {
      setError(e.message || "Registrazione fallita. Email già in uso?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper component="form" onSubmit={handleSubmit} elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Crea un account
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Nome" value={form.nome} onChange={aggiorna("nome")} fullWidth required />
          <TextField label="Cognome" value={form.cognome} onChange={aggiorna("cognome")} fullWidth required />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={aggiorna("email")}
            autoComplete="email"
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={aggiorna("password")}
            autoComplete="new-password"
            fullWidth
            required
          />
          <TextField
            label="Conferma password"
            type="password"
            value={form.confermaPassword}
            onChange={aggiorna("confermaPassword")}
            autoComplete="new-password"
            fullWidth
            required
          />
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? "Registrazione in corso…" : "Registrati"}
          </Button>
          <Typography variant="body2" align="center">
            Hai già un account? <RouterLink to="/login">Accedi</RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
