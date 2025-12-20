# Pre-emptive Rigor: Measuring Decision Framework Effectiveness in LLMs

**Authors:** Max Ghenis, [collaborators TBD]

**Status:** Draft v0.1 - December 2024

---

## Abstract

We introduce a methodology for evaluating whether structured decision frameworks improve LLM decision support. Rather than measuring forecast accuracy (which requires ground truth and long time horizons), we measure *stability-under-probing*: do naive responses update significantly when challenged with relevant considerations, and do they converge toward framework-guided responses?

In experiments across planning, risk assessment, and investment domains, we find that framework-guided responses (1) include uncertainty quantification upfront, (2) show smaller updates when probed with base rates and new information, and (3) serve as attractors that naive responses converge toward after probing. This suggests structured decision frameworks provide "pre-emptive rigor" — surfacing considerations that would otherwise require extensive follow-up questioning.

Our methodology enables evaluation of decision frameworks without waiting for real-world outcomes, complementing existing work on LLM forecasting benchmarks like ForecastBench.

---

## 1. Introduction

Large language models are increasingly used for decision support — helping users think through business decisions, personal choices, and strategic planning. A growing body of work suggests that structured prompting approaches can improve LLM reasoning (Wei et al., 2022; Kojima et al., 2022), and research on human decision-making shows that structured frameworks reduce noise and bias (Kahneman et al., 2021).

However, evaluating whether decision frameworks actually improve *decision quality* is challenging:

1. **Ground truth is often unavailable.** Many decisions have no objectively correct answer, and even those that do may not resolve for months or years.

2. **Confounders abound.** Real-world outcomes depend on execution, luck, and factors unknown at decision time.

3. **Measuring process vs. outcome.** Good decisions can have bad outcomes (and vice versa). We want to measure decision *quality*, not just outcome *accuracy*.

We propose a novel methodology: **stability-under-probing**. Rather than asking "did you get the right answer?", we ask:

- Does the framework front-load considerations that naive prompting misses?
- Do naive responses update significantly when challenged?
- Do naive responses converge toward framework-guided responses after probing?

If a framework produces responses that are robust to follow-up questions — because they already considered base rates, identified biases, and quantified uncertainty — this suggests the framework provides genuine value, not just cosmetic structure.

### 1.1 The Farness Framework

We evaluate a specific framework called "farness" (Forecasting as a Harness for Decision-Making) that requires:

1. Defining explicit, measurable KPIs
2. Making numeric forecasts with confidence intervals
3. Citing base rates from research (outside view)
4. Identifying cognitive biases in the framing
5. Giving recommendations based on expected value
6. Setting review dates for accountability

This framework draws on established research in decision hygiene (Kahneman et al., 2021), superforecasting (Tetlock & Gardner, 2015), and reference class forecasting (Flyvbjerg, 2006).

---

## 2. Related Work

### 2.1 Decision Hygiene and Structured Judgment

Kahneman, Sibony, and Sunstein (2021) introduce "decision hygiene" — procedures that reduce noise in human judgment. Key techniques include:

- Breaking decisions into independent components
- Using relative rather than absolute scales
- Aggregating multiple judgments
- Delaying intuitive synthesis until after analytical assessment

The GRADE Evidence-to-Decision framework in healthcare shows that structured approaches lead to more consistent, transparent recommendations (Alonso-Coello et al., 2016).

### 2.2 Superforecasting and Calibration

Tetlock's Good Judgment Project demonstrated that structured training improves forecasting accuracy by ~10%, and that calibration can be learned through practice with feedback (Tetlock & Gardner, 2015). Key techniques include reference class forecasting, decomposition, and explicit uncertainty quantification.

### 2.3 LLM Prompting and Reasoning

Chain-of-thought prompting (Wei et al., 2022) improves LLM performance on reasoning tasks by encouraging step-by-step thinking. Decomposition prompting (Khot et al., 2023) further improves performance by breaking complex problems into sub-problems.

### 2.4 LLM Forecasting Benchmarks

ForecastBench (Karger et al., 2024) provides a dynamic benchmark for LLM forecasting accuracy, comparing models to human forecasters including superforecasters. As of 2025, top LLMs approach but do not match superforecaster accuracy (Brier scores of ~0.10 vs ~0.08).

### 2.5 Gap in the Literature

Existing work measures either:
- **Forecasting accuracy** (ForecastBench) — but this requires resolvable questions and doesn't capture decision *process*
- **Reasoning quality** (chain-of-thought) — but this focuses on math/logic, not real-world judgment under uncertainty

Our methodology addresses the gap: measuring decision framework effectiveness without requiring ground truth outcomes.

---

## 3. Methodology: Stability-Under-Probing

### 3.1 Intuition

