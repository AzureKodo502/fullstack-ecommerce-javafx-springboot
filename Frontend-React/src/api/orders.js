import { apiClient } from "./client.js";

/**
 * Trasforma il carrello dell'utente in un ordine. Il totale lo calcola il
 * server sui prezzi correnti, e a ordine creato svuota il carrello.
 */
export const effettuaCheckout = (userId) => apiClient.post(`/api/orders/checkout/${userId}`);

/** Storico ordini dell'utente. Gli ordini non includono le righe, solo testata e totale. */
export const getOrdini = (userId) => apiClient.get(`/api/orders/user/${userId}`);
