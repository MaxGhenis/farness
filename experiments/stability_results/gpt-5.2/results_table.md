# Stability experiment results (gpt-5.2)

**Total results**: 198

## Stability-under-probing results

**Sample sizes**: n_naive = 66 | n_cot = 66 | n_farness = 66

### Primary metrics

| Metric |Naive | CoT | Farness |
|--------|------- | ------- | ------- |
| Mean update magnitude | 59.03 | 29.35 | 22.03 |
| Mean relative update | 58% | 55% | 45% |
| Initial ci rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 98% | 96% | 1.00 |

### Pairwise comparisons

**Naive vs CoT**:
- Mann-Whitney U = 2183.0
- p (raw) = 0.98, p (Holm-Bonferroni) = 0.98
- Cohen's d = 0.24 (small), 95% CI: [-0.10, 0.46]
- Rank-biserial r = -0.00, 95% CI: [-0.22, 0.18]

**Naive vs Farness**:
- Mann-Whitney U = 2652.0
- p (raw) = 0.03, p (Holm-Bonferroni) = 0.09
- Cohen's d = 0.30 (small), 95% CI: [0.01, 0.51]
- Rank-biserial r = -0.22, 95% CI: [-0.42, -0.03]

**CoT vs Farness**:
- Mann-Whitney U = 2634.5
- p (raw) = 0.04, p (Holm-Bonferroni) = 0.09
- Cohen's d = 0.16 (small), 95% CI: [-0.16, 0.55]
- Rank-biserial r = -0.21, 95% CI: [-0.41, -0.03]

### Mixed-effects model

Random effect (case_id) variance: 4194.546774117567
Groups: 11, Obs: 198

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 59.029 | 21.95 | 0.007 |
| condition[T.cot] | -29.680 | 14.19 | 0.04 |
| condition[T.farness] | -37.002 | 14.19 | 0.009 |

### Convergence analysis

- **Convergence ratio**: -5.14 (95% CI: [-7.57, -2.90])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.60
- **n valid pairs**: 47

*Significant divergence: naive responses moved away from farness initial estimates*