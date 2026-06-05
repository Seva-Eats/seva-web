---
name: seva-routing
description: >-
  Seva Eats route optimization and dispatch. Use when implementing routes,
  driver_routes, route_stops, QR scan, geocoding, or coordinator generate/finalize flows.
---

# Seva Eats Routing

## Rules

- Never run route solvers in React client components.
- Persist routes in `driver_routes` and `route_stops` (Supabase).
- **v1:** haversine distance on lat/lng in DB — **no** drive-time matrix API.
- Tour shape: **Gurdwara $D$ → stops → driver home $H$**.
- Each `route_stop` gets a `qr_code`; driver confirms via `/seva/scan/[code]`.
- Phase 0–3: mock UI in `/seva` until SQL + APIs land.

## Phases

| Phase | Behavior |
|-------|----------|
| 0–2 | Seed mock addresses; approve orders |
| 3 | SQL routes, GPS pings, QR scan |
| 4 | Manual dispatch on map |
| 5 | `lib/routing/` generate API (nearest-neighbor + 2-opt) |
| 8 | Re-sequence after DROP / failed delivery |

## Tables

- `driver_routes`, `route_stops` (+ `qr_code`, `scanned_at`), `deliveries`, `drivers`
- `driver_location_pings`, `shifts` *(migrations)*

## Volunteer UI

- Home: `/seva` → `/seva/route/pickup` → `/seva/route/stop/[id]`
- Scan: `/seva/scan/[code]` *(planned)*
- Settings: `/seva/profile`

## Full spec

`docs/ROUTING.md`, `docs/ROUTE_OPTIMIZATION.md` — math uses GitHub `$...$` / `$$...$$`.
