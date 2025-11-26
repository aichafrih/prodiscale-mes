import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Layers, Calendar, Settings, LogOut , Package } from "lucide-react";


export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Déconnexion en cours...");
    logout(); // Supprime token et mes_user
    console.log("✅ Déconnexion complétée - Redirection vers login");
    navigate("/login"); // Redirige vers login
  };

  const links = [
    { to: "/", label: "Tableau de bord", icon: <Home size={18} /> },
    { to: "/processus", label: "Processus", icon: <Layers size={18} /> },
    //{ to: "/ressources", label: "Ressources", icon: <Settings size={18} /> },
    //{ to: "/planification", label: "Planification", icon: <Calendar size={18} /> },
    {to: "/equipements", label: "Équipements", icon: <Layers size={18} /> },
    { to: "/materiaux", label: "Matériaux", icon: <Package size={18} /> },
    { to: "/operateurs", label: "Operateurs", icon: <Package size={18} /> },
  ];



  return (
    <aside className="w-64 bg-slate-900 text-gray-100 flex flex-col p-5 shadow-lg">
      <h1 className="text-2xl font-bold text-blue-400 mb-8 text-center">
        MES Factory
      </h1>
      <nav className="flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-gray-300"
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 mt-auto text-gray-400 hover:text-white transition"
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}