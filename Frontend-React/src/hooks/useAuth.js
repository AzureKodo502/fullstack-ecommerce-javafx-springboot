import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.js";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro <AuthProvider>");
  }
  return context;
}
