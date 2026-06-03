/**
 * DayCard — Tarjeta visual de un día del calendario.
 * Muestra: día, título, post Facebook, post Instagram, hashtags, guion reel, idea visual, CTA.
 *
 * Diseñada para verse profesional tanto en pantalla como cuando se exporta a PDF
 * (usa html2canvas — colores planos, sin gradientes complejos).
 */
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Hash, Film, Camera, Megaphone } from "lucide-react";

export default function DayCard({ day, index = 0 }) {
  return (
    <article
      className="card-surface card-hover anim-rise relative flex flex-col gap-5 p-6 md:p-7"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      data-testid={`day-card-${day.day}`}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-baseline gap-3">
          <div className="font-display text-4xl font-black tracking-tighter text-zinc-950">
            {String(day.day).padStart(2, "0")}
          </div>
          <div className="flex flex-col">
            <span className="label-eyebrow">Día {day.day}</span>
            <h3 className="mt-0.5 font-display text-base font-bold leading-tight tracking-tight text-zinc-950">
              {day.title}
            </h3>
          </div>
        </div>
      </header>

      {/* Facebook */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Badge className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-50">
            <Facebook className="mr-1 h-3 w-3" />
            Facebook
          </Badge>
        </div>
        <p className="text-[13.5px] leading-relaxed text-zinc-700">{day.facebook}</p>
      </section>

      {/* Instagram */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Badge className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-700 hover:bg-pink-50">
            <Instagram className="mr-1 h-3 w-3" />
            Instagram
          </Badge>
        </div>
        <p className="text-[13.5px] leading-relaxed text-zinc-700">{day.instagram}</p>
      </section>

      {/* Hashtags */}
      {day.hashtags?.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-zinc-500" />
            <span className="label-eyebrow">Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {day.hashtags.map((h, i) => (
              <span
                key={`${h}-${i}`}
                className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700"
              >
                {h}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Reel script */}
      {day.reel_script && (
        <section className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Film className="h-3.5 w-3.5 text-zinc-700" />
            <span className="label-eyebrow">Guion Reel / TikTok</span>
          </div>
          <p className="text-[13px] leading-relaxed text-zinc-700">{day.reel_script}</p>
        </section>
      )}

      {/* Idea visual */}
      {day.visual_idea && (
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Camera className="h-3.5 w-3.5 text-zinc-500" />
            <span className="label-eyebrow">Idea visual</span>
          </div>
          <p className="text-[13px] italic leading-relaxed text-zinc-600">{day.visual_idea}</p>
        </section>
      )}

      {/* CTA */}
      {day.cta && (
        <footer className="mt-auto flex items-start gap-2 border-t border-zinc-200 pt-4">
          <Megaphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <p className="text-[13px] font-semibold leading-snug text-zinc-950">{day.cta}</p>
        </footer>
      )}
    </article>
  );
}
