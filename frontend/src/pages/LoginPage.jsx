/**
 * LoginPage — Login / Registro de IMPULSE IA.
 * - Layout split: lado izquierdo (formulario), lado derecho (panel oscuro con quote).
 * - Tabs: Iniciar sesión / Crear cuenta.
 * - Botón "Continuar con Google" → redirige a Emergent Auth.
 * - REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Quote, Sparkles } from "lucide-react";

function GoogleIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.22-4.74 3.22-8.3z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.16A11 11 0 0 0 1 12c0 1.78.43 3.46 1.16 4.96l3.68-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.16-3.16C17.45 2.13 14.97 1 12 1A11 11 0 0 0 2.16 7.04l3.68 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const initialTab = search.get("tab") === "register" ? "register" : "login";
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [submitting, setSubmitting] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCompany, setRegCompany] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(loginEmail.trim(), loginPassword);
      toast.success(`Hola de nuevo, ${u.name.split(" ")[0]}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No pudimos iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        company: regCompany.trim(),
      });
      toast.success(`Bienvenido a IMPULSE IA, ${u.name.split(" ")[0]}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No pudimos crear tu cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href =
      `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const fillDemo = () => {
    setLoginEmail("demo@impulseia.com");
    setLoginPassword("Demo1234!");
  };

  return (
    <div className="min-h-screen bg-[var(--pearl)] lg:grid lg:grid-cols-2">
      {/* Lado izquierdo - formulario */}
      <div className="flex flex-col px-6 py-8 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
            data-testid="back-home-link"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>
        </div>

        <div className="my-auto flex flex-col py-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              {tab === "login" ? "Bienvenido de vuelta" : "Crear tu cuenta"}
            </h1>
            <p className="mt-2 text-zinc-500">
              {tab === "login"
                ? "Ingresa para continuar generando contenido."
                : "Tu próximo mes de contenido te espera."}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-8 h-12 w-full justify-center rounded-xl border-zinc-300 text-sm font-medium hover:bg-zinc-50"
              onClick={handleGoogle}
              data-testid="google-login-btn"
            >
              <GoogleIcon className="mr-3 h-5 w-5" />
              Continuar con Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs uppercase tracking-wider text-zinc-400">o con email</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-zinc-100 p-1">
                <TabsTrigger value="login" className="rounded-lg" data-testid="tab-login">
                  Iniciar sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg" data-testid="tab-register">
                  Crear cuenta
                </TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="mt-6 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Correo</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 rounded-lg bg-zinc-50"
                      data-testid="login-email-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-12 rounded-lg bg-zinc-50"
                      data-testid="login-password-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="btn-shine h-12 w-full rounded-xl bg-zinc-950 text-base hover:bg-zinc-800"
                    data-testid="login-submit-btn"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar sesión"}
                  </Button>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="mt-2 w-full text-center text-xs text-zinc-500 transition-colors hover:text-zinc-900"
                    data-testid="login-demo-btn"
                  >
                    Probar con cuenta demo →
                  </button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="mt-6 space-y-4">
                <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name">Nombre completo</Label>
                    <Input
                      id="reg-name"
                      required
                      minLength={2}
                      placeholder="Carlos Pérez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="h-12 rounded-lg bg-zinc-50"
                      data-testid="register-name-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Correo</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-12 rounded-lg bg-zinc-50"
                      data-testid="register-email-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="h-12 rounded-lg bg-zinc-50"
                      data-testid="register-password-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-company">Nombre de tu empresa</Label>
                    <Input
                      id="reg-company"
                      required
                      placeholder="Taquería El Patrón"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="h-12 rounded-lg bg-zinc-50"
                      data-testid="register-company-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="btn-shine h-12 w-full rounded-xl bg-zinc-950 text-base hover:bg-zinc-800"
                    data-testid="register-submit-btn"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear mi cuenta"}
                  </Button>
                  <p className="text-center text-xs text-zinc-500">
                    Al continuar aceptas nuestros Términos y Política de Privacidad.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="text-xs text-zinc-400">© {new Date().getFullYear()} IMPULSE IA · Plan de Fama IA</div>
      </div>

      {/* Lado derecho - panel marca */}
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="bg-grid absolute inset-0 opacity-10" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-16 text-white">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Generado con IA · 5 minutos</span>
          </div>
          <div className="space-y-8">
            <Quote className="h-8 w-8 text-zinc-500" />
            <blockquote className="font-display text-3xl font-extrabold leading-snug tracking-tight">
              “Pasé de improvisar cada publicación a tener un mes entero planeado en menos de lo que tardo
              en preparar un café.”
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <div>
                <div className="text-sm font-semibold">Sofía Castillo</div>
                <div className="text-xs text-zinc-400">Café Aurora · Mérida</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <div>
                <div className="font-display text-3xl font-extrabold">+1.2K</div>
                <div className="text-xs text-zinc-400">Planes generados</div>
              </div>
              <div>
                <div className="font-display text-3xl font-extrabold">5 min</div>
                <div className="text-xs text-zinc-400">Tiempo promedio</div>
              </div>
              <div>
                <div className="font-display text-3xl font-extrabold">4.9</div>
                <div className="text-xs text-zinc-400">★ Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
