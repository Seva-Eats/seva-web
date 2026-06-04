# Dispatch & routing

Server-side dispatch for Seva Eats. **Math:** [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md). **Phases:** [ROADMAP.md](./ROADMAP.md).

---

## Service night (how it works)

1. Coordinator **confirms** delivery sevadars for tonight (`shifts.status = confirmed` → `driverIds`).
2. **Approved orders** have geocoded `delivery_latitude/longitude`; kitchen = depot $D$.
3. **Generate** (Phase 5): matrix → cluster → assign → sequence → `driver_routes` + `route_stops` as `draft`.
4. Coordinator **reviews** map, fixes overflow, **finalize** → `assigned` + notifications.
5. Sevadars run `/seva`; **GPS pings** every 15–30s → ETAs; re-optimize on DROP (Phase 8).

Never run the optimizer in the client.

---

## Inputs & outputs

| Input | Source |
|-------|--------|
| Stops | `orders` (approved, lat/lng) |
| Drivers | Confirmed `drivers` + capacity / max stops |
| Depot | `kitchens`, `menus.ready_by_at` |
| Times | Mapbox/Google matrix (server env) |

| Table | Role |
|-------|------|
| `driver_routes` | One route per sevadar per night (`draft` → `assigned` → `in_progress` → `completed`) |
| `route_stops` | Ordered stops + ETAs |
| `deliveries` | Order ↔ driver ↔ stop |
| `route_optimization_runs` | Audit JSON *(migration)* |

---

## Algorithms

| Version | When |
|---------|------|
| **v0** | Phase 4 — manual assign on map |
| **v1** | Phase 5 — heuristic in `lib/routing/` ([math](./ROUTE_OPTIMIZATION.md)) |
| **v2** | OR-Tools only if v1 misses time windows often |
| **v3** | Phase 8 — re-run on remaining stops after DROP / failure |

---

## APIs

### `POST /api/dispatch/generate`

```json
{ "kitchenId": "uuid", "serviceDate": "2026-06-04", "driverIds": [], "orderIds": [] }
```

→ `{ "runId", "routes", "overflow" }` — persists **draft** routes.

### `POST /api/dispatch/finalize`

```json
{ "runId": "uuid" }
```

→ routes **assigned**, `deliveries` updated, `notifications` created.

### `POST /api/drivers/location` (Phase 3+)

```json
{ "lat", "lng", "routeId" }
```

→ `drivers.current_*`, `driver_location_pings`; throttled ETA to next pending stop.

---

## Live tracking

| Viewer | Sees |
|--------|------|
| Sevadar | Own `route_stops` |
| Recipient | Own order’s driver (RLS) |
| Coordinator | All routes + pings for `kitchen_id` + date |

Realtime on `orders` / `deliveries` / `route_stops` as phases land.

---

## Where code lives

| Piece | Path |
|-------|------|
| Algorithm | `lib/routing/*` (server only) |
| Matrix | `lib/routing/matrix.ts` |
| Map UI | `components/map/SevaMap.tsx` |
| Sevadar app | `app/seva/page.tsx` → SQL in Phase 3 |

**Today:** mock route in `constants/volunteer-deliveries.ts`; DB tables exist but unused.

---

## Env (later)

```env
MAPBOX_ACCESS_TOKEN=     # server — matrix + geocode
# or GOOGLE_MAPS_API_KEY=
```
