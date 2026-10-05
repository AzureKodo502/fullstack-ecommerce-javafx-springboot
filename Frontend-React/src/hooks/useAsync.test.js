import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAsync } from "./useAsync.js";

function differita() {
  let risolvi;
  let rifiuta;
  const promise = new Promise((res, rej) => {
    risolvi = res;
    rifiuta = rej;
  });
  return { promise, risolvi, rifiuta };
}

describe("useAsync", () => {
  it("passa da loading ai dati", async () => {
    const richiesta = differita();
    const { result } = renderHook(() => useAsync(() => richiesta.promise, "k"));
    expect(result.current.loading).toBe(true);

    await act(async () => richiesta.risolvi(["a", "b"]));

    expect(result.current).toEqual({ data: ["a", "b"], loading: false, error: null });
  });

  it("espone l'errore se la richiesta fallisce", async () => {
    const richiesta = differita();
    const { result } = renderHook(() => useAsync(() => richiesta.promise, "k"));

    await act(async () => richiesta.rifiuta(new Error("boom")));

    expect(result.current.loading).toBe(false);
    expect(result.current.error.message).toBe("boom");
  });

  // Scenario reale del catalogo: si cambia filtro mentre la ricerca precedente
  // è ancora in corso, e quella vecchia risponde per ultima.
  it("scarta la risposta di una richiesta superata da una più recente", async () => {
    const richieste = { vecchia: differita(), nuova: differita() };
    const { result, rerender } = renderHook(
      ({ chiave }) => useAsync(() => richieste[chiave].promise, chiave),
      { initialProps: { chiave: "vecchia" } },
    );

    rerender({ chiave: "nuova" });
    await act(async () => richieste.nuova.risolvi("risultato nuovo"));
    await waitFor(() => expect(result.current.data).toBe("risultato nuovo"));

    await act(async () => richieste.vecchia.risolvi("risultato vecchio"));

    expect(result.current.data).toBe("risultato nuovo");
  });
});
