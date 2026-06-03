/**
 * PlanDetailPage — Detalle de un plan generado.
 *  - Header con info empresa, industria, ciudad, objetivo, duración.
 *  - Grid de DayCards.
 *  - Exportación a PDF (html2canvas + jsPDF), con logo y datos.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import DayCard from "@/components/DayCard";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  Download,
  Calendar,
  MapPin,
  Target,
  Building2,
  Loader2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function formatDate(iso, withTime = true) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[plan-detail] no se pudo cargar:", err?.message || err);
        }
        if (!cancelled) {
          toast.error("No pudimos cargar este plan");
          navigate("/historial");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleExportPDF = async () => {
    if (!printRef.current || !project) return;
    setExporting(true);
    try {
      // Convertimos toda la zona "imprimible" a canvas y la paginamos en PDF
      const node = printRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const filename = `ImpulseIA_${project.company.replace(/\s+/g, "_")}_${project.duration_days}d.pdf`;
      pdf.save(filename);
      toast.success("PDF descargado");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[plan-detail] PDF export fallo:", err?.message || err);
      }
      toast.error("No pudimos generar el PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-12 w-1/2 rounded-lg" />
        <div className="skeleton-shimmer h-32 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`day-skel-${i}`} className="skeleton-shimmer h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }
  if (!project) return null;

  return (
    <div className="space-y-8" data-testid="plan-detail-page">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/historial")}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          data-testid="back-to-history"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Historial
        </button>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800"
          data-testid="export-pdf-btn"
        >
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Descargar PDF
        </Button>
      </div>

      {/* Zona imprimible (esto va al PDF) */}
      <div ref={printRef} className="space-y-6 bg-white p-2 md:p-4" data-testid="plan-print-area">
        {/* Encabezado del PDF */}
        <header className="card-surface flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Logo />
              <span className="hidden text-xs text-zinc-400 md:inline">·</span>
              <span className="hidden text-xs uppercase tracking-[0.18em] text-zinc-400 md:inline">
                Plan de Fama IA
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-950 md:text-4xl" data-testid="plan-title">
              {project.company}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {project.industry}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {project.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> {project.objective}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {project.duration_days} días
              </span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-zinc-500 md:text-right">
            <div className="label-eyebrow">Generado</div>
            <div className="font-medium text-zinc-700">{formatDate(project.created_at, false)}</div>
            <div className="text-zinc-400">{project.content?.length || 0} publicaciones generadas</div>
          </div>
        </header>

        {/* Grid de días */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="days-grid">
          {project.content?.map((d) => (
            <DayCard key={`day-${d.day}`} day={d} index={d.day - 1} />
          ))}
        </div>

        {/* Footer PDF */}
        <footer className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-zinc-200 px-2 py-6 text-xs text-zinc-400 md:flex-row">
          <span>Generado con IMPULSE IA · Plan de Fama IA</span>
          <span>impulseia.app · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}
