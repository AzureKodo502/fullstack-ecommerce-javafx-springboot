# Roadmap — Migrazione Frontend a React

> Obiettivo: sostituire il client JavaFX con una SPA React che consuma le API Spring Boot già esistenti (e già testate), senza toccare la logica di business del Backend. Metodo: PR piccole e mirate — una per fase — con build/test verdi ad ogni merge, esattamente come fatto per i punti 1 e 2 (test + CI).

Stato generale del progetto:
- [x] **Punto 1** — Testing backend (JUnit 5 + Mockito)
- [x] **Punto 2** — CI con GitHub Actions
- [ ] **Punto 3** — Frontend React ← *siamo qui*

---

## Decisioni di partenza

| Ambito | Scelta | Perché |
|---|---|---|
| Tooling | Vite + React (JavaScript, non TypeScript) | Setup veloce, meno attrito per imparare React. TS resta uno stretch goal a conversione incrementale. |
| Routing | `react-router-dom` | Standard de-facto, poche dipendenze. |
| UI library | Material UI (MUI) | Componenti pronti e coerenti, riduce il tempo speso su CSS puro. |
| Stato globale | React Context + `useReducer` (auth, carrello) | L'app è piccola: Redux/Zustand sarebbero over-engineering, e "ho scelto Context perché bastava" è una risposta migliore in colloquio di "ho messo Redux perché lo mettono tutti". |
| HTTP | `fetch` con un client sottile in `src/api/` | Niente Axios: una dipendenza in meno, e il wrapper è comunque il posto giusto per gestire errori/base URL. |
| Cartella | `Frontend-React/` nuova, accanto a `Backend/` e `Frontend/` | `Frontend/` (JavaFX) **resta intatta** come riferimento storico — utile per uno screenshot prima/dopo nel README finale. |
| Immagini prodotto | Servite dal **Backend** come risorse statiche (`/images/scarpe/...`) | Le immagini sono dati di prodotto, non asset del frontend: un solo posto dove vivono, coerente con `Scarpa.imageUrl`. |
| Autenticazione (MVP) | Nessun token: `User` in Context + `localStorage` dopo il login | Il backend oggi non ha JWT. Rifarlo bene è un progetto a parte (vedi Stretch) — non blocca l'MVP del frontend. |

Queste scelte non si ridiscutono a ogni sessione: se una si rivela sbagliata strada facendo, si annota qui il cambio e il motivo.

---

## Fase 0 — Backend pronto per il web

**Obiettivo:** il backend accetta richieste da un'origine browser e sa servire le immagini dei prodotti.

- [ ] Configurazione CORS (`WebMvcConfigurer`) che abilita `http://localhost:5173` (dev server Vite) e lascia un punto di estensione per l'origine di produzione
- [ ] Copiare le immagini scarpe da `Frontend/src/main/resources/immaginiScarpe/` a `Backend/src/main/resources/static/images/scarpe/`
- [ ] Verificare che `GET /images/scarpe/<file>.png` risponda 200

**Fatto quando:** `./mvnw verify` verde + una chiamata manuale a un'immagine funziona da browser.
**Stima:** 1–2 giorni. **PR:** `feat(backend): CORS e static serving delle immagini prodotto`

---

## Fase 1 — Scaffold del progetto React

**Obiettivo:** un progetto che builda, con la struttura e il layout base.

- [ ] `npm create vite@latest Frontend-React -- --template react`
- [ ] Installare `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`
- [ ] Struttura cartelle: `src/{api,components,context,pages,hooks}`
- [ ] `.env` con `VITE_API_BASE_URL=http://localhost:8080`
- [ ] Layout base (Navbar + Footer) con tema MUI, routing con una Home placeholder

**Fatto quando:** `npm run build` verde, `npm run dev` mostra la Home con navbar.
**Stima:** 2–3 giorni. **PR:** `feat(frontend): scaffold React + Vite + Router + MUI`

---

## Fase 2 — Autenticazione

**Obiettivo:** login e registrazione funzionanti contro le API reali.

- [ ] Client HTTP in `src/api/client.js` (base URL + gestione errori centralizzata)
- [ ] `AuthContext`: utente corrente, `login()`, `logout()`, `register()`, persistenza in `localStorage`
- [ ] Pagina **Login** e pagina **Registrazione** (form MUI, validazione client)
- [ ] Route protette: redirect a `/login` se non autenticato (Carrello, Checkout, Storico)

**Fatto quando:** una registrazione crea davvero un utente nel DB H2, il login popola il context, un refresh di pagina non disconnette.
**Stima:** 3–4 giorni. **PR:** `feat(frontend): autenticazione (login, registrazione, route protette)`

---

## Fase 3 — Catalogo prodotti

**Obiettivo:** sfogliare, cercare, filtrare le scarpe.

