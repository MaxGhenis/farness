# Revision Checklist From Simulated Referee Reports

## Already implemented in this pass

- Narrowed the paper further toward a methods-paper / case-study framing.
- Tightened the title to signal method + case-study scope.
- Expanded the scenario table to include expected probe direction and analysis role.
- Added explicit prose that the current scenario battery is bounded rather than representative.
- Clarified why the mixed-effects model is primary and why the non-parametric tests are secondary.
- Added a short roadmap sentence explaining the inferential role of each figure.
- Added an explicit falsification paragraph for the main interpretation.

## Next paper edits worth doing

- Tighten the abstract one more turn if aiming specifically at *Judgment and Decision Making*.
- Shorten the worked example slightly and explicitly link it back to the protocol schematic.
- Consider demoting the “Initial CI rate” row in the main results table since it is non-informative by design.
- Make the exploratory status of the downward sycophancy scenario visually even clearer.

## Next experiments most likely to address the referee consensus

### 1. Off-framework probe battery

Add probes that are not explicitly named in farness, for example:

- opportunity cost;
- implementation fragility;
- incentive misalignment;
- tail-risk concentration;
- organizational constraints.

Goal:
Test whether the stability effect generalizes beyond the prompt dimensions that farness explicitly primes.

### 2. Outcome-linked benchmark

Run the method on resolved tasks, such as:

- historical project timelines;
- hiring outcomes with known later performance;
- resolved forecasting questions or prediction-market questions.

Goal:
Check whether smaller updates correlate with accuracy rather than mere rigidity.

### 3. Cleaner baseline design

Add at least one additional control:

- numeric-estimate-only control without framework language;
- formatting-only control that mirrors farness output structure but removes substantive guidance.

Goal:
Separate content effects from schema/format effects.

### 4. Scenario-level robustness

Add at least one of:

- leave-one-scenario-out re-estimation;
- cluster bootstrap by scenario;
- more scenarios with balanced upward/downward probe pressure.

Goal:
Show that the current effect is not driven by a few high-leverage scenario families.