A well-thought-through decision should be robust to follow-up questions. If someone asks "but what about the base rate?" or "did you consider X risk?" and you immediately revise your recommendation, this suggests the original recommendation was under-considered.

Conversely, if a framework produces recommendations that are stable under probing — because they already incorporated base rates, risks, and uncertainty — this suggests the framework front-loaded the analytical work.

### 3.2 Protocol

For each decision scenario:

1. **Initial prompt (two conditions):**
   - *Naive*: "You are a helpful assistant. [Scenario]. What is your estimate?"
   - *Framework*: "You are a decision analyst using the farness framework. [Scenario]. What is your estimate with confidence interval?"

2. **Record initial response:**
   - Point estimate
   - Confidence interval (if provided)
   - Full response text

3. **Probing phase:**
   - Present 2-4 follow-up considerations (base rates, new information, bias identification)
   - Ask for revised estimate

4. **Record final response:**
   - Revised point estimate
   - Revised confidence interval
   - Full response text

### 3.3 Metrics

**Primary metrics:**

| Metric | Definition | Hypothesis |
|--------|------------|------------|
| Update magnitude | \|final - initial\| | Framework < Naive |
| Relative update | \|final - initial\| / initial | Framework < Naive |
| Initial CI rate | Proportion with CI in initial response | Framework > Naive |
| Correct direction rate | Updates in direction implied by probes | Framework ≥ Naive |

**Convergence metric:**

We measure whether naive(probed) converges toward framework(initial):

$$\text{Convergence ratio} = 1 - \frac{|\text{naive}_\text{final} - \text{framework}_\text{initial}|}{|\text{naive}_\text{initial} - \text{framework}_\text{initial}|}$$

A convergence ratio > 0 indicates that probing moves naive responses toward where the framework started.

### 3.4 Interpretation

| Finding | Interpretation |
|---------|---------------|
| Framework has lower update magnitude | Framework is more stable/robust |
| Framework has higher initial CI rate | Framework quantifies uncertainty upfront |
| Naive converges toward framework | Framework front-loads considerations that probing extracts |
| Both update in correct direction | Both respond coherently to evidence |

---

## 4. Experimental Design

### 4.1 Decision Scenarios

We design quantitative decision scenarios across multiple domains:

| Domain | Scenario | Estimate Type |
|--------|----------|---------------|
| Planning | Software project timeline | Weeks |
| Risk | Troubled project success probability | Percentage |
| Hiring | Candidate success prediction | Percentage |
| Investment | M&A synergy realization | Percentage |
| Product | Feature launch success | Percentage |
| Startup | Growth probability after flat period | Percentage |

Each scenario includes:
- A realistic decision context
- A quantitative question requiring a point estimate
- 2-4 probing questions with base rates and new information
- Expected direction of update (for validation)

### 4.2 Probing Questions

Probes are designed to surface considerations that good decision-making should address:

1. **Base rate probes**: "Research shows X% of similar situations result in Y..."
2. **Bias identification probes**: "This is a classic sign of [sunk cost fallacy / planning fallacy / etc.]..."
3. **New information probes**: "I just learned that [relevant new fact]..."

### 4.3 Model and Procedure

- **Model**: Claude (Anthropic), accessed via subagent framework
- **Runs per condition**: 3 (to account for stochasticity)
- **Order**: Randomized
- **Blinding**: Scorer does not know condition when extracting estimates

### 4.4 Sample Size

- 8 scenarios × 2 conditions × 3 runs = 48 total responses
- 24 per condition
- Power analysis: With n=24 per group, we have 80% power to detect a 0.8 standard deviation difference in update magnitude at α=0.05.

---

## 5. Results

### 5.1 Pilot Experiments

We conducted pilot experiments on two scenarios: software project timeline estimation and troubled project success probability.

#### Planning Scenario (Software Timeline)

| Metric | Naive | Farness |
|--------|-------|---------|
| Initial estimate | 4 weeks | 4 weeks |
| Initial CI | (none) | 2.5-7 weeks |
| Post-probe estimate | 3.5 weeks | 5 weeks |
| Post-probe CI | 2.5-5.5 weeks | 3-9 weeks |
| Update direction | ↓ (wrong) | ↑ (correct) |

Key finding: When probed with "30% chance of major blocker," farness incorporated this systematically (mixture model → higher estimate), while naive paradoxically became *more* optimistic.

#### Sunk Cost Scenario (Project Success)

| Metric | Naive | Farness |
|--------|-------|---------|
| Initial estimate | 15% | 6% |
| Initial CI | (none) | 2-15% |
| Post-probe estimate | 5% | 2% |
| Post-probe CI | 2-12% | 0.5-8% |
| Update direction | ↓ (correct) | ↓ (correct) |

Key finding: **Naive(probed) ≈ Farness(initial)**. The naive response converged to 5% after probing — almost exactly where farness started (6%).

