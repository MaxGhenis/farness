# Stability experiment results (gpt-5.4)

**Total results**: 198

## Stability-under-probing results

**Sample sizes**: n_naive = 66 | n_cot = 66 | n_farness = 66

### Primary metrics

| Metric |Naive | CoT | Farness |
|--------|------- | ------- | ------- |
| Mean update magnitude | 30.97 | 27.57 | 13.78 |
| Mean relative update | 48% | 41% | 36% |
| Initial ci rate | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 |

### Pairwise comparisons

**Naive vs CoT**:
- Mann-Whitney U = 2114.5
- p (raw) = 0.77, p (Holm-Bonferroni) = 0.77
- Cohen's d = 0.05 (small), 95% CI: [-0.29, 0.38]
- Rank-biserial r = 0.03, 95% CI: [-0.17, 0.22]

**Naive vs Farness**:
- Mann-Whitney U = 2601.0
- p (raw) = 0.05, p (Holm-Bonferroni) = 0.11
- Cohen's d = 0.33 (small), 95% CI: [0.08, 0.52]
- Rank-biserial r = -0.19, 95% CI: [-0.39, -0.00]

**CoT vs Farness**:
- Mann-Whitney U = 2663.0
- p (raw) = 0.03, p (Holm-Bonferroni) = 0.08
- Cohen's d = 0.32 (small), 95% CI: [0.04, 0.53]
- Rank-biserial r = -0.22, 95% CI: [-0.43, -0.04]

### Mixed-effects model

Random effect (case_id) variance: 1318.6759895847301
Groups: 11, Obs: 198

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 30.974 | 12.06 | 0.01 |
| condition[T.cot] | -3.402 | 7.16 | 0.63 |
| condition[T.farness] | -17.195 | 7.16 | 0.02 |

### Convergence analysis

- **Convergence ratio**: -1.07 (95% CI: [-1.65, -0.54])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.51
- **n valid pairs**: 55

*Significant divergence: naive responses moved away from farness initial estimates*