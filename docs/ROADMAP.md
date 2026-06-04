# Build roadmap

Phased plan for **seva-eats-web** + Supabase. Finish each phase’s **exit criteria** before the next. Product context: [context.md](../context.md). Dispatch: [ROUTING.md](./ROUTING.md). Math: [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md).

**Build order:** 0 → 1 → 2 → 3 → 4 (manual dispatch) → 5 (optimizer) → 8 (re-optimize). Do not add generate API before orders and drivers are in Postgres.

---

## Phase 0 — Foundation (in progress)

**Goal:** Postgres source of truth; types; role routing.

- [ ] `supabase/migrations/` + `types/database.ts`
- [ ] `orders` / `order_items` replace `RequestContext` localStorage
- [ ] Sign-in: `users` + `drivers` for volunteers
- [ ] `.env.example`

**Exit:** Request persists after refresh; `npm run build` passes.

---

## Phase 1 — Recipient path

- [ ] Geocode on submit → `orders.delivery_*`
- [ ] Staff confirm orders; Realtime on tracking
- [ ] `SevaMap` on tracking page
- [ ] Remove mock volunteer simulation when DB drives status

**Exit:** Submit → confirm in DB → tracking updates.

---

## Phase 2 — Admin + seed

- [ ] `/admin`, staff auth (`dispatcher`, `kitchen_manager`)
- [ ] `supabase/seed/dev_mississauga.sql`
- [ ] Intake queue: approve orders

**Exit:** Seed one test night; approve 10 orders without localStorage.

---

## Phase 3 — Sevadar MVP

- [ ] `/seva` from `driver_routes` + `route_stops`
- [ ] `POST /api/drivers/location` + `driver_location_pings`
- [ ] Stop check-in updates `deliveries`

**Exit:** Assigned route from SQL; GPS visible to coordinator.

**Deprecate:** `constants/volunteer-deliveries.ts` (tests only).

---

## Phase 4 — Manual dispatch

- [ ] Roster: confirm who is delivering tonight
- [ ] Map: kitchen + recipients + drivers; manual assign + drag order
- [ ] Finalize → `assigned`, notifications

**Exit:** ~15 stops planned manually in &lt;10 min; `/seva` consumes `route_stops`.

---

## Phase 5 — Route optimization v1

- [ ] `lib/routing/` + [math](./ROUTE_OPTIMIZATION.md)
- [ ] `route_optimization_runs` migration
- [ ] `POST /api/dispatch/generate` + `finalize`
- [ ] Coordinator: Generate → review → Finalize

**Exit:** ~20 stops in &lt;5 min; all orders routed or in `overflow`.

---

## Phase 6 — Kitchen workflow

Six stages (Prep → Dispatched), packing gates, notifications.

---

## Phase 7 — WhatsApp

Sevadar templates + webhooks after dispatch is stable.

---

## Phase 8 — Re-optimization

- [ ] DROP / failed → re-run optimizer on remaining stops
- [ ] Late kitchen → shift windows + new ETAs

**Exit:** Recover a night without retyping every stop.

---

## Migrations to plan

| Need | Table / field |
|------|----------------|
| Confirmed roster | `shifts(..., status)` — only `delivery` + `confirmed` → generate |
| GPS history | `driver_location_pings` |
| Audit | `route_optimization_runs` |
| Geocode cache | `geo_cache` |

---

## Out of scope (v1)

Payments, multi-Gurdwara, recipient↔sevadar chat, in-browser VRP.
