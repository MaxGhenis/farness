import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { darkTheme } from './styles/theme.css'
import { Header } from './components/Header'
import * as s from './styles/shared.css'
import * as a from './App.css'

function Hero() {
  return (
    <div className={a.hero}>
      <div className={a.heroGrid} />
      <div className={a.heroContent}>
        <p className={a.heroLabel}>Decision framework</p>
        <h1>
          Stop asking <em>"Is this good?"</em>
          <br />
          Start asking <em>"What will happen?"</em>
        </h1>
        <p className={a.subtitle}>
          Farness reframes decisions as forecasting problems—with explicit KPIs,
          confidence intervals, and calibration tracking.
        </p>
        <div className={a.heroActions}>
          <a href="#demo" className={`${s.btn} ${s.btnAccent}`}>See it work</a>
          <a href="https://pypi.org/project/farness/" className={`${s.btn} ${s.btnGhost}`}>
            <span className={s.mono}>pip install farness</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function Section({ id, label, title, children }: {
  id: string; label: string; title: string; children: React.ReactNode
}) {
  return (
    <section id={id} className={a.section}>
      <div className={a.sectionHead}>
        <span className={a.sectionLabel}>{label}</span>
        <h2>{title}</h2>
      </div>
      <div className={a.sectionBody}>
        {children}
      </div>
    </section>
  )
}

/* ── Interactive Decision Demo ── */

interface DemoScenario {
  question: string
  kpis: { name: string; unit: string }[]
  options: {
    name: string
    forecasts: { value: number; ci: [number, number] }[]
  }[]
}

const SCENARIOS: DemoScenario[] = [
  {
    question: 'Which job should I take?',
    kpis: [
      { name: 'Total Comp (Year 1)', unit: '$k' },
      { name: 'Learning & Growth', unit: '/10' },
      { name: 'Work-Life Balance', unit: '/10' },
    ],
    options: [
      {
        name: 'Startup',
        forecasts: [
          { value: 180, ci: [140, 240] },
          { value: 8.5, ci: [7, 10] },
          { value: 5, ci: [3, 7] },
        ],
      },
      {
        name: 'Big Co',
        forecasts: [
          { value: 250, ci: [230, 270] },
          { value: 5, ci: [4, 6] },
          { value: 7.5, ci: [6, 9] },
        ],
      },
    ],
  },
  {
    question: 'Should we launch this feature?',
    kpis: [
      { name: 'User Retention', unit: '%' },
      { name: 'Revenue Impact', unit: '$k/mo' },
      { name: 'Eng Effort', unit: 'weeks' },
    ],
    options: [
      {
        name: 'Launch Now',
        forecasts: [
          { value: 72, ci: [65, 80] },
          { value: 45, ci: [20, 80] },
          { value: 6, ci: [4, 10] },
        ],
      },
      {
        name: 'Wait & Polish',
        forecasts: [
          { value: 78, ci: [72, 85] },
          { value: 60, ci: [35, 90] },
          { value: 12, ci: [8, 18] },
        ],
      },
    ],
  },
  {
    question: 'Continue or kill this project?',
    kpis: [
      { name: 'Months to Ship', unit: 'mo' },
      { name: 'Added Burn', unit: '$k' },
      { name: 'Strategic Value', unit: '/10' },
    ],
    options: [
      {
        name: 'Continue',
        forecasts: [
          { value: 8, ci: [5, 14] },
          { value: 500, ci: [300, 900] },
          { value: 7, ci: [5, 9] },
        ],
      },
      {
        name: 'Kill It',
        forecasts: [
          { value: 0, ci: [0, 0] },
          { value: 0, ci: [0, 0] },
          { value: 2, ci: [1, 3] },
        ],
      },
    ],
  },
]

function ConfidenceBar({ value, ci, max, color, animate }: {
  value: number; ci: [number, number]; max: number; color: string; animate: boolean
}) {
  const pct = (v: number) => `${(v / max) * 100}%`

  return (
    <div className={a.ciBarContainer}>
      <div
        className={`${a.ciRange} ${animate ? a.ciRangeAnimate : ''}`}
        style={{
          left: pct(ci[0]),
          width: `${((ci[1] - ci[0]) / max) * 100}%`,
          background: `${color}20`,
          borderLeft: `1px solid ${color}40`,
          borderRight: `1px solid ${color}40`,
        }}
      />
      <div
        className={`${a.ciPoint} ${animate ? a.ciPointAnimate : ''}`}
        style={{
          left: pct(value),
          background: color,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  )
}

function InteractiveDemo() {
  const [activeScenario, setActiveScenario] = useState(0)
  const [animate, setAnimate] = useState(true)
  const scenario = SCENARIOS[activeScenario]

  useEffect(() => {
    setAnimate(false)
    const t = setTimeout(() => setAnimate(true), 50)
    return () => clearTimeout(t)
  }, [activeScenario])

  const colors = ['#e8a825', '#5b9bd5']

  return (
    <div className={a.demo} id="demo">
      <div className={a.demoHeader}>
        <span className={a.demoLabel}>Interactive demo</span>
        <h3 className={a.demoQuestion}>{scenario.question}</h3>
        <div className={a.demoTabs}>
          {SCENARIOS.map((sc, i) => (
            <button
              key={i}
              className={`${a.demoTab} ${i === activeScenario ? a.demoTabActive : ''}`}
              onClick={() => setActiveScenario(i)}
            >
              {sc.question.length > 25 ? sc.question.slice(0, 25) + '...' : sc.question}
            </button>
          ))}
        </div>
      </div>

      <div className={a.demoGrid}>
        {scenario.kpis.map((kpi, ki) => {
          const allVals = scenario.options.flatMap(o => [
            o.forecasts[ki].ci[0], o.forecasts[ki].ci[1]
          ])
          const max = Math.max(...allVals) * 1.15

          return (
            <div key={kpi.name} className={a.demoKpi}>
              <div className={a.demoKpiHeader}>
                <span className={a.demoKpiName}>{kpi.name}</span>
                <span className={a.demoKpiUnit}>{kpi.unit}</span>
              </div>
              <div className={a.demoKpiBars}>
                {scenario.options.map((opt, oi) => (
                  <div key={opt.name} className={a.demoOptionRow}>
                    <span className={a.demoOptionLabel} style={{ color: colors[oi] }}>
                      {opt.name}
                    </span>
                    <div className={a.demoBarWrap}>
                      <ConfidenceBar
                        value={opt.forecasts[ki].value}
                        ci={opt.forecasts[ki].ci}
                        max={max}
                        color={colors[oi]}
                        animate={animate}
                      />
                    </div>
                    <span className={`${a.demoValue} ${s.mono}`}>
                      {opt.forecasts[ki].value}
                    </span>
                  </div>
                ))}
              </div>
              <div className={a.demoScale}>
                <span className={s.mono}>0</span>
                <span className={s.mono}>{Math.round(max / 2)}</span>
                <span className={s.mono}>{Math.round(max)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className={a.demoFooter}>
        <span className={a.demoLegend}>
          <span className={a.demoLegendDot} /> Point estimate
          <span className={a.demoLegendBar} /> 80% confidence interval
        </span>
      </div>
    </div>
  )
}

/* ── Reframe Examples ── */

function ReframeDemo() {
  const examples = [
    {
      before: '"Should I take job A or job B?"',
      after: '"What\'s my 80% CI on E[salary] at Job A vs Job B? What about work-life balance?"'
    },
    {
      before: '"Is this a good investment?"',
      after: '"What\'s P(ROI > 10% at 5 years)? What are the key assumptions?"'
    },
    {
      before: '"Should we launch this feature?"',
      after: '"What\'s P(retention > 5% | launch)? What would make us update?"'
    }
  ]

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % examples.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={a.reframe}>
      <div className={a.reframePair}>
        <div className={`${a.reframeBox} ${a.reframeBefore}`}>
          <span className={`${a.reframeTag} ${a.reframeTagBefore}`}>vague</span>
          <p>{examples[current].before}</p>
        </div>
        <div className={a.reframeArrow}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </div>
        <div className={`${a.reframeBox} ${a.reframeAfter}`}>
          <span className={`${a.reframeTag} ${a.reframeTagAfter}`}>precise</span>
          <p>{examples[current].after}</p>
        </div>
      </div>
      <div className={a.reframeDots}>
        {examples.map((_, i) => (
          <button
            key={i}
            className={`${a.reframeDot} ${i === current ? a.reframeDotActive : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Framework Steps ── */

const StepIcons = {
  '01': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="6" width="4" height="12" rx="1" /><rect x="8" y="3" width="4" height="15" rx="1" /><rect x="14" y="9" width="4" height="9" rx="1" />
    </svg>
  ),
  '02': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 10h6" /><path d="M9 10l5-6" /><path d="M9 10l5 0" /><path d="M9 10l5 6" />
      <circle cx="16" cy="4" r="2" /><circle cx="16" cy="10" r="2" /><circle cx="16" cy="16" r="2" />
    </svg>
  ),
  '03': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 14l4-4 3 3 4-6 5 5" /><line x1="2" y1="18" x2="18" y2="18" />
    </svg>
  ),
  '04': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="10" cy="8" r="6" /><line x1="10" y1="14" x2="10" y2="18" />
      <line x1="10" y1="5" x2="10" y2="9" /><line x1="8" y1="7" x2="12" y2="7" />
    </svg>
  ),
  '05': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="2,12 6,16 18,4" />
    </svg>
  ),
} as const

function FrameworkSteps() {
  const steps = [
    {
      num: '01' as const,
      title: 'Define KPIs',
      text: "What outcomes matter? Income, satisfaction, optionality, time? Pick 1-3 you'd actually use to judge success in hindsight.",
    },
    {
      num: '02' as const,
      title: 'Expand options',
      text: "Don't just compare A vs B. What about C? Waiting? A hybrid? The best option is often one you didn't initially consider.",
    },
    {
      num: '03' as const,
      title: 'Decompose & forecast',
      text: 'For each option x KPI: start with base rates (outside view), adjust for specifics (inside view), give a point estimate with confidence interval.',
    },
    {
      num: '04' as const,
      title: 'Surface assumptions',
      text: "What are you assuming? What would change the estimate? This is where the real thinking happens.",
    },
    {
      num: '05' as const,
      title: 'Log & score',
      text: 'Record your forecasts. In 3-6 months, compare to reality. Build a calibration curve. Get better over time.',
    },
  ]

  return (
    <div className={a.stepsGrid}>
      {steps.map(step => (
        <div key={step.num} className={a.stepCard}>
          <div className={a.stepHeader}>
            <span className={a.stepIcon}>{StepIcons[step.num]}</span>
            <span className={`${a.stepNum} ${s.mono}`}>{step.num}</span>
          </div>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Why It Works ── */

function WhyItWorks() {
  const reasons = [
    { title: 'Reduces sycophancy', text: "It's harder to just agree when you have to produce a number with a confidence interval." },
    { title: 'Forces mechanism thinking', text: "You can't forecast without reasoning about cause and effect." },
    { title: 'Separates values from facts', text: 'You choose what to optimize (values); the forecast is about what will happen (facts).' },
    { title: 'Creates accountability', text: "Predictions can be scored. Opinions can't." },
    { title: 'Builds calibration', text: "Track predictions over time. Learn whether you're overconfident or biased in specific domains." },
  ]

  return (
    <div className={a.reasonsGrid}>
      {reasons.map((r, i) => (
        <div key={i} className={a.reasonCard}>
          <h3>{r.title}</h3>
          <p>{r.text}</p>
        </div>
      ))}
    </div>
  )
}

/* ── CTA ── */

function CTA() {
  return (
    <div className={a.cta}>
      <div className={a.ctaInner}>
        <h2>Start making better decisions</h2>
        <p>Farness is open source. Use it as a Python library, CLI tool, or Claude Code plugin.</p>
        <div className={a.ctaButtons}>
          <a href="https://github.com/MaxGhenis/farness" className={`${s.btn} ${s.btnAccent}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
          <a href="https://pypi.org/project/farness/" className={`${s.btn} ${s.btnGhost}`}>
            <span className={s.mono}>pip install farness</span>
          </a>
        </div>
        <div className={a.ctaCli}>
          <code className={s.mono}>
            $ farness new "Should I take this job?"<br/>
            Created decision [a3f8b2c1]: Should I take this job?
          </code>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className={a.footer}>
      <p>
        Built by <a href="https://github.com/MaxGhenis">Max Ghenis</a>.
        Inspired by superforecasting, Fermi estimation, and the desire for better decisions.
      </p>
    </footer>
  )
}

function App() {
  return (
    <div className={`${darkTheme} ${a.appDark}`}>
      <Header />
      <Hero />
      <main className={a.appMain}>
        <Section id="problem" label="01" title="The problem">
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

        <Section id="reframe" label="02" title="The reframe">
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

        <InteractiveDemo />

        <Section id="framework" label="03" title="The framework">
          <FrameworkSteps />
        </Section>

        <Section id="why" label="04" title="Why this works">
          <WhyItWorks />
        </Section>

        <Section id="research" label="05" title="The research">
          <p>
            How do we know structured frameworks actually improve LLM decision support? We developed
            a methodology called <strong>stability-under-probing</strong>: measuring whether responses
            hold up when challenged with base rates, new information, and adversarial pressure.
          </p>
          <p>
            Our experiments show that framework-guided responses are more stable under probing—not
            because they're stubborn, but because they've already incorporated the considerations
            that probing would surface. Naive responses converge toward where the framework started.
          </p>
          <p>
            <Link to="/paper" className={a.inlineLink}>Read the full paper →</Link>
          </p>
        </Section>
      </main>
      <CTA />
      <Footer />
    </div>
  )
}

export default App
