# Route Optimization — Mathematics & Algorithm Design

How Seva Eats plans delivery routes: problem definition, objectives, constraints, and the **v1 heuristic** we will implement in `lib/routing/` (Phase 5).

**Related docs**

| Doc | Focus |
|-----|--------|
| [ROUTING.md](./ROUTING.md) | APIs, tables, live tracking, service night playbook |
| [ROADMAP.md](./ROADMAP.md) | When to build each phase |
| This file | **Math, costs, and step-by-step algorithm** |

---

## 1. What we are solving

Each service night is a **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)**:

- One **depot** (Gurdwara / kitchen) where every sevadar picks up trays.
- **n** recipient **stops** (approved orders with lat/lng).
- **m** **vehicles** (confirmed delivery sevadars), each with capacity and max stops.
- Travel times come from a **road network** (Mapbox/Google matrix), not straight-line distance.

We want:

1. Every stop assigned to exactly one driver (or flagged **overflow**).
2. Each driver’s route is a tour: **depot → some stops → depot**.
3. Minimize **total driving** and keep routes **feasible** (windows, capacity, shift length).

Exact CVRPTW is NP-hard. v1 uses a **fast decomposition**: cluster → assign drivers to clusters → sequence each tour → validate.

---

## 2. Notation

| Symbol | Meaning |
|--------|---------|
| \(D\) | Depot (kitchen), index `0` |
| \(N = \{1,\ldots,n\}\) | Recipient stops (orders tonight) |
| \(K = \{1,\ldots,m\}\) | Confirmed drivers |
| \(V = \{0\} \cup N\) | All nodes in routing graph |
| \(c_{ij}\) | Drive **time** (minutes) from node \(i\) to \(j\) via matrix API |
| \(d_i\) | Demand at stop \(i\) (e.g. meal count, default 1) |
| \(Q_k\) | Capacity of driver \(k\) (meals or trays) |
| \(S_k^{\max}\) | Max stops for driver \(k\) |
| \([e_i, l_i]\) | Delivery time window for stop \(i\) (earliest, latest) |
| \(s_i\) | Service time at stop \(i\) (handoff minutes) |
| \(T_k^{\max}\) | Max route duration for driver \(k\) |
| \(p_k\) | Start position of driver \(k\) (GPS or home) |
| \(t_0\) | Kitchen **ready** time (`menus.ready_by_at`) |

**Matrix construction:** For each ordered pair \((i,j)\) in \(V \times V\) (and driver starts), call the provider once (batched). Store \(c_{ij}\) in memory for the run; persist snapshot in `route_optimization_runs.input_json`.

**Why time, not km:** Langar quality depends on **minutes** in the car; the matrix API returns duration (and optionally distance).

---

## 3. Decision variables (conceptual)

Binary assignment:

\[
x_{ik} = \begin{cases}
1 & \text{stop } i \text{ served by driver } k \\
0 & \text{otherwise}
\end{cases}
\]

Routing (for each driver \(k\), a path visiting their assigned stops):

\[
y_{ij}^k = \begin{cases}
1 & \text{driver } k \text{ travels } i \to j \\
0 & \text{otherwise}
\end{cases}
\]

In code v1 does **not** run a MIP solver; we approximate these with cluster + assign + TSP heuristics.

---

## 4. Objectives (lexicographic)

Seva prioritizes **coverage** over pure mileage. Treat goals in **layers** (optimize layer 1 first, then 2 among ties, etc.):

| Priority | Goal | Measure |
|----------|------|---------|
| 1 | **Coverage** | Unassigned stops = 0 (or explicit overflow) |
| 2 | **Freshness** | Minimize \(\max_k \big( \text{arrival at first stop on route } k - t_0 \big)\) |
| 3 | **Fairness** | Minimize variance of stop counts \(\mathrm{Var}(|R_k|)\) where \(R_k\) = stops on route \(k\) |
| 4 | **Total drive** | Minimize \(\sum_k T_k\) where \(T_k\) = total drive minutes on route \(k\) |

**Scalar shortcut (optional weighted sum for tie-breaking inside assign step):**

\[
\min \;\; \alpha \sum_{k} T_k + \beta \cdot \mathrm{Var}(|R_k|) + \gamma \cdot \sum_{k} \text{lateness}_k
\]

with large penalty on unassigned stops (effectively \(\alpha,\beta,\gamma\) tuned so coverage is never traded for a few saved minutes).

