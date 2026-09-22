import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import Quienes from "./pages/Quienes";
import Productos from "./pages/Productos";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import Perfil from "./pages/Perfil";
import Pedidos from "./pages/Pedido";
import Chatbot from "./components/Chatbot";

// Panel (ventana propia con menú lateral)
import PanelLayout from "./pages/panel/PanelLayout";
import PanelDashboard from "./pages/panel/PanelDashboard";
import AdminProductos from "./pages/AdminProductos";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminPedidos from "./pages/AdminPedidos";
import MisPedidos from "./pages/panel/MisPedidos";
import DetallePedido from "./pages/panel/DetallePedido";
import Facturas from "./pages/panel/Facturas";
import Ventas from "./pages/panel/Ventas";
import HistorialVentas from "./pages/panel/HistorialVentas";
import DetalleVenta from "./pages/panel/DetalleVenta";
import PQR from "./pages/panel/PQR";
import CuentaBancaria from "./pages/panel/CuentaBancaria";
import AdminServicios from "./pages/panel/AdminServicios";


function App() {
  const location = useLocation();
  const esPanel = location.pathname.startsWith("/panel");

  return (
    <div className="App">
      {!esPanel && <Header />}
      <main className={esPanel ? "" : "contenido"}>
        <Routes>
          {/* ===== WEB PÚBLICA ===== */}
          <Route path="/" element={<Index />} />
          <Route path="/quienes-somos" element={<Quienes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/pedido" element={<Pedidos />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/perfil" element={<Perfil />} />

          {/* ===== PANEL (ventana propia, sin header/footer) ===== */}
          <Route path="/panel" element={<PanelLayout />}>
            <Route index element={<PanelDashboard />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="mis-pedidos" element={<MisPedidos />} />
            <Route path="detalle-pedido/:id" element={<DetallePedido />} />
            <Route path="facturas" element={<Facturas />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="historial-ventas" element={<HistorialVentas />} />
            <Route path="ventas/:id" element={<DetalleVenta />} />
            <Route path="pqr" element={<PQR />} />
            <Route path="cuenta" element={<CuentaBancaria />} />
            <Route path="servicios-admin" element={<AdminServicios />} />
          </Route>
        </Routes>
      </main>
      {!esPanel && <Footer />}
      {!esPanel && <Chatbot />}
    </div>
  );
}

export default App;
