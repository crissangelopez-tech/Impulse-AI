/**
 * AuthCallback — recibe el hash `#session_id=...` tras el login de Emergent Google,
 * lo intercambia en backend y redirige a /dashboard.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { completeGoogleSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Idempotencia bajo StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const session_id = match ? decodeURIComponent(match[1]) : null;

    if (!session_id) {
      toast.error("No se recibió session_id");
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const user = await completeGoogleSession(session_id);
        // Limpiar hash de la URL
        window.history.replaceState(null, "", window.location.pathname);
        toast.success(`Bienvenido, ${user.name.split(" ")[0]}`);
        navigate("/dashboard", { replace: true });
      } catch (e) {
        toast.error(e?.response?.data?.detail || "No pudimos completar el login con Google");
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, completeGoogleSession]);

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--pearl)]" data-testid="auth-callback-loading">
      <div className="flex items-center gap-3 text-zinc-600">
        <div className="flex gap-1.5">
          <span className="loader-dot h-2 w-2 rounded-full bg-zinc-900" />
          <span className="loader-dot h-2 w-2 rounded-full bg-zinc-900" />
          <span className="loader-dot h-2 w-2 rounded-full bg-zinc-900" />
        </div>
        <span className="text-sm">Conectando con Google…</span>
      </div>
    </div>
  );
}
