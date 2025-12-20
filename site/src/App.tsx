import { useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

// Components
function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">Farness</Link>
      <nav className="nav">
        <Link to="/thesis" className="nav-link">Thesis</Link>
        <Link to="/paper" className="nav-link">Paper</Link>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <div className="hero">
      <h1>
        Stop asking <em>"Is this good?"</em>
        <br />
        Start asking <em>"What will happen?"</em>
      </h1>
      <p className="subtitle">
        A framework for better decisions through explicit forecasting and calibration.
      </p>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ReframeDemo() {
  const examples = [
    {
      before: '"Should I take job A or job B?"',
      after: '"If I value income and learning, what\'s P(income > $200k | Job A) vs P(income > $200k | Job B)? What\'s my confidence interval?"'
    },
    {
      before: '"Is this a good investment?"',
      after: '"What\'s P(ROI > 10% at 5 years)? What are the key assumptions driving that estimate?"'
    },
    {
      before: '"Should we launch this feature?"',
      after: '"What\'s P(retention improves > 5% | launch)? What would make us update that forecast?"'
    }
  ]

  const [currentExample, setCurrentExample] = useState(0)

  return (
    <div className="reframe">
      <div className="question-pair">
        <div className="question-box before">
          <div className="question-label">Instead of asking</div>
          <div className="question-text">{examples[currentExample].before}</div>
        </div>
        <div className="arrow">↓</div>
        <div className="question-box after">
          <div className="question-label">Ask</div>
          <div className="question-text">{examples[currentExample].after}</div>
        </div>
      </div>
      <div className="example-nav">
        {examples.map((_, i) => (
          <button
            key={i}
            className={`example-dot ${i === currentExample ? 'active' : ''}`}
            onClick={() => setCurrentExample(i)}
            aria-label={`Example ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function FrameworkSteps() {
  const steps = [
    {
      title: 'Define KPIs',
      description: "What outcomes matter? Income, satisfaction, optionality, time? Pick 1-3 you'd actually use to judge success in hindsight."
    },
    {
      title: 'Expand Options',
      description: "Don't just compare A vs B. What about C? Waiting? A hybrid approach? The best option is often one you didn't initially consider."
    },
    {
      title: 'Decompose & Forecast',
      description: 'For each option × KPI: start with base rates (outside view), adjust for specifics (inside view), break into components (Fermi-style), and give a point estimate with confidence interval.'
    },
    {
      title: 'Surface Assumptions',
      description: "What are you assuming? What would change the estimate? This is where the real thinking happens."
    },
    {
      title: 'Log & Score Later',
      description: 'Record your forecasts. In 3-6 months, compare to reality. Build a calibration curve. Get better over time.'
    }
  ]

  return (
    <ol className="steps">
      {steps.map((step, i) => (
        <li key={i}>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  )
}

function WhyItWorks() {
  const reasons = [
    { bold: 'Reduces sycophancy.', text: "It's harder to just agree when you have to produce a number with a confidence interval." },
    { bold: 'Forces mechanism thinking.', text: "You can't forecast without reasoning about cause and effect." },
    { bold: 'Separates values from facts.', text: 'You choose what to optimize (values); the forecast is about what will happen (facts).' },
    { bold: 'Creates accountability.', text: "Predictions can be scored. Opinions can't." },
    { bold: 'Builds calibration.', text: "Track predictions over time. Learn whether you're overconfident, underconfident, or biased in specific domains." }
  ]

  return (
    <div className="reasons">
      {reasons.map((reason, i) => (
        <div key={i} className="reason">
          <span className="reason-marker">→</span>
          <p><strong>{reason.bold}</strong> {reason.text}</p>
        </div>
      ))}
    </div>
  )
}

function CTA() {
  return (
    <div className="cta">
      <h2>Try It</h2>
      <p>Farness is open source. Use it as a Python library, CLI tool, or Claude Code plugin.</p>
      <div className="cta-buttons">
        <a href="https://github.com/MaxGhenis/farness" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          View on GitHub
        </a>
        <a href="https://pypi.org/project/farness/" className="btn btn-secondary">
          pip install farness
        </a>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p>
        Built by <a href="https://github.com/MaxGhenis">Max Ghenis</a>.
        Inspired by superforecasting, Fermi estimation, and the desire for better decisions.
      </p>
    </footer>
  )
}

function App() {
  return (
    <>
      <Header />
      <Hero />
      <main>
        <Section id="problem" title="The Problem">
          <p>
            When we ask AI (or advisors, or ourselves) <strong>"Should I do X?"</strong>,
            we get opinions dressed as answers. The response depends on unstated assumptions
            about what we value, what success looks like, and how confident the advisor really is.
          </p>
          <p>
            Worse: we can't learn from these answers. Six months later, we can't score whether
            the advice was good because we never defined what "good" meant.
          </p>
        </Section>

        <Section id="reframe" title="The Reframe">
          <p>
            Instead of asking for advice, ask for <strong>forecasts conditional on actions</strong>.
            Define what you're optimizing for, then predict outcomes.
          </p>
          <ReframeDemo />
          <p>
            This forces clarity: What do you actually care about? What are the real options?
            How uncertain are you? And crucially—you can <em>score this later</em> to improve.
          </p>
        </Section>

        <Section id="framework" title="The Framework">
          <FrameworkSteps />
        </Section>

        <Section id="why" title="Why This Works">
          <WhyItWorks />
        </Section>
      </main>
      <CTA />
      <Footer />
    </>
  )
}

export default App
