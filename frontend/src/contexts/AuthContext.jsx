/**
 * AuthContext — Gestiona el estado de autenticación de IMPULSE IA.
 *
 * Estados:
 *  - loading: aún no sabemos si hay sesión
 *  - user: objeto usuario o null
 *
 * Métodos:
 *  - login(email, password)
 *  - register(payload)
 *  - completeGoogleSession(session_id)
 *  - logout()
 *  - refresh()
 *  - updateUser(partial)
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "@/lib/api";

const AuthContext = createContext(null);
// Detecta si estamos en pleno callback OAuth de Google (hash con session_id) sin tocar deps.
const isOAuthCallback = () =>
  typeof window !== "undefined" && !!window.location.hash?.includes("session_id=");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // refresh: pide /auth/me. Usa `api` (módulo importado, referencia estable).
  // Sin deps porque `api` y `setUser` son estables — useCallback con [] es intencional.
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch (err) {
      // 401 esperado en rutas públicas. Logueamos en debug para diagnóstico futuro.
      if (process.env.NODE_ENV !== "production" && err?.response?.status !== 401) {
        console.warn("[auth] refresh fallo inesperado:", err?.message || err);
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // CRÍTICO: si volvemos del callback de Google (hash con session_id),
    // dejamos que AuthCallback haga su trabajo antes de pedir /auth/me.
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (isOAuthCallback()) {
      setLoading(false);
      return;
    }
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const completeGoogleSession = useCallback(async (session_id) => {
    const { data } = await api.post("/auth/google-session", { session_id });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Logout debe ser idempotente. Si el backend falla limpiamos cliente igual,
      // pero dejamos rastro en dev para detectar problemas de red.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] logout backend fallo (ignorado):", err?.message || err);
      }
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => setUser((u) => ({ ...u, ...partial })), []);

  // Memo del valor del contexto — evita re-renders innecesarios en consumers.
  const value = useMemo(
    () => ({ user, loading, login, register, completeGoogleSession, logout, refresh, updateUser }),
    [user, loading, login, register, completeGoogleSession, logout, refresh, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
