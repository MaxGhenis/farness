# Stability experiment results (claude-opus-4-6)

**Total results**: 191

## Stability-under-probing results

**Sample sizes**: n_naive = 63 | n_cot = 66 | n_farness = 62

### Primary metrics

**Primary pooled comparison metric**: relative update

| Metric |Naive | CoT | Farness |
|--------|------- | ------- | ------- |
| Mean relative update | 51% | 49% | 43% |
| Mean update magnitude | 13.80 | 13.37 | 9.02 |
| Initial CI rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 98% |

### Pairwise comparisons (relative update)

**Naive vs CoT**:
- Mann-Whitney U = 2117.0
- p (raw) = 0.86, p (Holm-Bonferroni) = 0.86
- Cohen's d = 0.06 (small), 95% CI: [-0.31, 0.40]
- Rank-biserial r = -0.02, 95% CI: [-0.22, 0.18]

**Naive vs Farness**:
- Mann-Whitney U = 2192.5
- p (raw) = 0.24, p (Holm-Bonferroni) = 0.71
- Cohen's d = 0.24 (small), 95% CI: [-0.13, 0.58]
- Rank-biserial r = -0.12, 95% CI: [-0.32, 0.10]

**CoT vs Farness**:
- Mann-Whitney U = 2226.5
- p (raw) = 0.39, p (Holm-Bonferroni) = 0.78
- Cohen's d = 0.20 (small), 95% CI: [-0.14, 0.55]
- Rank-biserial r = -0.09, 95% CI: [-0.29, 0.11]

### Mixed-effects model

Model: `relative_update ~ condition`

Random effect (case_id) variance: 0.11491057800210147
Groups: 11, Obs: 191

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 0.515 | 10% | <0.001 |
| condition[T.cot] | -0.024 | 2% | 0.13 |
| condition[T.farness] | -0.080 | 2% | <0.001 |

### Convergence analysis

- **Convergence ratio**: -1.48 (95% CI: [-2.08, -0.94])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.72
- **n valid pairs**: 53

*Significant divergence: naive responses moved away from farness initial estimates*