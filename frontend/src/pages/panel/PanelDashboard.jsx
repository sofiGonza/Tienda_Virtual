import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../../Services/AuthService";
import DashboardAdmin from "./DashboardAdmin";
import DashboardEmpleado from "./DashboardEmpleado";
import DashboardCliente from "./DashboardCliente";


function PanelDashboard() {
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const s = obtenerSesion();
    if (!s) {
      navigate("/", { replace: true });
      return;
    }
    setRol(String(s.rol).toLowerCase());
  }, [navigate]);

  if (!rol) return null;

  if (rol === "administrador") return <DashboardAdmin />;
  if (rol === "empleado") return <DashboardEmpleado />;
  return <DashboardCliente />;
}

export default PanelDashboard;
