import { Link as RouterLink } from "react-router-dom";
import { Button, Container, Stack, Typography } from "@mui/material";
import { useTitoloPagina } from "../hooks/useTitoloPagina.js";

export default function NotFound() {
  useTitoloPagina("Pagina non trovata");

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Typography variant="h4" component="h1">
          Pagina non trovata
        </Typography>
        <Typography color="text.secondary">
          L&apos;indirizzo che hai aperto non esiste o la pagina è stata spostata.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Torna alla home
        </Button>
      </Stack>
    </Container>
  );
}
