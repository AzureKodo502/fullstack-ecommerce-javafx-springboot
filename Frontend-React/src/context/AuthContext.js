import { createContext } from "react";

// Separato da AuthProvider.jsx: un file che esporta solo il context (nessun
// componente) fa funzionare correttamente il Fast Refresh di Vite.
export const AuthContext = createContext(null);
