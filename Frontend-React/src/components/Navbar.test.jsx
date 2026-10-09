import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../context/AuthContext.js";
import { CartContext } from "../context/CartContext.js";
import Navbar from "./Navbar.jsx";

function rendi({ auth, conteggio = 0 }) {
  render(
    <AuthContext.Provider value={{ logout: vi.fn(), ...auth }}>
      <CartContext.Provider value={{ conteggio }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </CartContext.Provider>
    </AuthContext.Provider>,
  );
}

describe("Navbar", () => {
  it("da sloggati mostra Accedi e nasconde Ordini", () => {
    rendi({ auth: { isAuthenticated: false, user: null } });

    expect(screen.getByRole("link", { name: "Accedi" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ordini" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Esci" })).not.toBeInTheDocument();
  });

  it("da loggati mostra nome utente, Ordini ed Esci", () => {
    rendi({ auth: { isAuthenticated: true, user: { nome: "Mario" } } });

    expect(screen.getByRole("link", { name: "Mario" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: "Ordini" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Esci" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Accedi" })).not.toBeInTheDocument();
  });

  it("il carrello indica il numero di paia", () => {
    rendi({ auth: { isAuthenticated: true, user: { nome: "Mario" } }, conteggio: 3 });

    expect(screen.getByRole("link", { name: "Carrello, 3 articoli" })).toHaveAttribute("href", "/carrello");
  });
});

describe("Navbar su schermi piccoli", () => {
  beforeEach(() => {
    // jsdom non ha matchMedia: lo si finge in modo che ogni media query risulti vera,
    // cioè "schermo stretto".
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query) => ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
      }),
    });
  });

  afterEach(() => {
    delete window.matchMedia;
  });

  it("raccoglie i link in un menu: chiuso non si vedono, il carrello resta sempre a portata", () => {
    rendi({ auth: { isAuthenticated: false, user: null }, conteggio: 2 });

    expect(screen.getByRole("button", { name: "Apri il menu" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Catalogo" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carrello, 2 articoli" })).toBeInTheDocument();
  });

  it("aperto, il menu mostra le voci per chi non è loggato", async () => {
    rendi({ auth: { isAuthenticated: false, user: null } });

    await userEvent.click(screen.getByRole("button", { name: "Apri il menu" }));

    expect(await screen.findByRole("menuitem", { name: "Catalogo" })).toHaveAttribute("href", "/prodotti");
    expect(screen.getByRole("menuitem", { name: "Accedi" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Ordini" })).not.toBeInTheDocument();
  });

  it("da loggati il menu offre Ordini, Account ed Esci, e Esci disconnette", async () => {
    const logout = vi.fn();
    rendi({ auth: { isAuthenticated: true, user: { nome: "Mario" }, logout } });

    await userEvent.click(screen.getByRole("button", { name: "Apri il menu" }));

    expect(await screen.findByRole("menuitem", { name: "Ordini" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Account (Mario)" })).toHaveAttribute("href", "/account");
    await userEvent.click(screen.getByRole("menuitem", { name: "Esci" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
