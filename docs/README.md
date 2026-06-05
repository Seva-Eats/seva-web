# Seva Eats — Docs

| File | Use |
|------|-----|
| [ROADMAP.md](./ROADMAP.md) | Phases, checkboxes, what’s done |
| [ROUTING.md](./ROUTING.md) | Supabase backend, GPS, QR scan flow |
| [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md) | v1 route math (haversine TSP, GitHub LaTeX) |

**Math on GitHub:** `$c_{ij}$` inline; block equations on their own line with `$$...$$`.

**v1 routing:** mock lat/lng in Postgres → Gurdwara → ~5 stops → driver home → nearest-neighbor + 2-opt. No drive-time matrix.

**Delivery proof:** QR on each `route_stop`; driver scans at door like Amazon.
