// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Charger le token et le décoder
    const token = localStorage.getItem("token");
    console.log('🔍 AUTHCONTEXT - Token au chargement:', token);
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('🔍 AUTHCONTEXT - Token décodé au chargement:', decoded);
        setUser(decoded);
      } catch (err) {
        console.error("❌ Token invalide:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ✅ Fonction pour décoder le token et mettre à jour l'utilisateur
  function setUserData(token) {
    console.log('🔍 AUTHCONTEXT setUserData - Token reçu:', token);
    try {
      const decoded = jwtDecode(token);
      console.log('🔍 AUTHCONTEXT setUserData - Token décodé:', decoded);
      setUser(decoded);
      localStorage.setItem("token", token);
      console.log('✅ User state mis à jour avec:', decoded);
    } catch (err) {
      console.error("❌ Erreur décodage token:", err);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("token");
    console.log("✅ Déconnexion réussie");
  }

  return (
    <AuthContext.Provider value={{ user, logout, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}