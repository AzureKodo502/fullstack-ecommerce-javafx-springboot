
# 🛒 E-Commerce Full Stack – Spring Boot, React e JavaFX

[![CI Backend](https://github.com/AzureKodo502/fullstack-ecommerce-javafx-springboot/actions/workflows/ci.yml/badge.svg)](https://github.com/AzureKodo502/fullstack-ecommerce-javafx-springboot/actions/workflows/ci.yml)
[![CI Frontend](https://github.com/AzureKodo502/fullstack-ecommerce-javafx-springboot/actions/workflows/frontend.yml/badge.svg)](https://github.com/AzureKodo502/fullstack-ecommerce-javafx-springboot/actions/workflows/frontend.yml)
![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/SpringBoot-4.0.2-brightgreen)
![React](https://img.shields.io/badge/React-19-61dafb)
![JavaFX](https://img.shields.io/badge/JavaFX-UI-orange)
![Architecture](https://img.shields.io/badge/Architettura-MVC-blueviolet)
![API](https://img.shields.io/badge/API-REST%20%2B%20JWT-success)
![Tests](https://img.shields.io/badge/Test-140%20passing-success)
![Database](https://img.shields.io/badge/Database-H2-lightgrey)
![Status](https://img.shields.io/badge/Stato-Completato-success)
![Project Type](https://img.shields.io/badge/Proggetto-Portfolio-informational)

> **EN English version available here → [Read in English](./README_EN.md)**

## 🌟 Overview

Questo progetto è un'**applicazione e-commerce full-stack**: un **backend Spring Boot REST** con autenticazione **JWT** e **due client** che consumano le stesse API:

- una **SPA React** (client web, in `Frontend-React/`) — responsive, con tema chiaro/scuro;
- il **client desktop JavaFX** originale (in `Frontend/`), mantenuto e funzionante.

L'applicazione simula un negozio di scarpe online e consente agli utenti di sfogliare i prodotti, gestire un carrello e completare un ordine tramite un'architettura client-server.

L'obiettivo principale di questo progetto era progettare un sistema software scalabile e manutenibile, seguendo le migliori pratiche del settore, come l'architettura a strati, la comunicazione RESTful, i test automatici e l'integrazione continua.

---

## 📸 Screenshots

### Prima e dopo: stesso backend, due client

| | **JavaFX** (originale) | **React** (web) |
|:---|:---:|:---:|
| **Catalogo** | <img src="screenshots/home.png" width="380" alt="Catalogo nel client JavaFX"> | <img src="screenshots/react-catalogo.jpg" width="380" alt="Catalogo nel client React"> |
| **Carrello** | <img src="screenshots/cart.png" width="380" alt="Carrello nel client JavaFX"> | <img src="screenshots/react-carrello-scuro.jpg" width="380" alt="Carrello nel client React in tema scuro"> |

### Solo nel client React

| **Dettaglio prodotto** | **Mobile** (menu aperto) |
|:---:|:---:|
| <img src="screenshots/react-dettaglio.jpg" width="400" alt="Dettaglio prodotto con selezione della taglia"> | <img src="screenshots/react-mobile.jpg" width="220" alt="Catalogo su schermo da telefono con il menu aperto"> |

### Login (client JavaFX)

![Login Screen](screenshots/login.png)

---

## Come avviare il Progetto

Il **Backend** va sempre avviato; poi si sceglie un client.

### Prerequisiti
* **Java JDK 21** installato.
* **Maven** (opzionale, il wrapper è incluso).
* **Node.js 24 (LTS)** — solo per il client React.

### Step 1: Avviare il Backend
Aprire un terminale nella cartella `Backend` ed eseguire:
```bash
./mvnw spring-boot:run
```
Il backend parte su `http://localhost:8080`.

### Step 2a: Avviare il client React (web)
Aprire un terminale nella cartella `Frontend-React` ed eseguire:
```bash
npm install
npm run dev
```
L'app è su `http://localhost:5173`.

### Step 2b: Avviare il client JavaFX (desktop)
In alternativa, aprire un terminale nella cartella `Frontend` ed eseguire:
```bash
./mvnw javafx:run
```

---

##  Architettura

L'applicazione segue un'architettura a strati sia nel backend che nei client.

### Backend – Spring Boot

- Controller Layer → Gestione endpoint REST  
- Service Layer → Logica di Business  
- Repository Layer → Accesso ai dati tramite JPA/Hibernate
- Model Layer → Mapping delle entità  
- Security Layer → Autenticazione JWT stateless (filtro + configurazione Spring Security)

L'autenticazione è **stateless**: il login restituisce un token JWT firmato (scadenza 24 ore) che il client invia nell'header `Authorization: Bearer`. Catalogo e immagini sono pubblici; carrello e ordini richiedono un token valido **e** verificano che la risorsa appartenga all'utente autenticato (`403` altrimenti).

### Frontend – React (web)

- Pages → Schermate, caricate in modo pigro (code-splitting per pagina)
- Hooks → Accesso ai dati (`useScarpe`, `useOrdini`…) con stato di caricamento ed errore
- API Layer → Un unico client HTTP che allega il token e normalizza gli errori
- Context → Stato globale di autenticazione e carrello (React Context + `useReducer`)

Il carrello e gli ordini hanno il **backend come fonte di verità**: il client non ricalcola le regole di business, aggiorna lo stato con ciò che il server risponde.

### Frontend – JavaFX (desktop)

- Controller → Gestione interfaccia utente  
- Service Layer → Comunicazione con le API 
- ApiClient → Gestione richieste HTTP (allega il token JWT)
- JSON Parser → Mapping dei dati 

---

##  Tecnologie Usate

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security + JWT (jjwt)
- Hibernate
- H2 Database
- Lombok
- Crittografia password BCrypt

### Frontend React
- React 19 + Vite
- React Router
- Material UI (tema chiaro/scuro, responsive)
- Context API + `useReducer`

### Frontend JavaFX
- JavaFX
- FXML
- CompletableFuture (operazioni asincrone)
- HTTP Client
- JSON Parsing

### Test e qualità
- JUnit 5, Mockito, Spring Test (`MockMvc`, `@DataJpaTest`)
- Vitest, React Testing Library
- GitHub Actions (CI separata per backend e frontend)
- oxlint

### Strumenti
- Maven
- npm
- Git
- IntelliJ IDEA
- Scene Builder

---

##  Funzionalità

###  Autenticazione
- Registrazione Utente
- Login con password cifrate lato server (BCrypt + salt)
- Sessione con token JWT; alla scadenza l'utente viene disconnesso con un messaggio chiaro

---

###  Catalogo Prodotti
- Visualizzazione prodotti
- Filtro per Marca
- Ricerca per Nome
- Pagina di dettaglio con selezione della taglia
- Caricamento dinamico dal backend

---

###  Carrello
- Aggiunta prodotti con selezione taglia
- Fusione automatica delle quantità
- Persistenza remota del carrello
- Sincronizzazione in tempo reale

---

###  Sistema Checkout
- Creazione ordini transazionali
- Reset automatico del carrello dopo il checkout
- Storico ordini

---

###  Performance & UX
- Aggiornamenti UI asincroni
- Comunicazione API non bloccante
- Gestione strutturata degli errori (messaggi comprensibili, anche se il server non risponde)
- Client web responsive (da telefono a desktop), tema chiaro/scuro, accessibilità di base (navigazione da tastiera, titoli di pagina)

---

##  Database

Il backend utilizza un database H2 basato su file che mantiene i dati tra i riavvii dell’applicazione.

Il database viene popolato automaticamente tramite uno script CommandLineRunner che previene duplicazioni di dati.

---

## 🧪 Testing

Il progetto ha **140 test automatici**: **70 sul backend** e **70 sul frontend React**.

### Backend (JUnit 5 + Mockito)

| Livello | Tecnica | Cosa verifica |
|---|---|---|
| **Service** | Mockito (`@ExtendWith(MockitoExtension.class)`) | Logica di business isolata: unicità email, hashing BCrypt, merge quantità nel carrello, calcolo totale ordine, rami di errore |
| **Controller REST** | `@WebMvcTest` + `MockMvc` | Routing, (de)serializzazione JSON, status code (200 / 400 / 401 / 403 / 404), controllo di ownership, assenza dell'hash della password nelle risposte |
| **Repository** | `@DataJpaTest` + H2 in memoria | Query derivate e custom (`findByNomeContainingIgnoreCase`, `findByUserAndScarpaAndTaglia`, DELETE `@Modifying`), vincolo `unique` |
| **Sicurezza** | Unit test + `@SpringBootTest` | Generazione e validazione del JWT; con filtro e token reali: 401 senza token, 403 con il token di un altro utente, 200 con quello giusto |

### Frontend (Vitest + React Testing Library)

| Cosa | Cosa verifica |
|---|---|
| **Client HTTP** | Header `Authorization`, risposte JSON / testo / vuote, errori di rete, scadenza del token |
| **Provider** (`AuthProvider`, `CartProvider`) | Ripristino della sessione, login/logout, righe del carrello unite senza duplicati, risposte in ritardo scartate |
| **Hook, utilità, componenti** | Calcolo del totale in centesimi, `useAsync`, route protette, form di login e registrazione, navbar (desktop e mobile), tema, routing 404 |

I test sulla logica più delicata sono stati verificati anche **per mutazione**: rompendo di proposito il codice, deve fallire esattamente il test dedicato.

### Integrazione continua

Due workflow **GitHub Actions** indipendenti, ognuno con un **filtro per percorso** (una PR che tocca solo il frontend non fa girare Maven, e viceversa):

- `ci.yml` → backend: `./mvnw verify` (JDK 21)
- `frontend.yml` → frontend: `npm ci`, lint, test, build (Node 24)

```bash
# backend (cartella Backend/)
./mvnw test

# frontend (cartella Frontend-React/)
npm test
```

---

##  Miglioramenti Futuri (Roadmap)

- Wishlist Avanzata: Implementazione completa della gestione Preferiti (attualmente placeholder MVP).
- Gateway di Pagamento: Integrazione con Stripe o PayPal per transazioni reali (oggi l'ordine nasce già confermato).
- Storico ordini dettagliato: esporre le righe d'ordine (oggi l'API restituisce solo testata e totale).
- Deploy: client web su un hosting statico, backend con un database persistente (H2 su file non sopravvive su hosting gratuiti).
- Dockerizzazione: Containerizzazione del Backend per facilitare il deploy.
- Multi-valuta: Integrazione API per conversione valute.

---

##  Competenze Acquisite

Attraverso questo progetto ho maturato esperienza pratica in:

- Progettazione architetture software a livelli 
- Sviluppo di REST API
- Autenticazione stateless con JWT e Spring Security, e autorizzazione a livello di risorsa
- Sviluppo di una SPA con React (hook, Context, routing, code-splitting)
- Testing automatico: unit, slice test e test d'integrazione (JUnit/Mockito, Vitest/Testing Library)
- Integrazione continua con GitHub Actions
- Integrazione tra backend e applicazioni desktop  
- Gestione operazioni UI asincrone
- Modellazione database con JPA/Hibernate

---
### Documentazione
- Copertura Javadoc completa per i livelli di servizio e controller.
  
### Qualità del Codice
- **Javadoc** completo per tutti i componenti backend per garantire la manutenibilità e la collaborazione del team.

### Note
- Il componente Frontend JavaFX di questa applicazione è stato inizialmente sviluppato come parte di un **progetto universitario collaborativo**, dimostrando il lavoro di squadra e la gestione condivisa del codice. Il Backend è stato successivamente riprogettato e ampliato individualmente per implementare una solida struttura di microservizi Spring Boot.
- Il **client React**, i test automatici, la CI e l'autenticazione JWT sono stati aggiunti in seguito, individualmente, partendo dal progetto esistente.
- Si prega di notare che **i commenti del codice sorgente, i nomi delle variabili e la documentazione Javadoc sono scritti in italiano**, come da requisiti accademici originali.
  
## Licenza
Progetto creato per scopi didattici e portfolio personale.

##  Autore

Sviluppato da **Oleksandr Bevtsyk**

