import { describe, expect, it } from "vitest";
import { calcolaTotale, contaArticoli, subtotaleRiga } from "./carrello.js";

const riga = (prezzo, quantita) => ({ quantita, scarpa: { prezzo } });

describe("contaArticoli", () => {
  it("somma le quantità, non il numero di righe", () => {
    expect(contaArticoli([riga(100, 2), riga(50, 1)])).toBe(3);
  });

  it("vale 0 con il carrello vuoto", () => {
    expect(contaArticoli([])).toBe(0);
  });
});

describe("subtotaleRiga", () => {
  it("moltiplica prezzo e quantità", () => {
    expect(subtotaleRiga(riga(89.99, 2))).toBe(179.98);
  });
});

describe("calcolaTotale", () => {
  it("non accumula errori di arrotondamento dei double", () => {
    // 0.1 * 3 in floating point vale 0.30000000000000004: il calcolo in
    // centesimi interi deve restituire esattamente 0.3.
    expect(0.1 * 3).not.toBe(0.3);
    expect(calcolaTotale([riga(0.1, 3)])).toBe(0.3);
  });

  it("somma righe diverse (stessi prezzi dell'ordine di prova #2)", () => {
    expect(calcolaTotale([riga(94.99, 1), riga(89.99, 2)])).toBe(274.97);
  });

  it("vale 0 con il carrello vuoto", () => {
    expect(calcolaTotale([])).toBe(0);
  });
});
