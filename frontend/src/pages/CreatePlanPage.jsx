/**
 * CreatePlanPage — Formulario para generar un Plan de Fama IA.
 * Campos: empresa, industria, ciudad, objetivo, duración (7/15/30).
 * Al enviar llama POST /api/projects y redirige al detalle.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Wand2, Loader2, Sparkles } from "lucide-react";

const INDUSTRIES = [
  "Restaurante",
  "Cafetería",
  "Barbería / Salón de belleza",
  "Gimnasio / Fitness",
  "Tienda de ropa / Moda",
  "Agencia de marketing",
  "Inmobiliaria",
  "Clínica / Salud",
  "Educación / Cursos",
  "E-commerce",
  "Servicios profesionales",
  "Otro",
];

const OBJECTIVES = [
  { v: "Conseguir más clientes", d: "Atraer nuevos compradores y leads." },
  { v: "Incrementar ventas", d: "Mover producto/servicio existente." },
  { v: "Obtener seguidores", d: "Crecer comunidad en redes." },
  { v: "Posicionar marca", d: "Construir autoridad y recordación." },
  { v: "Lanzar promoción", d: "Empujar una oferta específica." },
];

const DURATIONS = [
  { v: 7, label: "7 días", hint: "Semana" },
  { v: 15, label: "15 días", hint: "Quincena" },
  { v: 30, label: "30 días", hint: "Mes completo" },
];

export default function CreatePlanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    company: user?.company || "",
    industry: user?.industry || "",
    city: user?.city || "",
    objective: "Conseguir más clientes",
    duration_days: 7,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.industry || !form.city || !form.objective) {
      toast.error("Completa todos los campos.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/projects", form);
      toast.success("¡Plan de Fama listo!");
      navigate(`/historial/${data.project_id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No pudimos generar el plan. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10" data-testid="create-plan-page">
      <header>
        <div className="label-eyebrow">Crear plan</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
          Tu próximo mes,
          <br />
          <span className="text-zinc-500">en cinco minutos.</span>
        </h1>
        <p className="mt-3 max-w-xl text-zinc-500">
          Llena estos campos y la IA arma un calendario completo con copy, hashtags, guiones e ideas visuales.
        </p>
      </header>

      <Card className="card-surface border-none p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8" data-testid="create-plan-form">
          {/* Empresa + Industria */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company" className="label-eyebrow">
                Empresa
              </Label>
              <Input
                id="company"
                placeholder="Taquería El Patrón"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="h-12 rounded-lg bg-zinc-50"
                required
                data-testid="create-company-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-eyebrow">Industria</Label>
              <Select value={form.industry} onValueChange={(v) => update("industry", v)}>
                <SelectTrigger className="h-12 rounded-lg bg-zinc-50" data-testid="create-industry-trigger">
                  <SelectValue placeholder="Selecciona una industria" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i} data-testid={`industry-option-${i}`}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ciudad + Objetivo */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="label-eyebrow">
                Ciudad
              </Label>
              <Input
                id="city"
                placeholder="Mérida"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="h-12 rounded-lg bg-zinc-50"
                required
                data-testid="create-city-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-eyebrow">Objetivo principal</Label>
              <Select value={form.objective} onValueChange={(v) => update("objective", v)}>
                <SelectTrigger className="h-12 rounded-lg bg-zinc-50" data-testid="create-objective-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVES.map((o) => (
                    <SelectItem key={o.v} value={o.v} data-testid={`objective-option-${o.v}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{o.v}</span>
                        <span className="text-xs text-zinc-500">{o.d}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-3">
            <Label className="label-eyebrow">Duración del plan</Label>
            <RadioGroup
              value={String(form.duration_days)}
              onValueChange={(v) => update("duration_days", parseInt(v, 10))}
              className="grid grid-cols-3 gap-3"
            >
              {DURATIONS.map((d) => (
                <Label
                  key={d.v}
                  htmlFor={`dur-${d.v}`}
                  className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border p-5 transition-all ${
                    form.duration_days === d.v
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-lg shadow-black/10"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                  data-testid={`duration-${d.v}`}
                >
                  <RadioGroupItem id={`dur-${d.v}`} value={String(d.v)} className="sr-only" />
                  <span className="font-display text-2xl font-extrabold tracking-tight">{d.label}</span>
                  <span className={`text-xs ${form.duration_days === d.v ? "text-zinc-300" : "text-zinc-500"}`}>
                    {d.hint}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
              La generación toma ~20–60 segundos.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="btn-shine h-12 rounded-full bg-zinc-950 px-7 text-white hover:bg-zinc-800"
              data-testid="create-submit-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando tu plan…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Crear mi Plan de Fama
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
