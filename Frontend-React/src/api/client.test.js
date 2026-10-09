import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, impostaGestoreNonAutorizzato } from "./client.js";

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

  it("sostituisce il JSON generico di Spring con un messaggio leggibile", async () => {
    const jsonSpring = '{"timestamp":"2026-10-02T17:52:11Z","status":403,"error":"Forbidden","path":"/api/cart/1"}';
    rispondi({ status: 403, body: jsonSpring });

    await expect(apiClient.get("/api/cart/1")).rejects.toMatchObject({
      message: "Operazione non consentita.",
      status: 403,
    });
  });

  it("descrive gli errori 5xx senza mostrare dettagli interni", async () => {
    rispondi({ status: 500, body: '{"status":500,"error":"Internal Server Error"}' });

    await expect(apiClient.get("/api/products")).rejects.toMatchObject({
      message: "Errore del server. Riprova tra poco.",
      status: 500,
    });
  });

  it("se il server è irraggiungibile lancia un errore comprensibile con status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(apiClient.get("/api/products")).rejects.toMatchObject({
      message: expect.stringMatching(/Impossibile contattare il server/),
      status: 0,
    });
  });

  describe("sessione scaduta", () => {
    afterEach(() => impostaGestoreNonAutorizzato(null));

    it("un 401 su una richiesta con token avvisa il gestore (token scaduto)", async () => {
      const gestore = vi.fn();
      impostaGestoreNonAutorizzato(gestore);
      localStorage.setItem("token", "scaduto");
      rispondi({ status: 401, body: '{"status":401,"error":"Unauthorized"}' });

      await expect(apiClient.get("/api/cart/1")).rejects.toMatchObject({ status: 401 });

      expect(gestore).toHaveBeenCalledTimes(1);
    });

    it("un 401 senza token (login con password sbagliata) NON è una scadenza", async () => {
      const gestore = vi.fn();
      impostaGestoreNonAutorizzato(gestore);
      rispondi({ status: 401, body: "Credenziali non valide" });

      await expect(apiClient.post("/api/auth/login", {})).rejects.toThrow("Credenziali non valide");

      expect(gestore).not.toHaveBeenCalled();
    });

    it("un errore diverso da 401 non avvisa il gestore", async () => {
      const gestore = vi.fn();
      impostaGestoreNonAutorizzato(gestore);
      localStorage.setItem("token", "valido");
      rispondi({ status: 403, body: "" });

      await expect(apiClient.get("/api/cart/2")).rejects.toMatchObject({ status: 403 });

      expect(gestore).not.toHaveBeenCalled();
    });
  });
});
