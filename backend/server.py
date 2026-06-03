"""
IMPULSE IA — Backend API
========================
SaaS para generación automática de calendarios de contenido para redes sociales con IA (Groq).

Stack: FastAPI + MongoDB (Motor) + Groq.
Autenticación: email/contraseña (bcrypt + session tokens) + Emergent Google OAuth.

Rutas (todas con prefijo /api):
    Auth:
        POST   /auth/register            Registrar usuario
        POST   /auth/login               Login email/contraseña
        POST   /auth/google-session      Procesar callback OAuth de Emergent
        GET    /auth/me                  Datos del usuario autenticado
        POST   /auth/logout              Cerrar sesión
        POST   /auth/seed-demo           (Idempotente) crea cuenta demo
    Empresa / Perfil:
        GET    /user/profile             Obtener perfil
        PUT    /user/profile             Actualizar nombre / empresa / industria / ciudad
        PUT    /user/password            Cambiar contraseña
        DELETE /user/account             Eliminar cuenta
    Proyectos (Planes de Fama):
        POST   /projects                 Generar nuevo plan (llama Groq)
        GET    /projects                 Listar historial del usuario
        GET    /projects/{id}            Obtener un plan
        DELETE /projects/{id}            Eliminar plan
    Dashboard:
        GET    /dashboard/stats          Estadísticas del usuario

Las claves sensibles viven solo en backend/.env (GROQ_API_KEY, JWT_SECRET, MONGO_URL).
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

import bcrypt
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Cookie, Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from groq import AsyncGroq
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
CORS_ORIGINS_RAW = os.environ.get("CORS_ORIGINS", "*")
# CORS con wildcard "*" y credentials=True es inválido en todos los browsers modernos.
# Si el .env trae "*", lo detectamos aquí y lanzamos un error claro al arrancar.
if CORS_ORIGINS_RAW.strip() == "*":
    raise RuntimeError(
        "CORS_ORIGINS='*' es incompatible con cookies/credentials. "
        "Define el origen exacto de tu frontend en backend/.env, por ejemplo:\n"
        "  CORS_ORIGINS=https://tu-app.emergent.sh\n"
        "  CORS_ORIGINS=http://localhost:3000\n"
        "Puedes separar varios orígenes con coma."
    )
CORS_ORIGINS = [o.strip() for o in CORS_ORIGINS_RAW.split(",") if o.strip()]

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_LIFETIME_DAYS = 7

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger("impulse-ia")

# Cliente Mongo (Motor async)
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# Cliente Groq (async, reutilizable)
groq_client = AsyncGroq(api_key=GROQ_API_KEY)

# ---------------------------------------------------------------------------
# Modelos Pydantic
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    company: str = Field(min_length=1, max_length=120)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionIn(BaseModel):
    session_id: str


class UserOut(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    company: str
    industry: Optional[str] = None
    city: Optional[str] = None
    plan: str = "free"
    picture: Optional[str] = None
    auth_provider: str = "email"
    created_at: str


class ProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    city: Optional[str] = None


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class ProjectIn(BaseModel):
    company: str = Field(min_length=1, max_length=120)
    industry: str
    city: str
    objective: str
    duration_days: int = Field(ge=1, le=30)


class ProjectOut(BaseModel):
    project_id: str
    user_id: str
    name: str
    company: str
    industry: str
    city: str
    objective: str
    duration_days: int
    content: list  # lista de días generados
    created_at: str


# ---------------------------------------------------------------------------
# Helpers de autenticación
# ---------------------------------------------------------------------------
def hash_password(plain: str) -> str:
    """Hashea una contraseña con bcrypt."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


