import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";

export default function Home() {
  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Stride Style
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Sneaker Nike, Jordan, Adidas, Puma, Asics e Reebok.
        </Typography>
        <Button component={RouterLink} to="/prodotti" variant="contained" size="large">
          Sfoglia il catalogo
        </Button>
      </Box>
    </Container>
  );
}
