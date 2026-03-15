# Stability experiment results (claude-opus-4-6)

**Total results**: 191

## Stability-under-probing results

**Sample sizes**: n_cot = 66 | n_farness = 62 | n_naive = 63

### Primary metrics

| Metric |Cot | Farness | Naive |
|--------|------- | ------- | ------- |
| Mean update magnitude | 13.37 | 9.02 | 13.80 |
| Mean relative update | 49% | 43% | 51% |
| Initial ci rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 98% | 1.00 |

### Pairwise comparisons

**cot vs farness**:
- Mann-Whitney U = 2344.5
- p (raw) = 0.15, p (Holm-Bonferroni) = 0.31
- Cohen's d = 0.33 (small), 95% CI: [-0.00, 0.65]
- Rank-biserial r = -0.15, 95% CI: [-0.34, 0.05]

**cot vs naive**:
- Mann-Whitney U = 2037.5
- p (raw) = 0.85, p (Holm-Bonferroni) = 0.85
- Cohen's d = -0.03 (small), 95% CI: [-0.38, 0.33]
- Rank-biserial r = 0.02, 95% CI: [-0.19, 0.23]

**farness vs naive**:
- Mann-Whitney U = 1576.5
- p (raw) = 0.06, p (Holm-Bonferroni) = 0.19
- Cohen's d = -0.35 (small), 95% CI: [-0.67, -0.02]
- Rank-biserial r = 0.19, 95% CI: [0.00, 0.39]

### Convergence analysis

- **Convergence ratio**: -1.48 (95% CI: [-2.08, -0.94])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.72
- **n valid pairs**: 53

*Significant divergence: naive responses moved away from farness initial estimates*