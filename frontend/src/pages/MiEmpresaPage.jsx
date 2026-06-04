/**
 * MiEmpresaPage — Edita los datos de empresa que se usan por defecto en cada plan.
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save, Building2 } from "lucide-react";

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

export default function MiEmpresaPage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: user?.company || "",
    industry: user?.industry || "",
    city: user?.city || "",
    descripcion: user?.descripcion || "",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", form);
      updateUser(data);
      toast.success("Datos de la empresa actualizados");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No pudimos guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="mi-empresa-page">
      <header>
        <div className="label-eyebrow">Mi Empresa</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
          Datos de tu negocio
        </h1>
        <p className="mt-2 text-zinc-500">
          Estos datos se rellenan por defecto cuando creas un nuevo Plan de Fama.
        </p>
      </header>

      <Card className="card-surface flex flex-col gap-6 border-none p-8 md:flex-row md:items-start md:gap-10 md:p-10">
        <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-zinc-100 md:grid">
          <Building2 className="h-6 w-6 text-zinc-700" />
        </div>
        <form onSubmit={handleSave} className="w-full space-y-5" data-testid="empresa-form">
          <div className="space-y-1.5">
            <Label htmlFor="empresa-name" className="label-eyebrow">
              Nombre de empresa
            </Label>
            <Input
              id="empresa-name"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              className="h-12 rounded-lg bg-zinc-50"
              required
              data-testid="empresa-name-input"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="label-eyebrow">Industria</Label>
              <Select value={form.industry} onValueChange={(v) => update("industry", v)}>
                <SelectTrigger className="h-12 rounded-lg bg-zinc-50" data-testid="empresa-industry-trigger">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empresa-city" className="label-eyebrow">
                Ciudad
              </Label>
              <Input
                id="empresa-city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="h-12 rounded-lg bg-zinc-50"
                data-testid="empresa-city-input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="empresa-descripcion" className="label-eyebrow">
              Descripción del negocio
            </Label>
            <Textarea
              id="empresa-descripcion"
              value={form.descripcion}
              onChange={(e) => update("descripcion", e.target.value)}
              placeholder="Ej: Servicio de valet parking para eventos y restaurantes. Choferes certificados, uniformados, manejo de autos de lujo con total seguridad."
              className="min-h-[110px] rounded-lg bg-zinc-50 resize-none text-sm"
              data-testid="empresa-descripcion-input"
            />
            <p className="text-xs text-zinc-400">
              La IA usará esto para generar contenido más exacto en cada plan.
            </p>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="btn-shine h-11 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800"
            data-testid="empresa-save-btn"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar cambios
          </Button>
        </form>
      </Card>
    </div>
  );
}
