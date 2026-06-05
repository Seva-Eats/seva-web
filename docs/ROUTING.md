# Dispatch, Supabase backend & live tracking

How data flows from kitchen → driver → recipient. Math: [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md). Phases: [ROADMAP.md](./ROADMAP.md).

---

## One service night (end state)

```text
1. Seed / approve   orders + mock addresses (lat/lng in DB)
2. Confirm roster   shifts → driver_ids for tonight
3. Plan route       Gurdwara D → ~5 stops → driver home H (manual or generate API)
4. Finalize         driver_routes.status = assigned, qr_code per route_stop
5. Driver runs /seva, pings GPS, scans QR at each door
6. Recipient        Realtime on orders + route_stops → map + ETA
```

---

## Supabase tables (existing + planned)

| Table | Role |
|-------|------|
| `kitchens` | Depot $D$ — `latitude`, `longitude`, `name` |
| `orders` | Recipient requests — `delivery_*`, `status` |
| `drivers` | Sevadar profile + `current_latitude/longitude` |
| `driver_routes` | One row per driver per night (`draft` → `assigned` → `in_progress` → `completed`) |
| `route_stops` | Ordered stops: `sequence`, `eta_at`, **`qr_code`**, **`scanned_at`** |
| `deliveries` | Links `order_id` ↔ `driver_id` ↔ `route_stop_id` |
| `driver_location_pings` | GPS history *(migration)* |
| `shifts` | Who is delivering; `status = confirmed` *(migration)* |
| `route_optimization_runs` | Audit JSON from generate *(migration)* |

**RLS:** recipients read own `orders` + assigned driver ping; drivers read own `driver_routes`; staff read kitchen scope.

---

## Mock addresses (v1)

No matrix API. Seed ~5 real-ish Brampton/Mississauga points in `supabase/seed/dev_mississauga.sql`:

| Point | Example |
|-------|---------|
| $D$ Gurdwara | Ontario Khalsa Darbar, 43.6472, -79.6517 |
| Stop 1–5 | `orders.delivery_latitude/longitude` from seed |
| $H$ Driver home | `drivers.home_latitude/longitude` |

Coordinator picks 5 approved orders → optimizer orders them → saves `route_stops` rows.

---

## QR ticketing (Amazon-style)

Each `route_stop` gets a unique `qr_code` (e.g. `SEVA-3F8K2Q`) when route is **finalized**.

| Step | Who | What |
|------|-----|------|
| Generate | Server | `qr_code = encode(route_stop_id)` stored in DB |
| Print / show | Kitchen or driver app | QR encodes `https://sevaeats.vercel.app/seva/scan/{qr_code}` |
| Scan | Driver at door | Camera → `/seva/scan/[code]` |
| Confirm | API | Verify code → set `scanned_at`, `route_stops.status = delivered`, `orders.status = delivered` |

Prevents marking the wrong house: code is bound to one `order_id` + address in DB.

---

## APIs

### `POST /api/dispatch/generate` (Phase 5)

```json
{ "kitchenId": "uuid", "serviceDate": "2026-06-04", "driverId": "uuid", "orderIds": ["…"] }
```

Runs haversine TSP ($D \to$ stops $\to H$), writes `draft` `driver_routes` + `route_stops`.

### `POST /api/dispatch/finalize`

Sets `assigned`, generates `qr_code` per stop, creates `deliveries` + `notifications`.

### `POST /api/drivers/location` (Phase 3)

```json
{ "lat": 43.71, "lng": -79.76, "routeId": "uuid" }
```

→ `drivers.current_*`, insert `driver_location_pings`, recompute ETA to next unscanned stop.

### `POST /api/deliveries/scan` (Phase 3)

```json
{ "qrCode": "SEVA-3F8K2Q" }
```

→ auth driver, match `route_stops`, set `scanned_at`, advance route phase.

---

## Live tracking

| Viewer | Data | Channel |
|--------|------|---------|
| Driver | Own `route_stops`, next QR | `/seva` + polling or Realtime |
| Recipient | Driver ping + stop status for their `order_id` | Realtime on `driver_location_pings`, `orders` |
| Coordinator | All routes + pings for kitchen + date | `/admin` map |

**ETA:** $\text{ETA} = \text{now} + t_{\text{gps},\text{next}}$ — see [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md).

Throttle pings to 15–30 s while `driver_routes.status = in_progress`.

---

## What exists today

| Piece | Status |
|-------|--------|
| Mock volunteer UI | ✅ `app/seva/route/*`, `constants/volunteer-deliveries.ts` |
| Maps | ✅ `VolunteerRouteMap`, `SevaMap` |
| SQL routes / GPS / QR | ❌ not wired |
| Optimizer | ❌ `lib/routing/` not created |

---

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional later for geocoding only:
# MAPBOX_ACCESS_TOKEN=
```
