import { apiClient } from "./client.js";

export const getScarpe = () => apiClient.get("/api/products");

export const cercaScarpe = (q) => apiClient.get(`/api/products/search?q=${encodeURIComponent(q)}`);

export const getScarpeByMarchio = (marchio) =>
  apiClient.get(`/api/products/brand/${encodeURIComponent(marchio)}`);

export const getScarpa = (id) => apiClient.get(`/api/products/${encodeURIComponent(id)}`);

/**
 * Le immagini sono servite dal Backend (static/images/scarpe/), mentre
 * Scarpa.imageUrl contiene solo il nome del file.
 */
export const imageSrc = (fileName) =>
  fileName ? `${import.meta.env.VITE_API_BASE_URL}/images/scarpe/${fileName}` : null;

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
export const formatPrezzo = (prezzo) => euro.format(prezzo);

/** Taglie selezionabili: stesso intervallo (36–44) del client JavaFX. */
export const TAGLIE = [36, 37, 38, 39, 40, 41, 42, 43, 44];
