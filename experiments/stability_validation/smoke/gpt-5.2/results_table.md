# Stability Experiment Results

**Random seed**: 2111195631
**Runs per condition**: 1

## Stability-under-probing results

### On-Framework Probes

**Sample sizes**: n_naive = 1 | n_estimate_only = 1 | n_format_control = 1 | n_farness = 1

### Primary metrics

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean update magnitude | 27.00 | 22.00 | 23.00 | 9.00 |
| Mean relative update | 60% | 46% | 51% | 33% |
| Initial ci rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 | 1.00 |
### Convergence analysis

- **Convergence ratio**: 0.50 (95% CI: [0.50, 0.50])
- **n valid pairs**: 1

*Significant convergence: naive responses moved toward farness initial estimates (CI excludes 0)*

### Off-Framework Probes

**Sample sizes**: n_naive = 1 | n_estimate_only = 1 | n_format_control = 1 | n_farness = 1

### Primary metrics

| Metric |Naive | Estimate Only | Format Control | Farness |
|--------|------- | ------- | ------- | ------- |
| Mean update magnitude | 25.00 | 19.00 | 20.00 | 17.00 |
| Mean relative update | 56% | 40% | 44% | 61% |
| Initial ci rate | 1.00 | 1.00 | 1.00 | 1.00 |
| Correct direction rate | 1.00 | 1.00 | 1.00 | 1.00 |
### Convergence analysis

- **Convergence ratio**: -1.47 (95% CI: [-1.47, -1.47])
- **n valid pairs**: 1

*Significant divergence: naive responses moved away from farness initial estimates*