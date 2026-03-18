# Stability experiment results (claude-opus-4-6)

**Total results**: 384

## Stability-under-probing results

### On-Framework Probes

**Sample sizes**: n_naive = 48 | n_estimate_only = 48 | n_format_control = 48 | n_farness = 48

### Primary metrics

**Primary pooled comparison metric**: relative update

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean relative update | 68% | 62% | 52% | 56% |
| Mean update magnitude | 16.73 | 16.06 | 14.12 | 11.82 |
| Initial CI rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 | 1.00 |

### Pairwise comparisons (relative update)

**Naive vs Estimate Only**:
- Mann-Whitney U = 1188.0
- p (raw) = 0.79, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.18 (small), 95% CI: [-0.23, 0.54]
- Rank-biserial r = -0.03, 95% CI: [-0.26, 0.20]

**Naive vs Format Control**:
- Mann-Whitney U = 1414.5
- p (raw) = 0.05, p (Holm-Bonferroni) = 0.32
- Cohen's d = 0.56 (medium), 95% CI: [0.22, 0.87]
- Rank-biserial r = -0.23, 95% CI: [-0.45, -0.01]

**Naive vs Farness**:
- Mann-Whitney U = 1355.0
- p (raw) = 0.14, p (Holm-Bonferroni) = 0.55
- Cohen's d = 0.39 (small), 95% CI: [0.01, 0.74]
- Rank-biserial r = -0.18, 95% CI: [-0.41, 0.06]

**Estimate Only vs Format Control**:
- Mann-Whitney U = 1383.0
- p (raw) = 0.09, p (Holm-Bonferroni) = 0.45
- Cohen's d = 0.48 (small), 95% CI: [0.11, 0.85]
- Rank-biserial r = -0.20, 95% CI: [-0.43, 0.02]

**Estimate Only vs Farness**:
- Mann-Whitney U = 1320.5
- p (raw) = 0.22, p (Holm-Bonferroni) = 0.65
- Cohen's d = 0.25 (small), 95% CI: [-0.14, 0.66]
- Rank-biserial r = -0.15, 95% CI: [-0.39, 0.10]

**Format Control vs Farness**:
- Mann-Whitney U = 1086.5
- p (raw) = 0.63, p (Holm-Bonferroni) = 1.00
- Cohen's d = -0.23 (small), 95% CI: [-0.64, 0.18]
- Rank-biserial r = 0.06, 95% CI: [-0.19, 0.29]

### Mixed-effects model

Model: `relative_update ~ condition`

Random effect (case_id) variance: 0.05759130692679704
Groups: 8, Obs: 192

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 0.676 | 9% | <0.001 |
| condition[T.estimate_only] | -0.056 | 2% | 0.02 |
| condition[T.format_control] | -0.157 | 2% | <0.001 |
| condition[T.farness] | -0.112 | 2% | <0.001 |

### Convergence analysis

- **Convergence ratio**: -2.60 (95% CI: [-3.71, -1.55])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.77
- **n valid pairs**: 37

*Significant divergence: naive responses moved away from farness initial estimates*

### Off-Framework Probes

**Sample sizes**: n_naive = 48 | n_estimate_only = 48 | n_format_control = 48 | n_farness = 48

### Primary metrics

**Primary pooled comparison metric**: relative update

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean relative update | 70% | 83% | 60% | 83% |
| Mean update magnitude | 16.70 | 18.76 | 12.94 | 16.50 |
| Initial CI rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 92% | 1.00 | 81% | 96% |

### Pairwise comparisons (relative update)

**Naive vs Estimate Only**:
- Mann-Whitney U = 1088.0
- p (raw) = 0.64, p (Holm-Bonferroni) = 1.00
- Cohen's d = -0.27 (small), 95% CI: [-0.64, 0.14]
- Rank-biserial r = 0.06, 95% CI: [-0.18, 0.29]

**Naive vs Format Control**:
- Mann-Whitney U = 1250.0
- p (raw) = 0.47, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.26 (small), 95% CI: [-0.14, 0.66]
- Rank-biserial r = -0.09, 95% CI: [-0.30, 0.16]

**Naive vs Farness**:
- Mann-Whitney U = 1026.0
- p (raw) = 0.36, p (Holm-Bonferroni) = 1.00
- Cohen's d = -0.29 (small), 95% CI: [-0.68, 0.11]
- Rank-biserial r = 0.11, 95% CI: [-0.12, 0.33]

**Estimate Only vs Format Control**:
- Mann-Whitney U = 1305.5
- p (raw) = 0.26, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.49 (small), 95% CI: [0.13, 0.85]
- Rank-biserial r = -0.13, 95% CI: [-0.37, 0.10]

**Estimate Only vs Farness**:
- Mann-Whitney U = 1098.5
- p (raw) = 0.70, p (Holm-Bonferroni) = 1.00
- Cohen's d = -0.00 (small), 95% CI: [-0.44, 0.39]
- Rank-biserial r = 0.05, 95% CI: [-0.19, 0.28]

**Format Control vs Farness**:
- Mann-Whitney U = 924.5
- p (raw) = 0.10, p (Holm-Bonferroni) = 0.57
- Cohen's d = -0.54 (medium), 95% CI: [-0.90, -0.18]
- Rank-biserial r = 0.20, 95% CI: [-0.03, 0.42]

### Mixed-effects model

Model: `relative_update ~ condition`

Random effect (case_id) variance: 0.1619282576826335
Groups: 8, Obs: 192

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 0.696 | 15% | <0.001 |
| condition[T.estimate_only] | 0.137 | 6% | 0.02 |
| condition[T.format_control] | -0.092 | 6% | 0.11 |
| condition[T.farness] | 0.139 | 6% | 0.01 |

### Convergence analysis

- **Convergence ratio**: -3.91 (95% CI: [-5.28, -2.61])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.89
- **n valid pairs**: 42

*Significant divergence: naive responses moved away from farness initial estimates*