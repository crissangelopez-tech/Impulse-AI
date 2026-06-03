/**
 * HistorialPage — Lista de planes generados por el usuario.
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Wand2, Trash2, History as HistoryIcon } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HistorialPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      setItems(data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[historial] no se pudo cargar:", err?.message || err);
      }
      toast.error("No pudimos cargar el historial");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Plan eliminado");
      setItems((it) => it.filter((p) => p.project_id !== id));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[historial] delete fallo:", err?.message || err);
      }
      toast.error("No pudimos eliminar el plan");
    }
  };

  return (
    <div className="space-y-8" data-testid="historial-page">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="label-eyebrow">Historial</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
            Tus Planes de Fama
          </h1>
          <p className="mt-2 text-zinc-500">
            Cada calendario que hayas generado vive aquí — abrilo, reusalo o exportalo a PDF.
          </p>
        </div>
        <Button
          className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800"
          onClick={() => navigate("/crear")}
          data-testid="history-new-btn"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Nuevo plan
        </Button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`hist-skel-${i}`} className="skeleton-shimmer h-36 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-4 p-16 text-center" data-testid="history-empty">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100">
            <HistoryIcon className="h-6 w-6 text-zinc-700" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Aún no hay planes.</h2>
          <p className="max-w-md text-zinc-500">Crear tu primer Plan de Fama no toma más de un café.</p>
          <Button
            className="mt-2 rounded-full bg-zinc-950 text-white hover:bg-zinc-800"
            onClick={() => navigate("/crear")}
            data-testid="history-empty-cta"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Crear el primero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((p) => (
            <div
              key={p.project_id}
              className="card-surface card-hover group flex flex-col gap-3 p-6"
              data-testid={`history-card-${p.project_id}`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                  {p.industry}
                </span>
                <span className="text-xs text-zinc-500">{formatDate(p.created_at)}</span>
              </div>
              <button
                onClick={() => navigate(`/historial/${p.project_id}`)}
                className="text-left"
                data-testid={`history-open-${p.project_id}`}
              >
                <h3 className="font-display text-xl font-bold tracking-tight text-zinc-950 group-hover:underline">
                  {p.company}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {p.duration_days} días · {p.posts_count} publicaciones · {p.city}
                </p>
                <p className="mt-2 text-xs text-zinc-400">Objetivo: {p.objective}</p>
              </button>
              <div className="mt-3 flex justify-between border-t border-zinc-200 pt-4">
                <button
                  onClick={() => navigate(`/historial/${p.project_id}`)}
                  className="text-sm font-semibold text-zinc-900 hover:underline"
                  data-testid={`history-view-${p.project_id}`}
                >
                  Abrir →
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-red-600"
                      data-testid={`history-delete-${p.project_id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar este plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El plan "{p.company}" será eliminado permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(p.project_id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
