# Build roadmap

Phased plan for **seva-eats-web** + Supabase. Finish each phase’s **exit criteria** before the next.

| Doc | Use |
|-----|-----|
| [ROUTING.md](./ROUTING.md) | Supabase tables, APIs, live GPS, QR scan |
| [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md) | v1 route math (no matrix API) |

**Build order:** 0 → 1 → 2 → 3 → 4 → 5 → 8. Mock addresses + QR ticketing land in Phase 2–3.

---

## Phase 0 — Foundation

- [x] **Goal:** Postgres source of truth; types; role routing.
- [ ] `supabase/migrations/` in repo + `types/database.ts`
- [ ] `orders` / `order_items` replace `RequestContext` localStorage
- [x] Sign-in: Supabase OAuth/email + `upsert_recipient_profile`
- [ ] Sign-in: volunteer row in `drivers` on role = dasher
- [x] `.env.example`
- [x] Role routing (`AuthGate`, `lib/navigation/role-paths.ts`)
- [x] **Exit (partial):** `npm run build` passes; auth + roles work. **Remaining:** SQL-backed requests.

---

## Phase 1 — Recipient path

- [ ] Geocode on submit → `orders.delivery_latitude/longitude`
- [ ] Staff confirm orders; Realtime on tracking
- [x] `SevaMap` on tracking page (`app/request/[id]/page.tsx`)
- [ ] Remove mock status simulation when DB drives tracking
- [ ] **Exit:** Submit → confirm in DB → tracking updates live.

---

## Phase 2 — Admin + seed

- [ ] `/admin`, staff auth (`dispatcher`, `kitchen_manager`)
- [ ] `supabase/seed/dev_mississauga.sql` — mock kitchen + ~5 Brampton/Mississauga addresses
- [ ] Intake queue: approve orders
- [ ] **Exit:** Seed one test night; approve orders without localStorage.

---

## Phase 3 — Sevadar MVP + QR ticketing

- [x] `/seva` mock route UI (pickup → stops → complete) — `app/seva/route/*`
- [x] Maps on volunteer flow (`VolunteerRouteMap`, Google embed + `SevaMap`)
- [ ] `/seva` reads `driver_routes` + `route_stops` from Supabase
- [ ] `route_stops.qr_code` per stop; generate on finalize
- [ ] `/seva/scan/[code]` — driver scans QR → marks stop delivered (Amazon-style)
- [ ] `POST /api/drivers/location` + `driver_location_pings`
- [ ] Recipient tracking subscribes to driver ping + stop status (Realtime)
- [ ] **Exit:** Assigned route from SQL; scan confirms delivery; GPS on coordinator map.
- [ ] **Deprecate:** `constants/volunteer-deliveries.ts` (keep for Storybook/tests only).

---

## Phase 4 — Manual dispatch

- [ ] Roster: confirm who is delivering tonight (`shifts.status = confirmed`)
- [ ] Map: kitchen + recipients + drivers; drag to reorder stops
- [ ] Finalize → `assigned`, QR codes issued, notifications
- [ ] **Exit:** ~5 stops per driver planned manually in &lt;10 min; `/seva` consumes `route_stops`.

---

## Phase 5 — Route optimization v1

- [ ] `lib/routing/` — nearest-neighbor + 2-opt on haversine ([math](./ROUTE_OPTIMIZATION.md))
- [ ] `route_optimization_runs` migration
- [ ] `POST /api/dispatch/generate` + `finalize`
- [ ] Coordinator: Generate → review → Finalize
- [ ] **Exit:** Gurdwara → 5 mock stops → driver home sequenced in &lt;1 s; saved to `route_stops`.

---

## Phase 6 — Kitchen workflow

- [ ] Six stages (Prep → Dispatched)
- [ ] Packing gates
- [ ] Kitchen notifications

---

## Phase 7 — WhatsApp

- [ ] Sevadar templates
- [ ] Webhooks after dispatch is stable

---

## Phase 8 — Re-optimization

- [ ] DROP / failed scan → re-sequence remaining stops
- [ ] Late kitchen → shift ETAs
- [ ] **Exit:** Recover a night without retyping every stop.

---

## Migrations to plan

- [ ] `route_stops.qr_code`, `route_stops.scanned_at`
- [ ] Confirmed roster — `shifts(..., status)`
- [ ] GPS history — `driver_location_pings`
- [ ] Audit — `route_optimization_runs`
- [ ] Geocode cache — `geo_cache` *(optional; mock lat/lng in seed is enough for v1)*

---

## Out of scope (v1)

- Payments
- Multi-Gurdwara
- Recipient↔sevadar chat
- Drive-time matrix APIs (Mapbox/Google matrix)
- In-browser VRP solvers
