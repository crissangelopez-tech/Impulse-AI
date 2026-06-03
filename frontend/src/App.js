/**
 * App — Router principal.
 *
 * Rutas públicas: /, /login
 * Rutas protegidas (DashboardLayout): /dashboard, /crear, /historial, /historial/:id,
 *                                     /mi-empresa, /planes, /configuracion
 *
 * Importante:
 *   - Detectamos el hash `#session_id=...` SÍNCRONAMENTE durante el render para evitar
 *     race conditions con AuthCallback (Emergent Google OAuth).
 *   - REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
import { Navigate, Route, BrowserRouter, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AuthCallback from "@/pages/AuthCallback";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import CreatePlanPage from "@/pages/CreatePlanPage";
import HistorialPage from "@/pages/HistorialPage";
import PlanDetailPage from "@/pages/PlanDetailPage";
import MiEmpresaPage from "@/pages/MiEmpresaPage";
import PlanesPage from "@/pages/PlanesPage";
import ConfiguracionPage from "@/pages/ConfiguracionPage";
import "@/App.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--pearl)]" data-testid="auth-loading">
        <div className="flex gap-2">
          <span className="loader-dot h-2.5 w-2.5 rounded-full bg-zinc-900" />
          <span className="loader-dot h-2.5 w-2.5 rounded-full bg-zinc-900" />
          <span className="loader-dot h-2.5 w-2.5 rounded-full bg-zinc-900" />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  // Detección síncrona del session_id (callback de Google OAuth)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/crear" element={<CreatePlanPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/historial/:id" element={<PlanDetailPage />} />
        <Route path="/mi-empresa" element={<MiEmpresaPage />} />
        <Route path="/planes" element={<PlanesPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
