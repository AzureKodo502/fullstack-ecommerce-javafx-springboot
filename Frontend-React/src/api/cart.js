import { apiClient } from "./client.js";

export const getCarrello = (userId) => apiClient.get(`/api/cart/${userId}`);

/** Il backend unisce le righe con stessa scarpa e taglia sommando le quantità. */
export const aggiungiAlCarrello = ({ userId, scarpaId, taglia, quantita = 1 }) =>
  apiClient.post("/api/cart/add", { userId, scarpaId, taglia, quantita });

/** Rimuove l'intera riga (scarpa + taglia): il backend non ha un decremento. */
export const rimuoviDalCarrello = ({ userId, scarpaId, taglia }) =>
  apiClient.post("/api/cart/remove", { userId, scarpaId, taglia, quantita: 1 });