async def create_session(user_id: str) -> str:
    """Crea un nuevo session_token persistido en Mongo (TTL 7 días)."""
    token = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_LIFETIME_DAYS)
    await db.user_sessions.insert_one(
        {
            "session_token": token,
            "user_id": user_id,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return token


def set_session_cookie(response: Response, token: str) -> None:
    """Setea el cookie httpOnly del session_token."""
    response.set_cookie(
        key="session_token",
        value=token,
        max_age=SESSION_LIFETIME_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def serialize_user(doc: dict) -> dict:
    """Convierte un documento Mongo de user en payload UserOut (sin _id ni password_hash)."""
    return {
        "user_id": doc["user_id"],
        "name": doc["name"],
        "email": doc["email"],
        "company": doc.get("company", ""),
        "industry": doc.get("industry"),
        "city": doc.get("city"),
        "plan": doc.get("plan", "free"),
        "picture": doc.get("picture"),
        "auth_provider": doc.get("auth_provider", "email"),
        "created_at": doc.get("created_at", ""),
    }


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
) -> dict:
    """
    Obtiene el usuario autenticado a partir del cookie session_token
    o del header Authorization: Bearer <token>.
    """
    token: Optional[str] = session_token
    if not token and authorization:
        parts = authorization.split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1].strip()

    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Sesión inválida")

    # Validar expiración (string ISO en Mongo)
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Sesión expirada")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user_doc


# ---------------------------------------------------------------------------
# Prompt + integración Groq
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "Eres un estratega senior de marketing digital especializado en crecimiento "
    "de negocios locales en Latinoamérica. Generas calendarios de contenido para "
    "redes sociales claros, accionables y orientados a resultados. SIEMPRE respondes "
    "en JSON válido siguiendo exactamente el esquema solicitado, sin texto adicional."
)


def build_user_prompt(p: ProjectIn) -> str:
    return f"""Genera un calendario completo de contenido para redes sociales.

Datos del negocio:
- Empresa: {p.company}
- Industria: {p.industry}
- Ciudad: {p.city}
- Objetivo principal: {p.objective}
- Duración del plan: {p.duration_days} días

Devuelve EXCLUSIVAMENTE un objeto JSON con la siguiente forma exacta:

{{
  "days": [
    {{
      "day": 1,
      "title": "Tema o gancho del día (máx 60 chars)",
      "facebook": "Post completo para Facebook (60-120 palabras, tono cercano y profesional, sin hashtags inline).",
      "instagram": "Post completo para Instagram (40-90 palabras, primera línea engancha en menos de 8 palabras).",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"],
      "reel_script": "Guion para Reel/TikTok 15-25s: 1) Hook (1 línea). 2) Desarrollo (2-3 líneas). 3) CTA final (1 línea).",
      "visual_idea": "Descripción concreta de la idea visual (imagen o video): encuadre, colores, objetos, mood. 1-2 frases.",
      "cta": "Llamado a la acción específico, claro y medible (ej.: 'Reserva en wa.me/...' o 'Compra hoy con 10% off')."
    }}
  ]
}}

Reglas:
- Crea exactamente {p.duration_days} días, numerados de 1 a {p.duration_days}.
- Varía formatos (carrusel, reel, story-pregunta, testimonio, behind-the-scenes, promo, educativo, UGC).
- Adapta hashtags a la ciudad ({p.city}) e industria ({p.industry}).
- Cuida ortografía y acentos en español.
- NO incluyas markdown, NO incluyas explicaciones fuera del JSON."""


async def generate_calendar_with_groq(p: ProjectIn) -> list[dict]:
    """Llama a Groq y devuelve la lista de días (parseados)."""
    try:
        completion = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(p)},
            ],
            temperature=0.85,
            max_tokens=8000,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content or "{}"
    except Exception as exc:  # red, key inválida, etc.
        logger.exception("Error llamando Groq")
        raise HTTPException(status_code=502, detail=f"Error generando plan con IA: {exc}")

    try:
        parsed: Any = json.loads(raw)
    except json.JSONDecodeError:
        # Intento de rescate: encontrar el primer JSON dentro del string
        start, end = raw.find("{"), raw.rfind("}")
        if start == -1 or end == -1:
            raise HTTPException(status_code=502, detail="La IA no devolvió JSON válido")
        parsed = json.loads(raw[start : end + 1])

    days = parsed.get("days") if isinstance(parsed, dict) else None
    if not isinstance(days, list) or not days:
        raise HTTPException(status_code=502, detail="La IA no devolvió el calendario esperado")

    # Sanitización mínima — aseguramos campos
    sanitized: list[dict] = []
    for i, d in enumerate(days, start=1):
        if not isinstance(d, dict):
            continue
        sanitized.append(
            {
                "day": int(d.get("day", i)),
                "title": str(d.get("title", f"Día {i}"))[:140],
                "facebook": str(d.get("facebook", "")),
                "instagram": str(d.get("instagram", "")),
                "hashtags": [str(h) for h in (d.get("hashtags") or []) if h][:15],
                "reel_script": str(d.get("reel_script", "")),
                "visual_idea": str(d.get("visual_idea", "")),
                "cta": str(d.get("cta", "")),
            }
        )
    return sanitized


