import { useCallback, useEffect, useMemo, useReducer } from "react";
import { aggiungiAlCarrello, getCarrello, rimuoviDalCarrello } from "../api/cart.js";
import { useAuth } from "../hooks/useAuth.js";
import { calcolaTotale, contaArticoli } from "../utils/carrello.js";
import { CartContext } from "./CartContext.js";

const STATO_INIZIALE = { items: [], loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "LOADED":
      return { items: action.items, loading: false, error: null };
    case "FAILED":
      return { ...state, loading: false, error: action.error };
    case "ITEM_UPSERTED": {
      // Il backend risponde con la riga già unita (stessa scarpa + taglia =
      // quantità sommata, stesso id): la si sostituisce se c'è, altrimenti si aggiunge.
      const esiste = state.items.some((i) => i.id === action.item.id);
      const items = esiste
        ? state.items.map((i) => (i.id === action.item.id ? action.item : i))
        : [...state.items, action.item];
      return { ...state, items };
    }
    case "ITEM_REMOVED":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "CLEARED":
      return STATO_INIZIALE;
    default:
      throw new Error(`Azione sconosciuta: ${action.type}`);
  }
}

/**
 * Stato del carrello. La fonte di verità è il backend (il carrello è
 * persistente lato server): qui lo si carica al login e lo si tiene
 * allineato aggiornando lo stato con ciò che il server risponde, senza
 * rifare la regola di merge delle quantità lato client.
 * Va montato DENTRO AuthProvider: si ricarica quando cambia l'utente.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, dispatch] = useReducer(reducer, STATO_INIZIALE);

  useEffect(() => {
    if (userId === null) {
      dispatch({ type: "CLEARED" });
      return undefined;
    }

    let scartata = false;
    dispatch({ type: "LOADING" });
    getCarrello(userId)
      .then((items) => {
        if (!scartata) dispatch({ type: "LOADED", items });
      })
      .catch((error) => {
        if (!scartata) dispatch({ type: "FAILED", error });
      });

    return () => {
      scartata = true;
    };
  }, [userId]);

  const aggiungi = useCallback(
    async (scarpaId, taglia, quantita = 1) => {
      const item = await aggiungiAlCarrello({ userId, scarpaId, taglia, quantita });
      dispatch({ type: "ITEM_UPSERTED", item });
    },
    [userId],
  );

  const rimuovi = useCallback(
    async (item) => {
      await rimuoviDalCarrello({ userId, scarpaId: item.scarpa.id, taglia: item.taglia });
      dispatch({ type: "ITEM_REMOVED", id: item.id });
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      items: state.items,
      loading: state.loading,
      error: state.error,
      conteggio: contaArticoli(state.items),
      totale: calcolaTotale(state.items),
      aggiungi,
      rimuovi,
    }),
    [state, aggiungi, rimuovi],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
