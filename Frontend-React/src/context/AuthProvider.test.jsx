import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { AuthProvider } from "./AuthProvider.jsx";

vi.mock("../api/client.js", () => ({ apiClient: { post: vi.fn() } }));

const utente = { id: 33, nome: "Mario", cognome: "Rossi", email: "mario@example.com", role: "USER" };
const rispostaAuth = { token: "tok-123", user: utente };

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthProvider", () => {
  beforeEach(() => vi.resetAllMocks());

  it("parte non autenticato se non c'è nessuna sessione salvata", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("ripristina la sessione da localStorage (un refresh non disconnette)", () => {
    localStorage.setItem("token", "tok-123");
    localStorage.setItem("user", JSON.stringify(utente));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.nome).toBe("Mario");
  });

  it("ignora uno storage incompleto (token senza utente)", () => {
    localStorage.setItem("token", "tok-123");

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("login: chiama il backend, aggiorna lo stato e salva token e utente", async () => {
    apiClient.post.mockResolvedValue(rispostaAuth);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login("mario@example.com", "secret"));

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "mario@example.com",
      password: "secret",
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("token")).toBe("tok-123");
    expect(JSON.parse(localStorage.getItem("user")).email).toBe("mario@example.com");
  });

  it("login fallito: lancia l'errore e non salva nulla", async () => {
    apiClient.post.mockRejectedValue(new Error("Credenziali non valide"));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(act(() => result.current.login("a@b.it", "sbagliata"))).rejects.toThrow(
      "Credenziali non valide",
    );

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("register: autentica subito il nuovo utente", async () => {
    apiClient.post.mockResolvedValue(rispostaAuth);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.register("Mario", "Rossi", "mario@example.com", "secret"));

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/register", {
      nome: "Mario",
      cognome: "Rossi",
      email: "mario@example.com",
      password: "secret",
    });
    expect(result.current.user.id).toBe(33);
  });

  it("logout: azzera lo stato e svuota localStorage", async () => {
    localStorage.setItem("token", "tok-123");
    localStorage.setItem("user", JSON.stringify(utente));
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.logout());

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  // Regressione di un bug trovato provando l'app: subito dopo il login, un
  // componente figlio (il carrello) caricava i suoi dati con una richiesta
  // senza token, perché il token veniva scritto in localStorage da un effect
  // del genitore, che gira DOPO quelli dei figli. api/client.js legge il token
  // proprio da localStorage, quindi deve esserci già quando il figlio "vede" l'utente.
  it("il token è già in localStorage quando un componente figlio vede il nuovo utente", async () => {
    apiClient.post.mockResolvedValue(rispostaAuth);
    const tokenVistoDalFiglio = vi.fn();

    function Figlio() {
      const { user, login } = useAuth();
      useEffect(() => {
        if (user) tokenVistoDalFiglio(localStorage.getItem("token"));
      }, [user]);
      return <button onClick={() => login("mario@example.com", "secret")}>entra</button>;
    }

    render(
      <AuthProvider>
        <Figlio />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "entra" }));

    await waitFor(() => expect(tokenVistoDalFiglio).toHaveBeenCalled());
    expect(tokenVistoDalFiglio).toHaveBeenCalledWith("tok-123");
  });
});