# ---------------------------------------------------------------------------
# App / Router
# ---------------------------------------------------------------------------
app = FastAPI(title="IMPULSE IA — API", version="1.0.0")
api = APIRouter(prefix="/api")


@api.get("/")
async def root() -> dict:
    return {"service": "impulse-ia", "status": "ok"}


# ---------- AUTH ----------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response) -> dict:
    existing = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Este correo ya está registrado")

    user_id = f"user_{uuid.uuid4().hex[:16]}"
    user_doc = {
        "user_id": user_id,
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "company": payload.company.strip(),
        "industry": None,
        "city": None,
        "plan": "free",
        "picture": None,
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = await create_session(user_id)
    set_session_cookie(response, token)
    return {"token": token, "user": serialize_user(user_doc)}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response) -> dict:
    user_doc = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not verify_password(payload.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = await create_session(user_doc["user_id"])
    set_session_cookie(response, token)
    return {"token": token, "user": serialize_user(user_doc)}


@api.post("/auth/google-session")
async def google_session(payload: GoogleSessionIn, response: Response) -> dict:
    """
    Procesa el session_id devuelto por Emergent Auth tras login con Google.
    Llama al endpoint oficial de Emergent para canjearlo por datos del usuario.
    """
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": payload.session_id},
            )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Emergent Auth no responde: {exc}")

    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="session_id inválido o expirado")

    data = r.json()
    email = (data.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=400, detail="Respuesta de Emergent Auth incompleta")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        # Actualizar metadatos suaves (foto, nombre si estaba vacío)
        updates: dict = {}
        if data.get("picture") and existing.get("picture") != data["picture"]:
            updates["picture"] = data["picture"]
        if updates:
            await db.users.update_one({"user_id": existing["user_id"]}, {"$set": updates})
            existing.update(updates)
        user_doc = existing
    else:
        user_id = f"user_{uuid.uuid4().hex[:16]}"
        user_doc = {
            "user_id": user_id,
            "name": data.get("name") or email.split("@")[0],
            "email": email,
            "password_hash": None,
            "company": "Mi Empresa",
            "industry": None,
            "city": None,
            "plan": "free",
            "picture": data.get("picture"),
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user_doc)

    token = await create_session(user_doc["user_id"])
    set_session_cookie(response, token)
    return {"token": token, "user": serialize_user(user_doc)}


@api.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)) -> dict:
    return serialize_user(user)


@api.post("/auth/logout")
async def logout(
    response: Response,
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
) -> dict:
    token: Optional[str] = session_token
    if not token and authorization:
        parts = authorization.split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1].strip()
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/seed-demo")
async def seed_demo() -> dict:
    """Crea/actualiza la cuenta demo. Idempotente. No expone la contraseña."""
    await seed_demo_user()
    return {"ok": True, "email": os.environ.get("DEMO_EMAIL", "demo@impulseia.com")}


# ---------- USER ----------
@api.get("/user/profile")
async def get_profile(user: dict = Depends(get_current_user)) -> dict:
    return serialize_user(user)


@api.put("/user/profile")
async def update_profile(
    payload: ProfileUpdateIn, user: dict = Depends(get_current_user)
) -> dict:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        return serialize_user(user)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
    user.update(updates)
    return serialize_user(user)


