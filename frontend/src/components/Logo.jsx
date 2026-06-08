import { useEffect, useRef } from "react";

/**
 * Logo de IMPULSE IA — glyph de pulso eléctrico + wordmark.
 */
export function Logo({ className = "", variant = "light", animated = true }) {
  const pulseRef = useRef(null);

  const isDark = variant === "dark";
  const bg = isDark ? "#0A0A0A" : "#ffffff";
  const ink = isDark ? "#ffffff" : "#0A0A0A";
  const inkMuted = isDark ? "#555" : "#aaa";

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      data-testid="brand-logo"
      style={{ fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif" }}
    >
      {/* Glyph: pulso eléctrico en cuadro */}
      <div
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: isDark ? "#0A0A0A" : "#0A0A0A",
          border: `1.5px solid ${isDark ? "#1e1e1e" : "#e0e0e0"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Glow ambiental */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 60% 40%, rgba(0,255,135,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* SVG: línea de pulso */}
        <svg
          width="24"
          height="16"
          viewBox="0 0 24 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Línea base silenciosa */}
          <line x1="0" y1="8" x2="5" y2="8" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" />

          {/* El pulso */}
          <polyline
            points="5,8 7,8 9,2 11,14 13,4 15,8 17,8"
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Línea base silenciosa derecha */}
          <line x1="17" y1="8" x2="22" y2="8" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" />

          {/* Punto de impacto al final del pulso */}
          <circle cx="22" cy="8" r="1.8" fill="#00FF87" opacity="0.9">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.9;0.3;0.9"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          <defs>
            <linearGradient id="pulseGrad" x1="5" y1="8" x2="17" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1a6644" />
              <stop offset="60%" stopColor="#00FF87" />
              <stop offset="100%" stopColor="#00FFB2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: ink,
              textTransform: "uppercase",
            }}
          >
            Impulse
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#00FF87",
              textTransform: "uppercase",
              marginLeft: 1,
            }}
          >
            IA
          </span>
        </div>
        <span
          style={{
            fontSize: 7.5,
            fontWeight: 500,
            letterSpacing: "0.18em",
            color: inkMuted,
            textTransform: "uppercase",
          }}
        >
          Contenido con IA
        </span>
      </div>
    </div>
  );
}

// Preview para ver ambas variantes
export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48 }}>

      {/* Variante dark sobre fondo oscuro */}
      <div style={{ background: "#0A0A0A", padding: "40px 60px", borderRadius: 20, display: "flex", flexDirection: "column", gap: 32, alignItems: "flex-start" }}>
        <p style={{ color: "#444", fontSize: 11, fontFamily: "monospace", margin: 0 }}>variant="dark"</p>
        <Logo variant="dark" animated />
        {/* Tamaño grande */}
        <Logo variant="dark" animated className="" style={{ transform: "scale(1.8)", transformOrigin: "left" }} />
      </div>

      {/* Variante light sobre fondo claro */}
      <div style={{ background: "#ffffff", padding: "40px 60px", borderRadius: 20, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", gap: 32, alignItems: "flex-start" }}>
        <p style={{ color: "#bbb", fontSize: 11, fontFamily: "monospace", margin: 0 }}>variant="light"</p>
        <Logo variant="light" animated />
      </div>

    </div>
  );
}