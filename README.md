
# 🛒 E-Commerce Desktop Application – Full Stack Java Project

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/SpringBoot-4.0.2-brightgreen)
![JavaFX](https://img.shields.io/badge/JavaFX-UI-orange)
![Architecture](https://img.shields.io/badge/Architettura-MVC-blueviolet)
![API](https://img.shields.io/badge/API-REST-success)
![Database](https://img.shields.io/badge/Database-H2-lightgrey)
![Status](https://img.shields.io/badge/Stato-Completato-success)
![Project Type](https://img.shields.io/badge/Proggetto-Portfolio-informational)

> **EN Versione Inglese disponibile qui → [Read in English](./README_EN.md)**

## 🌟 Overview

Questo progetto è un'**applicazione e-commerce desktop full-stack** realizzata utilizzando **JavaFX (frontend)** e **Spring Boot REST API (backend)**.

L'applicazione simula un vero e proprio negozio di scarpe online e consente agli utenti di sfogliare i prodotti, gestire un carrello ed effettuare operazioni di pagamento tramite un'architettura client-server.

L'obiettivo principale di questo progetto era progettare un sistema software scalabile e manutenibile, seguendo le migliori pratiche del settore, come l'architettura a strati, le operazioni asincrone dell'interfaccia utente e la comunicazione RESTful.

---

## Screenshots

| **Login & Auth** | **Catalogo Prodotti** |
|:---:|:---:|
| ![Login Screen](screenshots/login.png) | ![Home Page](screenshots/home.png) |

| **Carrello** |
| ![Cart View](screenshots/cart.png) |

---

## Come avviare il Progetto

Per eseguire questa applicazione, è necessario avviare sia il **Backend Server** sia il **Frontend Client**.

### Prerequisiti
* **Java JDK 21** installato.
* **Maven** (opzionale, il wrapper è incluso).

### Step 1: Avviare il Backend
Aprire un terminale nella cartella `Backend` ed eseguire:
```bash
# Windows
./mvnw spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

### Step 2: Avviare il Frontend
Aprire un terminale nella cartella `Frontend` ed eseguire:
```bash
# Windows
./mvnw javafx:run

# Mac/Linux
./mvnw javafx:run
```

##  Architettura

L'applicazione segue un'architettura a strati sia nel frontend che nel backend.

### Backend – Spring Boot

- Controller Layer → Gestione endpoint REST  
- Service Layer → Logica di Business  
- Repository Layer → Accesso ai dati tramite JPA/Hibernate
- Model Layer → Mapping delle entità  

### Frontend – JavaFX

- Controller → Gestione interfaccia utente  
- Service Layer → Comunicazione con le API 
- ApiClient → Gestione richieste HTTP
- JSON Parser → Mapping dei dati 

---

##  Tecnologie Usate

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- H2 Database
- Lombok
- Crittografia password BCrypt

### Frontend
- JavaFX
- FXML
- CompletableFuture (operazioni asincrone)
- HTTP Client
- JSON Parsing

### Strumenti
- Maven
- Git
- IntelliJ IDEA
- Scene Builder

---

##  Funzionalità

###  Autenticazione
- Registrazione Utente
- Sistema login sicuro
- Gestione sessione

---

###  Catalogo Prodotti
- Visualizzazione prodotti
- Filtro per Marca
- Ricerca per Nome
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

---

###  Performance & UX
- Aggiornamenti UI asincroni
- Comunicazione API non bloccante
- Gestione strutturata degli errori

---

##  Database

Il backend utilizza un database H2 basato su file che mantiene i dati tra i riavvii dell’applicazione.

Il database viene popolato automaticamente tramite uno script CommandLineRunner che previene duplicazioni di dati.

---

##  Miglioramenti Futuri (Roadmap)

- Wishlist Avanzata: Implementazione completa della gestione Preferiti (attualmente placeholder MVP).
- Gateway di Pagamento: Integrazione con Stripe o PayPal per transazioni reali.
- Dockerizzazione: Containerizzazione del Backend per facilitare il deploy.
- Multi-valuta: Integrazione API per conversione valute.

---

##  Competenze Acquisite

Attraverso questo progetto ho maturato esperienza pratica in:

- Progettazione architetture software a livelli 
- Sviluppo di REST API
- Integrazione tra backend e applicazioni desktop  
- Gestione operazioni UI asincrone
- Modellazione database con JPA/Hibernate

---
### Documentazione
- Copertura Javadoc completa per i livelli di servizio e controller.
  
### Qualità del Codice
- **Javadoc** completo per tutti i componenti backend per garantire la manutenibilità e la collaborazione del team.

### Note
- Il componente Frontend di questa applicazione è stato inizialmente sviluppato come parte di un **progetto universitario collaborativo**, dimostrando il lavoro di squadra e la gestione condivisa del codice. Il Backend è stato successivamente riprogettato e ampliato individualmente per implementare una solida struttura di microservizi Spring Boot.
- Si prega di notare che **i commenti del codice sorgente, i nomi delle variabili e la documentazione Javadoc sono scritti in italiano**, come da requisiti accademici originali.
  
## Licenza
Progetto creato per scopi didattici e portfolio personale.

##  Autore

Sviluppato da **Oleksandr Bevtsyk**

