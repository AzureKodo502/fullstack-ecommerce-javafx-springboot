import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./components/Navbar.jsx";
import SaltaAlContenuto from "./components/SaltaAlContenuto.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";

// Ogni pagina (tranne la Home, che è l'ingresso) è un chunk separato, scaricato
// solo quando si visita: il bundle iniziale era oltre i 500 kB.
const Catalogo = lazy(() => import("./pages/Catalogo.jsx"));
const ProdottoDettaglio = lazy(() => import("./pages/ProdottoDettaglio.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Registrazione = lazy(() => import("./pages/Registrazione.jsx"));
const Account = lazy(() => import("./pages/Account.jsx"));
const Carrello = lazy(() => import("./pages/Carrello.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Ordini = lazy(() => import("./pages/Ordini.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function CaricamentoPagina() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress aria-label="Caricamento della pagina" />
    </Box>
  );
}

export default function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SaltaAlContenuto />
      <Navbar />
      <Box component="main" id="contenuto" tabIndex={-1} sx={{ flex: 1, outline: "none" }}>
        <Suspense fallback={<CaricamentoPagina />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prodotti" element={<Catalogo />} />
            <Route path="/prodotti/:id" element={<ProdottoDettaglio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrazione" element={<Registrazione />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/carrello" element={<Carrello />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/ordini" element={<Ordini />} />
              <Route path="/account" element={<Account />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}
