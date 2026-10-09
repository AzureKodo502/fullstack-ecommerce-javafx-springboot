import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { AuthContext } from "./context/AuthContext.js";
import { CartContext } from "./context/CartContext.js";

function rendiA(percorso) {
  render(
    <AuthContext.Provider value={{ isAuthenticated: false, user: null, logout: vi.fn() }}>
      <CartContext.Provider value={{ conteggio: 0 }}>
        <MemoryRouter initialEntries={[percorso]}>
          <App />
        </MemoryRouter>
      </CartContext.Provider>
    </AuthContext.Provider>,
  );
}

describe("App (routing)", () => {
  // Prima non c'era una rotta di ripiego: un URL sbagliato dava una pagina bianca.
  it("un indirizzo inesistente mostra la pagina 404, non una pagina vuota", async () => {
    rendiA("/questa-pagina-non-esiste");

    expect(await screen.findByRole("heading", { name: "Pagina non trovata" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Torna alla home" })).toHaveAttribute("href", "/");
  });

  it("la home si apre e il contenuto è dentro il landmark main raggiungibile dal link di salto", () => {
    rendiA("/");

    expect(screen.getByRole("main")).toHaveAttribute("id", "contenuto");
    expect(screen.getByRole("link", { name: "Salta al contenuto" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sfoglia il catalogo" })).toBeInTheDocument();
  });

  it("una pagina caricata in modo pigro compare dopo il caricamento (qui il login)", async () => {
    rendiA("/login");

    expect(await screen.findByRole("heading", { name: "Accedi" })).toBeInTheDocument();
  });
});
