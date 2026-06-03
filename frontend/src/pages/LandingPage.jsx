/**
 * LandingPage — Página marketing pública de IMPULSE IA.
 * Sección hero, problema, features bento, cómo funciona, pricing, testimonios, CTA.
 */
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  Sparkles,
  CalendarDays,
  FileText,
  History,
  Building2,
  Wand2,
  Check,
  Quote,
  Instagram,
  Facebook,
} from "lucide-react";

const INDUSTRIES = ["Restaurantes", "Barberías", "Gimnasios", "Cafeterías", "Tiendas", "Agencias"];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--pearl)] text-zinc-950">
      {/* Header sticky con glass */}
      <header
        className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl"
        data-testid="landing-header"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" data-testid="landing-nav">
            <a href="#features" className="text-sm text-zinc-600 transition-colors hover:text-zinc-950">
              Producto
            </a>
            <a href="#como-funciona" className="text-sm text-zinc-600 transition-colors hover:text-zinc-950">
              Cómo funciona
            </a>
            <a href="#precios" className="text-sm text-zinc-600 transition-colors hover:text-zinc-950">
              Precios
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => navigate("/login")}
              data-testid="header-signin-btn"
            >
              Iniciar sesión
            </Button>
            <Button
              className="btn-shine rounded-full bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800"
              onClick={() => navigate("/login?tab=register")}
              data-testid="header-cta-btn"
            >
              Empezar gratis
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 md:pt-32">
          <div className="anim-rise mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-zinc-700">Plan de Fama IA · Beta abierta</span>
            </div>
            <h1
              className="font-display text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
              data-testid="hero-headline"
            >
              Calendarios completos
              <br />
              <span className="text-zinc-500">para todo el mes,</span>
              <br />
              generados con IA.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-600">
              Pasa de <em className="not-italic font-medium text-zinc-900">"no sé qué publicar"</em> a un calendario
              estratégico de Facebook, Instagram, Reels y CTAs — en menos de 5 minutos.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="btn-shine h-12 rounded-full bg-zinc-950 px-7 text-base font-medium text-white shadow-lg shadow-black/5 hover:bg-zinc-800"
                onClick={() => navigate("/login?tab=register")}
                data-testid="hero-primary-cta"
              >
                Crear mi Plan de Fama
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-zinc-300 px-7 text-base text-zinc-700 hover:bg-zinc-100"
                onClick={() => navigate("/login")}
                data-testid="hero-secondary-cta"
              >
                Ya tengo cuenta
              </Button>
            </div>
            <p className="mt-6 text-xs text-zinc-500">
              Plan gratis · sin tarjeta · 1 proyecto incluido · español
            </p>
          </div>

          {/* Trust strip */}
          <div className="mx-auto mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-[0.18em] text-zinc-400">
            <span>Confían negocios de</span>
            {INDUSTRIES.map((ind) => (
              <span key={ind} className="font-semibold text-zinc-600">{ind}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO de features */}
      <section id="features" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <div className="label-eyebrow mb-3">El producto</div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Todo lo que necesitas para publicar con dirección.
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Una sola herramienta. Un solo flujo. Calendarios listos para copiar, exportar y ejecutar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            {/* Card grande - Calendario */}
            <div className="card-surface card-hover md:col-span-8 p-8 md:p-10 relative overflow-hidden">
              <div className="label-eyebrow mb-4">01 · Calendarios IA</div>
              <h3 className="font-display text-2xl font-bold tracking-tight">
                Día a día, con posts listos para Facebook, Instagram, Reels y hashtags.
              </h3>
              <p className="mt-3 text-zinc-600">
                Generamos copy, guion de video, idea visual y llamado a la acción específico para tu industria y ciudad.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {["Lun", "Mar", "Mié"].map((d, i) => (
                  <div
                    key={d}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="label-eyebrow mb-2">{d}</div>
                    <div className="flex gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        <Facebook className="h-2.5 w-2.5" /> FB
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700">
                        <Instagram className="h-2.5 w-2.5" /> IG
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-zinc-200" />
                      <div className="h-1.5 w-3/4 rounded-full bg-zinc-200" />
                      <div className="h-1.5 w-1/2 rounded-full bg-zinc-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-surface card-hover md:col-span-4 p-8 md:p-10 flex flex-col">
              <div className="label-eyebrow mb-4">02 · PDF Profesional</div>
              <h3 className="font-display text-2xl font-bold tracking-tight">
                Exportá un PDF listo para entregar a tu equipo.
              </h3>
              <FileText className="ml-auto mt-auto h-16 w-16 text-zinc-900" strokeWidth={1.2} />
            </div>

            <div className="card-surface card-hover md:col-span-4 p-8 md:p-10">
              <div className="label-eyebrow mb-4">03 · Historial</div>
              <h3 className="font-display text-xl font-bold tracking-tight">
                Cada plan se guarda automáticamente. Reabrí, compará, reusá.
              </h3>
              <History className="mt-6 h-10 w-10 text-zinc-900" strokeWidth={1.4} />
            </div>

            <div className="card-surface card-hover md:col-span-4 p-8 md:p-10">
              <div className="label-eyebrow mb-4">04 · Multi-industria</div>
              <h3 className="font-display text-xl font-bold tracking-tight">
                Adaptado a tu rubro y ciudad: restaurante, barbería, gimnasio, agencia…
              </h3>
              <Building2 className="mt-6 h-10 w-10 text-zinc-900" strokeWidth={1.4} />
            </div>

            <div className="card-surface card-hover md:col-span-4 p-8 md:p-10">
              <div className="label-eyebrow mb-4">05 · Velocidad real</div>
              <h3 className="font-display text-xl font-bold tracking-tight">
                30 días de contenido en &lt; 5 minutos. Sin prompts, sin curva.
              </h3>
              <Wand2 className="mt-6 h-10 w-10 text-zinc-900" strokeWidth={1.4} />
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <div className="label-eyebrow mb-3">Cómo funciona</div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Tres pasos. Cero fricción.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Cuéntanos tu negocio",
                d: "Nombre, industria, ciudad y tu objetivo del mes. Nada más.",
              },
              {
                n: "02",
                t: "La IA arma tu plan",
                d: "Generamos copy, guiones, hashtags y CTAs día por día.",
              },
              {
                n: "03",
                t: "Exportá y publicá",
                d: "Visualizá, ajustá y descargá un PDF profesional para tu equipo.",
              },
            ].map((s) => (
              <div key={s.n} className="border-t border-zinc-300 pt-6">
                <div className="font-display text-7xl font-black tracking-tighter text-zinc-200">{s.n}</div>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-zinc-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="precios" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <div className="label-eyebrow mb-3">Precios</div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Simple, transparente, sin sorpresas.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: "Gratis", price: "$0", desc: "Para empezar.", items: ["1 proyecto", "Hasta 7 días", "Visualización web"], cta: "Crear cuenta" },
              { name: "Pro", price: "$19", desc: "Para negocios activos.", items: ["Proyectos ilimitados", "Hasta 30 días", "Exportación PDF", "Historial completo"], cta: "Probar Pro", featured: true },
              { name: "Agencia", price: "$49", desc: "Para equipos y agencias.", items: ["Varias empresas", "Prioridad de generación", "Soporte directo", "Próximamente: equipo"], cta: "Hablar con ventas" },
            ].map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl border p-8 ${
                  t.featured
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl shadow-black/20"
                    : "border-zinc-200 bg-white"
                }`}
                data-testid={`pricing-card-${t.name.toLowerCase()}`}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
                    Más popular
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold">{t.name}</h3>
                <p className={`mt-1 text-sm ${t.featured ? "text-zinc-400" : "text-zinc-500"}`}>{t.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-extrabold tracking-tight">{t.price}</span>
                  <span className={`text-sm ${t.featured ? "text-zinc-400" : "text-zinc-500"}`}>/mes</span>
                </div>
                <ul className={`mt-8 space-y-3 text-sm ${t.featured ? "text-zinc-200" : "text-zinc-700"}`}>
                  {t.items.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${t.featured ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 w-full rounded-full ${
                    t.featured
                      ? "bg-white text-zinc-950 hover:bg-zinc-100"
                      : "bg-zinc-950 text-white hover:bg-zinc-800"
                  }`}
                  onClick={() => navigate("/login?tab=register")}
                  data-testid={`pricing-cta-${t.name.toLowerCase()}`}
                >
                  {t.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                q: "Antes pasaba 4 horas armando un calendario. Ahora lo hago en café y media. Y los posts son mejores.",
                a: "Sofía Castillo",
                r: "Dueña · Café Aurora, Mérida",
              },
              {
                q: "Genero los planes de 6 clientes el lunes a primera hora. IMPULSE IA me devolvió las tardes de los lunes.",
                a: "Mateo Reyes",
                r: "Founder · Agencia Pleno",
              },
            ].map((t) => (
              <div key={t.a} className="card-surface p-10">
                <Quote className="h-6 w-6 text-zinc-300" />
                <blockquote className="mt-5 font-display text-2xl font-bold leading-snug tracking-tight">
                  “{t.q}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
                  <div>
                    <div className="text-sm font-semibold">{t.a}</div>
                    <div className="text-xs text-zinc-500">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="anim-rise">
            <CalendarDays className="mx-auto mb-6 h-10 w-10 text-emerald-400" strokeWidth={1.5} />
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              Tu próximo mes de contenido,
              <br />
              <span className="text-zinc-500">listo en 5 minutos.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300">
              Empezá gratis. Crear tu primer plan no toma más de un café.
            </p>
            <Button
              size="lg"
              className="btn-shine mt-10 h-12 rounded-full bg-white px-7 text-base font-medium text-zinc-950 hover:bg-zinc-100"
              onClick={() => navigate("/login?tab=register")}
              data-testid="footer-cta"
            >
              Crear mi cuenta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
          <Logo variant="light" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <Link to="/login" className="hover:text-white">Iniciar sesión</Link>
            <a href="#precios" className="hover:text-white">Precios</a>
            <a href="#features" className="hover:text-white">Producto</a>
            <span>© {new Date().getFullYear()} IMPULSE IA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
