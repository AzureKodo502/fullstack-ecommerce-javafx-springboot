import { Container, Typography, Box } from "@mui/material";

/**
 * Placeholder della Fase 1: dimostra che routing, tema e layout funzionano.
 * Il catalogo vero arriva in Fase 3.
 */
export default function Home() {
  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Stride Style
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Il catalogo arriva nella prossima fase — per ora questa pagina
          dimostra solo che React, il routing e il tema sono a posto.
        </Typography>
      </Box>
    </Container>
  );
}
