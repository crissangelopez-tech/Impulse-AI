# IMPULSE IA · Plan de Fama IA

Plataforma SaaS que genera calendarios completos de contenido para redes sociales con IA (Groq).

**Stack:** React + FastAPI + MongoDB + Groq (`llama-3.3-70b-versatile`)
**Auth:** Email/contraseña (bcrypt + session tokens) + Emergent-managed Google OAuth
**UI:** Tailwind + Shadcn + Cabinet Grotesk / Satoshi (Fontshare)

---

## 📋 Requisitos previos

| Tecnología | Versión mínima | Notas |
|---|---|---|
| **Node.js** | 18.x (LTS) | Usa **`yarn`**, NO `npm` |
| **Yarn** | 1.22.x | `npm install -g yarn` |
| **Python** | 3.11 | (3.10+ funciona) |
| **MongoDB** | 6.0 | Local o Atlas (cloud) |
| **API Key de Groq** | — | Gratis en https://console.groq.com/keys |

---

## 🚀 Instalación rápida (5 minutos)

### 1. Descomprime el proyecto

```bash
unzip impulse-ia.zip
cd impulse-ia
```

### 2. Configura MongoDB

**Opción A — Local (recomendado para desarrollo):**

```bash
# Linux/Mac (con Homebrew)
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install -y mongodb
sudo systemctl start mongodb

# Windows: descarga desde https://www.mongodb.com/try/download/community
```

**Opción B — MongoDB Atlas (cloud, gratis):**
1. Crea cuenta en https://cloud.mongodb.com
2. Crea un cluster M0 (gratis)
3. Copia tu connection string → la usarás en el `.env` del backend

### 3. Backend (FastAPI)

```bash
cd backend

# Crea venv (opcional pero recomendado)
python3 -m venv venv
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows

# Instala dependencias
pip install -r requirements.txt

# Copia el .env de ejemplo y edítalo
cp .env.example .env
# Edita .env y pega tu GROQ_API_KEY y MONGO_URL
nano .env

# Arranca el server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend corriendo en → http://localhost:8001
Health check → `curl http://localhost:8001/api/`

### 4. Frontend (React)

En otra terminal:

```bash
cd frontend

# Copia el .env de ejemplo
cp .env.example .env
# Por defecto apunta a http://localhost:8001 — solo cámbialo si tu backend está en otro puerto

# Instala dependencias (SIEMPRE con yarn, NO npm)
yarn install

# Arranca el dev server
yarn start
```

Frontend corriendo en → http://localhost:3000

### 5. ¡Listo!

Abre **http://localhost:3000** en tu navegador.

- **Cuenta demo** (se auto-crea al iniciar el backend):
  - Email: `demo@impulseia.com`
  - Contraseña: `Demo1234!` (puedes cambiarla en `backend/.env`)
- O regístrate con tu propio correo en `/login`.

---

## 🔑 Variables de entorno

### `backend/.env`

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=impulseia
CORS_ORIGINS=*
GROQ_API_KEY=gsk_tu_key_aqui                  # ← Obligatorio
GROQ_MODEL=llama-3.3-70b-versatile
JWT_SECRET=cambia-esto-a-un-secreto-aleatorio  # ← Obligatorio en producción
JWT_ALGORITHM=HS256
DEMO_EMAIL=demo@impulseia.com
DEMO_PASSWORD=Demo1234!
```

### `frontend/.env`

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443                            # Solo en deploys con proxy; en local puedes comentarlo
```

---

## 🧪 Pruebas

### Backend (pytest)

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

Esperado: **23 tests passed**.

### Frontend (lint)

```bash
cd frontend
yarn lint     # si tienes el script configurado
```

---

## 📁 Estructura del proyecto

```
impulse-ia/
├── backend/
│   ├── server.py              # API FastAPI monolítica (auth, projects, user, dashboard)
│   ├── requirements.txt
│   ├── tests/
│   │   └── backend_test.py    # 23 tests pytest
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html         # Carga fuentes Cabinet Grotesk + Satoshi
│   ├── src/
│   │   ├── App.js             # Router + ProtectedRoute
│   │   ├── index.js           # Entry + QueryClientProvider
│   │   ├── index.css          # Tokens de diseño
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx   # Sidebar fija
│   │   │   ├── DayCard.jsx           # Tarjeta de día
│   │   │   ├── Logo.jsx
│   │   │   └── ui/                   # 50+ componentes Shadcn
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   ├── api.js                # Cliente axios + sessionStorage
│   │   │   └── utils.js
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── AuthCallback.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── CreatePlanPage.jsx
│   │       ├── PlanDetailPage.jsx    # Con export PDF
│   │       ├── HistorialPage.jsx
│   │       ├── MiEmpresaPage.jsx
│   │       ├── PlanesPage.jsx
│   │       └── ConfiguracionPage.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── craco.config.js               # Override webpack (path alias @/)
│   └── .env.example
│
├── memory/
│   └── PRD.md                        # Product Requirements Document
│
├── INSTALL.md                        # Este archivo en versión extendida
└── README.md
```

---

## 🛠️ Comandos útiles

```bash
# Backend: levantar en producción
cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4

# Frontend: build estático
cd frontend && yarn build
# Output en frontend/build/ — sirve con nginx, vercel, netlify, etc.

# Resetear datos demo
mongosh impulseia --eval "db.users.deleteOne({email:'demo@impulseia.com'})"
# El backend lo vuelve a crear al reiniciar.

# Ver logs
tail -f backend/logs/*.log         # si lo configuras
```

---

## ❓ Troubleshooting

**`groq.AuthenticationError: Invalid API key`**
Tu `GROQ_API_KEY` está mal. Verifica en https://console.groq.com/keys.

**`pymongo.errors.ServerSelectionTimeoutError`**
MongoDB no está corriendo o `MONGO_URL` es incorrecto.

**Frontend muestra "Network Error" en login**
`REACT_APP_BACKEND_URL` no apunta a tu backend. Verifica `frontend/.env`.

**Login con Google no funciona en local**
La integración Google usa el servicio `auth.emergentagent.com` que requiere que tu app esté deployada con dominio público. En local: usa **email/contraseña** o registra tu propia OAuth con Google Console (modifica `auth/google-session` en `server.py`).

**`npm` vs `yarn`**
**Usa SIEMPRE yarn.** Mezclar `npm` y `yarn` rompe el `node_modules`.

---

## 📝 Licencia

Código propietario. Construido con Emergent.

---

## 🔗 Recursos

- API Groq: https://console.groq.com/docs
- Shadcn UI: https://ui.shadcn.com
- FastAPI: https://fastapi.tiangolo.com
- React Router v7: https://reactrouter.com
