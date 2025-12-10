import { Link } from 'react-router-dom'
import './Thesis.css'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">Farness</Link>
      <nav className="nav">
        <Link to="/thesis" className="nav-link active">Thesis</Link>
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

function Thesis() {
  return (
    <>
      <Header />
      <article className="thesis">
        <header className="thesis-header">
          <p className="thesis-label">The Farness Thesis</p>
          <h1>Forecasting as a Harness</h1>
          <p className="thesis-subtitle">
            Why reframing decisions as predictions leads to better outcomes—and how to do it.
          </p>
        </header>

        <div className="thesis-content">
          <section>
            <h2>The Problem with Advice</h2>
            <p>
              When we ask someone—a friend, a mentor, an AI—"Should I do X?", we're asking the
              wrong question. The answer we get depends entirely on unstated assumptions: What
              do we value? What counts as success? How certain is the advisor? None of this is
              made explicit.
            </p>
            <p>
              Worse, we can never learn from these answers. A year later, we can't evaluate
              whether the advice was good because we never defined what "good" meant. The
              feedback loop is broken.
            </p>
            <p>
              This isn't just a problem with AI (though AI's tendency toward sycophancy makes
              it worse<Cite id="1">1</Cite>). It's a problem with how we structure decision-making conversations.
            </p>
          </section>

          <section>
            <h2>The Reframe</h2>
            <p>
              Instead of asking for advice, ask for <em>forecasts conditional on actions</em>.
            </p>
            <p>
              The shift is subtle but transformative:
            </p>
            <blockquote>
              <p><strong>Before:</strong> "Should I take this job?"</p>
              <p><strong>After:</strong> "If I value income, growth, and work-life balance, what's
              the probability that each of these exceeds my threshold under Option A vs Option B?
              What assumptions drive those estimates?"</p>
            </blockquote>
            <p>
              This forces several things to happen:
            </p>
            <ul>
              <li><strong>Values become explicit.</strong> You must state what you're optimizing for before anyone can help you.</li>
              <li><strong>Uncertainty becomes visible.</strong> A forecast requires a confidence interval. "Probably fine" becomes "70% chance, with a range of 50-85%."</li>
              <li><strong>Assumptions surface.</strong> To make a forecast, you must reason about mechanisms. What needs to be true for this outcome to occur?</li>
              <li><strong>Accountability emerges.</strong> Predictions can be scored. Opinions cannot.</li>
            </ul>
          </section>

          <section>
            <h2>The Superforecasting Connection</h2>
            <p>
              This isn't a new idea. Philip Tetlock's research on superforecasting<Cite id="2">2</Cite> identified a
              set of techniques that reliably improve predictive accuracy. In the Good Judgment Project,
              a small group of forecasters consistently beat professional intelligence analysts with
              access to classified information<Cite id="3">3</Cite>.
            </p>
            <p>
              Their techniques include:
            </p>
            <ul>
              <li><strong>Fermi decomposition:</strong> Break complex estimates into simpler, estimable components<Cite id="4">4</Cite>.</li>
              <li><strong>Outside view first:</strong> Start with base rates before adjusting for specifics—what Kahneman calls "reference class forecasting"<Cite id="5">5</Cite>.</li>
              <li><strong>Calibrated confidence:</strong> Your 80% predictions should come true 80% of the time.</li>
              <li><strong>Continuous updating:</strong> Revise estimates as new information arrives, following Bayesian principles.</li>
            </ul>
            <p>
              Superforecasters don't have access to secret information. They're just more
              disciplined about structuring their thinking. Farness applies this discipline
              to personal and professional decisions.
            </p>
          </section>

          <section>
            <h2>Why AI Makes This Better</h2>
            <p>
              Large language models are surprisingly good at forecasting. Recent research shows
              LLM ensembles can match human crowd accuracy on prediction tasks<Cite id="6">6</Cite>, and
              AI forecasting systems like AIA Forecaster have achieved expert-level performance
              on benchmarks<Cite id="7">7</Cite>. The Center for AI Safety's "FiveThirtyNine" bot
              achieved 87.7% accuracy on resolved questions, slightly outperforming the Metaculus
              crowd at 87.0%<Cite id="8">8</Cite>.
            </p>
            <p>
              But LLMs are also prone to sycophancy: telling you what you want to hear rather
              than what's true. Research has shown this tendency is robust across models and
              contexts<Cite id="1">1</Cite>.
            </p>
            <p>
              The forecasting frame is a <em>harness</em> that constrains this tendency. When
              you ask an AI for a probability with a confidence interval, it's harder for it
              to simply validate your existing beliefs. Numbers create accountability.
            </p>
            <p>
              More importantly, the structure itself improves thinking. Research on LLM-augmented
              forecasting found that AI assistance significantly boosts human forecasting accuracy,
              with the largest gains for less experienced forecasters<Cite id="9">9</Cite>:
            </p>
            <ul>
              <li><strong>KPI definition</strong> forces you to articulate what you actually care about.</li>
              <li><strong>Option expansion</strong> surfaces alternatives you hadn't considered.</li>
              <li><strong>Assumption surfacing</strong> reveals where your model might be wrong.</li>
              <li><strong>Sensitivity analysis</strong> shows which uncertainties matter most.</li>
            </ul>
            <p>
              The AI becomes a structured thinking partner, not an oracle.
            </p>
          </section>

          <section>
            <h2>The Calibration Loop</h2>
            <p>
              The most powerful part of this approach is what happens over time. By logging
              your forecasts and scoring them against reality, you build a calibration curve.
            </p>
            <p>
              Research on expert prediction shows that without feedback, even domain experts
              are poorly calibrated<Cite id="10">10</Cite>. But with structured feedback,
              calibration improves significantly. The Good Judgment Project found that
              providing forecasters with regular accuracy feedback was one of the key
              interventions that improved performance<Cite id="3">3</Cite>.
            </p>
            <p>
              You learn that you're overconfident on career decisions. Or underconfident on
              technical estimates. Or systematically biased toward optimism about timelines.
            </p>
            <p>
              This meta-knowledge is invaluable. It's not just about making better individual
              decisions—it's about understanding your own decision-making patterns and
              compensating for systematic biases.
            </p>
          </section>

          <section>
            <h2>The Framework</h2>
            <p>
              Farness implements a five-step process, drawing on structured analytic techniques
              from intelligence analysis<Cite id="11">11</Cite> and the superforecasting literature:
            </p>
            <ol>
              <li>
                <strong>Define KPIs.</strong> What outcomes matter? Pick 1-3 metrics you'd
                actually use to judge success in hindsight. This mirrors the "AIMS" technique
                (Audience, Issue, Message, Storyline) from intelligence analysis<Cite id="11">11</Cite>.
              </li>
              <li>
                <strong>Expand options.</strong> Don't just compare A vs B. What about C?
                Waiting? A hybrid? The best option is often one you didn't initially consider.
                This combats "premature closure"—a well-documented cognitive bias<Cite id="12">12</Cite>.
              </li>
              <li>
                <strong>Decompose and forecast.</strong> For each option × KPI, apply outside
                view, inside view, Fermi decomposition. Produce a point estimate with
                confidence interval. Decomposition is one of Heuer's core structured analytic
                techniques<Cite id="11">11</Cite>.
              </li>
              <li>
                <strong>Surface assumptions.</strong> What must be true for this forecast to
                hold? What would change it? This is the "key assumptions check" from
                intelligence tradecraft<Cite id="13">13</Cite>.
              </li>
              <li>
                <strong>Log and score.</strong> Record the decision. Return in 3-6 months.
                Compare predictions to reality. Update your calibration. Brier scores provide
                a proper scoring rule that rewards both accuracy and calibration<Cite id="14">14</Cite>.
              </li>
            </ol>
          </section>

          <section>
            <h2>When to Use It</h2>
            <p>
              Farness is valuable across a range of decisions:
            </p>
            <ul>
              <li><strong>High-stakes decisions</strong> where the cost of being wrong is significant.</li>
              <li><strong>Recurring decision types</strong> where you can build calibration over time.</li>
              <li><strong>Decisions with delayed feedback</strong> where you won't know if you were right for months or years.</li>
              <li><strong>Decisions where you suspect motivated reasoning</strong>—where you might be fooling yourself<Cite id="15">15</Cite>.</li>
              <li><strong>Smaller decisions as practice</strong>—building the habit and calibration data that pays off when stakes are high.</li>
            </ul>
          </section>

          <section>
            <h2>The Vision</h2>
            <p>
              Imagine a world where every significant decision comes with:
            </p>
            <ul>
              <li>Explicit success criteria</li>
              <li>A range of options, not just the obvious ones</li>
              <li>Quantified predictions with uncertainty ranges</li>
              <li>Surfaced assumptions that can be tested</li>
              <li>A record that can be scored and learned from</li>
            </ul>
            <p>
              This is possible today. The tools exist. The research supports it. What's
              missing is the habit—the muscle memory of reaching for forecasts instead of
              opinions.
            </p>
            <p>
              Farness is an attempt to build that habit. Use it as a Python library, a CLI
              tool, or a Claude Code plugin. Log your decisions. Score your predictions.
              Get better over time.
            </p>
            <p className="thesis-cta">
              <Link to="/" className="btn btn-primary">Get Started →</Link>
            </p>
          </section>
        </div>

        <section className="references">
          <h2>References</h2>
          <ol className="reference-list">
            <li id="ref-1">
              <a href="#cite-1">↑</a> Sharma, M., et al. (2023). "Towards Understanding Sycophancy in Language Models." <em>arXiv:2310.13548</em>.{' '}
              <a href="https://arxiv.org/abs/2310.13548" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2310.13548</a>
            </li>
            <li id="ref-2">
              <a href="#cite-2">↑</a> Tetlock, P. E., & Gardner, D. (2015). <em>Superforecasting: The Art and Science of Prediction</em>. Crown.{' '}
              <a href="https://www.amazon.com/Superforecasting-Science-Prediction-Philip-Tetlock/dp/0804136718" target="_blank" rel="noopener noreferrer">Amazon</a>
            </li>
            <li id="ref-3">
              <a href="#cite-3">↑</a> Mellers, B., et al. (2014). "Psychological Strategies for Winning a Geopolitical Forecasting Tournament." <em>Psychological Science</em>, 25(5), 1106-1115.{' '}
              <a href="https://doi.org/10.1177/0956797614524255" target="_blank" rel="noopener noreferrer">DOI</a>
            </li>
            <li id="ref-4">
              <a href="#cite-4">↑</a> Good Judgment. "Superforecasters' Toolbox: Fermi-ization in Forecasting."{' '}
              <a href="https://goodjudgment.com/superforecasters-toolbox-fermi-ization-in-forecasting/" target="_blank" rel="noopener noreferrer">goodjudgment.com</a>
            </li>
            <li id="ref-5">
              <a href="#cite-5">↑</a> Kahneman, D., & Tversky, A. (1979). "Intuitive Prediction: Biases and Corrective Procedures." <em>TIMS Studies in Management Science</em>, 12, 313-327.
            </li>
            <li id="ref-6">
              <a href="#cite-6">↑</a> Schoenegger, P., et al. (2024). "Wisdom of the Silicon Crowd: LLM Ensemble Prediction Capabilities Rival Human Crowd Accuracy." <em>arXiv:2402.19379</em>.{' '}
              <a href="https://arxiv.org/abs/2402.19379" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2402.19379</a>
            </li>
            <li id="ref-7">
              <a href="#cite-7">↑</a> "AIA Forecaster: Technical Report." (2025). <em>arXiv:2511.07678</em>.{' '}
              <a href="https://arxiv.org/abs/2511.07678" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2511.07678</a>
            </li>
            <li id="ref-8">
              <a href="#cite-8">↑</a> Center for AI Safety. "Superhuman Automated Forecasting."{' '}
              <a href="https://safe.ai/blog/forecasting" target="_blank" rel="noopener noreferrer">safe.ai/blog/forecasting</a>
            </li>
            <li id="ref-9">
              <a href="#cite-9">↑</a> Schoenegger, P., et al. (2024). "AI-Augmented Predictions: LLM Assistants Improve Human Forecasting Accuracy." <em>arXiv:2402.07862</em>.{' '}
              <a href="https://arxiv.org/abs/2402.07862" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2402.07862</a>
            </li>
            <li id="ref-10">
              <a href="#cite-10">↑</a> Tetlock, P. E. (2005). <em>Expert Political Judgment: How Good Is It? How Can We Know?</em> Princeton University Press.
            </li>
            <li id="ref-11">
              <a href="#cite-11">↑</a> Heuer, R. J., & Pherson, R. H. (2015). <em>Structured Analytic Techniques for Intelligence Analysis</em> (2nd ed.). CQ Press.{' '}
              <a href="https://www.amazon.com/Structured-Analytic-Techniques-Intelligence-Analysis/dp/1608710181" target="_blank" rel="noopener noreferrer">Amazon</a>
            </li>
            <li id="ref-12">
              <a href="#cite-12">↑</a> Kruglanski, A. W., & Webster, D. M. (1996). "Motivated Closing of the Mind: 'Seizing' and 'Freezing'." <em>Psychological Review</em>, 103(2), 263-283.
            </li>
            <li id="ref-13">
              <a href="#cite-13">↑</a> CIA. (2009). "A Tradecraft Primer: Structured Analytic Techniques for Improving Intelligence Analysis."{' '}
              <a href="https://www.cia.gov/resources/csi/static/Tradecraft-Primer-apr09.pdf" target="_blank" rel="noopener noreferrer">cia.gov</a>
            </li>
            <li id="ref-14">
              <a href="#cite-14">↑</a> Brier, G. W. (1950). "Verification of Forecasts Expressed in Terms of Probability." <em>Monthly Weather Review</em>, 78(1), 1-3.
            </li>
            <li id="ref-15">
              <a href="#cite-15">↑</a> Kunda, Z. (1990). "The Case for Motivated Reasoning." <em>Psychological Bulletin</em>, 108(3), 480-498.
            </li>
          </ol>
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

export default Thesis
