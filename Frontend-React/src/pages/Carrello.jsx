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
import { formatPrezzo, imageSrc } from "../api/products.js";
import { useCart } from "../hooks/useCart.js";
import { subtotaleRiga } from "../utils/carrello.js";
import { useTitoloPagina } from "../hooks/useTitoloPagina.js";

export default function Carrello() {
  useTitoloPagina("Il tuo carrello");

  const { items, loading, error, totale, rimuovi } = useCart();
  const [rimozioneInCorso, setRimozioneInCorso] = useState(null);
  const [erroreRimozione, setErroreRimozione] = useState(null);

  async function handleRimuovi(item) {
    setErroreRimozione(null);
    setRimozioneInCorso(item.id);
    try {
      await rimuovi(item);
    } catch (e) {
      setErroreRimozione(e.message || "Impossibile rimuovere l'articolo.");
    } finally {
      setRimozioneInCorso(null);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Il tuo carrello
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">Impossibile caricare il carrello. {error.message}</Alert>}
      {erroreRimozione && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erroreRimozione}
        </Alert>
      )}

      {!loading && !error && items.length === 0 && (
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Typography color="text.secondary">Il carrello è vuoto.</Typography>
          <Button component={RouterLink} to="/prodotti" variant="contained">
            Vai al catalogo
          </Button>
        </Stack>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <Stack spacing={2}>
            {items.map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    alignItems: "center",
                    gridTemplateColumns: { xs: "80px 1fr", sm: "96px 1fr auto auto" },
                  }}
                >
                  <Box
                    component="img"
                    src={imageSrc(item.scarpa.imageUrl)}
                    alt={item.scarpa.nome}
                    sx={{ width: "100%", height: 80, objectFit: "contain", bgcolor: "grey.50", borderRadius: 1 }}
                  />
                  <Box>
                    <Typography
                      component={RouterLink}
                      to={`/prodotti/${item.scarpa.id}`}
                      sx={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}
                    >
                      {item.scarpa.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taglia {item.taglia} · Quantità {item.quantita} · {formatPrezzo(item.scarpa.prezzo)} cad.
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ justifySelf: { sm: "end" } }}>
                    {formatPrezzo(subtotaleRiga(item))}
                  </Typography>
                  <Button
                    color="error"
                    onClick={() => handleRimuovi(item)}
                    disabled={rimozioneInCorso === item.id}
                  >
                    {rimozioneInCorso === item.id ? "Rimozione…" : "Rimuovi"}
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h5">Totale: {formatPrezzo(totale)}</Typography>
            <Button component={RouterLink} to="/checkout" variant="contained" size="large">
              Procedi al checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
