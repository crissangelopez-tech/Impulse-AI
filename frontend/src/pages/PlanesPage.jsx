/**
 * PlanesPage — Pricing card en dashboard. Estructura preparada (sin pagos aún).
 */
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TIERS = [
  {
    id: "free",
    name: "Gratis",
    price: "$0",
    desc: "Para empezar a probar.",
    items: ["1 proyecto", "Hasta 7 días por plan", "Visualización web"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    desc: "Para negocios activos.",
    items: ["Proyectos ilimitados", "Hasta 30 días por plan", "Exportación PDF", "Historial completo"],
    featured: true,
  },
  {
    id: "agency",
    name: "Agencia",
    price: "$49",
    desc: "Para equipos y agencias.",
    items: ["Varias empresas", "Prioridad de generación", "Soporte directo", "Próximamente: equipo"],
  },
];

export default function PlanesPage() {
  const { user } = useAuth();
  const current = user?.plan || "free";

  return (
    <div className="space-y-10" data-testid="planes-page">
      <header>
        <div className="label-eyebrow">Planes</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
          Crece a tu ritmo.
        </h1>
        <p className="mt-2 max-w-xl text-zinc-500">
          Empieza gratis y actualiza cuando quieras. Sin contratos, sin sorpresas.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TIERS.map((t) => {
          const isCurrent = current === t.id;
          return (
            <div
              key={t.id}
              className={`relative rounded-2xl border p-8 ${
                t.featured
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl shadow-black/20"
                  : "border-zinc-200 bg-white"
              }`}
              data-testid={`plan-card-${t.id}`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
                  <Sparkles className="h-3 w-3" />
                  Más popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold tracking-tight">{t.name}</h3>
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
                disabled={isCurrent}
                onClick={() => toast.info("Pagos disponibles próximamente.")}
                className={`mt-8 w-full rounded-full ${
                  t.featured
                    ? "bg-white text-zinc-950 hover:bg-zinc-100"
                    : "bg-zinc-950 text-white hover:bg-zinc-800"
                } disabled:opacity-100`}
                data-testid={`plan-cta-${t.id}`}
              >
                {isCurrent ? "Tu plan actual" : t.id === "agency" ? "Hablar con ventas" : "Mejorar a " + t.name}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-zinc-500">
        Pagos seguros. Cancela cuando quieras. Próximamente: integración con Stripe.
      </p>
    </div>
  );
}
