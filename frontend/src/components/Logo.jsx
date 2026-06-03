/**
 * Logo de IMPULSE IA — wordmark + glyph.
 * Diseño tipográfico minimalista (Cabinet Grotesk) con un punto luminoso.
 */
export function Logo({ className = "", variant = "dark" }) {
  const ink = variant === "light" ? "text-white" : "text-zinc-950";
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} data-testid="brand-logo">
      <div className="relative h-7 w-7">
        <div className="absolute inset-0 rounded-lg bg-zinc-950" />
        <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <div className="absolute bottom-1 left-1 font-display text-[10px] font-black leading-none text-white">
          I·
        </div>
      </div>
      <span className={`font-display text-[15px] font-extrabold tracking-tight ${ink}`}>
        Impulse<span className="text-zinc-400">·</span>IA
      </span>
    </div>
  );
}
