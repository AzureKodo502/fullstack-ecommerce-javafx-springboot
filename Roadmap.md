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
| Autenticazione | JWT (fatto il 2026-09-18, prima della Fase 0) | Il backend firma un token alla login/registrazione; il frontend React lo salva (es. in `localStorage`) e lo allega come header `Authorization: Bearer <token>` a ogni richiesta — stesso pattern già usato nel client JavaFX aggiornato. |

Queste scelte non si ridiscutono a ogni sessione: se una si rivela sbagliata strada facendo, si annota qui il cambio e il motivo.

---

## Fase 0 — Backend pronto per il web ✅ (2026-10-01)

**Obiettivo:** il backend accetta richieste da un'origine browser e sa servire le immagini dei prodotti.

- [x] Configurazione CORS — già dentro `SecurityConfig` (fatta insieme al JWT), verificata con una preflight reale da `http://localhost:5173`: `Access-Control-Allow-Origin` corretto
- [x] Copiate le 54 immagini scarpe da `Frontend/src/main/resources/immaginiScarpe/` a `Backend/src/main/resources/static/images/scarpe/`
- [x] Verificato `GET /images/scarpe/<file>.png` → 200 (e un file inesistente → 404, dopo un fix: rimbalzava su `/error`, bloccato dal SecurityConfig, risultava 401)

**Fatto quando:** `./mvnw verify` verde + una chiamata manuale a un'immagine funziona da browser. ✅ Verificato anche a mano con il server acceso (vedi Handoff.md per il dettaglio).
**Branch/PR:** `feat/react-phase-0-backend-cors`, 2 commit, PR da aprire.

---

## Fase 1 — Scaffold del progetto React ✅ (2026-10-01)

**Obiettivo:** un progetto che builda, con la struttura e il layout base.

- [x] `npm create vite@latest Frontend-React -- --template react` (React 19, Vite 8, oxlint)
- [x] Installati `react-router-dom`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- [x] Struttura cartelle: `src/{api,components,context,hooks,pages}`
- [x] `.env` con `VITE_API_BASE_URL=http://localhost:8080` (tracciato: nessun segreto)
- [x] Layout base (Navbar + Footer) con tema MUI, routing con una Home placeholder
- [x] `src/api/client.js`: wrapper fetch con token automatico da `localStorage`, stesso ruolo di `ApiClient.java` nel client JavaFX

**Fatto quando:** `npm run build` verde, `npm run dev` mostra la Home con navbar. ✅ Verificato anche visivamente (screenshot) e via console (nessun errore).
**Branch/PR:** `feat/react-phase-1-scaffold`, PR da aprire.

---

## Fase 2 — Autenticazione ✅ (2026-10-01)

**Obiettivo:** login e registrazione funzionanti contro le API reali.

- [x] Client HTTP in `src/api/client.js` (già fatto in Fase 1)
- [x] `AuthContext`/`AuthProvider`: utente corrente, token, `login()`, `logout()`, `register()`, persistenza in `localStorage`
- [x] Pagina **Login** e pagina **Registrazione** (form MUI, validazione client identica a `RegistrazioneController.java`)
- [x] `ProtectedRoute`: redirect a `/login` se non autenticato, ricordando la pagina di provenienza. Applicata per ora a `/account` (prima pagina protetta) — Carrello/Checkout/Storico la useranno allo stesso modo quando esisteranno (Fasi 4-5)

**Fatto quando:** una registrazione crea davvero un utente nel DB H2, il login popola il context (utente + token), un refresh di pagina non disconnette. ✅ Verificato end-to-end con Backend e frontend avviati insieme: registrazione reale, redirect automatico, refresh senza logout, `/account` senza sessione → redirect a `/login`, nessun errore console.
**Branch/PR:** `feat/react-phase-2-auth`, PR da aprire.

---

## Fase 3 — Catalogo prodotti ✅ (2026-10-02)

**Obiettivo:** sfogliare, cercare, filtrare le scarpe.

- [x] Hook `useScarpe` → `GET /api/products` (+ `useScarpa`, `useMarchi`, `useAsync` di base)
- [x] Pagina Catalogo: griglia di card prodotto (MUI `Card`)
- [x] Barra di ricerca → `GET /api/products/search?q=`
- [x] Filtro per marchio → `GET /api/products/brand/{marchio}` (combinabile con la ricerca)
- [x] Pagina Dettaglio prodotto (`/prodotti/:id`) con selezione taglia 36–44
- [x] **Backend**: aggiunto `GET /api/products/{id}` (con 404) — mancava, il service lo aveva già

**Fatto quando:** lista, ricerca e filtro mostrano dati reali dal backend; il click su una card apre il dettaglio. ✅ Verificato con Backend e frontend avviati insieme.
**Branch/PR:** `feat/react-phase-3-catalogo`, 2 commit, PR da aprire.

---

## Fase 4 — Carrello ✅ (2026-10-02)

**Obiettivo:** aggiungere, rimuovere, vedere gli articoli; badge nel nav.

