import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { aggiungiAlCarrello, getCarrello, rimuoviDalCarrello } from "../api/cart.js";
import { useCart } from "../hooks/useCart.js";
import { AuthContext } from "./AuthContext.js";
import { CartProvider } from "./CartProvider.jsx";

vi.mock("../api/cart.js", () => ({
  getCarrello: vi.fn(),
  aggiungiAlCarrello: vi.fn(),
  rimuoviDalCarrello: vi.fn(),
}));

const scarpa = { id: 10, nome: "Air Max", prezzo: 100 };
const riga = (id, quantita, taglia = 42) => ({ id, quantita, taglia, scarpa });

/** Promise risolvibile a mano: serve a controllare l'ordine con cui arrivano le risposte. */
function differita() {
  let risolvi;
  const promise = new Promise((r) => {
    risolvi = r;
  });
  return { promise, risolvi };
}

/** Provider reale del carrello, con un AuthContext finto che espone solo `user`. */
let utenteCorrente;
function wrapper({ children }) {
  return (
    <AuthContext.Provider value={{ user: utenteCorrente }}>
      <CartProvider>{children}</CartProvider>
    </AuthContext.Provider>
  );
}

async function montaCarrello(righeIniziali = []) {
  getCarrello.mockResolvedValue(righeIniziali);
  const hook = renderHook(() => useCart(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("CartProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    utenteCorrente = { id: 1 };
  });

  it("carica il carrello dell'utente loggato", async () => {
    const { result } = await montaCarrello([riga(1, 2), riga(2, 1, 43)]);

    expect(getCarrello).toHaveBeenCalledWith(1);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.conteggio).toBe(3);
  });

  it("senza utente non chiama il backend e il carrello è vuoto", async () => {
    utenteCorrente = null;
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(getCarrello).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
    expect(result.current.conteggio).toBe(0);
  });

  it("espone l'errore se il caricamento fallisce", async () => {
    getCarrello.mockRejectedValue(new Error("server giù"));
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error.message).toBe("server giù");
    expect(result.current.items).toEqual([]);
  });

  it("aggiungi: una scarpa nuova diventa una nuova riga", async () => {
    const { result } = await montaCarrello([riga(1, 1)]);
    aggiungiAlCarrello.mockResolvedValue(riga(2, 1, 43));

    await act(() => result.current.aggiungi(10, 43));

    expect(aggiungiAlCarrello).toHaveBeenCalledWith({ userId: 1, scarpaId: 10, taglia: 43, quantita: 1 });
    expect(result.current.items).toHaveLength(2);
  });

  it("aggiungi: stessa scarpa e taglia aggiorna la riga esistente invece di duplicarla", async () => {
    const { result } = await montaCarrello([riga(1, 1)]);
    // Il backend unisce le righe e risponde con lo stesso id e la quantità sommata.
    aggiungiAlCarrello.mockResolvedValue(riga(1, 3));

    await act(() => result.current.aggiungi(10, 42, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantita).toBe(3);
    expect(result.current.conteggio).toBe(3);
  });

  it("rimuovi: toglie la riga dallo stato e manda al backend scarpa e taglia di quella riga", async () => {
    const { result } = await montaCarrello([riga(1, 2, 42), riga(2, 1, 43)]);
    rimuoviDalCarrello.mockResolvedValue("Rimosso");

    await act(() => result.current.rimuovi(result.current.items[0]));

    expect(rimuoviDalCarrello).toHaveBeenCalledWith({ userId: 1, scarpaId: 10, taglia: 42 });
    expect(result.current.items.map((i) => i.id)).toEqual([2]);
  });

  it("rimuovi: se il backend rifiuta, la riga resta e l'errore arriva a chi ha chiamato", async () => {
    const { result } = await montaCarrello([riga(1, 2)]);
    rimuoviDalCarrello.mockRejectedValue(new Error("403"));

    await expect(act(() => result.current.rimuovi(result.current.items[0]))).rejects.toThrow("403");

    expect(result.current.items).toHaveLength(1);
  });

  it("svuota: azzera il carrello locale (dopo un checkout il server l'ha già svuotato)", async () => {
    const { result } = await montaCarrello([riga(1, 2)]);

    act(() => result.current.svuota());

    expect(result.current.items).toEqual([]);
    expect(result.current.totale).toBe(0);
  });

  it("scarta la risposta di un utente precedente arrivata in ritardo", async () => {
    const primaRisposta = differita();
    getCarrello.mockReturnValueOnce(primaRisposta.promise).mockResolvedValueOnce([riga(99, 1)]);

    const { result, rerender } = renderHook(() => useCart(), { wrapper });
    utenteCorrente = { id: 2 }; // cambia utente mentre la prima richiesta è ancora in volo
    rerender();
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    await act(async () => primaRisposta.risolvi([riga(1, 5), riga(2, 5)]));

    // Senza lo scarto, il carrello del vecchio utente sovrascriverebbe quello nuovo.
    expect(result.current.items.map((i) => i.id)).toEqual([99]);
  });
});
