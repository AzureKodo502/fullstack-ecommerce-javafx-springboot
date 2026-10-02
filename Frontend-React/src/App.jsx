import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import ProdottoDettaglio from "./pages/ProdottoDettaglio.jsx";
import Login from "./pages/Login.jsx";
import Registrazione from "./pages/Registrazione.jsx";
import Account from "./pages/Account.jsx";

export default function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prodotti" element={<Catalogo />} />
          <Route path="/prodotti/:id" element={<ProdottoDettaglio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrazione" element={<Registrazione />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}
