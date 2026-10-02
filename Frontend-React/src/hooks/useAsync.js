import { useEffect, useState } from "react";

/**
 * Esegue una chiamata asincrona e ne espone data/loading/error. Si rilancia
 * quando cambia la `key` (stringa che identifica la richiesta). Se la key
 * cambia mentre una richiesta è in volo, la risposta vecchia viene scartata:
 * senza questo, un filtro cambiato in fretta potrebbe mostrare i risultati
 * di una ricerca precedente.
 */
export function useAsync(fn, key) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let scartata = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fn()
      .then((data) => {
        if (!scartata) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!scartata) setState({ data: null, loading: false, error });
      });

    return () => {
      scartata = true;
    };
    // `fn` è ricreata a ogni render dal chiamante: la richiesta dipende solo da `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
