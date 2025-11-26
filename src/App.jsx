import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./routes/RequireAuth";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProcessusPage from "./pages/ProcessusPage";
import RessourcesPage from "./pages/RessourcesPage";
import PlanificationPage from "./pages/PlanificationPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Container from "./components/Container";
import RegisterPage from "./pages/RegisterPage";
import EquipementsPage from "./pages/EquipementsPage";
import MatériauxPage from "./pages/MatériauxPage";
import OperateurPage from "./pages/OperateurPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique */}


           <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes protégées */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <div className="flex min-h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Header />
                    <Container>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/processus" element={<ProcessusPage />} />
                        <Route path="/ressources" element={<RessourcesPage />} />
                        <Route path="/planification" element={<PlanificationPage />} />
                        <Route path="/equipements" element={<EquipementsPage />} />*
                        <Route path="/materiaux" element={<MatériauxPage />} />
                        <Route path="/operateurs" element={<OperateurPage />} />
                      </Routes>
                    </Container>
                  </div>
                </div>
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
