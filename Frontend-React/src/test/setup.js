import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Senza `globals`, Testing Library non si pulisce da solo tra un test e l'altro.
// localStorage va azzerato perché AuthProvider e api/client.js lo leggono: un
// token rimasto da un test potrebbe far passare (o fallire) quello dopo.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