@api.put("/user/password")
async def change_password(
    payload: PasswordChangeIn, user: dict = Depends(get_current_user)
) -> dict:
    if user.get("auth_provider") == "google" and not user.get("password_hash"):
        # Permitir setear una contraseña por primera vez
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"password_hash": hash_password(payload.new_password)}},
        )
        return {"ok": True}

    if not user.get("password_hash") or not verify_password(
        payload.current_password, user["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )
    return {"ok": True}


@api.delete("/user/account")
async def delete_account(
    response: Response, user: dict = Depends(get_current_user)
) -> dict:
    await db.projects.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.users.delete_one({"user_id": user["user_id"]})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------- PROJECTS ----------
@api.post("/projects")
async def create_project(payload: ProjectIn, user: dict = Depends(get_current_user)) -> dict:
    days = await generate_calendar_with_groq(payload)
    project_id = f"prj_{uuid.uuid4().hex[:16]}"
    project_doc = {
        "project_id": project_id,
        "user_id": user["user_id"],
        "name": f"Plan {payload.duration_days}d · {payload.company}",
        "company": payload.company,
        "industry": payload.industry,
        "city": payload.city,
        "objective": payload.objective,
        "duration_days": payload.duration_days,
        "content": days,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(project_doc)
    project_doc.pop("_id", None)
    return project_doc


@api.get("/projects")
async def list_projects(user: dict = Depends(get_current_user)) -> list:
    cursor = db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    items = await cursor.to_list(length=200)
    # Versión "resumen" para listado (sin content completo para no pesar)
    summary = []
    for it in items:
        summary.append(
            {
                "project_id": it["project_id"],
                "name": it["name"],
                "company": it["company"],
                "industry": it["industry"],
                "city": it["city"],
                "objective": it["objective"],
                "duration_days": it["duration_days"],
                "posts_count": len(it.get("content", [])),
                "created_at": it["created_at"],
            }
        )
    return summary


@api.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)) -> dict:
    doc = await db.projects.find_one(
        {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return doc


@api.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)) -> dict:
    res = await db.projects.delete_one(
        {"project_id": project_id, "user_id": user["user_id"]}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return {"ok": True}


# ---------- DASHBOARD ----------
@api.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(get_current_user)) -> dict:
    cursor = db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    projects = await cursor.to_list(length=1000)
    total_projects = len(projects)
    total_posts = 0
    for p in projects:
        total_posts += len(p.get("content", []))
    last_generation = projects[0]["created_at"] if projects else None
    return {
        "total_projects": total_projects,
        "total_posts": total_posts,
        "last_generation": last_generation,
        "current_plan": user.get("plan", "free"),
    }


# ---------------------------------------------------------------------------
# Seed demo + middleware + bootstrap
# ---------------------------------------------------------------------------
async def seed_demo_user() -> None:
    """Crea la cuenta demo si no existe. Credenciales desde env (no hardcoded)."""
    demo_email = os.environ.get("DEMO_EMAIL", "demo@impulseia.com")
    demo_password = os.environ.get("DEMO_PASSWORD")
    if not demo_password:
        logger.warning("DEMO_PASSWORD no está definida; omitiendo seed de cuenta demo.")
        return
    existing = await db.users.find_one({"email": demo_email}, {"_id": 0})
    if existing:
        return
    user_doc = {
        "user_id": f"user_{uuid.uuid4().hex[:16]}",
        "name": "Carlos Demo",
        "email": demo_email,
        "password_hash": hash_password(demo_password),
        "company": "Taquería El Patrón",
        "industry": "Restaurante",
        "city": "Mérida",
        "plan": "free",
        "picture": None,
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    logger.info("Cuenta demo creada (credenciales desde env)")


@app.on_event("startup")
async def on_startup() -> None:
    # Índices útiles
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("user_id")
    await db.projects.create_index([("user_id", 1), ("created_at", -1)])
    await db.projects.create_index("project_id", unique=True)
    await seed_demo_user()
    logger.info("IMPULSE IA backend listo · modelo Groq: %s", GROQ_MODEL)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    mongo_client.close()


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api)