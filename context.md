# Seva Eats Web — Project Context

**Read this before building new features.** UI: [AGENTS.md](./AGENTS.md). Docs index: [docs/README.md](./docs/README.md).

Expo/mobile PRD reference: [`../sewa-eats/context.md`](../sewa-eats/context.md) (older beta scope; web PRD v1 below is the north star).

---

## Vision (PRD v1 summary)

Sacred logistics for Gurdwaras: free langar, coordinator dispatch, sevadar routes, kitchen batches, WhatsApp for volunteers. v1 is **single Gurdwara per region**, no payments, no in-app recipient↔sevadar chat.

**Success targets:** &lt;24h intake→delivery · &gt;95% completion · &lt;30 min kitchen→door · &lt;5 min dispatch planning · 0 tray waste.

---

## Repos

| Repo | Role |
|------|------|
| **seva-eats-web** (this) | Next.js 15 App Router — primary web client |
| **sewa-eats** | Expo app — parity reference for UI/flows |
| **Supabase** (cloud) | Auth, Postgres, Realtime — schema already provisioned |

---

## What is built today

### Done (Phase 0 partial)

| Area | Status | Key paths |
|------|--------|-----------|
| Onboarding + auth | ✅ | `app/onboarding/*`, Supabase OAuth/email |
| Role choice | ✅ | Slide 2 → `recipient` \| `dasher` in `UserContext` |
| Recipient meal flow | ✅ UI, **mock data** | `app/request/*`, `context/RequestContext.tsx` (localStorage) |
| Volunteer home | ✅ **mock route** | `app/seva/page.tsx`, `constants/volunteer-deliveries.ts` |
| Volunteer settings | ✅ | `app/seva/profile/page.tsx` |
| Role routing | ✅ | `lib/navigation/role-paths.ts`, `components/AuthGate.tsx` |
| Supabase auth + profile RPC | ✅ | `upsert_recipient_profile` on sign-in |

### Not built yet

- Orders/deliveries/routes from **Postgres** (UI still uses localStorage simulation)
- `supabase/migrations/` in this repo (migrations exist only in cloud)
- Coordinator `/admin` console
- Kitchen 6-stage workflow
- Real maps on tracking/dispatch (scaffold: `components/map/SevaMap.tsx`, `lib/map/config.ts`)
- Route optimizer API
- Live GPS pings + Realtime
- WhatsApp bot
- Four seva types (ingredient, roti, packing, delivery) — only generic `dasher` role

---

## Roles and routes

| Role | Code | Home | Settings |
|------|------|------|----------|
| Recipient | `recipient` | `/request/location` | `/profile` |
| Volunteer (sevadar) | `dasher` | `/seva` | `/seva/profile` |

Staff (future): `staff.role` ∈ `admin`, `dispatcher`, `kitchen_manager` → `/admin/*`.

---

## Supabase schema (already live)

Use Supabase MCP: `list_tables`, `apply_migration`, `generate_typescript_types`.

**Core tables:** `users`, `drivers`, `staff`, `kitchens`, `menus`, `menu_items`, `food_items`, `orders`, `order_items`, `deliveries`, `driver_routes`, `route_stops`, `notifications`, status history tables.

**Ops:** `ops.kitchen_daily_controls`, `ops.runtime_config`.

**Web usage today:** Auth + `upsert_recipient_profile` only. No `.from('orders')` yet.

**Naming map:** PRD “sevadar” → DB `drivers`; PRD “coordinator” → `staff` where `role = dispatcher`.

---

## Architecture (target)

```
Recipient / Sevadar UI  →  Supabase (RLS)  →  orders, deliveries, routes
Coordinator Admin       →  API optimize    →  driver_routes + route_stops
Sevadar (active shift)  →  location pings  →  Realtime → map / ETA
```

Dispatch: confirm sevadars → geocoded orders + kitchen → server optimizes routes → finalize → GPS. See [docs/ROUTING.md](./docs/ROUTING.md) and [docs/ROUTE_OPTIMIZATION.md](./docs/ROUTE_OPTIMIZATION.md).

---

## Agent skills (install / use)

```bash
npx skills add supabase/agent-skills@supabase -y
npx skills add supabase/agent-skills@supabase-postgres-best-practices -y
npx skills add mapbox/mapbox-agent-skills@mapbox-web-integration-patterns -y
```

Project skill: `.agents/skills/seva-routing/SKILL.md`

---

## Build order

Follow **[docs/ROADMAP.md](./docs/ROADMAP.md)** phase by phase. Do not skip Phase 0 foundation (SQL + types) before expanding admin or routing.

---

## Verification

```bash
npm run build
```

**Smoke paths**

- Recipient: onboarding → slide 2 “I need a meal” → sign-in → `/request/location`
- Volunteer: onboarding → slide 2 “I want to volunteer” → sign-in → `/seva`
- Role switch: either profile page → switch role → correct home
