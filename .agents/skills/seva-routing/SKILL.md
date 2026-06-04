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
| 4 | Coordinator **confirms** tonight’s delivery volunteers → manual routes on map |
| 5 | `lib/routing/` + generate API: cluster recipients, assign to confirmed drivers, sequence stops |
| 8 | Re-optimize remaining stops after DROP / failure |

## Operations (always)

1. **Roster:** only coordinator-**confirmed** `driverIds` enter generate.
2. **Locations:** kitchen depot + geocoded `orders` + driver start positions.
3. **Optimize server-side:** minimize total drive time; balance stops; full coverage.
4. **Live:** `POST /api/drivers/location` while `in_progress`.

## Tables

- `driver_routes`, `route_stops`, `deliveries`, `drivers.current_latitude/longitude`
- *(planned)* `shifts` for sign-up / confirmed; `driver_location_pings` for history

## Volunteer UI

- Home: `/seva`
- Settings: `/seva/profile`
- Role helper: `lib/navigation/role-paths.ts`

## Full spec

- Ops + APIs: `docs/ROUTING.md`
- **Math / algorithms:** `docs/ROUTE_OPTIMIZATION.md`
- Phases: `docs/ROADMAP.md`
