# Stride Style — Frontend React

SPA React che sostituisce il client JavaFX in `../Frontend/`, consumando le stesse API del `../Backend/` Spring Boot. Vedi `../Roadmap.md` per il piano a fasi e le decisioni tecniche, `../Handoff.md` per lo stato di avanzamento.

## Avvio in locale

Richiede il Backend già avviato su `http://localhost:8080` (`cd ../Backend && ./mvnw spring-boot:run`).

```bash
npm install
npm run dev      # http://localhost:5173
```

## Script disponibili

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Dev server Vite con hot reload |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Serve la build di produzione in locale |
| `npm run lint` | Lint con [oxlint](https://oxc.rs/) |
| `npm test` | Esegue i test (Vitest + React Testing Library) una volta |
| `npm run test:watch` | Test in modalità watch, si rilanciano a ogni modifica |

## Stack

Vite + React 19, React Router, Material UI. Nessun TypeScript e nessun Redux/Zustand per scelta — motivazioni in `../Roadmap.md`.
