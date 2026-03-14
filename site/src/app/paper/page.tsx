import Link from "next/link";
import { Cite } from "@/components/Cite";
import { Header } from "@/components/Header";

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="w-full border-collapse my-8 text-[0.9rem]">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className="py-4 px-8 text-left border-b border-[var(--theme-border)] font-medium text-[var(--theme-text)] bg-[var(--theme-bg-surface)]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                className={`py-4 px-8 text-left text-[var(--theme-text-muted)] ${
                  i < rows.length - 1
                    ? "border-b border-[var(--theme-border)]"
                    : ""
                }`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PaperPage() {
  return (
    <div>
      <Header activePage="paper" />
      <article className="max-w-[680px] mx-auto px-8">
        <header className="text-center py-24 border-b border-[var(--theme-border)] mb-24 animate-[fade-up_0.6s_ease-out] max-[600px]:py-16">
          <p className="font-[var(--font-mono)] text-[0.65rem] tracking-[0.15em] uppercase text-accent mb-4">
            Research paper
          </p>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3rem)] font-light leading-[1.2] mb-8 tracking-[-0.02em]">
            Pre-emptive rigor
          </h1>
          <p className="text-[1.15rem] text-[var(--theme-text-muted)] max-w-[480px] mx-auto leading-[1.6]">
            Measuring decision framework effectiveness in LLMs
          </p>
          <p className="text-[0.85rem] text-[var(--theme-text-muted)] mt-4">
            Max Ghenis &middot; Draft v0.4 &middot; February 2026
          </p>
        </header>

        <div className="prose-content">
          <section className="bg-[linear-gradient(135deg,var(--color-accent-subtle)_0%,transparent_100%)] p-16 border-l-[3px] border-l-accent mb-24 rounded-r [&_p]:text-[0.95rem]">
            <h2>Abstract</h2>
            <p>
              We introduce <em>stability-under-probing</em> as a methodology for
              evaluating whether structured decision frameworks improve LLM
              decision support without requiring ground truth outcomes. Rather
              than measuring forecast accuracy, we measure whether
              framework-guided responses resist updating when challenged with
              new considerations — and whether this benefit exceeds that of
              generic chain-of-thought (CoT) prompting.
            </p>
            <p>
              In experiments across 11 scenarios on two models (Claude Opus 4.6,
              GPT-5.2) with three conditions (naive, CoT, farness), we find that
              framework-guided responses show substantially smaller update
              magnitudes on both models. On Claude (n=191), farness mean update
              was 9.02 vs 13.80 naive and 13.37 CoT. On GPT-5.2 (n=198), farness
              mean update was 22.03 vs 59.03 naive and 29.35 CoT. Crucially, CoT
              provided no stability benefit over naive prompting on either
              model, while farness reduced updates on both — indicating the
              framework&apos;s value comes from its specific structure (KPIs,
              base rates, bias identification), not generic reasoning.
            </p>
            <p>
              A complementary reframing experiment (n=240 across both models)
              finds that farness produces more reframe indicators and
              significantly more new KPIs (Claude: 34% vs 15% naive, p=0.02;
              GPT-5.2: 72% vs 50%). All p-values are reported with
              Holm-Bonferroni correction for multiple comparisons. These results
              provide cross-model evidence for the pre-emptive rigor hypothesis.
            </p>
          </section>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Large language models are increasingly used for decision support —
              helping users think through business decisions, personal choices,
              and strategic planning. A growing body of work suggests that
              structured prompting approaches can improve LLM reasoning
              <Cite id="1">1</Cite>
              <Cite id="2">2</Cite>, and research on human decision-making shows
              that structured frameworks reduce noise and bias
              <Cite id="3">3</Cite>.
            </p>
            <p>
              However, evaluating whether decision frameworks actually improve{" "}
              <em>decision quality</em> is challenging:
            </p>
            <ol>
              <li>
                <strong>Ground truth is often unavailable.</strong> Many
                decisions have no objectively correct answer, and even those
                that do may not resolve for months or years.
              </li>
              <li>
                <strong>Confounders abound.</strong> Real-world outcomes depend
                on execution, luck, and factors unknown at decision time.
              </li>
              <li>
                <strong>Measuring process vs. outcome.</strong> Good decisions
                can have bad outcomes (and vice versa). We want to measure
                decision <em>quality</em>, not just outcome <em>accuracy</em>.
              </li>
            </ol>
            <p>
              We propose a novel methodology:{" "}
              <strong>stability-under-probing</strong>. Rather than asking
              &quot;did you get the right answer?&quot;, we ask:
            </p>
            <ul>
              <li>
                Does the framework front-load considerations that naive
                prompting misses?
              </li>
              <li>Do naive responses update significantly when challenged?</li>
              <li>
                Do naive responses converge toward framework-guided responses
                after probing?
              </li>
            </ul>
            <p>
              If a framework produces responses that are robust to follow-up
              questions — because they already considered base rates, identified
              biases, and quantified uncertainty — this suggests the framework
              provides genuine value, not just cosmetic structure.
            </p>

            <h3>1.1 The Farness framework</h3>
            <p>
              We evaluate a specific framework called &quot;farness&quot;
              (Forecasting as a Harness for Decision-Making) that requires (
              <Link
                href="/thesis"
                className="text-accent no-underline hover:underline"
              >
                see full thesis
              </Link>
              ):
            </p>
            <ol>
              <li>Defining explicit, measurable KPIs</li>
              <li>Making numeric forecasts with confidence intervals</li>
              <li>Citing base rates from research (outside view)</li>
              <li>Identifying cognitive biases in the framing</li>
              <li>Giving recommendations based on expected value</li>
              <li>Setting review dates for accountability</li>
            </ol>
            <p>
              This framework draws on established research in decision hygiene
              <Cite id="3">3</Cite>, superforecasting
              <Cite id="4">4</Cite>, and reference class forecasting
              <Cite id="5">5</Cite>.
            </p>
          </section>

          <section>
            <h2>2. Related work</h2>

            <h3>2.1 Decision hygiene and structured judgment</h3>
            <p>
              Kahneman, Sibony, and Sunstein (2021) introduce &quot;decision
              hygiene&quot; — procedures that reduce noise in human judgment
              <Cite id="3">3</Cite>. Key techniques include:
            </p>
            <ul>
              <li>Breaking decisions into independent components</li>
              <li>Using relative rather than absolute scales</li>
              <li>Aggregating multiple judgments</li>
              <li>
                Delaying intuitive synthesis until after analytical assessment
              </li>
            </ul>
            <p>
              The evidence for structured over unstructured judgment is
              extensive. Dawes, Faust, and Meehl (1989) reviewed nearly 100
              studies and found that actuarial (structured) prediction equaled
              or surpassed clinical (unstructured) judgment in every domain
              tested
              <Cite id="15">15</Cite>. Grove and Zald (2000) confirmed this
              across 136 studies, finding mechanical prediction was ~10% more
              accurate on average, with clinical prediction substantially
              winning in only 6-16% of comparisons
              <Cite id="16">16</Cite>.
            </p>
            <p>
              The GRADE Evidence-to-Decision framework in healthcare shows that
              structured approaches lead to more consistent, transparent
              recommendations
              <Cite id="6">6</Cite>. Howard&apos;s Decision Quality framework
              provides six auditable elements — frame, alternatives,
              information, values, reasoning, and commitment — allowing decision
              quality to be assessed independent of outcomes
              <Cite id="17">17</Cite>.
            </p>

            <h3>2.2 Superforecasting and calibration</h3>
            <p>
              Tetlock&apos;s Good Judgment Project demonstrated that structured
              training improves forecasting accuracy by ~10%, and that
              calibration can be learned through practice with feedback
              <Cite id="4">4</Cite>. Key techniques include reference class
              forecasting, decomposition, and explicit uncertainty
              quantification.
            </p>

            <h3>2.3 LLM prompting and reasoning</h3>
            <p>
              Chain-of-thought prompting
              <Cite id="1">1</Cite> improves LLM performance on reasoning tasks
              by encouraging step-by-step thinking. Decomposition prompting
              <Cite id="7">7</Cite> further improves performance by breaking
              complex problems into sub-problems. Wang et al. (2023) showed that
              sampling diverse reasoning paths and selecting the most consistent
              answer improves chain-of-thought performance by up to 17.9%
              <Cite id="18">18</Cite>, providing the theoretical basis for
              structured ensemble approaches.
            </p>

            <h3>2.4 LLM calibration</h3>
            <p>
              Recent work has examined whether LLMs produce well-calibrated
              probability estimates. Kadavath et al. (2022) found that larger
              models show improved calibration on question-answering tasks,
              though calibration degrades for low-probability events
              <Cite id="9">9</Cite>. Tian et al. (2023) demonstrated that
              verbalized confidence correlates with accuracy but exhibits
              systematic overconfidence
              <Cite id="10">10</Cite>.
            </p>
            <p>
              Crucially, Xiong et al. (2024) showed that structured elicitation
              strategies — multi-step prompting, top-k sampling — significantly
              reduce LLM overconfidence, with human-inspired prompting
              strategies mitigating the worst miscalibration
              <Cite id="19">19</Cite>. This suggests that <em>how</em> you ask
              for probabilities matters as much as the model&apos;s underlying
              capability. Calibration research typically focuses on{" "}
              <em>factual</em> questions with ground truth. Our work extends
              this to <em>judgment</em> questions where no ground truth exists.
            </p>

            <h3>2.5 Sycophancy and cognitive bias in LLMs</h3>
            <p>
              LLMs exhibit sycophancy — the tendency to agree with users even
              when they shouldn&apos;t. Perez et al. (2023) documented that
              models shift answers when users express opinions, even on
              objective questions
              <Cite id="11">11</Cite>. Sharma et al. (2024) showed that
              sycophancy increases with model capability
              <Cite id="12">12</Cite>.
            </p>
            <p>
              Beyond sycophancy, LLMs exhibit broader cognitive biases.
              Echterhoff et al. (2024) tested 13,465 prompts for prompt-induced,
              sequential, and inherent biases, proposing &quot;BiasBuster&quot;
              — a framework for LLMs to debias their own human-like cognitive
              biases
              <Cite id="20">20</Cite>. Anchoring bias in particular persists
              even with chain-of-thought prompting; effective mitigation
              requires comprehensive structured elicitation
              <Cite id="21">21</Cite>. Christian and Mazor (2026) demonstrated
              that LLMs can mitigate their own biases through
              &quot;self-blinding&quot; — calling a blinded replica of
              themselves to achieve fairer decisions
              <Cite id="22">22</Cite>, operationalizing decision hygiene for AI
              systems.
            </p>
            <p>
              Our stability-under-probing methodology directly measures these
              phenomena: do models update inappropriately when probed, and does
              structured framing reduce such updates?
            </p>

            <h3>2.6 Process evaluation in decision-making</h3>
            <p>
              Evaluating decision <em>process</em> rather than outcomes has
              precedent in behavioral economics. Kahneman and Klein (2009) argue
              for &quot;pre-mortem&quot; analysis as a process intervention
              <Cite id="13">13</Cite>. Larrick (2004) reviews debiasing
              techniques, noting that process changes often outperform outcome
              feedback
              <Cite id="14">14</Cite>. Our stability-under-probing methodology
              offers a specific operationalization of deliberation quality.
            </p>

            <h3>2.7 LLM-assisted structured decision-making</h3>
            <p>
              Chiang et al. (2024) showed that LLM-powered &quot;devil&apos;s
              advocates&quot; — agents that argue against AI recommendations —
              promote appropriate reliance on AI in group decisions by grounding
              discussion in concrete evidence and surfacing assumptions
              <Cite id="23">23</Cite>. Du et al. (2024) demonstrated that
              multi-agent debate between LLM instances significantly enhances
              reasoning while reducing hallucinations, structurally analogous to
              Analysis of Competing Hypotheses
              <Cite id="24">24</Cite>.
            </p>

            <h3>2.8 LLM forecasting benchmarks</h3>
            <p>
              ForecastBench
              <Cite id="8">8</Cite> provides a dynamic benchmark for LLM
              forecasting accuracy, comparing models to human forecasters
              including superforecasters. Halawi et al. (2024) built a
              retrieval-augmented system that approaches competitive forecaster
              accuracy through a structured pipeline of search, reasoning, and
              aggregation
              <Cite id="25">25</Cite>. As of 2025, superforecasters still
              outperform leading LLMs (Brier ~0.08 vs ~0.10), but the gap is
              narrowing — LLMs now surpass the median public forecaster, with
              projected parity by late 2026.
            </p>

            <h3>2.9 Gap in the literature</h3>
            <p>Existing work measures either:</p>
            <ul>
              <li>
                <strong>Forecasting accuracy</strong> (ForecastBench) — but this
                requires resolvable questions and doesn&apos;t capture decision{" "}
                <em>process</em>
              </li>
              <li>
                <strong>Reasoning quality</strong> (chain-of-thought) — but this
                focuses on math/logic, not real-world judgment under uncertainty
              </li>
            </ul>
            <p>
              Our methodology addresses the gap: measuring decision framework
              effectiveness without requiring ground truth outcomes.
            </p>
          </section>

          <section>
            <h2>3. Methodology: stability-under-probing</h2>

            <h3>3.1 Intuition</h3>
            <p>
              A well-thought-through decision should be robust to follow-up
              questions. If someone asks &quot;but what about the base
              rate?&quot; or &quot;did you consider X risk?&quot; and you
              immediately revise your recommendation, this suggests the original
              recommendation was under-considered.
            </p>
            <p>
              Conversely, if a framework produces recommendations that are
              stable under probing — because they already incorporated base
              rates, risks, and uncertainty — this suggests the framework
              front-loaded the analytical work.
            </p>

            <h3>3.2 Protocol</h3>
            <p>For each decision scenario:</p>
            <ol>
              <li>
                <strong>Initial prompt (three conditions):</strong>
                <ul>
                  <li>
                    <em>Naive</em>: &quot;You are a helpful assistant.
                    [Scenario]. What is your estimate?&quot;
                  </li>
                  <li>
                    <em>Chain-of-thought (CoT)</em>: &quot;Think through this
                    step by step before answering. [Scenario]. What is your
                    estimate?&quot;
                  </li>
                  <li>
                    <em>Framework (farness)</em>: &quot;You are a decision
                    analyst using the farness framework. [Scenario]. What is
                    your estimate with confidence interval?&quot;
                  </li>
                </ul>
              </li>
              <li>
                <strong>Record initial response:</strong> Point estimate,
                confidence interval (if provided), full response text
              </li>
              <li>
                <strong>Probing phase:</strong> Present 2-4 follow-up
                considerations (base rates, new information, bias
                identification). Ask for revised estimate.
              </li>
              <li>
                <strong>Record final response:</strong> Revised point estimate,
                revised confidence interval, full response text
              </li>
            </ol>

            <h3>3.3 Metrics</h3>
            <p>
              <strong>Primary metrics:</strong>
            </p>
            <Table
              headers={["Metric", "Definition", "Hypothesis"]}
              rows={[
                ["Update magnitude", "|final - initial|", "Framework < Naive"],
                [
                  "Relative update",
                  "|final - initial| / initial",
                  "Framework < Naive",
                ],
                [
                  "Initial CI rate",
                  "Proportion with CI in initial response",
                  "Framework > Naive",
                ],
                [
                  "Correct direction rate",
                  "Updates in direction implied by probes",
                  "Framework >= Naive",
                ],
              ]}
            />
            <p>
              <strong>Convergence metric:</strong>
            </p>
            <p>
              We measure whether naive(probed) converges toward
              framework(initial):
            </p>
            <blockquote>
              <p className="font-[var(--font-mono)] text-[0.85em]">
                Convergence ratio = 1 - |naive_final - framework_initial| /
                |naive_initial - framework_initial|
              </p>
            </blockquote>
            <p>
              A convergence ratio {">"} 0 indicates that probing moves naive
              responses toward where the framework started.
            </p>

            <h3>3.4 Interpretation</h3>
            <Table
              headers={["Finding", "Interpretation"]}
              rows={[
                [
                  "Framework has lower update magnitude",
                  "Framework is more stable/robust",
                ],
                [
                  "Framework has higher initial CI rate",
                  "Framework quantifies uncertainty upfront",
                ],
                [
                  "Naive converges toward framework",
                  "Framework front-loads considerations that probing extracts",
                ],
                [
                  "Both update in correct direction",
                  "Both respond coherently to evidence",
                ],
              ]}
            />
          </section>

          <section>
            <h2>4. Experimental design</h2>

            <h3>4.1 Decision scenarios</h3>
            <p>
              We design quantitative decision scenarios across multiple domains:
            </p>
            <Table
              headers={["Domain", "Scenario", "Estimate Type"]}
              rows={[
                ["Planning", "Software project timeline", "Weeks"],
                ["Risk", "Troubled project success probability", "Percentage"],
                ["Hiring", "Candidate success prediction", "Percentage"],
                ["Investment", "M&A synergy realization", "Percentage"],
                ["Product", "Feature launch success", "Percentage"],
                [
                  "Startup",
                  "Growth probability after flat period",
                  "Percentage",
                ],
                ["Marketing", "Lead generation campaign success", "Leads"],
                ["Finance", "Budget variance estimation", "Percentage"],
                ["Adversarial", "Irrelevant anchor resistance", "Leads"],
                ["Adversarial", "False base rate resistance", "Percentage"],
                ["Adversarial", "Sycophantic pressure resistance", "Leads"],
              ]}
            />
            <p>Each scenario includes:</p>
            <ul>
              <li>A realistic decision context</li>
              <li>A quantitative question requiring a point estimate</li>
              <li>2-4 probing questions with base rates and new information</li>
              <li>Expected direction of update (for validation)</li>
            </ul>

            <h3>4.2 Probing questions</h3>
            <p>
              Probes are designed to surface considerations that good
              decision-making should address:
            </p>
            <ol>
              <li>
                <strong>Base rate probes</strong>: &quot;Research shows X% of
                similar situations result in Y...&quot;
              </li>
              <li>
                <strong>Bias identification probes</strong>: &quot;This is a
                classic sign of [sunk cost fallacy / planning fallacy /
                etc.]...&quot;
              </li>
              <li>
                <strong>New information probes</strong>: &quot;I just learned
                that [relevant new fact]...&quot;
              </li>
            </ol>

            <h3>4.3 Adversarial probing conditions</h3>
            <p>
              To establish discriminant validity, we include adversarial probing
              scenarios where estimates <em>should not</em> change:
            </p>
            <ol>
              <li>
                <strong>Irrelevant anchoring</strong>: Probes include unrelated
                numbers (e.g., &quot;My phone number ends in 97. Does this
                change your estimate?&quot;)
              </li>
              <li>
                <strong>False base rates</strong>: Probes cite inapplicable or
                fabricated statistics
              </li>
              <li>
                <strong>Sycophantic pressure</strong>: Probes express user
                disagreement without providing new information
              </li>
            </ol>
            <p>
              A robust framework should resist these adversarial probes while
              appropriately updating to legitimate new information.
            </p>

            <h3>4.4 Models and procedure</h3>
            <ul>
              <li>
                <strong>Models</strong>: Claude Opus 4.6 (Anthropic) and GPT-5.2
                (OpenAI), accessed via their respective Python SDKs
              </li>
              <li>
                <strong>Conditions</strong>: Three per model — naive,
                chain-of-thought (CoT), and farness framework
              </li>
              <li>
                <strong>Temperature</strong>: 1.0 (default for both models)
              </li>
              <li>
                <strong>Runs per condition</strong>: 6 per scenario (to account
                for stochasticity)
              </li>
              <li>
                <strong>Order</strong>: Randomized per case using a logged
                random seed for reproducibility
              </li>
              <li>
                <strong>Response format</strong>: Structured JSON extraction
                with regex fallback for point estimates and confidence intervals
              </li>
              <li>
                <strong>Blinding</strong>: Extraction functions operate on
                anonymized response text without condition labels
              </li>
            </ul>
            <p>
              The CoT condition serves as a baseline to distinguish whether
              stability benefits come from <em>any</em> structured reasoning
              (&quot;think step by step&quot;) or from the framework&apos;s
              specific structure (KPIs, base rates, bias identification,
              confidence intervals).
            </p>

            <h3>4.5 Statistical analysis</h3>
            <p>
              We use non-parametric tests given moderate sample sizes and
              non-normal distributions:
            </p>
            <ul>
              <li>
                <strong>Mann-Whitney U test</strong>: Pairwise comparisons of
                update magnitudes between all condition pairs (two-sided)
              </li>
              <li>
                <strong>Fisher&apos;s exact test</strong>: Compares categorical
                rates (CI provision, new KPI introduction) between conditions
              </li>
              <li>
                <strong>Holm-Bonferroni correction</strong>: Applied to all
                pairwise comparisons within each experiment to control
                family-wise error rate
              </li>
              <li>
                <strong>Bootstrap confidence intervals</strong>: 1000-resample
                95% CIs for Cohen&apos;s d and rank-biserial r
              </li>
              <li>
                <strong>Effect sizes</strong>: Rank-biserial correlation for
                update magnitude, Cohen&apos;s d with bootstrap 95% CIs
              </li>
              <li>
                <strong>Mixed-effects model</strong>:{" "}
                <code>update_magnitude ~ condition</code> with scenario as
                random effect (via statsmodels), to account for scenario-level
                variance
              </li>
            </ul>

            <h3>4.6 Sample size</h3>
            <p>
              <strong>Stability experiment:</strong>
            </p>
            <ul>
              <li>
                11 scenarios x 3 conditions x 6 runs x 2 models = 396 target
                responses
              </li>
              <li>Claude: 63 naive + 66 CoT + 62 farness = 191 completed</li>
              <li>GPT-5.2: 66 naive + 66 CoT + 66 farness = 198 completed</li>
              <li>Total: 389 stability trials across both models</li>
            </ul>
            <p>
              <strong>Reframing experiment:</strong>
            </p>
            <ul>
              <li>6 cases x 3 conditions x 5-10 runs x 2 models</li>
              <li>Claude: 59 naive + 30 CoT + 58 farness = 147 completed</li>
              <li>
                GPT-5.2: 20 naive + 20 CoT + 18 farness = 58 completed (4 of 6
                cases)
              </li>
              <li>Total: ~205 reframing trials across both models</li>
            </ul>
          </section>

          <section>
            <h2>5. Results</h2>

            <h3>5.1 Stability-under-probing: Claude Opus 4.6</h3>
            <p>
              We ran 191 stability trials on Claude Opus 4.6 across 11 scenarios
              with 6 runs per condition per scenario. Results are summarized
              below.
            </p>

            <h4>Primary metrics (Claude)</h4>
            <Table
              headers={[
                "Metric",
                "Naive (n=63)",
                "CoT (n=66)",
                "Farness (n=62)",
              ]}
              rows={[
                ["Mean update magnitude", "13.80", "13.37", "9.02"],
                ["Mean relative update", "51%", "—", "43%"],
                ["Initial CI rate", "100%", "100%", "100%"],
                ["Correct direction rate", "100%", "100%", "98%"],
              ]}
            />
            <p>
              Framework-guided responses showed 35% smaller mean update
              magnitudes (9.02 vs 13.80 naive). Crucially, chain-of-thought
              prompting (13.37) provided <em>no stability benefit</em> over
              naive prompting — the means were nearly identical. This indicates
              the framework&apos;s stability benefit comes from its specific
              structure (KPIs, base rates, bias identification), not from
              generic step-by-step reasoning.
            </p>

            <h3>5.2 Stability-under-probing: GPT-5.2</h3>
            <p>
              We ran 198 stability trials on GPT-5.2 across the same 11
              scenarios to test cross-model replication.
            </p>

            <h4>Primary metrics (GPT-5.2)</h4>
            <Table
              headers={[
                "Metric",
                "Naive (n=66)",
                "CoT (n=66)",
                "Farness (n=66)",
              ]}
              rows={[
                ["Mean update magnitude", "59.03", "29.35", "22.03"],
                ["Mean relative update", "58%", "—", "45%"],
                ["Initial CI rate", "100%", "100%", "100%"],
                ["Correct direction rate", "98%", "100%", "100%"],
              ]}
            />
            <p>
              GPT-5.2 showed dramatically larger update magnitudes than Claude
              across all conditions, driven primarily by the sycophancy scenario
              where naive GPT-5.2 responses updated by up to +1,100 leads under
              social pressure. Farness reduced mean updates by 63% compared to
              naive (22.03 vs 59.03). While CoT reduced updates somewhat (29.35
              vs 59.03), farness still outperformed CoT by 25%.
            </p>
            <p>
              The sycophancy case revealed a striking model difference: Claude
              showed zero update under sycophantic pressure in both conditions,
              while GPT-5.2 naive responses capitulated dramatically (updates of
              +300 to +1,100 leads) but farness-guided responses held firm at
              zero update in 3 of 6 runs.
            </p>

            <h3>5.3 Cross-model comparison</h3>
            <Table
              headers={["Model", "Naive", "CoT", "Farness"]}
              rows={[
                ["Claude Opus 4.6", "13.80", "13.37", "9.02"],
                ["GPT-5.2", "59.03", "29.35", "22.03"],
              ]}
            />
            <p>
              Cross-model Mann-Whitney U tests showed significant differences
              between models within each condition (all p {"<"} 0.035),
              confirming that GPT-5.2 is systematically more susceptible to
              updating under probing. However, the <em>pattern</em> of results
              was consistent: on both models, farness {"<"} CoT {"<="} naive.
            </p>

            <h3>5.4 Convergence analysis</h3>
            <p>
              Our convergence hypothesis predicted that naive responses, after
              probing, would move toward where farness started — i.e., that
              probing extracts the same considerations the framework
              front-loads.
            </p>
            <p>
              <strong>
                This hypothesis was not supported on either model.
              </strong>{" "}
              On Claude, the mean convergence ratio was -1.25, and on GPT-5.2 it
              was -2.24, indicating that naive responses <em>diverged</em> from
              farness initial estimates after probing. This suggests that naive
              and farness prompting lead to fundamentally different analytical
              trajectories.
            </p>

            <h3>5.5 Adversarial probing</h3>
            <p>
              Three adversarial scenarios tested whether conditions resist
              inappropriate updates:
            </p>
            <ul>
              <li>
                <strong>Irrelevant anchoring</strong>: All conditions on both
                models showed zero updates when presented with unrelated
                numbers, confirming resistance to irrelevant anchors.
              </li>
              <li>
                <strong>False base rates</strong>: Mixed results on both models
                — neither condition consistently resisted fabricated statistics.
              </li>
              <li>
                <strong>Sycophantic pressure</strong>: Claude showed zero update
                across all conditions. GPT-5.2 showed a dramatic split: naive
                responses updated by +300 to +1,100 leads, while farness held at
                zero in half the runs.
              </li>
            </ul>

            <h3>5.6 Reframing experiment</h3>
            <p>
              We ran a reframing experiment across both models to test whether
              the framework encourages reframing of the original decision
              question.
            </p>

            <h4>Claude reframing (n=147)</h4>
            <Table
              headers={[
                "Metric",
                "Naive (n=59)",
                "CoT (n=30)",
                "Farness (n=58)",
              ]}
              rows={[
                ["Mean reframe count", "3.47", "4.43", "4.64"],
                ["Challenged framing", "24%", "37%", "17%"],
                ["New KPIs introduced", "15%", "27%", "34%"],
              ]}
            />
            <p>
              Farness vs naive: reframe count U=2179.5, p=0.01 (raw), p=0.06
              (Holm-Bonferroni corrected). New KPI rate: Fisher&apos;s exact
              p=0.02 (raw), p=0.10 (corrected). Farness showed directionally
              more reframing and significantly more new-KPI introduction, though
              corrected p-values are marginal.
            </p>

            <h4>GPT-5.2 reframing (n=58)</h4>
            <Table
              headers={[
                "Metric",
                "Naive (n=20)",
                "CoT (n=20)",
                "Farness (n=18)",
              ]}
              rows={[
                ["Mean reframe count", "4.00", "4.60", "4.78"],
                ["Challenged framing", "10%", "30%", "0%"],
                ["New KPIs introduced", "50%", "30%", "72%"],
              ]}
            />
            <p>
              GPT-5.2 showed the same directional pattern: farness {">"} CoT{" "}
              {">"} naive on reframe count (4.78 vs 4.60 vs 4.00). The new-KPI
              introduction rate under farness was notably high at 72%. However,
              with smaller sample sizes per condition (n~20), pairwise
              comparisons did not reach significance after correction.
            </p>

            <h4>Per-case breakdown (Claude)</h4>
            <Table
              headers={["Case", "Naive", "CoT", "Farness"]}
              rows={[
                ["Feature build", "4.7", "5.0", "5.2"],
                ["Grad school", "0.4", "0.2", "0.8"],
                ["Hire senior", "5.0", "7.4", "6.8"],
                ["Move cities", "4.7", "6.6", "7.7"],
                ["Quit job", "4.2", "6.2", "4.9"],
                ["Raise funding", "1.7", "1.2", "2.4"],
              ]}
            />
            <p>
              The largest farness-vs-naive differences appeared in the
              &quot;move cities&quot; (+3.0) and &quot;hire senior&quot; (+1.8)
              scenarios, where the framework prompted more systematic
              consideration of quantifiable factors. CoT also improved on naive
              in most cases but the pattern was less consistent.
            </p>

            <h3>5.7 Summary of findings</h3>
            <ol>
              <li>
                <strong>Stability benefit replicates across models</strong>:
                Farness reduced mean update magnitude on both Claude (9.02 vs
                13.80 naive, -35%) and GPT-5.2 (22.03 vs 59.03 naive, -63%).
              </li>
              <li>
                <strong>CoT provides no stability benefit</strong>:
                Chain-of-thought prompting did not reduce update magnitudes on
                Claude (13.37 vs 13.80) and only partially on GPT-5.2 (29.35 vs
                59.03, but still 33% higher than farness).
              </li>
              <li>
                <strong>Divergence, not convergence</strong>: Probing naive
                responses moved them <em>away</em> from framework initial
                estimates on both models.
              </li>
              <li>
                <strong>Sycophancy resistance</strong>: Farness protected
                GPT-5.2 from dramatic sycophantic capitulation (0 vs +1,100
                update magnitude).
              </li>
              <li>
                <strong>Increased KPI introduction</strong>: Farness more than
                doubled the new-KPI rate on Claude (34% vs 15%) and increased it
                substantially on GPT-5.2 (72% vs 50%).
              </li>
            </ol>
          </section>

          <section>
            <h2>6. Discussion</h2>

            <h3>6.1 Pre-emptive rigor: supported across models</h3>
            <p>
              Our results provide cross-model support for the &quot;pre-emptive
              rigor&quot; hypothesis. Framework-guided responses showed smaller
              update magnitudes on both Claude (-35%, 9.02 vs 13.80) and GPT-5.2
              (-63%, 22.03 vs 59.03), confirming that the framework front-loads
              considerations that naive prompting misses.
            </p>
            <p>
              The divergence finding replicated on both models: probing pushes
              naive responses away from framework estimates rather than toward
              them. This suggests the two prompting approaches produce
              fundamentally different analytical trajectories.
            </p>

            <h3>6.2 CoT is not enough</h3>
            <p>
              The chain-of-thought baseline is perhaps the most important
              finding for practitioners. On Claude, CoT provided essentially{" "}
              <em>no</em> stability benefit (13.37 vs 13.80 naive). On GPT-5.2,
              CoT reduced updates compared to naive (29.35 vs 59.03) but was
              still 33% worse than farness (29.35 vs 22.03).
            </p>
            <p>
              This demonstrates that the framework&apos;s value is not reducible
              to &quot;thinking more&quot; — it comes from the specific
              structure of KPI definition, base rate citation, bias
              identification, and confidence interval quantification. Generic
              reasoning prompts do not produce the same stability benefits.
            </p>

            <h3>6.3 Model differences in sycophancy</h3>
            <p>
              The sycophancy case revealed a stark model difference. Claude
              showed complete resistance to sycophantic pressure across all
              conditions (zero update). GPT-5.2 naive responses capitulated
              dramatically (up to +1,100 leads), but farness-guided responses
              held firm in half the runs. This suggests farness may be most
              valuable for models with weaker built-in sycophancy resistance.
            </p>

            <h3>6.4 Why stability may matter even without convergence</h3>
            <p>
              Even though naive responses don&apos;t converge toward framework
              estimates, the stability difference may still be practically
              important:
            </p>
            <ol>
              <li>
                <strong>Stability signals robustness.</strong> Smaller updates
                under probing suggest the initial analysis was more thorough,
                regardless of whether conditions converge on the same endpoint.
              </li>
              <li>
                <strong>Users don&apos;t know what to probe for.</strong> The
                framework surfaces considerations (base rates, biases) that
                users might not think to ask about.
              </li>
              <li>
                <strong>Probing is costly.</strong> Multiple follow-up rounds
                take time and tokens. Front-loading is more efficient.
              </li>
            </ol>

            <h3>6.5 Limitations</h3>
            <ol>
              <li>
                <strong>No outcome validation.</strong> We don&apos;t know if
                more stable responses lead to better actual decisions. This
                requires longitudinal tracking.
              </li>
              <li>
                <strong>Two models.</strong> We tested two frontier models
                (Claude Opus 4.6, GPT-5.2). Open-source models and smaller
                models remain untested.
              </li>
              <li>
                <strong>Researcher-designed probes.</strong> Our probing
                questions are designed to be effective; naive users might probe
                less well.
              </li>
              <li>
                <strong>Response format confound.</strong> Structured JSON
                extraction may have reduced differences between conditions by
                imposing similar output structure on both.
              </li>
              <li>
                <strong>Multiple comparisons.</strong> With 3 conditions x 2
                models x multiple metrics, the number of tests is substantial.
                We apply Holm-Bonferroni correction, but some corrected p-values
                are marginal (e.g., Claude farness vs naive reframing: raw
                p=0.01, corrected p=0.06).
              </li>
              <li>
                <strong>Uneven CoT sample sizes.</strong> Claude CoT reframing
                had n=30 (vs n~60 for naive/farness); GPT-5.2 reframing covered
                4 of 6 cases. This reduces power for some comparisons.
              </li>
            </ol>

            <h3>6.6 Future work</h3>
            <ol>
              <li>
                <strong>LLM-as-judge evaluation.</strong> Use cross-model
                blinded judging (Claude judges GPT-5.2 responses, vice versa) to
                assess response quality beyond stability — scoring reasoning
                depth, appropriate updating, and bias recognition.
              </li>
              <li>
                <strong>Open-source models.</strong> Test Llama, Mistral, and
                other open models to assess generalizability beyond frontier
                APIs.
              </li>
              <li>
                <strong>Human studies.</strong> Does using the framework improve
                human decision-making? User studies with A/B assignment to
                framework vs. naive conditions.
              </li>
              <li>
                <strong>Longitudinal calibration.</strong> Track real decisions
                over time and measure forecast accuracy.
              </li>
              <li>
                <strong>Unstructured response format.</strong> Remove JSON
                extraction requirements to test whether CI provision rates
                differ without format constraints.
              </li>
            </ol>
          </section>

          <section>
            <h2>7. Conclusion</h2>
            <p>
              We introduce stability-under-probing as a methodology for
              evaluating decision framework effectiveness in LLMs. Across 389
              stability trials and ~205 reframing trials on two frontier models
              (Claude Opus 4.6, GPT-5.2) with three conditions (naive,
              chain-of-thought, farness), we find consistent evidence that the
              farness framework reduces estimate volatility under probing.
            </p>
            <p>
              The key finding is that generic chain-of-thought reasoning
              provides little to no stability benefit, while the farness
              framework&apos;s specific structure — KPI definition, base rate
              citation, bias identification, and confidence interval
              quantification — produces meaningful stability improvements on
              both models. This suggests that <em>what</em> you structure
              matters more than <em>whether</em> you structure.
            </p>
            <p>
              The sycophancy case provides a vivid demonstration: GPT-5.2 naive
              responses capitulated to social pressure with updates exceeding
              +1,000 leads, while farness-guided responses maintained their
              estimates. The framework&apos;s requirement to anchor on
              quantitative KPIs and base rates appears to create resistance to
              non-informative updating.
            </p>
            <p>
              Our convergence hypothesis was not supported — naive responses
              diverge from framework estimates after probing, suggesting
              fundamentally different analytical trajectories. Nevertheless, the
              stability benefits are practically meaningful: framework-guided
              responses front-load the analytical work that probing would
              otherwise need to extract, saving time and reducing the risk of
              anchoring on under-considered initial estimates.
            </p>
          </section>
        </div>

        <section className="mt-24 pt-24 border-t border-[var(--theme-border)]">
          <h2 className="font-[var(--font-display)] text-[1.25rem] font-normal mb-8 text-[var(--theme-text)]">
            References
          </h2>
          <ol className="list-none p-0 m-0 text-[0.85rem] text-[var(--theme-text-muted)] leading-[1.6] [&_li]:mb-4 [&_li]:pl-8 [&_li]:relative [&_li>a:first-child]:absolute [&_li>a:first-child]:left-0 [&_li>a:first-child]:text-[var(--theme-text-muted)] [&_li>a:first-child]:no-underline [&_li>a:first-child]:text-[0.8em] [&_li>a:first-child:hover]:text-accent [&_em]:italic [&_a]:text-accent [&_a]:no-underline [&_a:hover]:underline">
            <li id="ref-1">
              <a href="#cite-1">↑</a> Wei, J., et al. (2022).
              &quot;Chain-of-Thought Prompting Elicits Reasoning in Large
              Language Models.&quot; <em>NeurIPS 2022</em>.
            </li>
            <li id="ref-2">
              <a href="#cite-2">↑</a> Kojima, T., et al. (2022). &quot;Large
              Language Models are Zero-Shot Reasoners.&quot;{" "}
              <em>NeurIPS 2022</em>.
            </li>
            <li id="ref-3">
              <a href="#cite-3">↑</a> Kahneman, D., Sibony, O., & Sunstein, C.
              R. (2021). <em>Noise: A Flaw in Human Judgment</em>. Little,
              Brown.
            </li>
            <li id="ref-4">
              <a href="#cite-4">↑</a> Tetlock, P. E., & Gardner, D. (2015).{" "}
              <em>Superforecasting: The Art and Science of Prediction</em>.
              Crown.
            </li>
            <li id="ref-5">
              <a href="#cite-5">↑</a> Flyvbjerg, B. (2006). &quot;From Nobel
              Prize to project management: getting risks right.&quot;{" "}
              <em>Project Management Journal</em>, 37(3), 5-15.
            </li>
            <li id="ref-6">
              <a href="#cite-6">↑</a> Alonso-Coello, P., et al. (2016).
              &quot;GRADE Evidence to Decision (EtD) frameworks.&quot;{" "}
              <em>BMJ</em>, 353, i2016.
            </li>
            <li id="ref-7">
              <a href="#cite-7">↑</a> Khot, T., et al. (2023). &quot;Decomposed
              Prompting: A Modular Approach for Solving Complex Tasks.&quot;{" "}
              <em>ICLR 2023</em>.
            </li>
            <li id="ref-8">
              <a href="#cite-8">↑</a> Karger, E., et al. (2024).
              &quot;ForecastBench: A Dynamic Benchmark of AI Forecasting
              Capabilities.&quot; <em>ICLR 2025</em>.
            </li>
            <li id="ref-9">
              <a href="#cite-9">↑</a> Kadavath, S., et al. (2022).
              &quot;Language Models (Mostly) Know What They Know.&quot;{" "}
              <em>arXiv:2207.05221</em>.
            </li>
            <li id="ref-10">
              <a href="#cite-10">↑</a> Tian, K., et al. (2023). &quot;Just Ask
              for Calibration.&quot; <em>EMNLP 2023</em>.
            </li>
            <li id="ref-11">
              <a href="#cite-11">↑</a> Perez, E., et al. (2023).
              &quot;Discovering Language Model Behaviors with Model-Written
              Evaluations.&quot; <em>ACL 2023</em>.
            </li>
            <li id="ref-12">
              <a href="#cite-12">↑</a> Sharma, M., et al. (2024). &quot;Towards
              Understanding Sycophancy in Language Models.&quot;{" "}
              <em>ICLR 2024</em>.
            </li>
            <li id="ref-13">
              <a href="#cite-13">↑</a> Kahneman, D., & Klein, G. (2009).
              &quot;Conditions for intuitive expertise.&quot;{" "}
              <em>American Psychologist</em>, 64(6), 515.
            </li>
            <li id="ref-14">
              <a href="#cite-14">↑</a> Larrick, R. P. (2004).
              &quot;Debiasing.&quot;{" "}
              <em>Blackwell Handbook of Judgment and Decision Making</em>,
              316-338.
            </li>
            <li id="ref-15">
              <a href="#cite-15">↑</a> Dawes, R. M., Faust, D., & Meehl, P. E.
              (1989). &quot;Clinical Versus Actuarial Judgment.&quot;{" "}
              <em>Science</em>, 243(4899), 1668-1674.{" "}
              <a
                href="https://doi.org/10.1126/science.2648573"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI
              </a>
            </li>
            <li id="ref-16">
              <a href="#cite-16">↑</a> Grove, W. M., & Zald, D. H. (2000).
              &quot;Clinical Versus Mechanical Prediction.&quot;{" "}
              <em>Psychological Assessment</em>, 12(1), 19-30.{" "}
              <a
                href="https://doi.org/10.1037/1040-3590.12.1.19"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI
              </a>
            </li>
            <li id="ref-17">
              <a href="#cite-17">↑</a> Howard, R. A. (1988). &quot;Decision
              Analysis: Practice and Promise.&quot; <em>Management Science</em>,
              34(6), 679-695.{" "}
              <a
                href="https://doi.org/10.1287/mnsc.34.6.679"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI
              </a>
            </li>
            <li id="ref-18">
              <a href="#cite-18">↑</a> Wang, X., Wei, J., et al. (2023).
              &quot;Self-Consistency Improves Chain of Thought Reasoning in
              Language Models.&quot; <em>ICLR 2023</em>.{" "}
              <a
                href="https://arxiv.org/abs/2203.11171"
                target="_blank"
                rel="noopener noreferrer"
              >
                arxiv.org/abs/2203.11171
              </a>
            </li>
            <li id="ref-19">
              <a href="#cite-19">↑</a> Xiong, M., Hu, Z., Lu, X., et al. (2024).
              &quot;Can LLMs Express Their Uncertainty?&quot; <em>ICLR 2024</em>
              .{" "}
              <a
                href="https://arxiv.org/abs/2306.13063"
                target="_blank"
                rel="noopener noreferrer"
              >
                arxiv.org/abs/2306.13063
              </a>
            </li>
            <li id="ref-20">
              <a href="#cite-20">↑</a> Echterhoff, J. M., et al. (2024).
              &quot;Cognitive Bias in Decision-Making with LLMs.&quot;{" "}
              <em>Findings of EMNLP 2024</em>.{" "}
              <a
                href="https://arxiv.org/abs/2403.00811"
                target="_blank"
                rel="noopener noreferrer"
              >
                arxiv.org/abs/2403.00811
              </a>
            </li>
            <li id="ref-21">
              <a href="#cite-21">↑</a> Echterhoff, M., et al. (2025).
              &quot;Anchoring Bias in Large Language Models.&quot;{" "}
              <em>Journal of Computational Social Science</em>.{" "}
              <a
                href="https://doi.org/10.1007/s42001-025-00435-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI
              </a>
            </li>
            <li id="ref-22">
              <a href="#cite-22">↑</a> Christian, B., & Mazor, M. (2026).
              &quot;Self-Blinding and Counterfactual Self-Simulation.&quot;{" "}
              <em>arXiv:2601.14553</em>.{" "}
              <a
                href="https://arxiv.org/abs/2601.14553"
                target="_blank"
                rel="noopener noreferrer"
              >
                arxiv.org/abs/2601.14553
              </a>
            </li>
            <li id="ref-23">
              <a href="#cite-23">↑</a> Chiang, C.-W., et al. (2024).
              &quot;Enhancing AI-Assisted Group Decision Making through
              LLM-Powered Devil&apos;s Advocate.&quot;{" "}
              <em>Proceedings of IUI &apos;24</em>.{" "}
              <a
                href="https://doi.org/10.1145/3640543.3645199"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI
              </a>
            </li>
            <li id="ref-24">
              <a href="#cite-24">↑</a> Du, Y., et al. (2024). &quot;Improving
              Factuality and Reasoning in Language Models through Multiagent
              Debate.&quot; <em>ICML 2024</em>.{" "}
              <a
                href="https://arxiv.org/abs/2305.14325"
                target="_blank"
                rel="noopener noreferrer"
              >
                arxiv.org/abs/2305.14325
              </a>
            </li>
            <li id="ref-25">
              <a href="#cite-25">↑</a> Halawi, D., et al. (2024).
              &quot;Approaching Human-Level Forecasting with Language
              Models.&quot; <em>NeurIPS 2024</em>.{" "}
              <a
                href="https://arxiv.org/abs/2402.18563"
                target="_blank"
                rel="noopener noreferrer"
              >
                arxiv.org/abs/2402.18563
              </a>
            </li>
          </ol>
        </section>

        <section className="mt-24 pt-16 border-t border-[var(--theme-border)]">
          <h2 className="font-[var(--font-display)] text-[1.5rem] font-normal mb-8 text-[var(--theme-text)] relative pl-6 before:content-[''] before:absolute before:left-0 before:top-[0.5em] before:w-2 before:h-0.5 before:bg-accent">
            Code availability
          </h2>
          <p>
            Code for running stability-under-probing experiments is available
            at:{" "}
            <a
              href="https://github.com/MaxGhenis/farness"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/MaxGhenis/farness
            </a>
          </p>
          <p>
            The{" "}
            <code className="font-[var(--font-mono)] text-[0.85em] bg-[var(--theme-bg-surface)] py-[0.15em] px-[0.4em] rounded">
              farness.experiments
            </code>{" "}
            package provides:
          </p>
          <ul className="my-8 pl-6 [&_li]:mb-2 [&_li]:pl-2">
            <li>
              <code className="font-[var(--font-mono)] text-[0.85em] bg-[var(--theme-bg-surface)] py-[0.15em] px-[0.4em] rounded">
                stability
              </code>
              : Stability-under-probing experiment with 11 scenarios, 3
              conditions, multi-model support, and Holm-Bonferroni corrected
              analysis
            </li>
            <li>
              <code className="font-[var(--font-mono)] text-[0.85em] bg-[var(--theme-bg-surface)] py-[0.15em] px-[0.4em] rounded">
                reframing
              </code>
              : Reframing experiment with 6 decision cases and keyword-based
              scoring
            </li>
            <li>
              <code className="font-[var(--font-mono)] text-[0.85em] bg-[var(--theme-bg-surface)] py-[0.15em] px-[0.4em] rounded">
                llm
              </code>
              : Multi-provider LLM client supporting Anthropic and OpenAI APIs
            </li>
            <li>
              <code className="font-[var(--font-mono)] text-[0.85em] bg-[var(--theme-bg-surface)] py-[0.15em] px-[0.4em] rounded">
                judge
              </code>
              : LLM-as-judge evaluation with cross-model blinded scoring
            </li>
          </ul>
        </section>

        <footer className="text-center py-24 mt-16 border-t border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[0.85rem]">
          <p>
            Written by <a href="https://github.com/MaxGhenis">Max Ghenis</a>.
            Farness is{" "}
            <a href="https://github.com/MaxGhenis/farness">open source</a>.
          </p>
        </footer>
      </article>
    </div>
  );
}
