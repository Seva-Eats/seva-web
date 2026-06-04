# Seva Eats Web — Build Roadmap

Phased plan for **seva-eats-web** + Supabase. Complete each phase’s **exit criteria** before starting the next. Full product vision is in the PRD (see [context.md](../context.md)).

**Last updated:** June 2026 — added dispatch/tracking building plan; Mapbox map scaffold (`SevaMap`).

**Deep dive (roster → locations → optimize → live GPS):** [docs/ROUTING.md](./ROUTING.md#service-night-playbook).

**Math (CVRPTW, k-means, assign, TSP):** [docs/ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md).

---

## Next steps (what to build now)

Work **top to bottom**. Do not wire the route optimizer before orders and drivers exist in Postgres.

| Priority | Phase | Outcome |
|----------|-------|---------|
| **Now** | 0 | Meal requests and profiles persist; `types/database.ts`; volunteer → `drivers` row |
| **Next** | 1 | Geocoded `orders`; tracking page reads DB + map (`SevaMap`) |
| **Then** | 2–3 | Admin seed; `/seva` loads real `driver_routes`; GPS ping API |
| **Then** | 4 | Coordinator confirms **who is volunteering tonight**, manual routes on map |
| **Then** | 5 | Server-side generate: confirmed drivers + recipient locations + Gurdwara depot → balanced routes |
| **Later** | 8 | Re-optimize when someone drops out or kitchen is late |

### Dispatch & tracking in one sentence

The coordinator **confirms which sevadars are in** for delivery, the system **geocodes the Gurdwara and every approved recipient**, uses **drive-time matrices** to **split stops across drivers and order each driver’s loop** so all meals are covered with less total driving, then **finalize** pushes routes to apps; during the shift **GPS pings** update the map and ETAs for coordinator and recipients.

---

## How phases connect (backend + live tracking)

```
Phase 0–1   Recipients + coords in DB
     ↓
Phase 2     Staff can approve orders; seed test kitchen (Gurdwara point)
     ↓
Phase 3     Sevadars run assigned routes; location pings → Realtime
     ↓
Phase 4     Roster: confirm volunteers → manual assign stops (learn ops)
     ↓
Phase 5     Generate: auto shortest-path-style routes from same inputs
     ↓
Phase 8     Mid-shift re-generate on DROP / failure
```

Volunteer **confirmation** is Phase 4 UI + a small migration (`shifts` or `driver_availability`). **Route optimization** is Phase 5 once manual dispatch works. **Live tracking** starts in Phase 3 (pings) and enriches ETAs in Phase 5+.

---

## Phase 0 — Foundation (in progress)

**Goal:** Postgres is the source of truth; generated types; role routing stays intact.

### Tasks

- [ ] Add `supabase/migrations/` to repo (pull from remote via MCP `list_migrations` / export SQL)
- [ ] Run `generate_typescript_types` → `types/database.ts`
- [ ] Replace `RequestContext` localStorage with `orders` + `order_items` CRUD
- [ ] On sign-in: create/link `users` row; volunteers also upsert `drivers` (new RPC or extend profile)
- [ ] Sync `user.role` to DB when possible (preferences table or metadata)
- [ ] Env: document required keys in `.env.example` (Supabase, later Mapbox)

### Exit criteria

- New meal request persists to `orders` and appears after refresh
- Recipient tracking reads order/delivery status from DB (Realtime optional)
- `npm run build` passes; RLS advisors clean for new queries

### Files to touch

- `context/RequestContext.tsx`
- `app/request/details/page.tsx`
- `app/request/[id]/page.tsx`
- `lib/backend/` (new `orders.ts`, `drivers.ts`)
- `supabase/migrations/`, `types/database.ts`

---

## Phase 1 — Recipient production path

**Goal:** Real intake and live tracking (no coordinator automation yet).

### Tasks

- [ ] Geocode delivery address on submit → `orders.delivery_latitude/longitude` + `geo_cache` table (migration)
- [ ] Intake status UX: `pending` → staff `confirmed` (manual via admin or RPC)
- [ ] Supabase Realtime on `orders` / `deliveries` for `app/request/[id]`
- [ ] Map on tracking page (Mapbox GL JS or Google Maps JS)
- [ ] Post-delivery blessing (optional): `delivery_blessings` table + simple form
- [ ] Remove or gate `simulateVolunteerMatch` timeouts once DB drives status

### Exit criteria

- End-to-end: submit request → coordinator confirms in DB → status updates on tracking map
- No localStorage for request list/history

---

## Phase 2 — Admin seed + kitchen basics

**Goal:** Repeatable test nights and staff auth.

### Tasks

- [ ] `/admin` layout (wider than 430px `AppShell` for map-first dispatch later)
- [ ] Staff auth: session + `staff` row; middleware/API checks `dispatcher` | `kitchen_manager` | `admin`
- [ ] Dev seed: `supabase/seed/dev_mississauga.sql` (kitchen, menu, food items, sample users)
- [ ] Admin “Simulator”: advance `order_status` / `delivery_status` for demos
- [ ] Kitchen manager: publish menu, edit `ops.kitchen_daily_controls`
- [ ] Coordinator: intake queue — approve orders, assign `kitchen_id`

### Exit criteria

- One command/SQL seeds a full test evening
- Dispatcher approves 10 pending orders without using localStorage

---

## Phase 3 — Sevadar MVP (replace mock `/seva`)

**Goal:** Volunteer runs a real assigned route.

### Tasks

- [ ] Link `UserContext` dasher → `drivers` row (`auth_id`)
- [ ] `/seva` loads `driver_routes` + `route_stops` for today where `driver_id` = me
- [ ] Accept route / start shift → `driver_routes.status` = `in_progress`
- [ ] Per-stop check-in → update `route_stops.status`, `deliveries.status`
- [ ] Background location: `POST /api/drivers/location` → `drivers.current_*` + `driver_location_pings` (new table)
- [ ] Realtime subscription for active route
- [ ] “Open directions” → external maps URL from stop coordinates

### Exit criteria

- Sevadar sees only their assigned route from SQL
- Coordinator sees driver position update on map (admin Phase 4+)

### Deprecate

- `constants/volunteer-deliveries.ts` mock (keep for Storybook/tests only)

---

## Phase 4 — Coordinator dispatch v0 (manual)

**Goal:** Map-first operations without the optimizer. Teaches the **service night playbook** before automation ([ROUTING.md](./ROUTING.md#service-night-playbook)).

### Tasks

- [ ] **Volunteer roster:** list tonight’s `drivers` / sign-ups; coordinator marks **Confirmed for delivery** (only confirmed IDs used in assign UI)
- [ ] Dispatch board: pending **approved** recipients + confirmed sevadars on map (kitchen pin = Gurdwara depot)
- [ ] Show each sevadar relative to kitchen and recipient cluster (map + optional drive-time preview)
- [ ] Manual assign: order → driver; build `driver_routes` draft + `route_stops` (drag reorder)
- [ ] Pre-flight modal: counts, windows, capacity warnings, unassigned recipients = zero before finalize
- [ ] **Finalize & Notify:** lock routes (`assigned`), insert `notifications`, stub push/WhatsApp
- [ ] Distances preview: `earthdistance` or matrix API read-only

### Exit criteria

- Coordinator can answer: “Who is confirmed volunteering tonight?” and “Does every approved recipient have a stop?”
- Dispatcher plans a night manually in &lt;10 minutes for ~15 stops
- Finalize writes `route_stops` consumed by `/seva`

---

## Phase 5 — Route optimization v1

**Goal:** Automate Step 3 of the playbook: given **confirmed `driverIds`**, **geocoded orders**, and **kitchen depot**, produce balanced routes that minimize total driving while serving everyone. **Spec:** [ROUTING.md](./ROUTING.md). **Algorithms:** [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md).

### Tasks

- [ ] `lib/routing/` pure TypeScript (cluster, assign, sequence, validate)
- [ ] `route_optimization_runs` table (input/output JSON audit: roster snapshot, matrix provider, metrics)
- [ ] `POST /api/dispatch/generate` — input: `kitchenId`, `serviceDate`, **confirmed** `driverIds`, `orderIds`
- [ ] `POST /api/dispatch/finalize` — same as Phase 4 lock + notifications
- [ ] Mapbox/Google **distance matrix** (server-side secrets) — depot, driver starts, all recipient stops
- [ ] Coordinator UI: **Generate** (draft) → review on map (swap driver / drag stop) → **Finalize**
- [ ] `overflow[]` UX when constraints cannot be met (coordinator assigns manually)
- [ ] Unit tests with golden fixtures (5 stops, 2 drivers, 1 overflow)

### Exit criteria

- From confirmed roster + approved orders, generate completes in &lt;5 min for ~20 stops (PRD target)
- Every order on a route or explicitly in overflow; total drive time improves vs naive manual assign on seed data
- Routes persisted and visible on sevadar `/seva`

---

## Phase 6 — Kitchen six-stage workflow

**Goal:** Langar hall batch gates and automated notifications.

### Tasks

- [ ] `kitchen_batches` (or extend `menus`) with stages: Prep → Cooking → Packing → Ready → Pickup → Dispatched
- [ ] Packing gate: e.g. 180/180 meals before Ready
- [ ] Stage transitions → `notifications` + recipient window adjustments
- [ ] Kitchen admin UI under `/admin/kitchen`

### Exit criteria

- Kitchen cannot skip Packing below target; coordinator notified on Ready

---

## Phase 7 — WhatsApp bot

**Goal:** Sevadars on WhatsApp (parallel track once dispatch stable).

### Tasks

- [ ] Meta Cloud API webhooks (Edge Function)
- [ ] `whatsapp_links` opt-in + OTP link to `drivers`
- [ ] Template messages EN + Gurmukhi
- [ ] Commands: STATUS, ROUTE, DROP, HELP, PAUSE

### Exit criteria

- Assigned sevadar receives route link on finalize; reminder 60 min before pickup

---

## Phase 8 — Live re-optimization + edge cases

**Goal:** When the night diverges from the plan, re-run the same optimizer on **remaining** stops without undoing completed deliveries.

### Tasks

- [ ] Sevadar DROP → mark driver unavailable; re-cluster remaining stops across other **confirmed** drivers still on shift
- [ ] No-answer → `delivery.failed`, coordinator alert; optional auto-reassign stop
- [ ] Overflow recipients → priority tags in `ops.runtime_config`
- [ ] Late kitchen → shift delivery windows + notify recipients; regenerate ETAs from new `ready_by`
- [ ] Live pings inform re-assign: prefer driver closest to orphaned stop (matrix from `drivers.current_*`)

### Exit criteria

- Coordinator can recover a route after one sevadar drops without manual retyping every stop

---

## Schema gaps to plan (migrations)

| PRD need | Suggested addition |
|----------|-------------------|
| Geocode cache | `geo_cache(address_hash, lat, lng, provider, fetched_at)` |
| Location history | `driver_location_pings(driver_id, route_id, lat, lng, recorded_at)` |
| Optimization audit | `route_optimization_runs(kitchen_id, service_date, input_json, output_json, status)` |
| Coordinator review | `orders.review_status` or use `pending` + staff RPC |
| Confirmed volunteers tonight | `shifts(kitchen_id, service_date, driver_id, seva_type, status)` — `status`: signed_up → **confirmed** → completed |
| Four seva types | `driver_seva_preferences` or `shifts.seva_type` (only `delivery` rows feed VRP) |
| Kitchen stages | `kitchen_batches` linked to `menus` + `meals_packed` |
| Blessings | `delivery_blessings(delivery_id, message)` |
| WhatsApp | `whatsapp_links`, `message_log` |

---

## Out of scope (v1)

- Payments / donations
- Multi-Gurdwara federation
- Recipe/menu AI
- Direct recipient ↔ sevadar chat

---

## Typography note (PRD vs app)

- **Recipient / sevadar mobile flows:** SF Pro via `TypeClass` ([AGENTS.md](../AGENTS.md))
- **Coordinator admin (future):** PRD editorial fonts (Fraunces, etc.) allowed on `/admin` only — do not mix into `/request` or `/seva`