**v1 implementation:** Hard-filter infeasible assignments in **validate**; use \(\sum_k T_k\) as primary cost in **assign** and **2-opt**.

---

## 5. Constraints

### 5.1 Assignment

Each stop at most one driver:

\[
\sum_{k \in K} x_{ik} = 1 \quad \forall i \in N
\]

(Or \(=0\) and \(i \in\) overflow set if no feasible driver.)

### 5.2 Capacity

\[
\sum_{i \in N} d_i \, x_{ik} \le Q_k \quad \forall k \in K
\]

### 5.3 Max stops

\[
\sum_{i \in N} x_{ik} \le S_k^{\max} \quad \forall k \in K
\]

### 5.4 Route duration

Let \(T_k\) be sum of \(c_{ij}\) on edges in driver \(k\)’s tour plus service times:

\[
T_k \le T_k^{\max} \quad \forall k \in K
\]

### 5.5 Time windows

Arrival time at stop \(i\):

\[
A_i = t_0 + \text{travel along route} + \sum_{\text{stops before } i} (c_{\cdot,\cdot} + s_{\cdot})
\]

Feasible if:

\[
e_i \le A_i \le l_i
\]

If \(A_i < e_i\), **wait** until \(e_i\) (adds idle time to route). **Lateness:** \(\text{late}_i = \max(0, A_i - l_i)\).

### 5.6 Tour structure

Each active driver: one connected path starting and ending at depot \(D\), visiting exactly their assigned stops once.

---

## 6. Distance / time matrix

### 6.1 API batch

For nodes \(\{D\} \cup N\) plus driver starts \(\{p_k\}\):

\[
c_{ij} = \text{MatrixAPI}(i, j) \quad \text{(minutes)}
\]

Providers return duration for many pairs in one request (Mapbox Matrix, Google Routes Distance Matrix).

### 6.2 Haversine (preview only)

For **admin map preview** before matrix call:

\[
a = \sin^2\frac{\Delta\phi}{2} + \cos\phi_i \cos\phi_j \sin^2\frac{\Delta\lambda}{2}, \quad
d_{\text{km}} = 2R \arcsin(\sqrt{a})
\]

with Earth radius \(R \approx 6371\) km. Convert to rough minutes with \(v_{\text{avg}}\) (e.g. 35 km/h urban):

\[
\hat{c}_{ij} \approx \frac{d_{\text{km}}}{v_{\text{avg}}} \times 60
\]

**Do not** use \(\hat{c}_{ij}\) for final sequencing — only \(c_{ij}\) from the matrix.

### 6.3 Postgres `earthdistance`

Same role as haversine: fast sorting, not final VRP cost.

---

## 7. Pipeline (v1 heuristic)

```
Input: confirmed drivers K, stops N, depot D, matrix c_ij, constraints
  → A. Cluster N into m groups
  → B. Assign clusters to drivers (min cost)
  → C. For each driver: TSP on {D} ∪ assigned stops
  → D. Validate; push failures to overflow
Output: routes[], overflow[], metrics
```

---

## 8. Step A — Clustering (k-means)

**Purpose:** Group recipients geographically so each driver gets a compact area.

### 8.1 Feature vectors

For stop \(i\), use coordinates (or projected x/y):

\[
\mathbf{z}_i = (\text{lat}_i,\ \text{lng}_i)
\]

(Optional: weight by time-window urgency in a later version.)

### 8.2 k-means with \(k = m\)

Initialize \(m\) centroids (e.g. k-means++ using \(\mathbf{z}_i\)).

Repeat until convergence or max iterations:

**Assign** each stop to nearest centroid:

\[
\text{cluster}(i) = \arg\min_{j \in \{1..m\}} \|\mathbf{z}_i - \boldsymbol{\mu}_j\|_2
\]

**Update** centroids:

\[
\boldsymbol{\mu}_j = \frac{1}{|C_j|} \sum_{i \in C_j} \mathbf{z}_i
\]

Empty cluster → re-seed from a random unassigned stop.

**Output:** clusters \(C_1,\ldots,C_m\).

**Note:** Geographic k-means ignores roads; **assign** and **TSP** steps fix that using \(c_{ij}\).

---

## 9. Step B — Assign clusters to drivers

**Purpose:** Match each geographic cluster to the sevadar who can serve it with least drive **from their start** and balance load.

### 9.1 Cluster cost for driver \(k\) on cluster \(j\)

Let \(\bar{\mathbf{z}}_j\) be centroid of \(C_j\). Approximate cost:

