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
- Cohen's d = 0.33 (small), 95% CI: [-0.01, 0.66]
- Rank-biserial r = -0.15, 95% CI: [-0.34, 0.05]

**cot vs naive**:
- Mann-Whitney U = 2037.5
- p (raw) = 0.85, p (Holm-Bonferroni) = 0.85
- Cohen's d = -0.03 (small), 95% CI: [-0.36, 0.31]
- Rank-biserial r = 0.02, 95% CI: [-0.18, 0.21]

**farness vs naive**:
- Mann-Whitney U = 1576.5
- p (raw) = 0.06, p (Holm-Bonferroni) = 0.19
- Cohen's d = -0.35 (small), 95% CI: [-0.67, 0.01]
- Rank-biserial r = 0.19, 95% CI: [-0.01, 0.39]

### Mixed-effects model

Random effect (case_id) variance: 202.21639006969335
Groups: 11, Obs: 191

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 13.927 | 4.31 | 0.001 |
| condition[T.cot] | -0.556 | 59% | 0.34 |
| condition[T.farness] | -4.169 | 60% | <0.001 |

### Convergence analysis

- **Convergence ratio**: -1.25 (95% CI: [-1.49, -1.01])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.58
- **n valid pairs**: 293

*Significant divergence: naive responses moved away from farness initial estimates*