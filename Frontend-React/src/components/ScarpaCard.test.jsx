import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ScarpaCard from "./ScarpaCard.jsx";

const scarpa = {
  id: 7,
  nome: "Adidas Yeezy Boost 350 V2 nero lucido",
  marchio: "Adidas",
  prezzo: 229.99,
  imageUrl: "ADYB350V2Black.png",
};

describe("ScarpaCard", () => {
  it("mostra nome, marchio e prezzo in formato italiano, e porta al dettaglio", () => {
    render(
      <MemoryRouter>
        <ScarpaCard scarpa={scarpa} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Adidas Yeezy Boost 350 V2 nero lucido")).toBeInTheDocument();
    expect(screen.getByText("Adidas")).toBeInTheDocument();
    expect(screen.getByText(/229,99\s*€/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/prodotti/7");
  });

  it("carica l'immagine dal backend, non da un percorso locale", () => {
    render(
      <MemoryRouter>
        <ScarpaCard scarpa={scarpa} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: scarpa.nome })).toHaveAttribute(
      "src",
      expect.stringMatching(/\/images\/scarpe\/ADYB350V2Black\.png$/),
    );
  });
});
