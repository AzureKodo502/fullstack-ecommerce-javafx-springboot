import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { theme } from "../theme.js";
import ThemeToggle from "./ThemeToggle.jsx";

describe("ThemeToggle", () => {
  it("alterna tra tema chiaro e scuro aggiornando l'etichetta", async () => {
    render(
      <ThemeProvider theme={theme}>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Senza una scelta salvata si parte dal tema del sistema (chiaro in jsdom).
    await userEvent.click(await screen.findByRole("button", { name: "Passa al tema scuro" }));
    expect(await screen.findByRole("button", { name: "Passa al tema chiaro" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Passa al tema chiaro" }));
    expect(await screen.findByRole("button", { name: "Passa al tema scuro" })).toBeInTheDocument();
  });
});
