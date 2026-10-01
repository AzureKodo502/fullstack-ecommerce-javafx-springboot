import { useCallback, useEffect, useReducer } from "react";
import { apiClient } from "../api/client.js";
import { AuthContext } from "./AuthContext.js";

const TOKEN_KEY = "token"; // stessa chiave che api/client.js legge per allegare l'header
const USER_KEY = "user";

function loadInitialState() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    const user = rawUser ? JSON.parse(rawUser) : null;
    return token && user ? { user, token } : { user: null, token: null };
  } catch {
    // localStorage non disponibile (es. modalità privata restrittiva): si parte sloggati.
    return { user: null, token: null };
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
      return { user: action.user, token: action.token };
    case "LOGGED_OUT":
      return { user: null, token: null };
    default:
      throw new Error(`Azione sconosciuta: ${action.type}`);
  }
}

/**
 * Stato di autenticazione dell'app: utente corrente, token JWT, e le tre
 * operazioni che lo cambiano. Persistito in localStorage così un refresh
 * di pagina non disconnette — letto anche da api/client.js per allegare il
 * token alle richieste, indipendentemente da questo Context.
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    persist(state);
  }, [state]);

  const login = useCallback(async (email, password) => {
    const { token, user } = await apiClient.post("/api/auth/login", { email, password });
    dispatch({ type: "AUTHENTICATED", token, user });
  }, []);

  const register = useCallback(async (nome, cognome, email, password) => {
    const { token, user } = await apiClient.post("/api/auth/register", {
      nome,
      cognome,
      email,
      password,
    });
    dispatch({ type: "AUTHENTICATED", token, user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGGED_OUT" });
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: Boolean(state.user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
