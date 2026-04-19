# 4. JWT auth with auto-refresh via Axios interceptors

Date: 2026-04-19

## Status

Accepted

## Context

The backend uses SimpleJWT with a 7-day access token + 30-day refresh token. We need:

- Attach `Authorization: Bearer <access>` to every API call
- Transparently refresh an expired access token
- Redirect to `/login` when refresh also fails
- Persist login across tabs/reloads

## Decision

`src/services/api.js` sets up a single Axios instance with two interceptors:

**Request interceptor:**
- Read `access_token` from `localStorage`
- Attach as `Authorization: Bearer <token>`

**Response interceptor:**
- On `401`, call `POST /api/v1/auth/refresh/` with the refresh token
- On success: replace stored access token, retry the original request
- On failure: clear storage, navigate to `/login`

Tokens are stored in `localStorage` (XSS risk is low — this is an internal admin tool, not a consumer app).

Auth state is mirrored in Redux (`userSlice`) so components can conditionally render based on `user.person.person_type.type === 'ADMINISTRADOR'`.

## Consequences

- Individual service files don't think about auth — they just call `api.get(...)`.
- One failed refresh = one redirect to login (no infinite retry loop).
- `localStorage` means sharing tabs works but XSS would leak tokens; mitigated by CSP headers and the internal nature of the app.
- Future: move to httpOnly cookies if we ever expose this to untrusted networks.
