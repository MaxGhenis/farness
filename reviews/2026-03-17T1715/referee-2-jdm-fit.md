# Referee Report 2

## Recommendation
Major revision.

## Summary for Editor
This is a promising and plausible submission for *Judgment and Decision Making*. The paper is strongest when framed as a methodological contribution: it introduces stability-under-probing as a process-level way to evaluate decision prompts without ground truth, and it uses the farness framework as a concrete case study. That said, the current draft still overstates the generality of the empirical finding and leaves the central construct-validity issue underdeveloped.

The paper’s fit for JDM is good, but only if the authors narrow the rhetorical claims and strengthen the validation of the proposed measure. At present, the evidence shows that farness is more stable than naive prompting on the probes used here, not that the framework broadly improves decision quality. The manuscript would be substantially stronger if it treated that distinction as the main point rather than a caveat.

## Major Concerns
- The core construct-validity problem is still the prompt-probe alignment confound. The paper acknowledges this explicitly in the Discussion ([index.qmd:280](/Users/maxghenis/farness/paper/index.qmd#L280), [index.qmd:302](/Users/maxghenis/farness/paper/index.qmd#L302)), but the consequence is more serious than the current framing suggests. Because farness explicitly asks models to consider base rates, biases, and uncertainty ([index.qmd:27](/Users/maxghenis/farness/paper/index.qmd#L27)), and the probes then test exactly those dimensions ([index.qmd:147](/Users/maxghenis/farness/paper/index.qmd#L147)), the main result may partly reflect targeted priming rather than a more robust decision process. For JDM, this is not a side issue; it is the main validity threat that must be addressed before the measure can be interpreted as a general decision-quality proxy.
- The empirical design is interesting but still too small to support broad claims. The paper uses 11 scenarios with 6 runs per scenario-condition pair ([index.qmd:9-13](/Users/maxghenis/farness/paper/index.qmd#L9), [index.qmd:159-165](/Users/maxghenis/farness/paper/index.qmd#L159)), and the authors correctly note that the effective between-scenario sample size is much closer to 11 than 66. That makes the mixed-effects analysis useful, but it does not resolve the limited generalizability. The title, abstract, and conclusion should therefore remain explicitly bounded to the method and case study, rather than implying a more general verdict on decision frameworks ([index.qmd:1-13](/Users/maxghenis/farness/paper/index.qmd#L1), [index.qmd:314-318](/Users/maxghenis/farness/paper/index.qmd#L314)).
- The paper still mixes two different claims: a methodological claim about measurement and a substantive claim about the farness framework. The methods claim is stronger. The substantive claim is less secure because the strongest effects are concentrated in a few scenarios, especially the sycophancy case ([index.qmd:221-237](/Users/maxghenis/farness/paper/index.qmd#L221)), and because the framework appears most useful on exactly the dimensions it names itself. I would encourage the authors to make the case-study status of farness much more explicit, including in the title and abstract, and to reserve any broader claim for future work with off-framework probes or outcome-linked validation ([index.qmd:306-310](/Users/maxghenis/farness/paper/index.qmd#L306)).
- The statistical story is reasonable, but the paper should be more disciplined about what the models can and cannot establish. The mixed-effects model is an appropriate response to the hierarchical structure ([index.qmd:196](/Users/maxghenis/farness/paper/index.qmd#L196)), but the main interpretation still depends heavily on effect sizes and descriptive contrasts across a small number of scenarios. The non-parametric tests, mixed model, and scenario table together are informative, yet they do not fully address whether the observed reductions are robust across task types or merely concentrated in a few high-leverage cases ([index.qmd:221](/Users/maxghenis/farness/paper/index.qmd#L221)).
- The exposition is good enough for a working paper, but JDM readers will want the design logic even more foregrounded. The new protocol schematic helps ([index.qmd:88](/Users/maxghenis/farness/paper/index.qmd#L88)), but the manuscript still moves quickly from method to results. I would recommend an even clearer separation between "what exactly is being tested" and "what the case study found," especially in the introduction and first half of Results.

## Minor Comments
- The title is accurate but still a bit broad for what the paper actually demonstrates. Something that signals the method-case-study structure would better set expectations.
- The abstract should say more directly that farness is a case study for stability-under-probing, not the object of the main claim.
- The term "decision prompts" is now closer to the argument than "decision frameworks" in general, but the paper should keep that distinction consistent throughout.
- The worked example in the Results section is helpful ([index.qmd:266](/Users/maxghenis/farness/paper/index.qmd#L266)), but it would be even more useful if the prose explicitly connected it back to the protocol schematic rather than treating it mainly as a narrative illustration of the aggregate result.
- The paper is strongest when it emphasizes "starts closer, updates less" rather than "improves decision quality." I would keep that wording discipline throughout the conclusion ([index.qmd:314](/Users/maxghenis/farness/paper/index.qmd#L314)).
- The figures are now much better than in the earlier version, especially the protocol schematic and the convergence panel, but the paper would benefit from one sentence in the text explaining why each figure exists and what unique inferential role it plays.

## Decision-Contingent Revision Request
If the paper is revised, I would ask for three concrete changes.

First, tighten the title, abstract, and conclusion so the manuscript is explicitly presented as a method for evaluating decision prompts, with farness as a case study, rather than as evidence that the framework broadly improves decisions.

Second, add one stronger validation exercise that attacks the main confound. The cleanest option would be an off-framework probe battery, paired if possible with an outcome-linked benchmark. That would let the authors show whether stability-under-probing has discriminant validity beyond the dimensions named in the framework prompt.

Third, clarify the inferential hierarchy. The paper should say more plainly that the mixed-effects model, descriptive plots, and scenario table are complementary views of the same limited dataset, not independent replications of a broad claim.

With those revisions, I think the paper would be a credible and useful contribution for JDM.
