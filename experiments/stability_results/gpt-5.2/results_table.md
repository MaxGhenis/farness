# Stability Experiment Results

**Random seed**: 1943633219
**Runs per condition**: 6

## Stability-under-probing results

**Sample sizes**: n_farness = 66 | n_naive = 66

### Primary metrics

| Metric |Farness | Naive |
|--------|------- | ------- |
| Mean update magnitude | 22.03 | 59.03 |
| Mean relative update | 45% | 58% |
| Initial ci rate | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 98% |

### Pairwise comparisons

**farness vs naive**:
- Mann-Whitney U = 1704.0
- p (raw) = 0.03, p (Holm-Bonferroni) = 0.03
- Cohen's d = -0.30 (small), 95% CI: [-0.49, -0.03]
- Rank-biserial r = 0.22, 95% CI: [0.03, 0.42]

### Convergence analysis

- **Convergence ratio**: -2.24 (95% CI: [-2.65, -1.78])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.60
- **n valid pairs**: 269

*Significant divergence: naive responses moved away from farness initial estimates*