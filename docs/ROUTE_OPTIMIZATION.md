# Route optimization (math)

How Phase 5 `lib/routing/` will plan routes. Ops flow: [ROUTING.md](./ROUTING.md). Build order: [ROADMAP.md](./ROADMAP.md).

> **GitHub math:** `$inline$` and `$$block$$` (MathJax). [Docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)

---

## Problem

Each night is **CVRPTW**: depot $D$ (kitchen), stops $N = \{1,\ldots,n\}$, drivers $K = \{1,\ldots,m\}$.

- Cost $c_{ij}$ = drive **minutes** from matrix API (not straight-line).
- Each driver: tour $D \to \text{stops} \to D$, capacity $Q_k$, max stops $S_k^{\max}$, max duration $T_k^{\max}$.
- Stop $i$ has window $[e_i, l_i]$ and service time $s_i$.

Exact CVRPTW is NP-hard. **v1** uses a fast heuristic; upgrade to OR-Tools only if windows fail often in production.

---

## Goals (in order)

1. **Coverage** — every approved order on a route or in `overflow`
2. **Freshness** — minimize delay from kitchen ready $t_0$ to first drop
3. **Fairness** — similar $|R_k|$ per driver
4. **Total drive** — minimize $\sum_k T_k$

---

## Best approach (v1 pipeline)

```text
Matrix c_ij  →  k-means (k = m)  →  assign clusters to drivers  →  TSP per driver  →  validate
```

| Step | What | Why |
|------|------|-----|
| **Matrix** | Batch Mapbox/Google for $\{D\} \cup N$ and driver starts $p_k$ | Roads matter; haversine is wrong for sequencing |
| **Cluster** | k-means on $(\text{lat}, \text{lng})$, $k = m$ | Group nearby recipients |
| **Assign** | Hungarian ($m \le 10$) or greedy on $\text{cost}_{k,j}$ | Match clusters to drivers near that area |
| **Sequence** | Nearest-neighbor + 2-opt on $c_{ij}$ | Short loop per driver |
| **Validate** | Capacity, stops, $T_k$, windows | Failures → `overflow` for coordinator |

**Do not** run this in the browser. `POST /api/dispatch/generate` → Postgres `draft` routes.

---

## Key math

### Assignment

Each stop $i$ assigned to one driver $k$ (or overflow):

$$\sum_{k \in K} x_{ik} = 1 \quad \forall i \in N$$

Capacity: $\sum_i d_i x_{ik} \le Q_k$. Stops: $\sum_i x_{ik} \le S_k^{\max}$.

### Tour time for driver $k$

For visit order $\pi$:

$$T_k(\pi) = c_{D,\pi_1} + \sum_{r} c_{\pi_r,\pi_{r+1}} + c_{\pi_{|R_k|},D} + \sum_r s_{\pi_r}$$

**2-opt:** reverse a segment if $c_{ab} + c_{cd} > c_{ac} + c_{bd}$.

### Time windows

Arrival $A_i$ from forward simulation along the route. Feasible if $e_i \le A_i \le l_i$. Lateness: $\text{late}_i = \max(0, A_i - l_i)$.

### k-means (cluster)

Assign stop $i$ to nearest centroid $\mu_j$, then update $\mu_j = \frac{1}{|C_j|}\sum_{i \in C_j} \mathbf{z}_i$. Roads are fixed in the next steps via $c_{ij}$.

### Assign clusters to drivers

Minimize $\sum_{k,j} \text{cost}_{k,j} a_{kj}$ with each cluster to exactly one driver. Use matrix times from $p_k$ through $D$ to stops in cluster $j$.

### Live ETA

$$\text{ETA} = \text{now} + \text{MatrixAPI}(p_{\text{gps}}, n_{\text{next}}) + s_n$$

Re-optimize mid-shift (Phase 8): freeze completed stops, re-run pipeline on the rest with current $p_k$.

---

## Code map (Phase 5)

| Step | File |
|------|------|
| Matrix | `lib/routing/matrix.ts` |
| Cluster | `lib/routing/cluster.ts` |
| Assign | `lib/routing/assign.ts` |
| TSP | `lib/routing/sequence.ts` |
| Validate | `lib/routing/validate.ts` |
| API | `app/api/dispatch/generate/route.ts` |

Manual dispatch first (Phase 4), then automate (Phase 5).
