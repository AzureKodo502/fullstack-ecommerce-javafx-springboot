import { useMemo } from "react";
import { getScarpe } from "../api/products.js";
import { useAsync } from "./useAsync.js";

/**
 * Elenco dei marchi presenti a catalogo, ordinato alfabeticamente. Il backend
 * non ha un endpoint dedicato: si ricava dai prodotti (poche decine di
 * record, una chiamata sola).
 */
export function useMarchi() {
  const { data } = useAsync(getScarpe, "marchi");
  return useMemo(
    () => (data ? [...new Set(data.map((s) => s.marchio))].sort() : []),
    [data],
  );
}
