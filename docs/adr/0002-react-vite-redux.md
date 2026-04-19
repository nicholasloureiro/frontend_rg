# 2. React 18 + Vite + Redux Toolkit

Date: 2026-04-19

## Status

Accepted

## Context

The frontend is a back-office operational tool used daily by attendants and admins. It needs:

- Fast dev feedback loop (HMR)
- Large form support (OS creation with dozens of fields)
- Tabular views of thousands of rows
- Rich charts for dashboard
- Client-side routing with protected routes
- Global state for auth + UI preferences (sidebar, theme)

## Decision

- **React 18** — mainstream choice, strong team familiarity
- **Vite 7** — build tool + dev server (fast HMR, simple config)
- **React Router DOM 7** — client-side routing
- **Redux Toolkit 2** — global state (`userSlice`, `sidebarSlice`). Local UI state stays in `useState`.
- **Axios 1.10** — HTTP client with interceptors for JWT attach + auto-refresh
- **MUI 7** + **Bootstrap 5** — UI components (MUI for data grids and icons, Bootstrap for spacing/layout utilities)

Directory structure (`src/`):
```
pages/         top-level route components
components/    reusable UI (Sidebar, Modal, Button, ...)
services/      API clients (one per backend domain)
store/         Redux slices
hooks/         custom hooks (useAuth, useTheme, useDashboard, ...)
utils/         pure helpers (Mascaras, ValidarCPF, format, ...)
styles/        CSS per component/page
```

## Consequences

- Vite's fast HMR dramatically improves the dev experience vs CRA.
- Redux Toolkit's `createSlice` keeps boilerplate low.
- Axios interceptors centralize auth — individual service files are thin wrappers.
- Mixing MUI + Bootstrap creates a slight visual inconsistency; we accept this because MUI's data tables and charts are best-in-class and we didn't want to reimplement them.
