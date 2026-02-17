# Stability experiment results

**Total results**: 125

## Stability-Under-Probing Results

**Sample sizes**: n_naive = 63, n_farness = 62

### Primary Metrics

| Metric | Naive | Farness | p-value |
|--------|-------|---------|---------|
| Mean update magnitude | 13.80 | 9.02 | 0.03 |
| Mean relative update | 51% | 43% | — |
| Initial CI rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 98% | — |

### Effect Sizes

- Cohen's d (update magnitude): 0.35 (small)
- Rank-biserial r: -0.19

### Convergence Analysis

- **Convergence ratio**: -1.25 (95% CI: [-1.53, -1.00])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.58
- **n valid pairs**: 293

*Significant divergence: naive responses moved away from farness initial estimates*