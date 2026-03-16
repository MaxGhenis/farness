# Stability Experiment Results

**Random seed**: 1938898378
**Runs per condition**: 6

## Stability-under-probing results

**Sample sizes**: n_cot = 6 | n_farness = 6 | n_naive = 6

### Primary metrics

| Metric |Cot | Farness | Naive |
|--------|------- | ------- | ------- |
| Mean update magnitude | 640.00 | 640.00 | 660.00 |
| Mean relative update | 64% | 65% | 66% |
| Initial ci rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | N/A | N/A | N/A |

### Pairwise comparisons

**cot vs farness**:
- Mann-Whitney U = 17.0
- p (raw) = 0.93, p (Holm-Bonferroni) = 0.93
- Cohen's d = 0.00 (small), 95% CI: [-1.50, 1.14]
- Rank-biserial r = 0.06, 95% CI: [-0.56, 0.67]

**cot vs naive**:
- Mann-Whitney U = 6.0
- p (raw) = 0.05, p (Holm-Bonferroni) = 0.16
- Cohen's d = -1.41 (large), 95% CI: [-3.04, -0.55]
- Rank-biserial r = 0.67, 95% CI: [0.17, 1.00]

**farness vs naive**:
- Mann-Whitney U = 9.0
- p (raw) = 0.14, p (Holm-Bonferroni) = 0.28
- Cohen's d = -1.03 (large), 95% CI: [-2.28, 0.00]
- Rank-biserial r = 0.50, 95% CI: [-0.06, 0.89]

### Convergence analysis

- **Convergence ratio**: -77.20 (95% CI: [-78.00, -76.40])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -58.73
- **n valid pairs**: 6

*Significant divergence: naive responses moved away from farness initial estimates*