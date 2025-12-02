import { useState, useEffect, useRef } from "react";
import { Search, X, Package, Users, Cog, ListOrdered, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // URLs de votre API - Adaptez selon votre backend
  const API_BASE_URL = "http://localhost:5000/api"; // Changez selon votre configuration

  // Fonction de recherche dans l'API
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      try {
        const query = searchQuery.toLowerCase();
        const allResults = [];

        // Pages de navigation
        const pages = [
          { type: "page", name: "Dashboard", path: "/", icon: "📊", category: "Navigation" },
          { type: "page", name: "Processus", path: "/processus", icon: "⚙️", category: "Navigation" },
          { type: "page", name: "Ressources", path: "/ressources", icon: "📦", category: "Navigation" },
          { type: "page", name: "Planification", path: "/planification", icon: "📅", category: "Navigation" },
          { type: "page", name: "Équipements", path: "/equipements", icon: "🔧", category: "Ressources" },
          { type: "page", name: "Matériaux", path: "/materiaux", icon: "📦", category: "Ressources" },
          { type: "page", name: "Opérateurs", path: "/operateurs", icon: "👥", category: "Ressources" },
        ];

        // Filtrer les pages
        const filteredPages = pages.filter(page =>
          page.name.toLowerCase().includes(query) ||
          page.category.toLowerCase().includes(query)
        );
        allResults.push(...filteredPages);

        // Rechercher dans les équipements
        try {
          const equipementsRes = await fetch(`${API_BASE_URL}/equipements`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Si vous utilisez JWT
            }
          });
          if (equipementsRes.ok) {
            const equipements = await equipementsRes.json();
            const filteredEquipements = equipements
              .filter(eq => 
                eq.nom?.toLowerCase().includes(query) ||
                eq.type?.toLowerCase().includes(query) ||
                eq.numero_serie?.toLowerCase().includes(query)
              )
              .map(eq => ({
                type: "equipement",
                name: eq.nom,
                description: `${eq.type} - ${eq.statut}`,
                path: "/equipements",
                icon: "🔧",
                category: "Équipement",
                data: eq
              }));
            allResults.push(...filteredEquipements);
          }
        } catch (error) {
          console.error("Erreur recherche équipements:", error);
        }

        // Rechercher dans les matériaux
        try {
          const materiauxRes = await fetch(`${API_BASE_URL}/materiaux`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (materiauxRes.ok) {
            const materiaux = await materiauxRes.json();
            const filteredMateriaux = materiaux
              .filter(mat => 
                mat.nom?.toLowerCase().includes(query) ||
                mat.type?.toLowerCase().includes(query) ||
                mat.description?.toLowerCase().includes(query)
              )
              .map(mat => ({
                type: "materiau",
                name: mat.nom,
                description: `Stock: ${mat.quantiteStock || 0} unités`,
                path: "/materiaux",
                icon: "📦",
                category: "Matériau",
                data: mat
              }));
            allResults.push(...filteredMateriaux);
          }
        } catch (error) {
          console.error("Erreur recherche matériaux:", error);
        }

        // Rechercher dans les opérateurs
        try {
          const operateursRes = await fetch(`${API_BASE_URL}/operateurs`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (operateursRes.ok) {
            const operateurs = await operateursRes.json();
            const filteredOperateurs = operateurs
              .filter(op => 
                op.nom?.toLowerCase().includes(query) ||
                op.prenom?.toLowerCase().includes(query) ||
                op.poste?.toLowerCase().includes(query) ||
                op.email?.toLowerCase().includes(query)
              )
              .map(op => ({
                type: "operateur",
                name: `${op.prenom} ${op.nom}`,
                description: op.poste || "Opérateur",
                path: "/operateurs",
                icon: "👥",
                category: "Opérateur",
                data: op
              }));
            allResults.push(...filteredOperateurs);
          }
        } catch (error) {
          console.error("Erreur recherche opérateurs:", error);
        }

        // Rechercher dans les processus
        try {
          const processusRes = await fetch(`${API_BASE_URL}/processus`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (processusRes.ok) {
            const processus = await processusRes.json();
            const filteredProcessus = processus
              .filter(proc => 
                proc.nom?.toLowerCase().includes(query) ||
                proc.description?.toLowerCase().includes(query)
              )
              .map(proc => ({
                type: "processus",
                name: proc.nom,
                description: proc.description || "Processus de fabrication",
                path: "/processus",
                icon: "⚙️",
                category: "Processus",
                data: proc
              }));
            allResults.push(...filteredProcessus);
          }
        } catch (error) {
          console.error("Erreur recherche processus:", error);
        }

        setSearchResults(allResults);
      } catch (error) {
        console.error("Erreur de recherche globale:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(() => {
      searchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fermer la recherche en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result) => {
    navigate(result.path);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const getIconComponent = (type) => {
    switch(type) {
      case "equipement": return <Cog className="text-blue-500" size={18} />;
      case "materiau": return <Package className="text-green-500" size={18} />;
      case "operateur": return <Users className="text-purple-500" size={18} />;
      case "processus": return <ListOrdered className="text-orange-500" size={18} />;
      case "page": return <FileText className="text-gray-500" size={18} />;
      default: return <Search className="text-gray-400" size={18} />;
    }
  };

  // Grouper les résultats par catégorie
  const groupedResults = searchResults.reduce((acc, result) => {
    const category = result.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {});

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-700">Système MES</h2>
      
      {/* Zone de recherche */}
      <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher pages, équipements, matériaux, opérateurs..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Résultats de recherche */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              <div className="p-2">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Recherche en cours...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-500 px-3 py-2 font-medium">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                    </p>
                    
                    {/* Afficher les résultats groupés par catégorie */}
                    {Object.entries(groupedResults).map(([category, results]) => (
                      <div key={category} className="mb-3">
                        <p className="text-xs font-semibold text-gray-400 px-3 py-1 uppercase tracking-wide">
                          {category}
                        </p>
                        <div className="space-y-1">
                          {results.map((result, index) => (
                            <div
                              key={`${result.type}-${index}`}
                              onClick={() => handleResultClick(result)}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <span className="text-2xl">{result.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {result.name}
                                </p>
                                {result.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {result.description}
                                  </p>
                                )}
                              </div>
                              {getIconComponent(result.type)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-500">
                      Aucun résultat pour "{searchQuery}"
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Essayez: équipements, matériaux, opérateurs, processus...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="flex items-center gap-3">
        <span className="text-gray-600 text-sm">
          {user?.user?.username || user?.user?.nom}
        </span>
        <img
          src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?semt=ais_hybrid&w=740&q=80"
          alt="user"
          className="w-9 h-9 rounded-full border"
        />
      </div>
    </header>
  );
}