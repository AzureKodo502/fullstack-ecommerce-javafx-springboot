import { useCallback, useEffect, useReducer } from "react";
import { apiClient, impostaGestoreNonAutorizzato } from "../api/client.js";
import { AuthContext } from "./AuthContext.js";

const TOKEN_KEY = "token"; // stessa chiave che api/client.js legge per allegare l'header
const USER_KEY = "user";

const STATO_ANONIMO = { user: null, token: null, sessioneScaduta: false };

function loadInitialState() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    const user = rawUser ? JSON.parse(rawUser) : null;
    return token && user ? { ...STATO_ANONIMO, user, token } : STATO_ANONIMO;
  } catch {
    // localStorage non disponibile (es. modalità privata restrittiva): si parte sloggati.
    return STATO_ANONIMO;
  }
}

function persist(state) {
  try {
    if (state.user && state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Se non si riesce a scrivere, la sessione semplicemente non sopravvive a un refresh.
  }
}

function reducer(_state, action) {
  switch (action.type) {
    case "AUTHENTICATED":
      return { user: action.user, token: action.token, sessioneScaduta: false };
    case "LOGGED_OUT":
      return STATO_ANONIMO;
    case "SESSION_EXPIRED":
      // Come il logout, ma ricorda il motivo: la pagina di login lo spiega.
      return { ...STATO_ANONIMO, sessioneScaduta: true };
    default:
      throw new Error(`Azione sconosciuta: ${action.type}`);
  }
}

/**
 * Stato di autenticazione dell'app: utente corrente, token JWT, e le tre
 * operazioni che lo cambiano. Persistito in localStorage così un refresh
 * di pagina non disconnette — letto anche da api/client.js per allegare il
 * token alle richieste, indipendentemente da questo Context.
 *
 * La persistenza avviene dentro le azioni, PRIMA del dispatch, e non in un
 * useEffect: gli effetti dei componenti figli (es. CartProvider, che carica
 * il carrello appena cambia l'utente) girano prima di quelli del genitore,
 * quindi con un effect la prima richiesta partirebbe senza token → 401.
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  const autentica = useCallback(({ token, user }) => {
    persist({ token, user });
    dispatch({ type: "AUTHENTICATED", token, user });
  }, []);

  const login = useCallback(
    async (email, password) => {
      autentica(await apiClient.post("/api/auth/login", { email, password }));
    },
    [autentica],
  );

  const register = useCallback(
    async (nome, cognome, email, password) => {
      autentica(await apiClient.post("/api/auth/register", { nome, cognome, email, password }));
    },
    [autentica],
  );

  const logout = useCallback(() => {
    persist({ token: null, user: null });
    dispatch({ type: "LOGGED_OUT" });
  }, []);

  // Se il backend rifiuta con 401 una richiesta autenticata, il token è scaduto
  // (dura 24h): si disconnette l'utente invece di lasciare l'interfaccia
  // "loggata" con ogni chiamata che fallisce.
  useEffect(() => {
    impostaGestoreNonAutorizzato(() => {
      persist({ token: null, user: null });
      dispatch({ type: "SESSION_EXPIRED" });
    });
    return () => impostaGestoreNonAutorizzato(null);
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    sessioneScaduta: state.sessioneScaduta,
    isAuthenticated: Boolean(state.user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
