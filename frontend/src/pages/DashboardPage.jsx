/**
 * DashboardPage — Vista principal tras login.
 *  - Saludo personalizado + tarjetas estadísticas
 *  - CTA principal: Crear mi Plan de Fama
 *  - Vista rápida del historial reciente
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wand2,
  CalendarDays,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, hint, testId }) {
  return (
    <div className="card-surface flex flex-col gap-5 p-6" data-testid={testId}>
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">{label}</span>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="font-display text-4xl font-extrabold tracking-tight text-zinc-950">{value}</div>
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const PLAN_LABEL = { free: "Gratis", pro: "Pro", agency: "Agencia" };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([api.get("/dashboard/stats"), api.get("/projects")]);
        setStats(s.data);
        setRecent(p.data.slice(0, 4));
      } catch {
        // noop
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "amigo";

  return (
    <div className="space-y-10" data-testid="dashboard-page">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="label-eyebrow">Dashboard</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl" data-testid="dashboard-greeting">
            Hola, {firstName}.
          </h1>
          <p className="mt-2 text-zinc-500" data-testid="dashboard-subtitle">
            Empresa: <span className="font-semibold text-zinc-800">{user?.company || "—"}</span>
            {user?.city ? ` · ${user.city}` : ""}
          </p>
        </div>
        <Button
          size="lg"
          className="btn-shine h-12 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800"
          onClick={() => navigate("/crear")}
          data-testid="dashboard-create-btn"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Crear mi Plan de Fama
        </Button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`stat-skel-${i}`} className="skeleton-shimmer h-40 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Proyectos"
              value={stats?.total_projects ?? 0}
              icon={Layers}
              hint="Total acumulado"
              testId="stat-projects"
            />
            <StatCard
              label="Publicaciones"
              value={stats?.total_posts ?? 0}
              icon={CalendarDays}
              hint="Generadas por IA"
              testId="stat-posts"
            />
            <StatCard
              label="Última generación"
              value={stats?.last_generation ? formatDate(stats.last_generation).split(",")[0] : "—"}
              icon={Clock}
              hint={stats?.last_generation ? formatDate(stats.last_generation) : "Aún no creas planes"}
              testId="stat-last"
            />
            <StatCard
              label="Plan actual"
              value={PLAN_LABEL[stats?.current_plan ?? "free"]}
              icon={Sparkles}
              hint="Cambia cuando quieras"
              testId="stat-plan"
            />
          </>
        )}
      </section>

      {/* Quick action panel + recientes */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* CTA grande */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-950 bg-zinc-950 p-8 text-white shadow-[0_4px_24px_rgba(10,10,10,0.06)] lg:col-span-2" data-testid="dashboard-cta-card">
          <div className="bg-grid absolute inset-0 opacity-10" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              Acción rápida
            </div>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight">
              Crear un nuevo Plan de Fama
            </h2>
            <p className="mt-2 max-w-lg text-zinc-300">
              Cuéntanos tu empresa, industria, ciudad y objetivo. En menos de un minuto tendrás un calendario completo listo.
            </p>
            <Button
              className="mt-6 rounded-full bg-white text-zinc-950 hover:bg-zinc-100"
              onClick={() => navigate("/crear")}
              data-testid="dashboard-cta-button"
            >
              Empezar ahora
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tip box */}
        <div className="card-surface flex flex-col justify-between p-8">
          <div>
            <div className="label-eyebrow">Tip pro</div>
            <p className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-zinc-950">
              Mientras más concreto sea tu objetivo, mejor será tu calendario.
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Ej.: "Llenar la barra de tacos los miércoles" funciona mejor que "Más ventas".
            </p>
          </div>
          <div className="mt-6 flex -space-x-1.5">
            <div className="h-8 w-8 rounded-full border-2 border-white bg-emerald-100" />
            <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100" />
            <div className="h-8 w-8 rounded-full border-2 border-white bg-pink-100" />
          </div>
        </div>
      </section>

      {/* Recientes */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight">Historial reciente</h2>
          <button
            onClick={() => navigate("/historial")}
            className="text-sm text-zinc-500 hover:text-zinc-900"
            data-testid="dashboard-see-all-history"
          >
            Ver todo →
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="card-surface p-10 text-center" data-testid="empty-recent">
            <p className="text-zinc-500">Aún no has creado ningún Plan de Fama.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => navigate("/crear")}
              data-testid="empty-create-btn"
            >
              Crear el primero
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recent.map((p) => (
              <button
                key={p.project_id}
                onClick={() => navigate(`/historial/${p.project_id}`)}
                className="card-surface card-hover group flex flex-col items-start gap-3 p-6 text-left"
                data-testid={`recent-item-${p.project_id}`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="label-eyebrow">{p.industry}</span>
                  <span className="text-xs text-zinc-500">{formatDate(p.created_at)}</span>
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-zinc-950">{p.company}</h3>
                <p className="text-sm text-zinc-500">
                  {p.duration_days} días · {p.posts_count} publicaciones · {p.city}
                </p>
                <span className="mt-2 text-xs text-zinc-400 group-hover:text-zinc-900">Abrir plan →</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