\[
\text{cost}_{k,j} = c_{p_k, D} + c_{D, \bar{j}} + \sum_{i \in C_j} c_{D, i}
\]

Better (v1.1): sample 2–3 stops in \(C_j\) and use average matrix time from \(p_k\) through depot to those stops.

### 9.2 Balanced assignment

**Decision variables** \(a_{kj} \in \{0,1\}\): driver \(k\) takes cluster \(j\).

\[
\min \sum_{k \in K} \sum_{j=1}^{m} \text{cost}_{k,j} \, a_{kj}
\]

Subject to:

- Each cluster exactly one driver: \(\sum_k a_{kj} = 1\)
- Each driver at most one cluster per round* OR split large clusters in a second pass

\*When \(|C_j|\) exceeds \(S_k^{\max}\), **split** cluster: move farthest stops from centroid to nearest other cluster (greedy) until capacity OK.

### 9.3 Hungarian algorithm ( \(m \le 10\) )

Build square cost matrix \(C \in \mathbb{R}^{m \times m}\) (pad with dummy high cost if \(m\) drivers ≠ \(m\) clusters).

Hungarian finds assignment minimizing \(\sum_k C_{k,\sigma(k)}\) in \(O(m^3)\) — fine for volunteer counts.

For \(m > 10\), use **greedy**: sort all \((k,j)\) by \(\text{cost}_{k,j}\), assign lowest unused pairs.

### 9.4 Rebalance stop counts

