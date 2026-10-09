const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Legge il token JWT salvato dopo il login (lo scrive AuthProvider).
 * Isolato in una funzione a sé perché è l'unico punto che tocca localStorage
 * direttamente: se in futuro cambia lo storage, cambia solo qui.
 */
function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    // localStorage può non essere disponibile (es. modalità privata restrittiva).
    return null;
  }
}

/**
 * Funzione da chiamare quando il backend rifiuta con 401 una richiesta che
 * portava un token: vuol dire che il token è scaduto o non è più valido.
 * La imposta AuthProvider (che è chi sa come disconnettere l'utente); sta qui
 * come variabile di modulo perché il client non è un componente React.
 */
let gestoreNonAutorizzato = null;
export function impostaGestoreNonAutorizzato(funzione) {
  gestoreNonAutorizzato = funzione;
}

const MESSAGGI_PER_STATUS = {
  401: "Sessione scaduta o non autenticato.",
  403: "Operazione non consentita.",
  404: "Risorsa non trovata.",
};

/**
 * Il corpo di un errore è testo scritto da un nostro controller ("Email già
 * in uso!") oppure il JSON generico di Spring ({"timestamp":...,"status":401,
 * "error":"Unauthorized"}), che a un utente non dice nulla. Il testo si tiene,
 * il JSON si sostituisce con un messaggio per status.
 */
function messaggioDiErrore(status, corpo) {
  const testo = corpo.trim();
  if (testo && !testo.startsWith("{")) return testo;
  if (MESSAGGI_PER_STATUS[status]) return MESSAGGI_PER_STATUS[status];
  if (status >= 500) return "Errore del server. Riprova tra poco.";
  return `Errore HTTP ${status}`;
}

/**
 * Client HTTP minimale verso il Backend: stesso ruolo di ApiClient.java nel
 * client JavaFX — un solo punto che costruisce l'URL, allega il token quando
 * presente e normalizza gli errori, così le pagine non ripetono questa logica.
 */
async function request(path, { method = "GET", body } = {}) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch rifiuta solo per problemi di rete (server spento, offline, CORS):
    // non c'è nessuna risposta HTTP da cui ricavare un messaggio.
    const error = new Error("Impossibile contattare il server. Controlla la connessione e riprova.");
    error.status = 0;
    throw error;
  }

  if (!response.ok) {
    // Un 401 con un token allegato = sessione scaduta. Senza token (es. login
    // con password sbagliata) è un normale errore di credenziali, non una scadenza.
    if (response.status === 401 && token) gestoreNonAutorizzato?.();

    const corpo = await response.text().catch(() => "");
    const error = new Error(messaggioDiErrore(response.status, corpo));
    error.status = response.status; // permette a chi chiama di distinguere es. 404 da 500
    throw error;
  }

  if (response.status === 204) return null;

  // Non tutti gli endpoint rispondono JSON: /api/cart/remove restituisce il
  // testo semplice "Rimosso". Si legge come testo e si prova a interpretarlo.
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
};
