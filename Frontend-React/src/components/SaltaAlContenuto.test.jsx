import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import SaltaAlContenuto from "./SaltaAlContenuto.jsx";

describe("SaltaAlContenuto", () => {
  it("sposta il focus sul contenuto principale senza toccare l'URL", async () => {
    render(
      <>
        <SaltaAlContenuto />
        <main id="contenuto" tabIndex={-1}>
          contenuto
        </main>
      </>,
    );
    const urlPrima = window.location.href;

    await userEvent.click(screen.getByRole("link", { name: "Salta al contenuto" }));

    expect(screen.getByRole("main")).toHaveFocus();
    expect(window.location.href).toBe(urlPrima);
  });

  it("è il primo elemento raggiungibile con Tab", async () => {
    render(
      <>
        <SaltaAlContenuto />
        <button>altro</button>
      </>,
    );

    await userEvent.tab();

    expect(screen.getByRole("link", { name: "Salta al contenuto" })).toHaveFocus();
  });
});
