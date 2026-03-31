# Farness paper revisions — March 15, 2026

## Priority 1: Narrative fixes

- [x] **Reframe convergence finding**: "farness starts closer to where both end up after probing" — not divergence, not overshoot. Both conditions converge on similar final values; farness just starts closer. Change throughout abstract, Section 5.5, Section 6.3, Section 7.
- [x] **Introduce farness properly**: "I introduce farness, a structured decision framework" not "I evaluate a framework called farness." This paper IS the introduction. Add footnote linking to GitHub/site.
- [x] **Drop "pre-registered" claims**: Replace with "analysis code was committed prior to data collection (December 2025; experiments ran February 2026)." No formal pre-registration exists — just git history (commits 50e93d4, bfd1aae predate experiment runs).

## Priority 2: Graphs (desperately needed)

- [ ] **Update magnitude box/violin plots**: by condition, for each model
- [ ] **Per-scenario forest plot**: effect sizes with CIs for each scenario
- [ ] **Convergence visualization**: show initial→final for naive vs farness on 2-3 scenarios, illustrating "farness starts closer to where both end up"
- [ ] **Sycophancy bar chart**: Claude vs GPT-5.2 update magnitude on sycophancy scenario — the most dramatic finding

## Priority 3: Content additions

- [ ] **Concrete example**: Pick one scenario (e.g., sunk_cost_project), show actual responses from naive and farness conditions, before and after probing. Raw text excerpts.
- [ ] **Sycophancy deep-dive**: GPT-5.2 naive updates by 466.7 leads on average under sycophantic pressure (1000→1300-1400). Claude: zero update. Farness on GPT: 108.3. This is the clearest finding in the paper and currently buried.
- [ ] **Run symmetric sycophancy test**: Current test only pushes "higher." Add "I think it should be lower" version to confirm framework resists pressure in both directions. ~12 API calls, ~$5.

## Priority 4: Technical fixes

- [ ] **Scale heterogeneity note**: GPT mixed-effects coefficient (-37.0) is inflated by leads-scale sycophancy scenario. The 9x difference vs Claude (-4.17) is partly a units artifact. Clarify.
- [ ] **CI rate metric → appendix**: 100% everywhere (prompt design artifact), uninformative. Move from primary metrics to appendix.
- [ ] **Consolidate "transient API errors"**: Mentioned in Section 4.4, 4.6, 5.1, and 6.5. Reduce to one mention in Section 4.4.
- [x] **Fix "overshoot"/"diverge" language**: Replace throughout with the correct framing (see Priority 1).
- [ ] **Default CoT caveat**: Modern models (Claude Opus, GPT-4+) likely do implicit chain-of-thought by default. The CoT null result may mean "explicit CoT adds nothing to implicit CoT" rather than "reasoning doesn't help." Add to discussion.
- [ ] **Mixed-effects as primary**: Already mostly done, but remove any remaining language suggesting non-parametric is primary. Non-parametric is the robustness check.

## Priority 5: Citation/style fixes

- [ ] **Fix Quarto citation style**: Renders "Jason Wei et al." with first name. Should be "Wei et al." Configure CSL.
- [ ] **Newer lit review**: Check for post-2024 papers on LLM forecasting, sycophancy, decision frameworks. Look at what cites our current references.
- [ ] **Check for outdated claims**: "projected LLM-superforecaster parity by late 2026" — we're in March 2026, is this still current?

## Key data points for reference

- Claude mixed-effects: farness = -4.17 (p<0.001), CoT = -0.56 (p=0.34)
- GPT mixed-effects: farness = -37.0 (p=0.009), CoT = -29.7 (p=0.036)
- GPT sycophancy (adversarial_sycophancy): naive mean update = 466.7 leads, farness = 108.3, Claude naive = 0.0
- Scenarios use different units: percentages (most), weeks (planning), leads (sycophancy)
- Analysis code: commits 50e93d4 (Dec 19) and bfd1aae (Dec 20), experiments: Feb 16-18
- Skill optimization loop was running (PID 20928) — check if it finished and apply the optimized description
