import { cercaScarpe, getScarpe, getScarpeByMarchio } from "../api/products.js";
import { useAsync } from "./useAsync.js";

/**
 * Lista delle scarpe, con ricerca testuale e/o filtro per marchio.
 * Usa l'endpoint più specifico disponibile; se ci sono entrambi i filtri
 * il backend non ha un endpoint combinato, quindi si cerca per nome e si
 * restringe al marchio lato client.
 */
export function useScarpe({ q = "", marchio = "" } = {}) {
  const fetcher = async () => {
    if (q) {
      const risultati = await cercaScarpe(q);
      return marchio ? risultati.filter((s) => s.marchio === marchio) : risultati;
    }
    if (marchio) return getScarpeByMarchio(marchio);
    return getScarpe();
  };

  return useAsync(fetcher, JSON.stringify({ q, marchio }));
}
