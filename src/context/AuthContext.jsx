// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("mes_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // ✅ Fonction pour mettre à jour l'utilisateur
  function setUserData(userData) {
    setUser(userData);
    localStorage.setItem("mes_user", JSON.stringify(userData));
  }

  function login(username, password) {
    if (username === "planificateur" && password === "password") {
      const u = { name: "Planificateur", role: "planificateur" };
      setUser(u);
      localStorage.setItem("mes_user", JSON.stringify(u));
      return { ok: true };
    }
    return { ok: false, message: "Identifiants invalides" };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("mes_user");
    localStorage.removeItem("token");
    console.log("✅ Déconnexion réussie - Token et utilisateur supprimés");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}