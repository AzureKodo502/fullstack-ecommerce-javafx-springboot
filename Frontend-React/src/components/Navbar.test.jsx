import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
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
