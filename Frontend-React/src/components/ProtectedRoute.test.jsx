import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthContext } from "../context/AuthContext.js";
import ProtectedRoute from "./ProtectedRoute.jsx";

function PaginaLogin() {
  const location = useLocation();
  return <p>pagina login, provenienza: {location.state?.from?.pathname}</p>;
}

function rendi(isAuthenticated) {
  render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <MemoryRouter initialEntries={["/privata"]}>
        <Routes>
          <Route path="/login" element={<PaginaLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/privata" element={<p>contenuto riservato</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("mostra la pagina se l'utente è autenticato", () => {
    rendi(true);

    expect(screen.getByText("contenuto riservato")).toBeInTheDocument();
  });

  it("senza login porta alla pagina di login ricordando quella richiesta", () => {
    rendi(false);

    expect(screen.queryByText("contenuto riservato")).not.toBeInTheDocument();
    expect(screen.getByText(/pagina login, provenienza: \/privata/)).toBeInTheDocument();
  });
});
