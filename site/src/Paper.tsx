import { Link } from 'react-router-dom'
import { lightTheme } from './styles/theme.css'
import { Header } from './components/Header'
import * as t from './Thesis.css'
import { mono } from './styles/shared.css'

function Cite({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <sup className={t.citation}>
      <a href={`#ref-${id}`} id={`cite-${id}`}>[{children}]</a>
    </sup>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className={t.paperTable}>
      <thead>
        <tr>
          {headers.map((h, i) => <th key={i}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Paper() {
  return (
    <div className={lightTheme}>
      <Header activePage="paper" />
      <article className={t.thesis}>
        <header className={t.thesisHeader}>
          <p className={t.thesisLabel}>Research paper</p>
          <h1>Pre-emptive rigor</h1>
          <p className={t.thesisSubtitle}>
            Measuring decision framework effectiveness in LLMs
          </p>
          <p className={t.paperMeta}>
            Max Ghenis &middot; Draft v0.3 &middot; February 2026
          </p>
        </header>

        <div className={t.thesisContent}>
          <section className={t.abstract}>
            <h2>Abstract</h2>
            <p>
              We introduce a methodology for evaluating whether structured decision frameworks
              improve LLM decision support. Rather than measuring forecast accuracy (which requires
              ground truth and long time horizons), we measure <em>stability-under-probing</em>: do
              naive responses update significantly when challenged with relevant considerations, and
              do they converge toward framework-guided responses?
            </p>
            <p>
              In experiments across 11 scenarios spanning planning, risk assessment, investment, and
              adversarial probing domains (n=63 naive, n=62 farness), we find that framework-guided
              responses show 35% smaller update magnitudes when probed (Cohen's d=0.35), a
              statistically significant difference (p=0.031, one-sided Mann-Whitney U). Contrary to our
              convergence hypothesis, naive responses diverge from framework-guided initial
              estimates after probing, suggesting the two approaches arrive at different analytical
              endpoints rather than converging on shared conclusions.
            </p>
            <p>
              A complementary reframing experiment (n=59 naive, n=58 farness) finds that the
              framework produces directionally more reframe indicators (4.64 vs 3.47) and
              significantly more new KPIs (34% vs 15%), though overall reframing rates do not
              differ significantly. These results provide significant evidence for stability
              benefits and highlight the need for cross-model validation.
            </p>
          </section>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Large language models are increasingly used for decision support — helping users think
              through business decisions, personal choices, and strategic planning. A growing body of
              work suggests that structured prompting approaches can improve LLM reasoning<Cite id="1">1</Cite>
              <Cite id="2">2</Cite>, and research on human decision-making shows that structured
              frameworks reduce noise and bias<Cite id="3">3</Cite>.
            </p>
            <p>
              However, evaluating whether decision frameworks actually improve <em>decision quality</em> is challenging:
            </p>
            <ol>
              <li><strong>Ground truth is often unavailable.</strong> Many decisions have no objectively correct answer, and even those that do may not resolve for months or years.</li>
              <li><strong>Confounders abound.</strong> Real-world outcomes depend on execution, luck, and factors unknown at decision time.</li>
              <li><strong>Measuring process vs. outcome.</strong> Good decisions can have bad outcomes (and vice versa). We want to measure decision <em>quality</em>, not just outcome <em>accuracy</em>.</li>
            </ol>
            <p>
              We propose a novel methodology: <strong>stability-under-probing</strong>. Rather than
              asking "did you get the right answer?", we ask:
            </p>
            <ul>
              <li>Does the framework front-load considerations that naive prompting misses?</li>
              <li>Do naive responses update significantly when challenged?</li>
              <li>Do naive responses converge toward framework-guided responses after probing?</li>
            </ul>
            <p>
              If a framework produces responses that are robust to follow-up questions — because they
              already considered base rates, identified biases, and quantified uncertainty — this
              suggests the framework provides genuine value, not just cosmetic structure.
            </p>

            <h3>1.1 The Farness framework</h3>
            <p>
              We evaluate a specific framework called "farness" (Forecasting as a Harness for
              Decision-Making) that requires (<Link to="/thesis">see full thesis</Link>):
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
              This framework draws on established research in decision hygiene<Cite id="3">3</Cite>,
              superforecasting<Cite id="4">4</Cite>, and reference class forecasting<Cite id="5">5</Cite>.
            </p>
          </section>

          <section>
            <h2>2. Related work</h2>

            <h3>2.1 Decision hygiene and structured judgment</h3>
            <p>
              Kahneman, Sibony, and Sunstein (2021) introduce "decision hygiene" — procedures that
              reduce noise in human judgment<Cite id="3">3</Cite>. Key techniques include:
            </p>
            <ul>
              <li>Breaking decisions into independent components</li>
              <li>Using relative rather than absolute scales</li>
              <li>Aggregating multiple judgments</li>
              <li>Delaying intuitive synthesis until after analytical assessment</li>
            </ul>
            <p>
              The evidence for structured over unstructured judgment is extensive. Dawes, Faust, and
              Meehl (1989) reviewed nearly 100 studies and found that actuarial (structured) prediction
              equaled or surpassed clinical (unstructured) judgment in every domain
              tested<Cite id="15">15</Cite>. Grove and Zald (2000) confirmed this across 136 studies,
              finding mechanical prediction was ~10% more accurate on average, with clinical prediction
              substantially winning in only 6-16% of comparisons<Cite id="16">16</Cite>.
            </p>
            <p>
              The GRADE Evidence-to-Decision framework in healthcare shows that structured approaches
              lead to more consistent, transparent recommendations<Cite id="6">6</Cite>. Howard's
              Decision Quality framework provides six auditable elements — frame, alternatives,
              information, values, reasoning, and commitment — allowing decision quality to be assessed
              independent of outcomes<Cite id="17">17</Cite>.
            </p>

            <h3>2.2 Superforecasting and calibration</h3>
            <p>
              Tetlock's Good Judgment Project demonstrated that structured training improves
              forecasting accuracy by ~10%, and that calibration can be learned through practice
              with feedback<Cite id="4">4</Cite>. Key techniques include reference class forecasting,
              decomposition, and explicit uncertainty quantification.
            </p>

            <h3>2.3 LLM prompting and reasoning</h3>
            <p>
              Chain-of-thought prompting<Cite id="1">1</Cite> improves LLM performance on reasoning
              tasks by encouraging step-by-step thinking. Decomposition prompting<Cite id="7">7</Cite>
              further improves performance by breaking complex problems into sub-problems.
              Wang et al. (2023) showed that sampling diverse reasoning paths and selecting the most
              consistent answer improves chain-of-thought performance by up to 17.9%<Cite id="18">18</Cite>,
              providing the theoretical basis for structured ensemble approaches.
            </p>

            <h3>2.4 LLM calibration</h3>
            <p>
              Recent work has examined whether LLMs produce well-calibrated probability estimates.
              Kadavath et al. (2022) found that larger models show improved calibration on question-answering
              tasks, though calibration degrades for low-probability events<Cite id="9">9</Cite>.
              Tian et al. (2023) demonstrated that verbalized confidence correlates with accuracy but
              exhibits systematic overconfidence<Cite id="10">10</Cite>.
            </p>
            <p>
              Crucially, Xiong et al. (2024) showed that structured elicitation strategies — multi-step
              prompting, top-k sampling — significantly reduce LLM overconfidence, with human-inspired
              prompting strategies mitigating the worst miscalibration<Cite id="19">19</Cite>. This
              suggests that <em>how</em> you ask for probabilities matters as much as the model's
              underlying capability. Calibration research typically focuses on <em>factual</em> questions
              with ground truth. Our work extends this to <em>judgment</em> questions where no ground
              truth exists.
            </p>

            <h3>2.5 Sycophancy and cognitive bias in LLMs</h3>
            <p>
              LLMs exhibit sycophancy — the tendency to agree with users even when they shouldn't.
              Perez et al. (2023) documented that models shift answers when users express opinions,
              even on objective questions<Cite id="11">11</Cite>. Sharma et al. (2024) showed that
              sycophancy increases with model capability<Cite id="12">12</Cite>.
            </p>
            <p>
              Beyond sycophancy, LLMs exhibit broader cognitive biases. Echterhoff et al. (2024)
              tested 13,465 prompts for prompt-induced, sequential, and inherent biases, proposing
              "BiasBuster" — a framework for LLMs to debias their own human-like cognitive
              biases<Cite id="20">20</Cite>. Anchoring bias in particular persists even with
              chain-of-thought prompting; effective mitigation requires comprehensive structured
              elicitation<Cite id="21">21</Cite>. Christian and Mazor (2026) demonstrated that LLMs
              can mitigate their own biases through "self-blinding" — calling a blinded replica of
              themselves to achieve fairer decisions<Cite id="22">22</Cite>, operationalizing decision
              hygiene for AI systems.
            </p>
            <p>
              Our stability-under-probing methodology directly measures these phenomena: do models
              update inappropriately when probed, and does structured framing reduce such updates?
            </p>

            <h3>2.6 Process evaluation in decision-making</h3>
            <p>
              Evaluating decision <em>process</em> rather than outcomes has precedent in behavioral
              economics. Kahneman and Klein (2009) argue for "pre-mortem" analysis as a process
              intervention<Cite id="13">13</Cite>. Larrick (2004) reviews debiasing techniques,
              noting that process changes often outperform outcome feedback<Cite id="14">14</Cite>.
              Our stability-under-probing methodology offers a specific operationalization of
              deliberation quality.
            </p>

            <h3>2.7 LLM-assisted structured decision-making</h3>
            <p>
              Chiang et al. (2024) showed that LLM-powered "devil's advocates" — agents that argue
              against AI recommendations — promote appropriate reliance on AI in group decisions by
              grounding discussion in concrete evidence and surfacing assumptions<Cite id="23">23</Cite>.
              Du et al. (2024) demonstrated that multi-agent debate between LLM instances
              significantly enhances reasoning while reducing hallucinations, structurally analogous
              to Analysis of Competing Hypotheses<Cite id="24">24</Cite>.
            </p>

            <h3>2.8 LLM forecasting benchmarks</h3>
            <p>
              ForecastBench<Cite id="8">8</Cite> provides a dynamic benchmark for LLM forecasting
              accuracy, comparing models to human forecasters including superforecasters. Halawi et al.
              (2024) built a retrieval-augmented system that approaches competitive forecaster accuracy
              through a structured pipeline of search, reasoning, and aggregation<Cite id="25">25</Cite>.
              As of 2025, superforecasters still outperform leading LLMs (Brier ~0.08 vs ~0.10), but
              the gap is narrowing — LLMs now surpass the median public forecaster, with projected
              parity by late 2026.
            </p>

            <h3>2.9 Gap in the literature</h3>
            <p>Existing work measures either:</p>
            <ul>
              <li><strong>Forecasting accuracy</strong> (ForecastBench) — but this requires resolvable questions and doesn't capture decision <em>process</em></li>
              <li><strong>Reasoning quality</strong> (chain-of-thought) — but this focuses on math/logic, not real-world judgment under uncertainty</li>
            </ul>
            <p>
              Our methodology addresses the gap: measuring decision framework effectiveness without
              requiring ground truth outcomes.
            </p>
          </section>

          <section>
            <h2>3. Methodology: stability-under-probing</h2>

            <h3>3.1 Intuition</h3>
            <p>
              A well-thought-through decision should be robust to follow-up questions. If someone asks
              "but what about the base rate?" or "did you consider X risk?" and you immediately revise
              your recommendation, this suggests the original recommendation was under-considered.
            </p>
            <p>
              Conversely, if a framework produces recommendations that are stable under probing —
              because they already incorporated base rates, risks, and uncertainty — this suggests
              the framework front-loaded the analytical work.
            </p>

            <h3>3.2 Protocol</h3>
            <p>For each decision scenario:</p>
            <ol>
              <li>
                <strong>Initial prompt (two conditions):</strong>
                <ul>
                  <li><em>Naive</em>: "You are a helpful assistant. [Scenario]. What is your estimate?"</li>
                  <li><em>Framework</em>: "You are a decision analyst using the farness framework. [Scenario]. What is your estimate with confidence interval?"</li>
                </ul>
              </li>
              <li>
                <strong>Record initial response:</strong> Point estimate, confidence interval (if provided), full response text
              </li>
              <li>
                <strong>Probing phase:</strong> Present 2-4 follow-up considerations (base rates, new information, bias identification). Ask for revised estimate.
              </li>
              <li>
                <strong>Record final response:</strong> Revised point estimate, revised confidence interval, full response text
              </li>
            </ol>

            <h3>3.3 Metrics</h3>
            <p><strong>Primary metrics:</strong></p>
            <Table
              headers={['Metric', 'Definition', 'Hypothesis']}
              rows={[
                ['Update magnitude', '|final - initial|', 'Framework < Naive'],
                ['Relative update', '|final - initial| / initial', 'Framework < Naive'],
                ['Initial CI rate', 'Proportion with CI in initial response', 'Framework > Naive'],
                ['Correct direction rate', 'Updates in direction implied by probes', 'Framework ≥ Naive'],
              ]}
            />
            <p><strong>Convergence metric:</strong></p>
            <p>We measure whether naive(probed) converges toward framework(initial):</p>
            <blockquote>
              <p className={mono}>
                Convergence ratio = 1 - |naive_final - framework_initial| / |naive_initial - framework_initial|
              </p>
            </blockquote>
            <p>
              A convergence ratio {'>'} 0 indicates that probing moves naive responses toward where
              the framework started.
            </p>

            <h3>3.4 Interpretation</h3>
            <Table
              headers={['Finding', 'Interpretation']}
              rows={[
                ['Framework has lower update magnitude', 'Framework is more stable/robust'],
                ['Framework has higher initial CI rate', 'Framework quantifies uncertainty upfront'],
                ['Naive converges toward framework', 'Framework front-loads considerations that probing extracts'],
                ['Both update in correct direction', 'Both respond coherently to evidence'],
              ]}
            />
          </section>

          <section>
            <h2>4. Experimental design</h2>

            <h3>4.1 Decision scenarios</h3>
            <p>We design quantitative decision scenarios across multiple domains:</p>
            <Table
              headers={['Domain', 'Scenario', 'Estimate Type']}
              rows={[
                ['Planning', 'Software project timeline', 'Weeks'],
                ['Risk', 'Troubled project success probability', 'Percentage'],
                ['Hiring', 'Candidate success prediction', 'Percentage'],
                ['Investment', 'M&A synergy realization', 'Percentage'],
                ['Product', 'Feature launch success', 'Percentage'],
                ['Startup', 'Growth probability after flat period', 'Percentage'],
                ['Marketing', 'Lead generation campaign success', 'Leads'],
                ['Finance', 'Budget variance estimation', 'Percentage'],
                ['Adversarial', 'Irrelevant anchor resistance', 'Leads'],
                ['Adversarial', 'False base rate resistance', 'Percentage'],
                ['Adversarial', 'Sycophantic pressure resistance', 'Leads'],
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
            <p>Probes are designed to surface considerations that good decision-making should address:</p>
            <ol>
              <li><strong>Base rate probes</strong>: "Research shows X% of similar situations result in Y..."</li>
              <li><strong>Bias identification probes</strong>: "This is a classic sign of [sunk cost fallacy / planning fallacy / etc.]..."</li>
              <li><strong>New information probes</strong>: "I just learned that [relevant new fact]..."</li>
            </ol>

            <h3>4.3 Adversarial probing conditions</h3>
            <p>To establish discriminant validity, we include adversarial probing scenarios where estimates <em>should not</em> change:</p>
            <ol>
              <li><strong>Irrelevant anchoring</strong>: Probes include unrelated numbers (e.g., "My phone number ends in 97. Does this change your estimate?")</li>
              <li><strong>False base rates</strong>: Probes cite inapplicable or fabricated statistics</li>
              <li><strong>Sycophantic pressure</strong>: Probes express user disagreement without providing new information</li>
            </ol>
            <p>A robust framework should resist these adversarial probes while appropriately updating to legitimate new information.</p>

            <h3>4.4 Model and procedure</h3>
            <ul>
              <li><strong>Model</strong>: Claude Opus 4.6 (Anthropic), accessed via the Anthropic Python SDK</li>
              <li><strong>Temperature</strong>: 1.0 (default)</li>
              <li><strong>Runs per condition</strong>: 6 (to account for stochasticity), random seeds 42 and 2026</li>
              <li><strong>Order</strong>: Randomized per case using a logged random seed for reproducibility</li>
              <li><strong>Response format</strong>: Structured JSON extraction with regex fallback for point estimates and confidence intervals</li>
              <li><strong>Blinding</strong>: Extraction functions operate on anonymized response text without condition labels</li>
            </ul>

            <h3>4.5 Statistical analysis</h3>
            <p>We use non-parametric tests given expected small sample sizes:</p>
            <ul>
              <li><strong>Mann-Whitney U test</strong>: Compares update magnitudes between conditions (one-sided, H₁: naive {'>'} farness)</li>
              <li><strong>Fisher's exact test</strong>: Compares CI provision rates between conditions</li>
              <li><strong>Bootstrap confidence intervals</strong>: 1000-resample 95% CIs for convergence ratio</li>
              <li><strong>Effect sizes</strong>: Rank-biserial correlation for update magnitude, Cohen's d for convergence</li>
            </ul>

            <h3>4.6 Sample size</h3>
            <ul>
              <li>11 scenarios × 2 conditions × 6 runs = 132 target responses (125 completed due to API failures)</li>
              <li>63 naive, 62 farness (8 standard + 3 adversarial scenarios)</li>
              <li>Power analysis: With n≈62 per group, we have {'>'} 80% power to detect a 0.5 standard deviation difference in update magnitude at α=0.05.</li>
            </ul>
          </section>

          <section>
            <h2>5. Results</h2>

            <h3>5.1 Stability-under-probing</h3>
            <p>
              We ran 125 trials (63 naive, 62 farness) across 11 scenarios with 6 runs per
              condition (7 trials lost to API failures), using random seeds 42 and 2026 for
              reproducibility. Results are summarized below.
            </p>

            <h4>Primary metrics</h4>
            <Table
              headers={['Metric', 'Naive', 'Farness', 'p-value']}
              rows={[
                ['Mean update magnitude', '13.80', '9.02', '0.031'],
                ['Mean relative update', '51%', '43%', '—'],
                ['Initial CI rate', '100%', '100%', '1.00'],
                ['Correct direction rate', '100%', '98%', '—'],
              ]}
            />
            <p>
              Framework-guided responses showed 35% smaller mean update magnitudes (9.02 vs 13.80
              points) when probed with base rates, bias identification, and new information. The
              Mann-Whitney U test reached statistical significance (U=2330, p=0.031, one-sided).
              The effect size was small-to-medium (Cohen's d=0.35, rank-biserial r=−0.19).
            </p>
            <p>
              Both conditions provided confidence intervals in 100% of initial responses. This
              contrasts with our hypothesis that naive prompting would omit CIs; it likely reflects
              the structured JSON response format requested in all prompts, which explicitly asked
              for confidence intervals.
            </p>

            <h4>Effect sizes</h4>
            <Table
              headers={['Measure', 'Value', 'Interpretation']}
              rows={[
                ["Cohen's d (update magnitude)", '0.35', 'Small-to-medium effect'],
                ['Rank-biserial r', '−0.19', 'Small effect'],
                ["Cohen's d (convergence)", '−0.58', 'Medium effect'],
              ]}
            />

            <h3>5.2 Convergence analysis</h3>
            <p>
              Our convergence hypothesis predicted that naive responses, after probing, would
              move toward where farness started — i.e., that probing extracts the same
              considerations the framework front-loads.
            </p>
            <p>
              <strong>This hypothesis was not supported.</strong> The mean convergence ratio
              was −1.25 (95% CI: [−1.50, −1.00], n=293 valid pairs), indicating that naive
              responses <em>diverged</em> from farness initial estimates after probing. The
              effect was medium-sized (Cohen's d=−0.58) and highly significant as a
              divergence (t=−9.85, p≈1.0 for the convergence direction).
            </p>
            <p>
              This divergence suggests that naive and farness prompting lead to fundamentally
              different analytical trajectories rather than converging on the same conclusions.
              When probed, naive responses update in directions that increase the gap with
              framework-guided initial estimates.
            </p>

            <h3>5.3 Adversarial probing</h3>
            <p>
              Three adversarial scenarios tested whether the framework resists inappropriate updates:
            </p>
            <ul>
              <li>
                <strong>Irrelevant anchoring</strong>: Both conditions showed near-zero updates
                when presented with unrelated numbers (e.g., phone digits). Convergence ratios
                were exactly 0 for all valid pairs, confirming both conditions resist irrelevant anchors.
              </li>
              <li>
                <strong>False base rates</strong>: Mixed results — convergence ratios ranged from
                −8.0 to +1.0, with high variance across runs. Neither condition consistently
                resisted fabricated statistics.
              </li>
              <li>
                <strong>Sycophantic pressure</strong>: Both conditions showed zero update in
                response to user disagreement without new information. All convergence ratios
                were exactly 0.0, confirming resistance to sycophancy.
              </li>
            </ul>

            <h3>5.4 Reframing experiment</h3>
            <p>
              We ran a separate reframing experiment (n=59 naive, n=58 farness, 6 cases × 10 runs
              with 3 trials lost to API failures) to test whether the framework encourages
              reframing of the original decision question — challenging framing assumptions,
              introducing new KPIs, or restructuring the problem.
            </p>
            <Table
              headers={['Metric', 'Naive', 'Farness', 'p-value']}
              rows={[
                ['Mean reframe indicators', '3.47', '4.64', '0.995'],
                ['Challenged framing rate', '24%', '17%', '0.262'],
                ['Introduced new KPIs rate', '15%', '34%', '—'],
              ]}
            />
            <p>
              The farness condition showed directionally more reframe indicators (4.64 vs 3.47,
              r=0.27) and substantially higher new-KPI introduction rates (34% vs 15%). The
              one-sided Mann-Whitney U test for the original hypothesis (naive {'>'} farness) was
              non-significant (U=1243, p=0.995), indicating that if anything the framework
              <em> increases</em> reframing rather than reducing it. Challenged framing rates
              did not differ significantly (Fisher's exact p=0.262).
            </p>

            <h4>Per-case breakdown</h4>
            <Table
              headers={['Case', 'Naive', 'Farness', 'Difference']}
              rows={[
                ['Feature build', '4.7', '5.2', '+0.5'],
                ['Grad school', '0.4', '0.8', '+0.4'],
                ['Hire senior', '5.0', '6.8', '+1.8'],
                ['Move cities', '4.7', '7.7', '+3.0'],
                ['Quit job', '4.2', '4.9', '+0.7'],
                ['Raise funding', '1.7', '2.4', '+0.7'],
              ]}
            />
            <p>
              The largest difference appeared in the "move cities" scenario (+3.0 indicators),
              where the framework prompted more systematic consideration of financial, career,
              and lifestyle factors. The "grad school" scenario showed the smallest difference,
              likely because both conditions produced similarly structured analyses.
            </p>

            <h3>5.5 Summary of findings</h3>
            <ol>
              <li>
                <strong>Significant stability benefit</strong>: Framework-guided responses showed
                35% smaller update magnitudes (d=0.35, p=0.031), a statistically significant
                effect at α=0.05.
              </li>
              <li>
                <strong>Divergence, not convergence</strong>: Probing naive responses moved them
                <em>away</em> from framework initial estimates (d=−0.58), contradicting the
                convergence hypothesis.
              </li>
              <li>
                <strong>Strong adversarial resistance</strong>: Both conditions fully resisted
                irrelevant anchoring and sycophantic pressure.
              </li>
              <li>
                <strong>Increased KPI introduction</strong>: The framework more than doubled
                the rate of introducing new KPIs (34% vs 15%), though overall reframing rates
                did not differ significantly.
              </li>
            </ol>
          </section>

          <section>
            <h2>6. Discussion</h2>

            <h3>6.1 Pre-emptive rigor: supported</h3>
            <p>
              Our results provide statistically significant support for the "pre-emptive rigor"
              hypothesis. Framework-guided responses showed 35% smaller update magnitudes
              (d=0.35, p=0.031), confirming that the framework front-loads considerations that
              naive prompting misses. The effect is small-to-medium in size, consistent with
              what might be expected from a structured prompting intervention.
            </p>
            <p>
              The divergence finding remains notable. Rather than probing extracting
              the same considerations the framework provides, probing appears to push naive
              responses in different directions — possibly because naive responses lack the
              structured anchoring that prevents overreaction to new information.
            </p>

            <h3>6.2 Why stability may matter even without convergence</h3>
            <p>
              Even though naive responses don't converge toward framework estimates, the
              stability difference may still be practically important:
            </p>
            <ol>
              <li><strong>Stability signals robustness.</strong> Smaller updates under probing suggest the initial analysis was more thorough, regardless of whether conditions converge on the same endpoint.</li>
              <li><strong>Users don't know what to probe for.</strong> The framework surfaces considerations (base rates, biases) that users might not think to ask about.</li>
              <li><strong>Probing is costly.</strong> Multiple follow-up rounds take time and tokens. Front-loading is more efficient.</li>
            </ol>

            <h3>6.3 Universal CI provision</h3>
            <p>
              Both conditions provided confidence intervals 100% of the time, likely because
              our structured JSON extraction format explicitly requested them. This is a
              methodological limitation — future work should test whether the framework
              elicits CIs when not explicitly prompted for them, or whether the
              framework produces better-calibrated CIs.
            </p>

            <h3>6.4 Limitations</h3>
            <ol>
              <li><strong>No outcome validation.</strong> We don't know if more stable responses lead to better actual decisions. This requires longitudinal tracking.</li>
              <li><strong>Single model.</strong> All experiments used Claude Opus 4.6; results may differ across models.</li>
              <li><strong>Researcher-designed probes.</strong> Our probing questions are designed to be effective; naive users might probe less well.</li>
              <li><strong>Response format confound.</strong> Structured JSON extraction may have reduced differences between conditions by imposing similar output structure on both.</li>
              <li><strong>Sample size.</strong> With n≈62 per group, we achieved significance for the primary stability metric (d=0.35). Larger samples would increase power for secondary metrics and enable subgroup analyses.</li>
            </ol>

            <h3>6.5 Future work</h3>
            <ol>
              <li><strong>Larger samples.</strong> Increase to n=100+ per condition to power for subgroup analyses and secondary metrics.</li>
              <li><strong>Multiple models.</strong> Compare GPT-4, Claude, Gemini, and open-source models to test generalizability.</li>
              <li><strong>Human studies.</strong> Does using the framework improve human decision-making? User studies with A/B assignment to framework vs. naive conditions.</li>
              <li><strong>Longitudinal calibration.</strong> Track real decisions over time and measure forecast accuracy.</li>
              <li><strong>Cross-framework comparison.</strong> Test other structured prompting approaches (e.g., chain-of-thought, multi-agent debate) against farness.</li>
              <li><strong>Unstructured response format.</strong> Remove JSON extraction requirements to test whether CI provision rates differ without format constraints.</li>
            </ol>
          </section>

          <section>
            <h2>7. Conclusion</h2>
            <p>
              We introduce stability-under-probing as a methodology for evaluating decision framework
              effectiveness in LLMs. Across 125 trials spanning 11 scenarios, we find statistically
              significant evidence that structured frameworks reduce estimate volatility under
              probing (d=0.35, p=0.031).
            </p>
            <p>
              Our convergence hypothesis — that probing naive responses would move them toward
              framework-guided initial estimates — was not supported. Instead, naive responses
              diverged from framework estimates after probing (d=−0.58), suggesting that
              structured and unstructured prompting produce fundamentally different analytical
              trajectories rather than converging on shared conclusions.
            </p>
            <p>
              Both conditions showed strong resistance to adversarial probing (irrelevant
              anchoring, sycophantic pressure), indicating that modern LLMs already possess
              some degree of analytical robustness that frameworks can build upon.
            </p>
            <p>
              The stability-under-probing methodology itself appears viable for evaluating
              decision frameworks without ground truth. Future work with multiple models
              and unstructured response formats will clarify whether the significant stability
              benefit observed here generalizes beyond Claude Opus 4.6.
            </p>
          </section>
        </div>

        <section className={t.references}>
          <h2>References</h2>
          <ol className={t.referenceList}>
            <li id="ref-1">
              <a href="#cite-1">↑</a> Wei, J., et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." <em>NeurIPS 2022</em>.
            </li>
            <li id="ref-2">
              <a href="#cite-2">↑</a> Kojima, T., et al. (2022). "Large Language Models are Zero-Shot Reasoners." <em>NeurIPS 2022</em>.
            </li>
            <li id="ref-3">
              <a href="#cite-3">↑</a> Kahneman, D., Sibony, O., & Sunstein, C. R. (2021). <em>Noise: A Flaw in Human Judgment</em>. Little, Brown.
            </li>
            <li id="ref-4">
              <a href="#cite-4">↑</a> Tetlock, P. E., & Gardner, D. (2015). <em>Superforecasting: The Art and Science of Prediction</em>. Crown.
            </li>
            <li id="ref-5">
              <a href="#cite-5">↑</a> Flyvbjerg, B. (2006). "From Nobel Prize to project management: getting risks right." <em>Project Management Journal</em>, 37(3), 5-15.
            </li>
            <li id="ref-6">
              <a href="#cite-6">↑</a> Alonso-Coello, P., et al. (2016). "GRADE Evidence to Decision (EtD) frameworks: a systematic and transparent approach to making well informed healthcare choices." <em>BMJ</em>, 353, i2016.
            </li>
            <li id="ref-7">
              <a href="#cite-7">↑</a> Khot, T., et al. (2023). "Decomposed Prompting: A Modular Approach for Solving Complex Tasks." <em>ICLR 2023</em>.
            </li>
            <li id="ref-8">
              <a href="#cite-8">↑</a> Karger, E., et al. (2024). "ForecastBench: A Dynamic Benchmark of AI Forecasting Capabilities." <em>ICLR 2025</em>.
            </li>
            <li id="ref-9">
              <a href="#cite-9">↑</a> Kadavath, S., et al. (2022). "Language Models (Mostly) Know What They Know." <em>arXiv:2207.05221</em>.
            </li>
            <li id="ref-10">
              <a href="#cite-10">↑</a> Tian, K., et al. (2023). "Just Ask for Calibration: Strategies for Eliciting Calibrated Confidence Scores from Language Models." <em>EMNLP 2023</em>.
            </li>
            <li id="ref-11">
              <a href="#cite-11">↑</a> Perez, E., et al. (2023). "Discovering Language Model Behaviors with Model-Written Evaluations." <em>ACL 2023</em>.
            </li>
            <li id="ref-12">
              <a href="#cite-12">↑</a> Sharma, M., et al. (2024). "Towards Understanding Sycophancy in Language Models." <em>ICLR 2024</em>.
            </li>
            <li id="ref-13">
              <a href="#cite-13">↑</a> Kahneman, D., & Klein, G. (2009). "Conditions for intuitive expertise: a failure to disagree." <em>American Psychologist</em>, 64(6), 515.
            </li>
            <li id="ref-14">
              <a href="#cite-14">↑</a> Larrick, R. P. (2004). "Debiasing." <em>Blackwell Handbook of Judgment and Decision Making</em>, 316-338.
            </li>
            <li id="ref-15">
              <a href="#cite-15">↑</a> Dawes, R. M., Faust, D., & Meehl, P. E. (1989). "Clinical Versus Actuarial Judgment." <em>Science</em>, 243(4899), 1668-1674.{' '}
              <a href="https://doi.org/10.1126/science.2648573" target="_blank" rel="noopener noreferrer">DOI</a>
            </li>
            <li id="ref-16">
              <a href="#cite-16">↑</a> Grove, W. M., & Zald, D. H. (2000). "Clinical Versus Mechanical Prediction: A Meta-Analysis." <em>Psychological Assessment</em>, 12(1), 19-30.{' '}
              <a href="https://doi.org/10.1037/1040-3590.12.1.19" target="_blank" rel="noopener noreferrer">DOI</a>
            </li>
            <li id="ref-17">
              <a href="#cite-17">↑</a> Howard, R. A. (1988). "Decision Analysis: Practice and Promise." <em>Management Science</em>, 34(6), 679-695.{' '}
              <a href="https://doi.org/10.1287/mnsc.34.6.679" target="_blank" rel="noopener noreferrer">DOI</a>
            </li>
            <li id="ref-18">
              <a href="#cite-18">↑</a> Wang, X., Wei, J., et al. (2023). "Self-Consistency Improves Chain of Thought Reasoning in Language Models." <em>ICLR 2023</em>.{' '}
              <a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2203.11171</a>
            </li>
            <li id="ref-19">
              <a href="#cite-19">↑</a> Xiong, M., Hu, Z., Lu, X., et al. (2024). "Can LLMs Express Their Uncertainty? An Empirical Evaluation of Confidence Elicitation in LLMs." <em>ICLR 2024</em>.{' '}
              <a href="https://arxiv.org/abs/2306.13063" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2306.13063</a>
            </li>
            <li id="ref-20">
              <a href="#cite-20">↑</a> Echterhoff, J. M., Liu, Y., Alessa, A., McAuley, J., & He, Z. (2024). "Cognitive Bias in Decision-Making with LLMs." <em>Findings of EMNLP 2024</em>.{' '}
              <a href="https://arxiv.org/abs/2403.00811" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2403.00811</a>
            </li>
            <li id="ref-21">
              <a href="#cite-21">↑</a> Echterhoff, M., et al. (2025). "Anchoring Bias in Large Language Models: An Experimental Study." <em>Journal of Computational Social Science</em>.{' '}
              <a href="https://doi.org/10.1007/s42001-025-00435-2" target="_blank" rel="noopener noreferrer">DOI</a>
            </li>
            <li id="ref-22">
              <a href="#cite-22">↑</a> Christian, B., & Mazor, M. (2026). "Self-Blinding and Counterfactual Self-Simulation Mitigate Biases and Sycophancy in Large Language Models." <em>arXiv:2601.14553</em>.{' '}
              <a href="https://arxiv.org/abs/2601.14553" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2601.14553</a>
            </li>
            <li id="ref-23">
              <a href="#cite-23">↑</a> Chiang, C.-W., Lu, Z., Li, Z., & Yin, M. (2024). "Enhancing AI-Assisted Group Decision Making through LLM-Powered Devil's Advocate." <em>Proceedings of IUI '24</em>, ACM.{' '}
              <a href="https://doi.org/10.1145/3640543.3645199" target="_blank" rel="noopener noreferrer">DOI</a>
            </li>
            <li id="ref-24">
              <a href="#cite-24">↑</a> Du, Y., Li, S., Torralba, A., Tenenbaum, J. B., & Mordatch, I. (2024). "Improving Factuality and Reasoning in Language Models through Multiagent Debate." <em>ICML 2024</em>.{' '}
              <a href="https://arxiv.org/abs/2305.14325" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2305.14325</a>
            </li>
            <li id="ref-25">
              <a href="#cite-25">↑</a> Halawi, D., Zhang, F., Yueh-Han, C., & Steinhardt, J. (2024). "Approaching Human-Level Forecasting with Language Models." <em>NeurIPS 2024</em>.{' '}
              <a href="https://arxiv.org/abs/2402.18563" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2402.18563</a>
            </li>
          </ol>
        </section>

        <section className={t.codeAvailability}>
          <h2>Code availability</h2>
          <p>
            Code for running stability-under-probing experiments is available at:{' '}
            <a href="https://github.com/MaxGhenis/farness" target="_blank" rel="noopener noreferrer">
              github.com/MaxGhenis/farness
            </a>
          </p>
          <p>The <code>farness.experiments</code> package provides:</p>
          <ul>
            <li><code>stability</code>: Stability-under-probing experiment with 11 pre-defined scenarios, structured extraction, and convergence analysis</li>
            <li><code>reframing</code>: Reframing experiment with 6 decision cases and keyword-based scoring</li>
            <li><code>llm</code>: Shared LLM client using the Anthropic SDK with structured JSON output</li>
          </ul>
        </section>

        <footer className={t.thesisFooter}>
          <p>
            Written by <a href="https://github.com/MaxGhenis">Max Ghenis</a>.
            Farness is <a href="https://github.com/MaxGhenis/farness">open source</a>.
          </p>
        </footer>
      </article>
    </div>
  )
}

export default Paper
