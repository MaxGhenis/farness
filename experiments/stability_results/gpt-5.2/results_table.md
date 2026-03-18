# Stability experiment results (gpt-5.2)

**Total results**: 198

## Stability-under-probing results

**Sample sizes**: n_naive = 66 | n_cot = 66 | n_farness = 66

### Primary metrics

**Primary pooled comparison metric**: relative update

| Metric |Naive | CoT | Farness |
|--------|------- | ------- | ------- |
| Mean relative update | 58% | 55% | 45% |
| Mean update magnitude | 59.03 | 29.35 | 22.03 |
| Initial CI rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 98% | 96% | 1.00 |

### Pairwise comparisons (relative update)

**Naive vs CoT**:
- Mann-Whitney U = 2142.0
- p (raw) = 0.87, p (Holm-Bonferroni) = 0.87
- Cohen's d = 0.05 (small), 95% CI: [-0.31, 0.39]
- Rank-biserial r = 0.02, 95% CI: [-0.19, 0.22]

**Naive vs Farness**:
- Mann-Whitney U = 2523.5
- p (raw) = 0.12, p (Holm-Bonferroni) = 0.35
- Cohen's d = 0.32 (small), 95% CI: [-0.01, 0.63]
- Rank-biserial r = -0.16, 95% CI: [-0.36, 0.04]

**CoT vs Farness**:
- Mann-Whitney U = 2503.5
- p (raw) = 0.14, p (Holm-Bonferroni) = 0.35
- Cohen's d = 0.27 (small), 95% CI: [-0.07, 0.59]
- Rank-biserial r = -0.15, 95% CI: [-0.36, 0.05]

### Mixed-effects model

Model: `relative_update ~ condition`

Random effect (case_id) variance: 0.13514413539818687
Groups: 11, Obs: 198

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 0.576 | 11% | <0.001 |
| condition[T.cot] | -0.024 | 4% | 0.55 |
| condition[T.farness] | -0.130 | 4% | 0.001 |

### Convergence analysis

- **Convergence ratio**: -5.14 (95% CI: [-7.57, -2.90])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.60
- **n valid pairs**: 47

*Significant divergence: naive responses moved away from farness initial estimates*