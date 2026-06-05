# Route optimization (v1 math)

Short spec for Phase 5. **No drive-time matrix** — mock lat/lng in Postgres, straight-line distances, server-only.

Ops flow: [ROUTING.md](./ROUTING.md). Build order: [ROADMAP.md](./ROADMAP.md).

> **GitHub math:** inline `$...$`, block equations on their own line with `$$...$$`. [GitHub docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)

---

## Problem (simplified)

One driver, one night, fixed endpoints:

$$\text{Gurdwara } D \;\to\; \text{stops } N=\{1,\ldots,n\} \;\to\; \text{driver home } H$$

Typical $n \approx 5$. Addresses and coordinates live in `orders` + `kitchens` + `drivers` (seeded mock data for dev).

**Goal:** pick visit order $\pi$ that minimizes total path length. NP-hard in general; $n \le 10$ so a fast heuristic is fine.

---

## Distance (haversine)

For stop $i$ at $(\phi_i, \lambda_i)$ and $j$ at $(\phi_j, \lambda_j)$ (radians), Earth radius $R = 6371\,\text{km}$:

$$d_{ij} = 2R \arcsin\sqrt{\sin^2\frac{\Delta\phi}{2} + \cos\phi_i\cos\phi_j\sin^2\frac{\Delta\lambda}{2}}$$

$\Delta\phi = \phi_j - \phi_i$, $\Delta\lambda = \lambda_j - \lambda_i$.  
Convert $d_{ij}$ to estimated minutes with avg speed $\bar{v} = 40\,\text{km/h}$:

$$t_{ij} = \frac{d_{ij}}{\bar{v}} \times 60$$

Good enough for mock Mississauga/Brampton routes. Upgrade to matrix API only if production ETAs are consistently wrong.

---

## Tour cost

For order $\pi = (\pi_1, \ldots, \pi_n)$:

$$C(\pi) = d_{D,\pi_1} + \sum_{r=1}^{n-1} d_{\pi_r,\pi_{r+1}} + d_{\pi_n,H}$$

**Minimize** $C(\pi)$.

---

## Algorithm (v1)

```text
Input: D, H, stops N with lat/lng from DB
  1. Nearest-neighbor from D through all stops
  2. 2-opt improvements on the middle segment (fixed D and H)
  3. Write sequence to route_stops.sequence + ETAs from t_ij sum
Output: rows in driver_routes + route_stops + qr_code per stop
```

### Step 1 — Nearest neighbor

Current $c \leftarrow D$. Unvisited $U \leftarrow N$. Order $\pi \leftarrow []$.

While $U \neq \emptyset$: pick $j = \arg\min_{i \in U} d_{c,i}$, append $j$ to $\pi$, $c \leftarrow j$, remove $j$ from $U$.  
Append leg $d_{\pi_n,H}$ at the end.

### Step 2 — 2-opt

For indices $1 \le i < j \le n$, reverse $\pi_i \ldots \pi_j$ if:

$$d_{\pi_{i-1},\pi_i} + d_{\pi_j,\pi_{j+1}} > d_{\pi_{i-1},\pi_j} + d_{\pi_i,\pi_{j+1}}$$

(with $\pi_0 := D$, $\pi_{n+1} := H$). Repeat until no improvement.

### Step 3 — ETAs

Kitchen ready at $t_0$. Arrival at stop $\pi_r$:

$$A_{\pi_r} = t_0 + \sum_{k<r} t_{\pi_k,\pi_{k+1}} + \sum_{k<r} s_{\pi_k}$$

Service time $s_i \approx 3\,\text{min}$ (hand-off). Store $A_{\pi_r}$ on `route_stops.eta_at`.

---

## Multiple drivers (later)

Split stops across $m$ drivers by greedy balance: assign each stop to driver $k$ that adds least extra $d$, cap at $S_k^{\max}$ stops. Run the single-driver TSP per driver with their own $H_k$. v1 can use **manual assign** (Phase 4) first.

---

## Live ETA (Phase 3+)

Driver GPS $(\phi_g, \lambda_g)$, next stop $n$:

$$\text{ETA} = \text{now} + t_{g,n} + s_n$$

Update `route_stops.eta_at` on each `POST /api/drivers/location` (throttled). Recipient sees it via Supabase Realtime on `route_stops`.

---

## Code map

| Step | File |
|------|------|
| Haversine | `lib/routing/distance.ts` |
| Nearest-neighbor + 2-opt | `lib/routing/sequence.ts` |
| Persist | `lib/routing/persist.ts` |
| API | `app/api/dispatch/generate/route.ts` |

**Never** run this in the browser.
