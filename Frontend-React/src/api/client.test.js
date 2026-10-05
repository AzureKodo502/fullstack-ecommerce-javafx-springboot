import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client.js";

function rispondi({ status = 200, body = "" } = {}) {
  const fetchFinto = vi.fn().mockResolvedValue(new Response(body, { status }));
  vi.stubGlobal("fetch", fetchFinto);
  return fetchFinto;
}

const headerDellaChiamata = (fetchFinto, nome) => fetchFinto.mock.calls[0][1].headers[nome];

describe("apiClient", () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it("allega l'header Authorization quando c'è un token salvato", async () => {
    localStorage.setItem("token", "abc.def.ghi");
    const fetchFinto = rispondi({ body: "[]" });

    await apiClient.get("/api/cart/1");

    expect(headerDellaChiamata(fetchFinto, "Authorization")).toBe("Bearer abc.def.ghi");
  });

  it("non manda Authorization se l'utente non è loggato", async () => {
    const fetchFinto = rispondi({ body: "[]" });

    await apiClient.get("/api/products");

    expect(headerDellaChiamata(fetchFinto, "Authorization")).toBeUndefined();
  });

  it("interpreta le risposte JSON", async () => {
    rispondi({ body: JSON.stringify({ id: 7, nome: "Air Max" }) });

    await expect(apiClient.get("/api/products/7")).resolves.toEqual({ id: 7, nome: "Air Max" });
  });

  it("restituisce come testo le risposte non JSON (/api/cart/remove risponde 'Rimosso')", async () => {
    rispondi({ body: "Rimosso" });

    await expect(apiClient.post("/api/cart/remove", {})).resolves.toBe("Rimosso");
  });

  it("restituisce null se il corpo è vuoto", async () => {
    rispondi({ status: 200, body: "" });

    await expect(apiClient.post("/api/orders/checkout/1")).resolves.toBeNull();
  });

  it("lancia un errore con status e messaggio del server", async () => {
    rispondi({ status: 401, body: "Credenziali non valide" });

    await expect(apiClient.post("/api/auth/login", {})).rejects.toMatchObject({
      message: "Credenziali non valide",
      status: 401,
    });
  });

  it("usa un messaggio di ripiego se l'errore ha il corpo vuoto (es. checkout a carrello vuoto)", async () => {
    rispondi({ status: 400, body: "" });

    await expect(apiClient.post("/api/orders/checkout/1")).rejects.toMatchObject({
      message: "Errore HTTP 400",
      status: 400,
    });
  });
});
