import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../context/AuthContext.js";
import Login from "./Login.jsx";

function rendi({ login, iniziale = "/login" }) {
  render(
    <AuthContext.Provider value={{ login }}>
      <MemoryRouter initialEntries={[iniziale]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>home</p>} />
          <Route path="/carrello" element={<p>pagina carrello</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function compilaEInvia(email, password) {
  await userEvent.type(screen.getByLabelText(/^email/i), email);
  await userEvent.type(screen.getByLabelText(/^password/i), password);
  await userEvent.click(screen.getByRole("button", { name: "Accedi" }));
}

describe("Login", () => {
  it("passa le credenziali al login e, riuscito, va alla home", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    rendi({ login });

    await compilaEInvia("mario@example.com", "secret");

    expect(login).toHaveBeenCalledWith("mario@example.com", "secret");
    expect(await screen.findByText("home")).toBeInTheDocument();
  });

  it("dopo il login torna alla pagina che aveva richiesto l'accesso", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    rendi({ login, iniziale: { pathname: "/login", state: { from: { pathname: "/carrello" } } } });

    await compilaEInvia("mario@example.com", "secret");

    expect(await screen.findByText("pagina carrello")).toBeInTheDocument();
  });

  it("mostra il messaggio del server se le credenziali sono sbagliate e resta sulla pagina", async () => {
    const login = vi.fn().mockRejectedValue(new Error("Credenziali non valide"));
    rendi({ login });

    await compilaEInvia("mario@example.com", "sbagliata");

    expect(await screen.findByRole("alert")).toHaveTextContent("Credenziali non valide");
    expect(screen.queryByText("home")).not.toBeInTheDocument();
  });
});
