# Stability experiment results (gpt-5.2)

**Total results**: 198

## Stability-under-probing results

**Sample sizes**: n_cot = 66 | n_farness = 66 | n_naive = 66

### Primary metrics

| Metric |Cot | Farness | Naive |
|--------|------- | ------- | ------- |
| Mean update magnitude | 29.35 | 22.03 | 59.03 |
| Mean relative update | 55% | 45% | 58% |
| Initial ci rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 96% | 1.00 | 98% |

### Pairwise comparisons

**cot vs farness**:
- Mann-Whitney U = 2634.5
- p (raw) = 0.04, p (Holm-Bonferroni) = 0.09
- Cohen's d = 0.16 (small), 95% CI: [-0.16, 0.55]
- Rank-biserial r = -0.21, 95% CI: [-0.41, -0.03]

**cot vs naive**:
- Mann-Whitney U = 2173.0
- p (raw) = 0.98, p (Holm-Bonferroni) = 0.98
- Cohen's d = -0.24 (small), 95% CI: [-0.45, 0.07]
- Rank-biserial r = 0.00, 95% CI: [-0.21, 0.20]

**farness vs naive**:
- Mann-Whitney U = 1704.0
- p (raw) = 0.03, p (Holm-Bonferroni) = 0.09
- Cohen's d = -0.30 (small), 95% CI: [-0.51, -0.02]
- Rank-biserial r = 0.22, 95% CI: [0.02, 0.40]

### Convergence analysis

- **Convergence ratio**: -5.14 (95% CI: [-7.57, -2.90])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.60
- **n valid pairs**: 47

*Significant divergence: naive responses moved away from farness initial estimates*