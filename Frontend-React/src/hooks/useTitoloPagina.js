import { useEffect } from "react";

const NOME_SITO = "Stride Style";

/**
 * Imposta il titolo della scheda del browser. In una SPA l'HTML è uno solo,
 * quindi senza questo ogni pagina si chiamerebbe "Stride Style": cronologia,
 * segnalibri e screen reader (che annunciano il titolo a ogni navigazione)
 * non distinguerebbero le pagine.
 */
export function useTitoloPagina(titolo) {
  useEffect(() => {
    document.title = titolo ? `${titolo} · ${NOME_SITO}` : NOME_SITO;
    return () => {
      document.title = NOME_SITO;
    };
  }, [titolo]);
}
