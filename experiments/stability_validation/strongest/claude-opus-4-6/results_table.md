# Stability Experiment Results

**Random seed**: 2111785411
**Runs per condition**: 6

## Stability-under-probing results

### On-Framework Probes

**Sample sizes**: n_naive = 48 | n_estimate_only = 48 | n_format_control = 48 | n_farness = 48

### Primary metrics

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean update magnitude | 16.73 | 16.06 | 14.12 | 11.82 |
| Mean relative update | 68% | 62% | 52% | 56% |
| Initial ci rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 | 1.00 |

### Pairwise comparisons

**Naive vs Estimate Only**:
- Mann-Whitney U = 1187.0
- p (raw) = 0.80, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.04 (small), 95% CI: [-0.38, 0.45]
- Rank-biserial r = -0.03, 95% CI: [-0.29, 0.21]

**Naive vs Format Control**:
- Mann-Whitney U = 1370.5
- p (raw) = 0.11, p (Holm-Bonferroni) = 0.66
- Cohen's d = 0.15 (small), 95% CI: [-0.28, 0.55]
- Rank-biserial r = -0.19, 95% CI: [-0.42, 0.04]

**Naive vs Farness**:
- Mann-Whitney U = 1354.0
- p (raw) = 0.14, p (Holm-Bonferroni) = 0.70
- Cohen's d = 0.33 (small), 95% CI: [-0.09, 0.70]
- Rank-biserial r = -0.18, 95% CI: [-0.42, 0.06]

**Estimate Only vs Format Control**:
- Mann-Whitney U = 1347.5
- p (raw) = 0.15, p (Holm-Bonferroni) = 0.70
- Cohen's d = 0.11 (small), 95% CI: [-0.34, 0.51]
- Rank-biserial r = -0.17, 95% CI: [-0.42, 0.06]

**Estimate Only vs Farness**:
- Mann-Whitney U = 1320.0
- p (raw) = 0.22, p (Holm-Bonferroni) = 0.70
- Cohen's d = 0.28 (small), 95% CI: [-0.14, 0.64]
- Rank-biserial r = -0.15, 95% CI: [-0.39, 0.08]

**Format Control vs Farness**:
- Mann-Whitney U = 1132.5
- p (raw) = 0.89, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.16 (small), 95% CI: [-0.26, 0.54]
- Rank-biserial r = 0.02, 95% CI: [-0.25, 0.26]

### Mixed-effects model

Random effect (case_id) variance: 275.0614855663513
Groups: 8, Obs: 192

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 16.729 | 5.89 | 0.004 |
| condition[T.estimate_only] | -0.667 | 77% | 0.38 |
| condition[T.format_control] | -2.604 | 77% | <0.001 |
| condition[T.farness] | -4.910 | 77% | <0.001 |

### Convergence analysis

- **Convergence ratio**: -2.60 (95% CI: [-3.71, -1.55])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.77
- **n valid pairs**: 37

*Significant divergence: naive responses moved away from farness initial estimates*

### Off-Framework Probes

**Sample sizes**: n_naive = 48 | n_estimate_only = 48 | n_format_control = 48 | n_farness = 48

### Primary metrics

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean update magnitude | 16.70 | 18.76 | 12.94 | 16.50 |
| Mean relative update | 70% | 83% | 60% | 83% |
| Initial ci rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 92% | 1.00 | 81% | 96% |

### Pairwise comparisons

**Naive vs Estimate Only**:
- Mann-Whitney U = 1046.0
- p (raw) = 0.44, p (Holm-Bonferroni) = 1.00
- Cohen's d = -0.16 (small), 95% CI: [-0.60, 0.24]
- Rank-biserial r = 0.09, 95% CI: [-0.15, 0.33]

**Naive vs Format Control**:
- Mann-Whitney U = 1324.0
- p (raw) = 0.21, p (Holm-Bonferroni) = 0.83
- Cohen's d = 0.35 (small), 95% CI: [-0.05, 0.74]
- Rank-biserial r = -0.15, 95% CI: [-0.38, 0.09]

**Naive vs Farness**:
- Mann-Whitney U = 1142.5
- p (raw) = 0.95, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.02 (small), 95% CI: [-0.42, 0.42]
- Rank-biserial r = 0.01, 95% CI: [-0.23, 0.24]

**Estimate Only vs Format Control**:
- Mann-Whitney U = 1466.5
- p (raw) = 0.02, p (Holm-Bonferroni) = 0.13
- Cohen's d = 0.52 (medium), 95% CI: [0.11, 0.96]
- Rank-biserial r = -0.27, 95% CI: [-0.50, -0.03]

**Estimate Only vs Farness**:
- Mann-Whitney U = 1275.5
- p (raw) = 0.37, p (Holm-Bonferroni) = 1.00
- Cohen's d = 0.18 (small), 95% CI: [-0.25, 0.60]
- Rank-biserial r = -0.11, 95% CI: [-0.34, 0.14]

**Format Control vs Farness**:
- Mann-Whitney U = 958.0
- p (raw) = 0.16, p (Holm-Bonferroni) = 0.78
- Cohen's d = -0.33 (small), 95% CI: [-0.75, 0.08]
- Rank-biserial r = 0.17, 95% CI: [-0.08, 0.40]

### Mixed-effects model

Random effect (case_id) variance: 117.66880021945629
Groups: 8, Obs: 192

| Term | Estimate | SE | p-value |
|------|----------|------|---------|
| Intercept | 16.698 | 3.93 | <0.001 |
| condition[T.estimate_only] | 2.067 | 1.24 | 0.10 |
| condition[T.format_control] | -3.754 | 1.24 | 0.002 |
| condition[T.farness] | -0.196 | 1.24 | 0.87 |

### Convergence analysis

- **Convergence ratio**: -3.91 (95% CI: [-5.28, -2.61])
- **p-value** (H0: ratio = 0): 1.00
- **Cohen's d**: -0.89
- **n valid pairs**: 42

*Significant divergence: naive responses moved away from farness initial estimates*