import { Link as RouterLink } from "react-router-dom";
import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { formatPrezzo, imageSrc } from "../api/products.js";

export default function ScarpaCard({ scarpa }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea
        component={RouterLink}
        to={`/prodotti/${scarpa.id}`}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardMedia
          component="img"
          image={imageSrc(scarpa.imageUrl)}
          alt={scarpa.nome}
          sx={{ height: 200, objectFit: "contain", p: 2, bgcolor: "grey.50" }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {scarpa.marchio}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}>
            {scarpa.nome}
          </Typography>
          <Typography variant="h6" color="primary">
            {formatPrezzo(scarpa.prezzo)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
