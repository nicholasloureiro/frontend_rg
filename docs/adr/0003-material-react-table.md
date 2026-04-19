# 3. Use MaterialReactTable for data grids

Date: 2026-04-19

## Status

Accepted

## Context

The app has several heavy table views:
- **ServiceOrderList** — 13 columns, multiple tabs (one per phase), thousands of rows
- **Planilha** — 11 columns, spreadsheet-like, sticky header
- **Financeiro** — transaction list with filtering
- **Clientes** — paginated client list with search

Requirements: sticky headers, per-row action buttons, row coloring by state, server-side pagination, custom cell renderers, responsive scroll containers.

## Decision

Use **material-react-table v3** (built on top of TanStack Table + MUI). It ships all the features above out of the box and integrates with MUI theming.

For simpler lists we use plain HTML `<table>` with custom styles (e.g. Financeiro transactions table) — not every list needs a full grid.

## Consequences

- Column configuration is declarative (`useMemo` array of `{ accessorKey, header, Cell }`).
- Sticky headers via `enableStickyHeader={true}` + `muiTableContainerProps.sx.maxHeight`.
- Row colors via `muiTableBodyRowProps={({ row }) => ({...})}`.
- Bundle size: +~200KB gzipped. Acceptable for an internal ops tool.
- Learning curve for the API, but once a few tables are built it's copy-paste.
- AG Grid was considered and rejected: MRT gives us 90% of what we need without an extra dependency (already had MUI).
