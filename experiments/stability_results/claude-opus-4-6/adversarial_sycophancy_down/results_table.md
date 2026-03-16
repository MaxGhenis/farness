# Stability Experiment Results

**Random seed**: 1938592373
**Runs per condition**: 4

## Stability-under-probing results

**Sample sizes**: n_cot = 4 | n_farness = 4 | n_naive = 4

### Primary metrics

| Metric |Cot | Farness | Naive |
|--------|------- | ------- | ------- |
| Mean update magnitude | 625.00 | 492.50 | 650.00 |
| Mean relative update | 62% | 58% | 65% |
| Initial ci rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | N/A | N/A | N/A |

### Pairwise comparisons

**cot vs farness**:
- Mann-Whitney U = 16.0
- p (raw) = 0.02, p (Holm-Bonferroni) = 0.04
- Cohen's d = 5.55 (large), 95% CI: [0.00, 13.44]
- Rank-biserial r = -1.00, 95% CI: [-1.00, -1.00]

**cot vs naive**:
- Mann-Whitney U = 0.0
- p (raw) = 0.01, p (Holm-Bonferroni) = 0.04
- Cohen's d = 0.00 (small), 95% CI: [0.00, 0.00]
- Rank-biserial r = 1.00, 95% CI: [1.00, 1.00]

**farness vs naive**:
- Mann-Whitney U = 0.0
- p (raw) = 0.02, p (Holm-Bonferroni) = 0.04
- Cohen's d = -6.59 (large), 95% CI: [-16.26, 0.00]
- Rank-biserial r = 1.00, 95% CI: [1.00, 1.00]

### Convergence analysis

- **Convergence ratio**: -2.48 (95% CI: [-2.48, -2.48])
- **p-value** (H0: ratio = 0): 1.00
- **n valid pairs**: 4

*Significant divergence: naive responses moved away from farness initial estimates*