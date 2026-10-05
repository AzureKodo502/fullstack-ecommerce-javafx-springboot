import { describe, expect, it } from "vitest";
import { formatDataOra } from "./formato.js";

describe("formatDataOra", () => {
  it("formatta il LocalDateTime del backend, anche con 7 cifre frazionarie", () => {
    // Formato reale emesso da Java: i browser non sono tenuti ad accettare
    // più di 3 cifre dopo il secondo, quindi vengono tagliate.
    const testo = formatDataOra("2026-10-06T00:51:58.9221429");

    expect(testo).toMatch(/6 ott 2026/);
    expect(testo).toMatch(/00:51/);
  });

  it("restituisce la stringa originale se non è una data valida", () => {
    expect(formatDataOra("non-una-data")).toBe("non-una-data");
  });
});
