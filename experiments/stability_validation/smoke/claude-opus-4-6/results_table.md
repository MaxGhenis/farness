# Stability Experiment Results

**Random seed**: 2110963931
**Runs per condition**: 1

## Stability-under-probing results

### On-Framework Probes

**Sample sizes**: n_naive = 1 | n_estimate_only = 1 | n_format_control = 1 | n_farness = 1

### Primary metrics

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean update magnitude | 7.00 | 10.00 | 5.00 | 3.00 |
| Mean relative update | 28% | 33% | 20% | 20% |
| Initial ci rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 | 1.00 |
### Convergence analysis

- **Convergence ratio**: 0.70 (95% CI: [0.70, 0.70])
- **n valid pairs**: 1

*Significant convergence: naive responses moved toward farness initial estimates (CI excludes 0)*

### Off-Framework Probes

**Sample sizes**: n_naive = 1 | n_estimate_only = 1 | n_format_control = 1 | n_farness = 1

### Primary metrics

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean update magnitude | 18.00 | 25.00 | 17.00 | 18.00 |
| Mean relative update | 60% | 83% | 68% | 90% |
| Initial ci rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 | 1.00 |
### Convergence analysis

- **Convergence ratio**: -1.80 (95% CI: [-1.80, -1.80])
- **n valid pairs**: 1

*Significant divergence: naive responses moved away from farness initial estimates*