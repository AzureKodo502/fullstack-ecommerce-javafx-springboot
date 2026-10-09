import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ScarpaCard from "../components/ScarpaCard.jsx";
import { useMarchi } from "../hooks/useMarchi.js";
import { useScarpe } from "../hooks/useScarpe.js";
import { useTitoloPagina } from "../hooks/useTitoloPagina.js";

/**
 * Catalogo con ricerca per nome e filtro per marchio. I filtri vivono
 * nell'URL (?q=...&marchio=...): la pagina filtrata è condivisibile e il
 * tasto "indietro" del browser torna alla ricerca precedente.
 */
export default function Catalogo() {
  useTitoloPagina("Catalogo");

  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const marchio = params.get("marchio") ?? "";

  const [testoRicerca, setTestoRicerca] = useState(q);
  const marchi = useMarchi();
  const { data: scarpe, loading, error } = useScarpe({ q, marchio });

  function aggiornaParams(cambi) {
    const next = new URLSearchParams(params);
    for (const [chiave, valore] of Object.entries(cambi)) {
      if (valore) next.set(chiave, valore);
      else next.delete(chiave);
    }
    setParams(next);
  }

  function handleRicerca(event) {
    event.preventDefault();
    aggiornaParams({ q: testoRicerca.trim() });
  }

  function handleMarchio(nome) {
    aggiornaParams({ marchio: nome === marchio ? "" : nome });
  }

  function azzeraFiltri() {
    setTestoRicerca("");
    setParams({});
  }

  const filtriAttivi = Boolean(q || marchio);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Catalogo
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Box component="form" onSubmit={handleRicerca} sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Cerca per nome"
            value={testoRicerca}
            onChange={(e) => setTestoRicerca(e.target.value)}
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained">
            Cerca
          </Button>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          {marchi.map((nome) => (
            <Chip
              key={nome}
              label={nome}
              onClick={() => handleMarchio(nome)}
              color={nome === marchio ? "primary" : "default"}
              variant={nome === marchio ? "filled" : "outlined"}
            />
          ))}
          {filtriAttivi && <Chip label="Azzera filtri" onClick={azzeraFiltri} onDelete={azzeraFiltri} />}
        </Stack>
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">
          Impossibile caricare il catalogo. {error.message}
        </Alert>
      )}

      {!loading && !error && scarpe.length === 0 && (
        <Typography color="text.secondary">Nessuna scarpa corrisponde alla ricerca.</Typography>
      )}

      {!loading && !error && scarpe.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {scarpe.length} {scarpe.length === 1 ? "risultato" : "risultati"}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            }}
          >
            {scarpe.map((scarpa) => (
              <ScarpaCard key={scarpa.id} scarpa={scarpa} />
            ))}
          </Box>
        </>
      )}
    </Container>
  );
}