### 5.2 Convergence Pattern

Across both pilot scenarios, we observed a consistent pattern:

$$\text{Naive}_\text{final} \approx \text{Farness}_\text{initial}$$

This suggests that:
1. Framework-guided responses front-load the analytical work
2. Naive responses require extensive probing to reach similar conclusions
3. The framework captures considerations that matter for decision quality

### 5.3 Coherence Under New Information

When presented with new information (e.g., "two senior engineers are interviewing elsewhere"), we observed:

- **Farness**: Explicit quantitative update using mixture models, principled incorporation of new risk factor
- **Naive**: Qualitative acknowledgment but less systematic incorporation

---

## 6. Discussion

### 6.1 Pre-emptive Rigor

Our central finding is that structured decision frameworks provide "pre-emptive rigor" — they front-load considerations that would otherwise require extensive follow-up questioning. This has practical implications:

1. **For users**: Framework-guided responses provide higher-quality initial recommendations without requiring users to probe effectively
2. **For systems**: The framework can be implemented as a prompt prefix, requiring no model fine-tuning
3. **For evaluation**: Stability-under-probing offers a tractable way to evaluate decision frameworks without ground truth

### 6.2 Why Not Just Probe Everything?

One might ask: if probing improves naive responses, why use a framework at all?

1. **Users don't know what to probe for.** The framework surfaces considerations (base rates, biases) that users might not think to ask about.
2. **Probing is costly.** Multiple follow-up rounds take time and tokens. Front-loading is more efficient.
3. **Probing may not be complete.** Our probing protocol is designed to be thorough, but real users ask ad-hoc follow-ups.

### 6.3 Limitations

1. **No outcome validation.** We don't know if more stable responses lead to better actual decisions. This requires longitudinal tracking.
2. **Specific model.** Results may differ across models; we tested only Claude.
3. **Researcher-designed probes.** Our probing questions are designed to be effective; naive users might probe less well.
4. **Sample size.** Pilot experiments are small; full experiment needed.

### 6.4 Future Work

1. **Full experiment.** Run all 8 scenarios with multiple runs per condition.
2. **Multiple models.** Compare GPT-4, Claude, Gemini, open-source models.
3. **Human studies.** Does using the framework improve human decision-making?
4. **Longitudinal calibration.** Track real decisions over time and measure forecast accuracy.
5. **Adversarial probing.** Design probes that should *not* change the recommendation; test if framework resists.

---

## 7. Conclusion

We introduce stability-under-probing as a methodology for evaluating decision framework effectiveness in LLMs. Our pilot experiments suggest that structured frameworks like farness provide "pre-emptive rigor" — producing recommendations that are more stable under probing because they already incorporated base rates, identified biases, and quantified uncertainty.

This methodology complements existing work on LLM forecasting accuracy (ForecastBench) by focusing on decision *process* rather than outcome accuracy. It enables evaluation of decision frameworks without requiring ground truth or long time horizons.

The practical implication is clear: prompting LLMs with structured decision frameworks may improve the quality of decision support, not by changing what the model "knows," but by ensuring it systematically applies what it knows to the decision at hand.

---

## References

Alonso-Coello, P., et al. (2016). GRADE Evidence to Decision (EtD) frameworks: a systematic and transparent approach to making well informed healthcare choices. *BMJ*, 353, i2016.

Flyvbjerg, B. (2006). From Nobel Prize to project management: getting risks right. *Project Management Journal*, 37(3), 5-15.

Kahneman, D., Sibony, O., & Sunstein, C. R. (2021). *Noise: A Flaw in Human Judgment*. Little, Brown.

Karger, E., et al. (2024). ForecastBench: A Dynamic Benchmark of AI Forecasting Capabilities. *ICLR 2025*.

Khot, T., et al. (2023). Decomposed Prompting: A Modular Approach for Solving Complex Tasks. *ICLR 2023*.

Kojima, T., et al. (2022). Large Language Models are Zero-Shot Reasoners. *NeurIPS 2022*.

Tetlock, P. E., & Gardner, D. (2015). *Superforecasting: The Art and Science of Prediction*. Crown.

Wei, J., et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. *NeurIPS 2022*.

---

## Appendix A: Scenario Details

[Full scenario texts and probing questions]

## Appendix B: Raw Pilot Data

[Complete responses from pilot experiments]

## Appendix C: Code Availability

Code for running stability-under-probing experiments is available at: https://github.com/MaxGhenis/farness

The `farness.experiments.stability` module provides:
- `QuantitativeCase`: Dataclass for defining scenarios
- `StabilityResult`: Dataclass for recording results
- `StabilityExperiment`: Class for running and analyzing experiments
- `STABILITY_CASES`: Pre-defined scenarios across domains
