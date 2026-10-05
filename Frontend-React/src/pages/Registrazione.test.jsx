import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../context/AuthContext.js";
import Registrazione from "./Registrazione.jsx";

function rendi(register) {
  render(
    <AuthContext.Provider value={{ register }}>
      <MemoryRouter initialEntries={["/registrazione"]}>
        <Routes>
          <Route path="/registrazione" element={<Registrazione />} />
          <Route path="/" element={<p>home</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function compila({ password, conferma }) {
  await userEvent.type(screen.getByLabelText(/^nome/i), "Mario");
  await userEvent.type(screen.getByLabelText(/^cognome/i), "Rossi");
  await userEvent.type(screen.getByLabelText(/^email/i), "mario@example.com");
  await userEvent.type(screen.getByLabelText(/^password/i), password);
  await userEvent.type(screen.getByLabelText(/conferma password/i), conferma);
  await userEvent.click(screen.getByRole("button", { name: "Registrati" }));
}

describe("Registrazione", () => {
  // Stessa validazione di RegistrazioneController.java nel client JavaFX.
  it("se le password non coincidono mostra l'errore e non chiama il backend", async () => {
    const register = vi.fn();
    rendi(register);

    await compila({ password: "secret1", conferma: "secret2" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Le password non coincidono.");
    expect(register).not.toHaveBeenCalled();
  });

  it("con dati validi registra l'utente e va alla home", async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    rendi(register);

    await compila({ password: "secret1", conferma: "secret1" });

    expect(register).toHaveBeenCalledWith("Mario", "Rossi", "mario@example.com", "secret1");
    expect(await screen.findByText("home")).toBeInTheDocument();
  });

  it("mostra l'errore del server (es. email già in uso)", async () => {
    const register = vi.fn().mockRejectedValue(new Error("Email già in uso!"));
    rendi(register);

    await compila({ password: "secret1", conferma: "secret1" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Email già in uso!");
  });
});
