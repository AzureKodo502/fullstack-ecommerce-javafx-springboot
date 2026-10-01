import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Da usare come elemento di una <Route> che avvolge altre <Route> figlie
 * (vedi App.jsx). Se non autenticato, redirige al login ricordando da dove
 * si veniva, così dopo il login si torna alla pagina richiesta in origine.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
