---
name: seva-routing
description: >-
  Seva Eats route optimization and dispatch. Use when implementing VRP,
  driver_routes, route_stops, geocoding, or coordinator generate/finalize flows.
---

# Seva Eats Routing

## Rules

- Never run VRP solvers in React client components.
- Persist routes in `driver_routes` and `route_stops` (Supabase).
- Use drive-time matrices (Mapbox/Google) for sequencing; `earthdistance` is preview-only.
- Phase 0–3: mock or manual routes in `/seva` until `app/api/dispatch` exists.

## Phases

| Phase | Behavior |
|-------|----------|
| 0–3 | Mock route in `constants/volunteer-deliveries.ts` |
| 4 | Manual coordinator assignment |
| 5 | `lib/routing/` heuristic + API |

## Tables

- `driver_routes`, `route_stops`, `deliveries`, `drivers.current_latitude/longitude`

## Volunteer UI

- Home: `/seva`
- Settings: `/seva/profile`
- Role helper: `lib/navigation/role-paths.ts`
