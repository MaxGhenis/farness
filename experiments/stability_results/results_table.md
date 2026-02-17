# Stability Experiment Results

**Random seed**: 42
**Runs per condition**: 3

## Stability-Under-Probing Results

**Sample sizes**: n_naive = 33, n_farness = 33

### Primary Metrics

| Metric | Naive | Farness | p-value |
|--------|-------|---------|---------|
| Mean update magnitude | 13.68 | 9.64 | 0.13 |
| Mean relative update | 50% | 44% | — |
| Initial CI rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 96% | — |

### Effect Sizes

- Cohen's d (update magnitude): 0.30 (small)
- Rank-biserial r: -0.16

### Convergence Analysis

- **Convergence ratio**: -1.33 (95% CI: [-1.78, -0.88])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.62
- **n valid pairs**: 82

*Significant divergence: naive responses moved away from farness initial estimates*