- [x] `CartContext`/`CartProvider` + reducer. **Scelta diversa dal piano**: invece di rifare la regola di merge lato client, il backend resta fonte di verità e lo stato si aggiorna con la riga che il server risponde (già unita, stesso id)
- [x] Integrazione `POST /api/cart/add` e `POST /api/cart/remove`
- [x] Pagina Carrello (`/carrello`, protetta): articoli, quantità, subtotali, totale
- [x] Badge contatore (numero di paia) in Navbar
- [x] Pulsante "Aggiungi al carrello" attivo nel dettaglio (da sloggati porta al login e poi torna al prodotto)
- [x] **Backend**: `@JsonIgnore` su `User.password` (l'hash usciva in ogni riga del carrello)
- [x] **Fix a codice della Fase 2**: il token ora si salva prima del dispatch, non in un `useEffect` (causava 401 al primo caricamento del carrello)

**Fatto quando:** aggiungere due volte la stessa scarpa+taglia incrementa la quantità invece di duplicare la riga. ✅ Verificato con Backend e frontend insieme (una riga con quantità 2; taglia diversa = seconda riga).
**Limite noto**: il backend non ha un decremento di quantità, quindi dal carrello si può solo rimuovere l'intera riga (come nel client JavaFX).
**Branch/PR:** `feat/react-phase-4-carrello`, 3 commit, PR da aprire.

---

## Fase 5 — Checkout e storico ordini ✅ (2026-10-06)

**Obiettivo:** completare un acquisto e vederlo nello storico.

- [x] Pagina Checkout (riepilogo + conferma) → `POST /api/orders/checkout/{userId}`
- [x] Svuotamento del carrello lato client dopo conferma (`svuota()` nel `CartProvider`)
- [x] Pagina Storico Ordini → `GET /api/orders/user/{userId}`
- [x] Link "Ordini" in Navbar per i loggati; "Procedi al checkout" attivo nel carrello

**Fatto quando:** il flusso browse → carrello → checkout → storico funziona senza refresh manuale della pagina. ✅ Verificato con Backend e frontend insieme, compreso il caso di due schede con stato diverso (400 gestito, nessun ordine doppio).
**Limiti noti (backend)**: l'ordine restituisce solo testata e totale, non le righe, quindi lo storico non mostra *cosa* è stato comprato; non c'è un pagamento (l'ordine nasce confermato). Esporre le righe richiederebbe una modifica backend (+ test).
**Branch/PR:** `feat/react-phase-5-checkout`, 1 commit, PR da aprire.

---

## Fase 6 — Test frontend ✅ (2026-10-07)

**Obiettivo:** applicare al frontend la stessa disciplina di test usata sul backend.

- [x] Vitest 5 + React Testing Library (jsdom), script `npm test` e `npm run test:watch`
- [x] Test su `AuthProvider` / `CartProvider` (stesso spirito degli unit test Mockito sui service)
- [x] Test su componenti e pagine: Login, Registrazione, ProtectedRoute, ScarpaCard, Navbar
- [x] Mock delle chiamate API con `vi.mock` / `fetch` finto — niente `msw`: i moduli `api/*.js` sono sottili e il confine da mockare è chiaro

**Fatto quando:** `npm test` verde. ✅ **48 test in 11 file** (oltre i 10–15 previsti: tutti su comportamenti con un motivo, nessuno di riempimento).
**Verificato per mutazione**: 5 rotture mirate del codice (scarto risposte in ritardo, merge per id, token in un `useEffect`, ripiego sulle risposte non JSON, scarto in `useAsync`) → ogni volta fallisce esattamente il test dedicato e nessun altro.
**Non incluso (di proposito)**: le pagine `Catalogo`, `ProdottoDettaglio`, `Carrello`, `Checkout`, `Ordini` non hanno test di pagina. La loro logica sta già coperta in hook/provider/utils; i test di pagina sarebbero soprattutto MUI e routing. Se servono, sono il candidato naturale per un'estensione.
**Branch/PR:** `feat/react-phase-6-test-frontend`, 2 commit, PR da aprire.

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

- ~~**JWT**~~ — **fatto in anticipo il 2026-09-18** (branch `feat/jwt-auth`), prima ancora di iniziare la Fase 0. Vedi `Handoff.md` per i dettagli. Autenticazione stateless con Spring Security + jjwt, controllo di ownership su carrello/ordini (403 se lo userId non coincide col token), client JavaFX aggiornato per inviare il token. Refresh token **non incluso** (token con scadenza fissa a 24h) — se servisse, resta da fare a parte.
- **Deploy** — frontend su Vercel/Netlify (free tier, statico, nessun costo), backend su Render free web service. Richiede di sostituire H2-su-file con **Neon Postgres** (stesso provider free già usato per il progetto RAG) perché Render free non offre disco persistente — H2 si resetterebbe a ogni sleep/riavvio. URL API configurabile via env. Nessun costo ricorrente: sono tutti tier fissi gratuiti, non a consumo come le chiamate API di un LLM. ~1–2 giorni, da fare per ultimo e solo se si vuole un link live oltre alla demo locale.
- **TypeScript** — conversione incrementale file per file, quando c'è tempo. Non blocca nulla.
