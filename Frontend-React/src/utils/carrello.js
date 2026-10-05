/** Numero totale di paia nel carrello (somma delle quantità, non delle righe). */
export function contaArticoli(items) {
  return items.reduce((somma, item) => somma + item.quantita, 0);
}

/** Subtotale di una riga, calcolato in centesimi interi per evitare errori di arrotondamento dei double. */
export function subtotaleRiga(item) {
  return (Math.round(item.scarpa.prezzo * 100) * item.quantita) / 100;
}

export function calcolaTotale(items) {
  const centesimi = items.reduce(
    (somma, item) => somma + Math.round(item.scarpa.prezzo * 100) * item.quantita,
    0,
  );
  return centesimi / 100;
}
