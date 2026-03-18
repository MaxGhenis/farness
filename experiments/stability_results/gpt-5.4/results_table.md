# Stability experiment results (gpt-5.4)

**Total results**: 198

## Stability-under-probing results

**Sample sizes**: n_naive = 66 | n_cot = 66 | n_farness = 66

### Primary metrics

**Primary pooled comparison metric**: relative update

| Metric |Naive | CoT | Farness |
|--------|------- | ------- | ------- |
| Mean relative update | 48% | 41% | 36% |
| Mean update magnitude | 30.97 | 27.57 | 13.78 |
| Initial CI rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 |

### Pairwise comparisons (relative update)

**Naive vs CoT**:
- Mann-Whitney U = 2192.0
- p (raw) = 0.95, p (Holm-Bonferroni) = 0.95
- Cohen's d = 0.21 (small), 95% CI: [-0.14, 0.51]
- Rank-biserial r = -0.01, 95% CI: [-0.21, 0.18]

**Naive vs Farness**:
- Mann-Whitney U = 2505.5
- p (raw) = 0.14, p (Holm-Bonferroni) = 0.41
- Cohen's d = 0.36 (small), 95% CI: [0.04, 0.66]
- Rank-biserial r = -0.15, 95% CI: [-0.35, 0.03]

**CoT vs Farness**:
- Mann-Whitney U = 2493.0
- p (raw) = 0.15, p (Holm-Bonferroni) = 0.41
- Cohen's d = 0.22 (small), 95% CI: [-0.12, 0.57]
- Rank-biserial r = -0.14, 95% CI: [-0.34, 0.05]

### Mixed-effects model

Model: `relative_update ~ condition`

Random effect (case_id) variance: 0.08730099221770166
Groups: 11, Obs: 198

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 0.484 | 9% | <0.001 |
| condition[T.cot] | -0.074 | 3% | 0.006 |
| condition[T.farness] | -0.128 | 3% | <0.001 |

### Convergence analysis

- **Convergence ratio**: -1.07 (95% CI: [-1.65, -0.54])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.51
- **n valid pairs**: 55

*Significant divergence: naive responses moved away from farness initial estimates*