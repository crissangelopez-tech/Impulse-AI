/**
 * Cliente HTTP centralizado para IMPULSE IA.
 * Se apoya en REACT_APP_BACKEND_URL (definido en frontend/.env) — NUNCA hardcodear.
 *
 * Estrategia de auth (defensa en profundidad):
 *  1. PRIMARIO: cookie httpOnly `session_token` seteado por el backend (no accesible a JS → mitiga XSS).
 *  2. FALLBACK: token en `sessionStorage` (vida limitada a la pestaña — preferible a localStorage)
 *     enviado como `Authorization: Bearer ...`. Solo se usa cuando el cookie no fluye
 *     (ej.: pruebas automatizadas, o navegadores que bloquean cookies third-party).
 *
 *  ⚠️ Nunca devolvemos el token al lado servidor a partir de sessionStorage para nada distinto
 *  de Authorization header; la fuente de verdad de la sesión es siempre el backend.
 */
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;
const TOKEN_KEY = "impulse_token";

// sessionStorage: el token se invalida al cerrar la pestaña. Reduce ventana de exposición a XSS.
const safeStorage = (() => {
  try {
if (typeof window !== "undefined" && window.localStorage) return window.localStorage;  } catch {
    /* sessionStorage bloqueado (modo privado en algunos navegadores) */
  }
  // Fallback en memoria — sobrevive solo durante la sesión SPA.
  const mem = new Map();
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k),
  };
})();

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // envía cookie httpOnly (canal primario)
});

// Interceptor: añade Authorization Bearer como fallback al cookie httpOnly.
api.interceptors.request.use((config) => {
  const token = safeStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tokenStore = {
  get: () => safeStorage.getItem(TOKEN_KEY),
  set: (t) => safeStorage.setItem(TOKEN_KEY, t),
  clear: () => safeStorage.removeItem(TOKEN_KEY),
};
