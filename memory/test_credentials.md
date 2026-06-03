# Test Credentials — IMPULSE IA

## Email/Password Test Account
- Email: `demo@impulseia.com`
- Password: `Demo1234!`
- Name: `Carlos Demo`
- Company: `Taquería El Patrón`

This account is auto-seeded on backend startup (see `seed_demo_user()` in server.py).
If missing, hit `POST /api/auth/seed-demo` (idempotent) to recreate it.

## Google OAuth Test Identities
- Emergent-managed Google OAuth is enabled.
- No domain allowlist; any Google account can sign in.
- Test by clicking "Continuar con Google" on the login page.

## Auth Token Behavior
- Auth uses session tokens stored in MongoDB `user_sessions` collection.
- Frontend stores token in both:
  - httpOnly cookie `session_token` (set by backend on login)
  - localStorage `impulse_token` (as fallback for Bearer auth in tests)
- Backend `/api/*` endpoints accept either:
  - `Cookie: session_token=...`
  - `Authorization: Bearer ...`

## Backend Session Doc Schema
```
{
  user_id: <uuid string>,
  session_token: <uuid string>,
  expires_at: <ISO date string, +7 days>,
  created_at: <ISO date string>
}
```
