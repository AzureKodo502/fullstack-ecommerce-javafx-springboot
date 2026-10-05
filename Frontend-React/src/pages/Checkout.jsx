import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { effettuaCheckout } from "../api/orders.js";
import { formatPrezzo } from "../api/products.js";
import { useAuth } from "../hooks/useAuth.js";
import { useCart } from "../hooks/useCart.js";
import { subtotaleRiga } from "../utils/carrello.js";

export default function Checkout() {
  const { user } = useAuth();
  const { items, loading, totale, svuota } = useCart();
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState(null);
  const [ordine, setOrdine] = useState(null);

  async function handleConferma() {
    setErrore(null);
    setInCorso(true);
    try {
      const creato = await effettuaCheckout(user.id);
      setOrdine(creato);
      svuota();
    } catch (e) {
      setErrore(
        e.status === 400
          ? "Il carrello è vuoto o non è più valido. Torna al carrello e riprova."
          : e.message || "Impossibile completare l'ordine.",
      );
    } finally {
      setInCorso(false);
    }
  }

  // Ordine appena creato: mostra la conferma con i dati restituiti dal server
  // (il totale è quello calcolato lì, non quello mostrato prima della conferma).
  if (ordine) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Ordine #{ordine.id} confermato — totale {formatPrezzo(ordine.totale)}.
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button component={RouterLink} to="/ordini" variant="contained">
            Vai ai miei ordini
          </Button>
          <Button component={RouterLink} to="/prodotti">
            Continua gli acquisti
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Riepilogo ordine
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && items.length === 0 && (
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Typography color="text.secondary">Non c&apos;è nulla da ordinare: il carrello è vuoto.</Typography>
          <Button component={RouterLink} to="/prodotti" variant="contained">
            Vai al catalogo
          </Button>
        </Stack>
      )}

      {!loading && items.length > 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5} divider={<Divider flexItem />}>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{item.scarpa.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taglia {item.taglia} · Quantità {item.quantita}
                    </Typography>
                  </Box>
                  <Typography>{formatPrezzo(subtotaleRiga(item))}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Typography variant="h5" sx={{ my: 3 }}>
            Totale: {formatPrezzo(totale)}
          </Typography>

          {errore && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errore}
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="contained" size="large" onClick={handleConferma} disabled={inCorso}>
              {inCorso ? "Invio in corso…" : "Conferma ordine"}
            </Button>
            <Button component={RouterLink} to="/carrello" disabled={inCorso}>
              Torna al carrello
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Il pagamento non è ancora implementato: l&apos;ordine viene registrato come confermato.
          </Typography>
        </>
      )}
    </Container>
  );
}
