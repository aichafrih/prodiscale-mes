import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Layers, Calendar, Settings, LogOut, Wrench, Package, ChevronDown, ChevronRight, Users } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [processus, setProcessus] = useState([]);
  const [expandedProcessus, setExpandedProcessus] = useState({});
  

  const token = localStorage.getItem('token');

useEffect(() => {
  fetchProcessus();
  
  // Rafraîchir toutes les 5 secondes
  const interval = setInterval(() => {
    fetchProcessus();
  }, 5000);

  return () => clearInterval(interval);
}, []);



 
  const fetchProcessus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/processus', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProcessus(res.data);
    } catch (err) {
      console.error('Erreur chargement processus:', err);
    }
  };

  const toggleProcessus = (id) => {
    setExpandedProcessus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = () => {
    console.log("Déconnexion en cours...");
    logout();
    console.log("✅ Déconnexion complétée - Redirection vers login");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Tableau de bord", icon: <Home size={18} /> },
   
    { to: "/equipements", label: "Équipements", icon: <Wrench size={18} /> },
    { to: "/materiaux", label: "Matériaux", icon: <Package size={18} /> },
    { to: "/operateurs", label: "Opérateurs", icon: <Users size={18} /> },
     { to: "/processus", label: "Processus", icon: <Layers size={18} /> },
];


  return (
    <aside className="w-64 bg-slate-900 text-gray-100 flex flex-col shadow-lg overflow-y-auto">
      <div className="p-5">
        <h1 className="text-xl font-bold text-blue-400 mb-8 text-center">
          Gestion de Ressources 
        </h1>
      </div>

      <nav className="flex-1 px-3">
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

        {/* Section Processus avec Étapes */}
        <div className="mt-6 border-t border-slate-700 pt-4">
          <h3 className="text-xs uppercase text-gray-400 font-semibold mb-3 px-3">
            Mes Processus
          </h3>
          
          {processus.length === 0 ? (
            <p className="text-xs text-gray-500 px-3 italic">Aucun processus</p>
          ) : (
            <div className="space-y-1">
              {processus.map((proc) => (
                <div key={proc._id}>
                  {/* Nom du processus */}
                  <div
                    onClick={() => toggleProcessus(proc._id)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-800 text-gray-300 transition"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {expandedProcessus[proc._id] ? (
                        <ChevronDown size={14} className="flex-shrink-0" />
                      ) : (
                        <ChevronRight size={14} className="flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{proc.nom}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                      proc.statut === 'actif' ? 'bg-green-600' : 
                      proc.statut === 'archive' ? 'bg-red-600' : 'bg-gray-600'
                    }`}>
                      {proc.statut === 'actif' ? 'A' : proc.statut === 'archive' ? 'Ar' : 'B'}
                    </span>
                  </div>

                  {/* Liste des étapes */}
                  {expandedProcessus[proc._id] && proc.etapes && proc.etapes.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-700 pl-2">
                      {proc.etapes.map((etape, idx) => (
                        <NavLink
                          key={idx}
                          to={`/processus/${proc._id}/etapes/${etape._id}`}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded text-xs transition ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:bg-slate-800 hover:text-gray-200"
                            }`
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-700 text-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-semibold">
                              {etape.numero}
                            </span>
                            <span className="truncate">{etape.nom}</span>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                  )}

                  {expandedProcessus[proc._id] && (!proc.etapes || proc.etapes.length === 0) && (
                    <div className="ml-6 mt-1 px-3 py-1 text-xs text-gray-500 italic">
                      Aucune étape
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


          <div className="p-5 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
      </nav>

    
    </aside>
  );
}