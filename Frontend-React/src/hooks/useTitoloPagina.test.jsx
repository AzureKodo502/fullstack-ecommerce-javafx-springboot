import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTitoloPagina } from "./useTitoloPagina.js";

describe("useTitoloPagina", () => {
  it("imposta il titolo della scheda con il nome del sito", () => {
    renderHook(() => useTitoloPagina("Catalogo"));

    expect(document.title).toBe("Catalogo · Stride Style");
  });

  it("si aggiorna quando il titolo cambia (es. dettaglio prodotto dopo il caricamento)", () => {
    const { rerender } = renderHook(({ titolo }) => useTitoloPagina(titolo), {
      initialProps: { titolo: "Prodotto" },
    });
    expect(document.title).toBe("Prodotto · Stride Style");

    rerender({ titolo: "Air Max 1" });

    expect(document.title).toBe("Air Max 1 · Stride Style");
  });

  it("alla chiusura della pagina torna al nome del sito", () => {
    const { unmount } = renderHook(() => useTitoloPagina("Carrello"));

    unmount();

    expect(document.title).toBe("Stride Style");
  });
});
