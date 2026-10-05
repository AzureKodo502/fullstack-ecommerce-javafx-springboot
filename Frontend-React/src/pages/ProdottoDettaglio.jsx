import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { TAGLIE, formatPrezzo, imageSrc } from "../api/products.js";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { useScarpa } from "../hooks/useScarpa.js";

export default function ProdottoDettaglio() {
  const { id } = useParams();
  const { data: scarpa, loading, error } = useScarpa(id);
  const { isAuthenticated } = useAuth();
  const { aggiungi } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [taglia, setTaglia] = useState(null);
  const [inCorso, setInCorso] = useState(false);
  const [erroreCarrello, setErroreCarrello] = useState(null);
  const [aggiunto, setAggiunto] = useState(false);

  async function handleAggiungi() {
    // Il carrello è per utente: da sloggati si passa dal login e si torna qui.
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setErroreCarrello(null);
    setInCorso(true);
    try {
      await aggiungi(scarpa.id, taglia);
      setAggiunto(true);
    } catch (e) {
      setErroreCarrello(e.message || "Impossibile aggiungere al carrello.");
    } finally {
      setInCorso(false);
    }
  }

  const indietro = (
    <Button component={RouterLink} to="/prodotti" sx={{ mb: 2 }}>
      ← Torna al catalogo
    </Button>
  );

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        {indietro}
        <Alert severity={error.status === 404 ? "warning" : "error"}>
          {error.status === 404
            ? "Questa scarpa non esiste (o non è più a catalogo)."
            : `Impossibile caricare la scarpa. (${error.message})`}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {indietro}
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Box
          component="img"
          src={imageSrc(scarpa.imageUrl)}
          alt={scarpa.nome}
          sx={{ width: "100%", maxHeight: 420, objectFit: "contain", bgcolor: "grey.50", p: 3, borderRadius: 2 }}
        />

        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary">
            {scarpa.marchio} · {scarpa.modello}
          </Typography>
          <Typography variant="h4" component="h1">
            {scarpa.nome}
          </Typography>
          <Typography variant="h5" color="primary">
            {formatPrezzo(scarpa.prezzo)}
          </Typography>
          <Typography color="text.secondary">{scarpa.descrizione}</Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Taglia
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={taglia}
              onChange={(_, nuova) => setTaglia(nuova)}
              size="small"
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              {TAGLIE.map((t) => (
                <ToggleButton key={t} value={t} sx={{ border: 1, borderColor: "divider" }}>
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {erroreCarrello && <Alert severity="error">{erroreCarrello}</Alert>}

          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleAggiungi}
              disabled={taglia === null || inCorso}
            >
              {inCorso ? "Aggiunta in corso…" : "Aggiungi al carrello"}
            </Button>
            {taglia === null && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Seleziona una taglia per continuare.
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={aggiunto}
        autoHideDuration={4000}
        onClose={() => setAggiunto(false)}
        message="Aggiunto al carrello"
        action={
          <Button color="inherit" size="small" component={RouterLink} to="/carrello">
            Vai al carrello
          </Button>
        }
      />
    </Container>
  );
}
