# Seva Eats — Docs

| File | Use |
|------|-----|
| [ROADMAP.md](./ROADMAP.md) | What to build, phase by phase |
| [ROUTING.md](./ROUTING.md) | Dispatch ops, APIs, tables, live GPS |
| [ROUTE_OPTIMIZATION.md](./ROUTE_OPTIMIZATION.md) | **How routing math works** (CVRPTW + v1 heuristic) |

**Math on GitHub:** inline `$c_{ij}$`, block equations on their own line with `$$ ... $$`. See [GitHub: mathematical expressions](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions).

**Rules:** VRP runs on the server only. Use Mapbox/Google **drive-time matrix** for routing; haversine / `earthdistance` is preview only.