- [ ] Hook `useScarpe` → `GET /api/products`
- [ ] Pagina Catalogo: griglia di card prodotto (MUI `Card`)
- [ ] Barra di ricerca → `GET /api/products/search?q=`
- [ ] Filtro per marchio → `GET /api/products/brand/{marchio}`
- [ ] Pagina Dettaglio prodotto (`/prodotti/:id`) con selezione taglia

**Fatto quando:** lista, ricerca e filtro mostrano dati reali dal backend; il click su una card apre il dettaglio.
**Stima:** 3–5 giorni. **PR:** `feat(frontend): catalogo prodotti (lista, ricerca, filtro, dettaglio)`

---

## Fase 4 — Carrello

**Obiettivo:** aggiungere, rimuovere, vedere gli articoli; badge nel nav.

- [ ] `CartContext` + reducer (rispecchia la regola di merge quantità già testata nel backend)
- [ ] Integrazione `POST /api/cart/add` e `POST /api/cart/remove`
- [ ] Pagina Carrello: articoli, quantità, subtotali, totale
- [ ] Badge contatore in Navbar

**Fatto quando:** aggiungere due volte la stessa scarpa+taglia incrementa la quantità invece di duplicare la riga — stessa regola già coperta da `CartServiceTest`.
**Stima:** 3–5 giorni. **PR:** `feat(frontend): carrello (context, pagina, badge)`

---

## Fase 5 — Checkout e storico ordini

**Obiettivo:** completare un acquisto e vederlo nello storico.

- [ ] Pagina Checkout (riepilogo + conferma) → `POST /api/orders/checkout/{userId}`
- [ ] Svuotamento del carrello lato client dopo conferma
- [ ] Pagina Storico Ordini → `GET /api/orders/user/{userId}`

**Fatto quando:** il flusso browse → carrello → checkout → storico funziona senza refresh manuale della pagina.
**Stima:** 2–3 giorni. **PR:** `feat(frontend): checkout e storico ordini`

---

## Fase 6 — Test frontend

**Obiettivo:** applicare al frontend la stessa disciplina di test usata sul backend.

- [ ] Vitest + React Testing Library
- [ ] Test su `AuthContext` / `CartContext` (logica pura, stesso spirito degli unit test Mockito)
- [ ] Test su 2–3 componenti chiave (form di login, card prodotto, badge carrello) con render + interazione utente
- [ ] Mock delle chiamate API (`msw` o mock di `fetch`)

**Fatto quando:** 10–15 test veri, `npm test` verde.
**Stima:** 3–4 giorni. **PR:** `test(frontend): Vitest + React Testing Library su context e componenti chiave`

---

## Fase 7 — Rifinitura

**Obiettivo:** qualità da portfolio, non solo "funziona".

- [ ] Stati di loading/errore su ogni chiamata API (niente schermate vuote silenziose)
- [ ] Responsive mobile/tablet
- [ ] Dark/light mode (parità con il tema del client JavaFX)
- [ ] Accessibilità di base (focus visibile, label sui form)

**Fatto quando:** l'app si usa bene da telefono e nessuna azione fallisce in silenzio.
**Stima:** 3–5 giorni. **PR:** `polish(frontend): stati di caricamento/errore, responsive, dark mode`

---

## Fase 8 — CI e narrazione

**Obiettivo:** pipeline verde anche sul frontend, storia coerente nel README.

- [ ] Job CI separato, filtrato su `Frontend-React/**` (`npm ci && npm run build && npm test`)
- [ ] Badge CI frontend nel README (accanto a quello backend)
- [ ] Sezione "Frontend React" nel README con screenshot prima (JavaFX) / dopo (React)

**Fatto quando:** due badge verdi nel README (backend + frontend), README aggiornato.
**Stima:** 1–2 giorni. **PR:** `ci(frontend): build e test su GitHub Actions` + `docs: README con sezione frontend React`

---

## Stima totale MVP (Fasi 0–8)

**~3–4 settimane part-time.**

---

## Stretch goal (dopo l'MVP, opzionali)

- **JWT** — sostituire l'auth "ingenua" con un vero token + refresh + endpoint protetti (Spring Security). ~3–4 giorni, PR dedicata, mini-roadmap a parte.
- **Deploy** — frontend su Vercel/Netlify (free tier, statico, nessun costo), backend su Render free web service. Richiede di sostituire H2-su-file con **Neon Postgres** (stesso provider free già usato per il progetto RAG) perché Render free non offre disco persistente — H2 si resetterebbe a ogni sleep/riavvio. URL API configurabile via env. Nessun costo ricorrente: sono tutti tier fissi gratuiti, non a consumo come le chiamate API di un LLM. ~1–2 giorni, da fare per ultimo e solo se si vuole un link live oltre alla demo locale.
- **TypeScript** — conversione incrementale file per file, quando c'è tempo. Non blocca nulla.
