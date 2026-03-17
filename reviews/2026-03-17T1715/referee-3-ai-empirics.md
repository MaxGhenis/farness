# Referee Report 3

## Recommendation

`Major revision`

## Summary for Editor

This paper has a clear and potentially useful methodological contribution: the author proposes `stability-under-probing` as a way to evaluate decision prompts without needing ground-truth outcomes, and uses `farness` as a case study. The paper is also better framed than a typical product-style manuscript; it now reads more like a methods paper with a concrete empirical demonstration. That said, the current evidence is not yet strong enough for the central empirical claims because the framework prompt and the probes are closely aligned, the design is small and highly structured, and the results depend on a narrow set of scenarios and models.

My overall view is that this is promising but not yet decisive. The paper would be substantially stronger if it either demonstrated out-of-framework generalization or narrowed its claims to the methodological contribution alone.

## Major Concerns

1. `Construct validity / prompt-probe alignment`

   The main threat to the paper is that the `farness` prompt explicitly instructs models to consider the same ingredients that the probes later test. The author acknowledges this directly in the introduction and discussion (`"prompt-probe alignment"` at lines 13, 23, 280, 302), but the problem is still central rather than incidental. If the framework is primed on base rates, bias identification, and uncertainty quantification, then lower update magnitudes may reflect matched prompting rather than any general property of the framework. In other words, the current design can show that the framework is better aligned with the probe battery, but it cannot yet show that the framework produces more robust judgment in a broader sense.

   I would want at least one follow-up experiment with probes that are deliberately *not* named in the framework prompt, or with a held-out probe battery that is only revealed after prompt design is frozen.

2. `Baseline choice and interpretability`

   The paper compares three conditions: naive, CoT, and farness. That is reasonable as an initial comparison, but the interpretive burden is heavy because `CoT` may already invoke implicit reasoning, and the paper itself notes this possibility (`lines 278-288`). This makes the `naive` versus `CoT` distinction less theoretically clean than it appears, especially because all three conditions also request structured JSON output for extraction (`line 157`). The result is that the baselines are not cleanly separable along a single dimension.

   More broadly, the paper sometimes treats `CoT` as a generic reasoning control, but the control is only partial. A stronger design would include a pure-formatting control, a prompt that asks for numeric estimates without any framework language, and perhaps an additional condition that mirrors the farness output schema while removing the substantive content.

3. `Small and highly structured sample`

   The paper is candid that the effective between-scenario sample size is closer to 11 than to the nominal 66 per cell (`line 165`). That is the right caveat, but it also means the main claims rest on a fairly small number of scenario families. The mixed-effects model helps, but it does not fully solve the problem because the scenarios are not a random sample from a large population of decision problems; they are author-selected and narrowly quantitative. The empirical claim is therefore stronger than the design supports if it is read as general evidence about decision frameworks.

   I would encourage the author to either add substantially more scenarios or explicitly recast the evidence as a demonstration on a bounded class of quantitative decisions, not as a broad statement about decision support generally.

4. `Outcome validity remains unresolved`

   The manuscript is appropriately careful in saying that smaller updates are not necessarily better decisions (`lines 19, 300, 314-318`). Even so, the abstract and conclusion still risk being read as evidence that the framework is meaningfully better at decision support. Without outcome-linked validation, the paper can only claim that the framework changes how the model behaves under challenge, not that it improves the quality of the decision. That distinction should be sharper throughout.

   In JDM terms, the paper currently validates a process measure, not a decision-quality measure. That is a legitimate contribution, but it should be framed as such throughout the abstract, introduction, and conclusion.

5. `Scenario and probe imbalance`

   The scenario battery is not balanced. The paper notes that 7 of 8 non-adversarial scenarios push downward and only 1 pushes upward (`line 300`), and the adversarial set includes a post hoc downward-sycophancy scenario that is excluded from the primary analysis (`lines 141, 143, 188, 231, 237`). This creates a risk that the paper is over-weighting a particular direction of adjustment and that the headline effect partly reflects the chosen probe distribution.

   I would want a probe battery with balanced directional pressure and a cleaner separation between pre-planned primary analyses and post hoc exploratory scenarios.

6. `Robustness claims are stronger than the evidence`

   The paper says the effect is reproducible across two frontier models (`lines 11-13, 314-318`), but both models are evaluated under the same author-designed prompts and the same scenario battery. That is useful replication, but it is not yet enough to support broad claims about prompt-structure robustness. The observed mixed-effects estimates and Mann-Whitney tests are interesting, but they still sit inside a highly constrained design. I would be careful not to let the quantitative significance of the coefficients outrun the inferential scope of the design.

## Minor Comments

1. The title still overstates the empirical scope slightly. `“Evaluating decision frameworks in LLMs”` reads like a general statement, whereas the paper is really a case study of one framework plus one methodology. A more bounded title would better match the evidence.

2. The abstract is much better than the original version, but it still mixes methodological and substantive claims. The first sentence should lead with the method, and the framework result should be clearly labeled as a case study.

3. The protocol figure is useful and should be retained. It helps readers see the design before they reach the results.

4. The discussion of the mixed-effects model is sensible, but the paper should say more explicitly why the mixed-effects model is primary relative to the non-parametric tests, beyond the general point about clustering.

5. The paper could be clearer about which analyses were pre-specified, which were post hoc, and which are exploratory. The distinction matters because several of the most interesting findings are also the most vulnerable to researcher degrees of freedom.

6. The paper would benefit from a compact table that lists all scenario families, probe direction, and whether each scenario is in-sample, adversarial, or post hoc. Right now the reader has to reconstruct that structure from several places.

7. The worked example is helpful, but the paper should be careful not to treat it as independent evidence once the aggregate result table has already been presented.

## Decision-Contingent Revision Request

If invited to revise, I would ask for one of two things:

1. A stronger validation experiment that directly addresses prompt-probe alignment, ideally with off-framework probes and held-out scenarios.
2. A tighter reframing that presents the paper primarily as a methodological demonstration, with `farness` as a case study rather than the main theoretical claim.

If the author can provide the first, the empirical claims become much more compelling. If not, the paper should still be publishable as a methods-oriented demonstration, but the substantive claims about the framework itself need to be narrowed.
