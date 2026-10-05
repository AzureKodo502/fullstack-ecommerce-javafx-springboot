import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { formatPrezzo } from "../api/products.js";
import { useOrdini } from "../hooks/useOrdini.js";
import { formatDataOra } from "../utils/formato.js";

export default function Ordini() {
  const { data: ordini, loading, error } = useOrdini();

  // Dal più recente: le date ISO si ordinano correttamente come stringhe.
  const recenti = ordini ? [...ordini].sort((a, b) => b.dataCreazione.localeCompare(a.dataCreazione)) : [];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        I miei ordini
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">Impossibile caricare gli ordini. ({error.message})</Alert>}

      {!loading && !error && recenti.length === 0 && (
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Typography color="text.secondary">Non hai ancora effettuato ordini.</Typography>
          <Button component={RouterLink} to="/prodotti" variant="contained">
            Vai al catalogo
          </Button>
        </Stack>
      )}

      {!loading && !error && recenti.length > 0 && (
        <Stack spacing={2}>
          {recenti.map((ordine) => (
            <Paper key={ordine.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Ordine #{ordine.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDataOra(ordine.dataCreazione)}
                  </Typography>
                </Box>
                <Chip label={ordine.stato} color="success" variant="outlined" size="small" />
                <Typography variant="h6">{formatPrezzo(ordine.totale)}</Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
