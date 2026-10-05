const dataOra = new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" });

/**
 * Formatta il LocalDateTime del backend (es. "2026-10-06T00:51:58.9221429").
 * Java emette fino a 9 cifre frazionarie, ma lo standard JS ne definisce 3 e
 * alcuni browser rifiutano le altre: si tagliano ai millisecondi.
 */
export function formatDataOra(iso) {
  const date = new Date(iso.replace(/(\.\d{3})\d+/, "$1"));
  return Number.isNaN(date.getTime()) ? iso : dataOra.format(date);
}