If \(|R_k| - |R_{k'}| > 2\), move border stop \(i\) (closest to another cluster’s centroid) from heavy route to light route if capacity and \(T_k^{\max}\) still hold.

---

## 10. Step C — Sequencing (TSP per driver)

For driver \(k\), let \(R_k\) be assigned stops. Find visit order on \(\{D\} \cup R_k\) minimizing tour time.

### 10.1 Tour length

Permutation \(\pi = (\pi_1,\ldots,\pi_{|R_k|})\) of stops:

\[
T_k(\pi) = c_{D,\pi_1} + \sum_{r=1}^{|R_k|-1} c_{\pi_r,\pi_{r+1}} + c_{\pi_{|R_k|}, D} + \sum_{r} s_{\pi_r}
\]

**Goal:** \(\min_\pi T_k(\pi)\).

Exact TSP is NP-hard; v1 uses **nearest neighbor** + **2-opt**.

### 10.2 Nearest neighbor (construct initial \(\pi\))

```
current ← D
unvisited ← R_k
order ← []
while unvisited not empty:
  i ← argmin_{j in unvisited} c_{current, j}
  append i to order
  current ← i
return order  (depot D prepended/appended in output)
```

Complexity \(O(|R_k|^2)\).

### 10.3 2-opt (local improvement)

For each pair of edges \((i,i+1)\) and \((j,j+1)\), if reversing segment \(i+1..j\) reduces \(T_k\), reverse it.

Repeat until no improvement or max iterations (e.g. 50).

**2-opt gain:** Replace edges \((a,b)+(c,d)\) with \((a,c)+(b,d)\); accept if:

\[
c_{ab} + c_{cd} > c_{ac} + c_{bd}
\]

(all from matrix).

### 10.4 Time windows in sequencing

When building NN order, **penalize** choices that would cause \(\text{late}_i > 0\):

\[
\text{score}(j) = c_{\text{current},j} + \lambda \cdot \max(0,\, A_j^{\text{est}} - l_j)
\]

Pick \(j\) with minimum score. \(\lambda\) large enough to prefer feasible windows.

After 2-opt, run **forward time simulation** (Section 5.5) to compute final \(A_i\).

---

## 11. Step D — Validation & overflow

For each route \(k\):

1. **Capacity:** \(\sum_{i \in R_k} d_i \le Q_k\)
2. **Stops:** \(|R_k| \le S_k^{\max}\)
3. **Duration:** \(T_k \le T_k^{\max}\)
4. **Windows:** \(\text{late}_i = 0\) or \(\sum_i \text{late}_i \le \text{tolerance}\)

If route fails:

- Try moving last stop to another driver with slack (greedy).
- Else add stop to **overflow** list for coordinator manual assign.

**Coverage invariant:**

\[
|N| = \sum_k |R_k| + |\text{overflow}|
\]

Coordinator must clear overflow before finalize.

---

## 12. Live tracking math

### 12.1 ETA to next stop

Sevadar at position \(p\) (live GPS), next stop \(n\):

\[
\text{ETA}_n = \text{now} + \text{MatrixAPI}(p, n) + s_n
\]

Throttle updates (e.g. recompute at most every 60s or when moved > 200m).

### 12.2 Recipient map

Recipient sees only their order’s driver \(k^\*\) and \(c_{p, \text{their stop}}\) under RLS.

---

## 13. Mid-shift re-optimization (Phase 8)

**Frozen set** \(F\): stops with `completed` or `arrived`.

**Remaining** \(R = N \setminus F\).

**Active drivers** \(K' \subseteq K\): confirmed and not DROP.

Re-run **Section 7** on \((R, K')\) with:

- New depot leave time = **now** (or kitchen slip time).
- Driver start \(p_k\) = **current GPS**.

Do not reorder frozen stops; append new tours for leftover work.

---

## 14. Complexity & scale

| Step | Typical night | Complexity |
|------|---------------|------------|
| Matrix batch | \(O((n+m)^2)\) pairs, one API call | Dominated by network |
| k-means | \(n \approx 20\), \(m \approx 5\) | \(O(\text{iter} \cdot n \cdot m)\) |
| Hungarian | \(m \le 10\) | \(O(m^3)\) |
| TSP per driver | \(|R_k| \le 8\) | \(O(|R_k|^2)\) per 2-opt pass |

Target: **&lt; 5 minutes** end-to-end including matrix (PRD), usually seconds of CPU.

---

## 15. When to upgrade (v2)

If validation often fails with hard windows (\(\text{late}_i > 0\) on &gt;10% of stops), move to **OR-Tools VRP** with:

- Same \(c_{ij}\) matrix
- Explicit CVRPTW constraint programming
- Run in Python worker or Edge Function; still persist via `route_optimization_runs`

Keep v1 for default nights; v2 is fallback, not day-one scope.

---

## 16. Code mapping (Phase 5)

| Math step | Module | Function (planned) |
|-----------|--------|-------------------|
| Matrix | `lib/routing/matrix.ts` | `buildCostMatrix(nodes, driverStarts)` |
| k-means | `lib/routing/cluster.ts` | `clusterStops(stops, k)` |
| Assign | `lib/routing/assign.ts` | `assignClustersToDrivers(clusters, drivers, matrix)` |
| TSP | `lib/routing/sequence.ts` | `sequenceRoute(depot, stops, matrix)` |
| Validate | `lib/routing/validate.ts` | `validateRoutes(routes, constraints)` |
| Orchestrate | `lib/routing/generate.ts` | `generateRoutes(input)` |
| API | `app/api/dispatch/generate/route.ts` | POST handler → Postgres draft |

**Tests:** `lib/routing/__fixtures__/brampton-five-stops.json` — assert coverage, max stops, and \(T_k\) within bounds.

---

## 17. Worked micro-example

**Depot** \(D\), **2 drivers** \(K_1, K_2\), **4 stops** \(1,2,3,4\).

Matrix times (minutes):

|   | D | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| D | 0 | 8 | 10 | 15 | 14 |
| 1 | 8 | 0 | 4 | 12 | 11 |
| … |   |   |   |   |   |

**k-means** → \(C_1 = \{1,2\}\), \(C_2 = \{3,4\}\).

**Assign** → \(K_1\) starts south → \(C_1\); \(K_2\) → \(C_2\) (lower \(\text{cost}_{k,j}\)).

**TSP \(K_1\):** NN from D: D→1 (8), 1→2 (4), 2→D (10) → \(T_1 = 22\) min.

**TSP \(K_2\):** D→3→4→D similarly.

**Validate:** If \(S_k^{\max} = 3\) and both routes ≤ 60 min, **finalize**. If stop 3 window ends before arrival, move 3 to overflow or swap to \(K_1\) and re-sequence.

---

## 18. Summary

| Question | Answer |
|----------|--------|
| What problem class? | CVRPTW on drive-time matrix |
| Exact or heuristic? | Heuristic v1: cluster + assign + TSP + validate |
| What is “shortest path”? | Per-driver tour \(\min T_k(\pi)\); system \(\min \sum_k T_k\) subject to fairness and windows |
| What metric? | Matrix **minutes**, not haversine |
| Who runs it? | Server only (`POST /api/dispatch/generate`) |
| When does math change mid-night? | Re-run on \(R \setminus F\) with live \(p_k\) (Phase 8) |

Build the **operations workflow** first (Phase 4 manual), then drop this pipeline into `lib/routing/` (Phase 5).
