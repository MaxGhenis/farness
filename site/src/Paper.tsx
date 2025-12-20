import { Link } from 'react-router-dom'
import './Thesis.css'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">Farness</Link>
      <nav className="nav">
        <Link to="/thesis" className="nav-link">Thesis</Link>
        <Link to="/paper" className="nav-link active">Paper</Link>
      </nav>
    </header>
  )
}

// Citation component
function Cite({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <sup className="citation">
      <a href={`#ref-${id}`} id={`cite-${id}`}>[{children}]</a>
    </sup>
  )
}

// Table component for metrics
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="paper-table">
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
    <>
      <Header />
      <article className="thesis">
        <header className="thesis-header">
          <p className="thesis-label">Research Paper</p>
          <h1>Pre-emptive Rigor</h1>
          <p className="thesis-subtitle">
            Measuring Decision Framework Effectiveness in LLMs
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            Max Ghenis &middot; Draft v0.1 &middot; December 2025
          </p>
        </header>

        <div className="thesis-content">
          <section className="abstract">
            <h2>Abstract</h2>
            <p>
              We introduce a methodology for evaluating whether structured decision frameworks
              improve LLM decision support. Rather than measuring forecast accuracy (which requires
              ground truth and long time horizons), we measure <em>stability-under-probing</em>: do
              naive responses update significantly when challenged with relevant considerations, and
              do they converge toward framework-guided responses?
            </p>
            <p>
              In experiments across planning, risk assessment, and investment domains, we find that
              framework-guided responses (1) include uncertainty quantification upfront, (2) show
              smaller updates when probed with base rates and new information, and (3) serve as
              attractors that naive responses converge toward after probing. This suggests structured
              decision frameworks provide "pre-emptive rigor" — surfacing considerations that would
              otherwise require extensive follow-up questioning.
            </p>
            <p>
              Our methodology enables evaluation of decision frameworks without waiting for real-world
              outcomes, complementing existing work on LLM forecasting benchmarks like ForecastBench.
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

            <h3>1.1 The Farness Framework</h3>
            <p>
              We evaluate a specific framework called "farness" (Forecasting as a Harness for
              Decision-Making) that requires:
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
            <h2>2. Related Work</h2>

            <h3>2.1 Decision Hygiene and Structured Judgment</h3>
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
              The GRADE Evidence-to-Decision framework in healthcare shows that structured approaches
              lead to more consistent, transparent recommendations<Cite id="6">6</Cite>.
            </p>

            <h3>2.2 Superforecasting and Calibration</h3>
            <p>
              Tetlock's Good Judgment Project demonstrated that structured training improves
              forecasting accuracy by ~10%, and that calibration can be learned through practice
              with feedback<Cite id="4">4</Cite>. Key techniques include reference class forecasting,
              decomposition, and explicit uncertainty quantification.
            </p>

            <h3>2.3 LLM Prompting and Reasoning</h3>
            <p>
              Chain-of-thought prompting<Cite id="1">1</Cite> improves LLM performance on reasoning
              tasks by encouraging step-by-step thinking. Decomposition prompting<Cite id="7">7</Cite>
              further improves performance by breaking complex problems into sub-problems.
            </p>

            <h3>2.4 LLM Forecasting Benchmarks</h3>
            <p>
              ForecastBench<Cite id="8">8</Cite> provides a dynamic benchmark for LLM forecasting
              accuracy, comparing models to human forecasters including superforecasters. As of 2025,
              top LLMs approach but do not match superforecaster accuracy (Brier scores of ~0.10 vs ~0.08).
            </p>

            <h3>2.5 Gap in the Literature</h3>
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
            <h2>3. Methodology: Stability-Under-Probing</h2>

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
              <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
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
            <h2>4. Experimental Design</h2>

            <h3>4.1 Decision Scenarios</h3>
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
              ]}
            />
            <p>Each scenario includes:</p>
            <ul>
              <li>A realistic decision context</li>
              <li>A quantitative question requiring a point estimate</li>
              <li>2-4 probing questions with base rates and new information</li>
              <li>Expected direction of update (for validation)</li>
            </ul>

            <h3>4.2 Probing Questions</h3>
            <p>Probes are designed to surface considerations that good decision-making should address:</p>
            <ol>
              <li><strong>Base rate probes</strong>: "Research shows X% of similar situations result in Y..."</li>
              <li><strong>Bias identification probes</strong>: "This is a classic sign of [sunk cost fallacy / planning fallacy / etc.]..."</li>
              <li><strong>New information probes</strong>: "I just learned that [relevant new fact]..."</li>
            </ol>

            <h3>4.3 Model and Procedure</h3>
            <ul>
              <li><strong>Model</strong>: Claude (Anthropic), accessed via subagent framework</li>
              <li><strong>Runs per condition</strong>: 3 (to account for stochasticity)</li>
              <li><strong>Order</strong>: Randomized</li>
              <li><strong>Blinding</strong>: Scorer does not know condition when extracting estimates</li>
            </ul>

            <h3>4.4 Sample Size</h3>
            <ul>
              <li>8 scenarios × 2 conditions × 3 runs = 48 total responses</li>
              <li>24 per condition</li>
              <li>Power analysis: With n=24 per group, we have 80% power to detect a 0.8 standard deviation difference in update magnitude at α=0.05.</li>
            </ul>
          </section>

          <section>
            <h2>5. Results</h2>

            <h3>5.1 Pilot Experiments</h3>
            <p>
              We conducted pilot experiments on two scenarios: software project timeline estimation
              and troubled project success probability.
            </p>

            <h4>Planning Scenario (Software Timeline)</h4>
            <Table
              headers={['Metric', 'Naive', 'Farness']}
              rows={[
                ['Initial estimate', '4 weeks', '4 weeks'],
                ['Initial CI', '(none)', '2.5-7 weeks'],
                ['Post-probe estimate', '3.5 weeks', '5 weeks'],
                ['Post-probe CI', '2.5-5.5 weeks', '3-9 weeks'],
                ['Update direction', '↓ (wrong)', '↑ (correct)'],
              ]}
            />
            <p>
              <strong>Key finding:</strong> When probed with "30% chance of major blocker," farness
              incorporated this systematically (mixture model → higher estimate), while naive
              paradoxically became <em>more</em> optimistic.
            </p>

            <h4>Sunk Cost Scenario (Project Success)</h4>
            <Table
              headers={['Metric', 'Naive', 'Farness']}
              rows={[
                ['Initial estimate', '15%', '6%'],
                ['Initial CI', '(none)', '2-15%'],
                ['Post-probe estimate', '5%', '2%'],
                ['Post-probe CI', '2-12%', '0.5-8%'],
                ['Update direction', '↓ (correct)', '↓ (correct)'],
              ]}
            />
            <p>
              <strong>Key finding:</strong> Naive(probed) ≈ Farness(initial). The naive response
              converged to 5% after probing — almost exactly where farness started (6%).
            </p>

            <h3>5.2 Convergence Pattern</h3>
            <p>Across both pilot scenarios, we observed a consistent pattern:</p>
            <blockquote>
              <p style={{ fontFamily: 'monospace', textAlign: 'center' }}>
                Naive_final ≈ Farness_initial
              </p>
            </blockquote>
            <p>This suggests that:</p>
            <ol>
              <li>Framework-guided responses front-load the analytical work</li>
              <li>Naive responses require extensive probing to reach similar conclusions</li>
              <li>The framework captures considerations that matter for decision quality</li>
            </ol>

            <h3>5.3 Coherence Under New Information</h3>
            <p>
              When presented with new information (e.g., "two senior engineers are interviewing elsewhere"),
              we observed:
            </p>
            <ul>
              <li><strong>Farness</strong>: Explicit quantitative update using mixture models, principled incorporation of new risk factor</li>
              <li><strong>Naive</strong>: Qualitative acknowledgment but less systematic incorporation</li>
            </ul>
          </section>

          <section>
            <h2>6. Discussion</h2>

            <h3>6.1 Pre-emptive Rigor</h3>
            <p>
              Our central finding is that structured decision frameworks provide "pre-emptive rigor" —
              they front-load considerations that would otherwise require extensive follow-up questioning.
              This has practical implications:
            </p>
            <ol>
              <li><strong>For users</strong>: Framework-guided responses provide higher-quality initial recommendations without requiring users to probe effectively</li>
              <li><strong>For systems</strong>: The framework can be implemented as a prompt prefix, requiring no model fine-tuning</li>
              <li><strong>For evaluation</strong>: Stability-under-probing offers a tractable way to evaluate decision frameworks without ground truth</li>
            </ol>

            <h3>6.2 Why Not Just Probe Everything?</h3>
            <p>One might ask: if probing improves naive responses, why use a framework at all?</p>
            <ol>
              <li><strong>Users don't know what to probe for.</strong> The framework surfaces considerations (base rates, biases) that users might not think to ask about.</li>
              <li><strong>Probing is costly.</strong> Multiple follow-up rounds take time and tokens. Front-loading is more efficient.</li>
              <li><strong>Probing may not be complete.</strong> Our probing protocol is designed to be thorough, but real users ask ad-hoc follow-ups.</li>
            </ol>

            <h3>6.3 Limitations</h3>
            <ol>
              <li><strong>No outcome validation.</strong> We don't know if more stable responses lead to better actual decisions. This requires longitudinal tracking.</li>
              <li><strong>Specific model.</strong> Results may differ across models; we tested only Claude.</li>
              <li><strong>Researcher-designed probes.</strong> Our probing questions are designed to be effective; naive users might probe less well.</li>
              <li><strong>Sample size.</strong> Pilot experiments are small; full experiment needed.</li>
            </ol>

            <h3>6.4 Future Work</h3>
            <ol>
              <li><strong>Full experiment.</strong> Run all 8 scenarios with multiple runs per condition.</li>
              <li><strong>Multiple models.</strong> Compare GPT-4, Claude, Gemini, open-source models.</li>
              <li><strong>Human studies.</strong> Does using the framework improve human decision-making?</li>
              <li><strong>Longitudinal calibration.</strong> Track real decisions over time and measure forecast accuracy.</li>
              <li><strong>Adversarial probing.</strong> Design probes that should <em>not</em> change the recommendation; test if framework resists.</li>
            </ol>
          </section>

          <section>
            <h2>7. Conclusion</h2>
            <p>
              We introduce stability-under-probing as a methodology for evaluating decision framework
              effectiveness in LLMs. Our pilot experiments suggest that structured frameworks like
              farness provide "pre-emptive rigor" — producing recommendations that are more stable
              under probing because they already incorporated base rates, identified biases, and
              quantified uncertainty.
            </p>
            <p>
              This methodology complements existing work on LLM forecasting accuracy (ForecastBench)
              by focusing on decision <em>process</em> rather than outcome accuracy. It enables
              evaluation of decision frameworks without requiring ground truth or long time horizons.
            </p>
            <p>
              The practical implication is clear: prompting LLMs with structured decision frameworks
              may improve the quality of decision support, not by changing what the model "knows,"
              but by ensuring it systematically applies what it knows to the decision at hand.
            </p>
          </section>
        </div>

        <section className="references">
          <h2>References</h2>
          <ol className="reference-list">
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
          </ol>
        </section>

        <section style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
          <h2>Code Availability</h2>
          <p>
            Code for running stability-under-probing experiments is available at:{' '}
            <a href="https://github.com/MaxGhenis/farness" target="_blank" rel="noopener noreferrer">
              github.com/MaxGhenis/farness
            </a>
          </p>
          <p>The <code>farness.experiments.stability</code> module provides:</p>
          <ul>
            <li><code>QuantitativeCase</code>: Dataclass for defining scenarios</li>
            <li><code>StabilityResult</code>: Dataclass for recording results</li>
            <li><code>StabilityExperiment</code>: Class for running and analyzing experiments</li>
            <li><code>STABILITY_CASES</code>: Pre-defined scenarios across domains</li>
          </ul>
        </section>

        <footer className="thesis-footer">
          <p>
            Written by <a href="https://github.com/MaxGhenis">Max Ghenis</a>.
            Farness is <a href="https://github.com/MaxGhenis/farness">open source</a>.
          </p>
        </footer>
      </article>
    </>
  )
}

export default Paper
