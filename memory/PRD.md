# IMPULSE IA · Plan de Fama IA — PRD

## Problem Statement (original, sin modificar)
Build a complete SaaS web app called **IMPULSE IA (Plan de Fama IA)** that lets
businesses auto-generate complete social media content calendars using AI (Groq).
Premium, professional, marketing-ready. Inspirations: Notion, Stripe, Linear, Framer.
Spanish UI. Stack adapted to React + FastAPI + MongoDB by user choice.

## Architecture
- **Backend**: FastAPI single-file (`/app/backend/server.py`) with MongoDB (Motor async) + Groq (AsyncGroq).
- **Frontend**: React + react-router-dom v7 + Tailwind + Shadcn UI + Fontshare (Cabinet Grotesk + Satoshi).
- **Auth**: dual support — email/password (bcrypt + session token cookie) **and** Emergent-managed Google OAuth. Bearer header fallback for testing.
- **AI**: Groq `llama-3.3-70b-versatile`, `response_format=json_object`. Single call per plan.
- **PDF**: client-side via `html2canvas` + `jspdf`.

## User Personas
- **Sofía** — Dueña de café/restaurante, sin equipo de marketing. Quiere publicar consistente.
- **Mateo** — Founder de agencia. Sirve 5–10 negocios pequeños. Necesita volumen + velocidad.
- **Andrea** — Marketing manager en gym. Reporta a dueño; necesita PDF entregable.

## Core Requirements (statiques)
- Landing pública + dashboard SaaS premium.
- Auth: email/contraseña + Google.
- Generar calendarios 7/15/30 días personalizados (empresa, industria, ciudad, objetivo).
- Visualización por día (Facebook, Instagram, hashtags, reel, idea visual, CTA).
- Historial persistido por usuario.
- Exportación PDF.
- Edición de empresa, perfil y contraseña. Eliminación de cuenta.
- Pricing UI (sin pagos aún).
- Responsive.

## Implemented (2026-06-03)
- ✅ Backend completo (`server.py`) con auth, proyectos, perfil, dashboard, stats.
- ✅ Integración Groq verificada en producción (modelo llama-3.3-70b-versatile, JSON output).
- ✅ Frontend completo: Landing, Login (tabs login/register + Google), AuthCallback, Dashboard, Crear Plan, Plan Detail (con PDF), Historial, Mi Empresa, Planes, Configuración.
- ✅ Sidebar fija + topbar móvil + dropdown user con logout.
- ✅ Diseño Notion/Stripe/Linear — paleta Obsidian + Pearl, Cabinet Grotesk + Satoshi.
- ✅ Cuenta demo auto-seed en startup: `demo@impulseia.com / Demo1234!`.
- ✅ Testing subagent: 23/23 backend pytest + 14/14 frontend flows pasados.

## Backlog (P0/P1/P2)
- **P1** Stripe integration para upgrade a Pro / Agencia.
- **P1** Background task + polling para planes de 30 días (evita timeouts de proxy).
- **P1** Editar contenido día por día desde el detalle del plan (edición inline).
- **P2** Compartir plan via link público read-only.
- **P2** Conectar Meta API para programar publicaciones directamente.
- **P2** Multi-empresa para tier Agencia (workspaces).
- **P2** Migrar `@app.on_event` a `lifespan` (FastAPI deprecation).
- **P2** Split server.py en routers (auth/projects/user) + services.
- **P2** Idiomas adicionales (EN/PT).

## Run Local
```bash
# Backend
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd /app/frontend
yarn install
yarn start
```

`backend/.env` requires: `MONGO_URL`, `DB_NAME`, `GROQ_API_KEY`, `GROQ_MODEL`, `JWT_SECRET`.
`frontend/.env` requires: `REACT_APP_BACKEND_URL`.
