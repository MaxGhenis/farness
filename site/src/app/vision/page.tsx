import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Farness vision — working document",
  description:
    "Working synthesis of the Farness company vision: the forecasting layer for civilization, built on encoded law, calibrated synthetic populations, and open-source AI.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function VisionPage() {
  return (
    <div>
      <Header />
      <article className="max-w-[680px] mx-auto px-8">
        <header className="text-center py-24 border-b border-[var(--theme-border)] mb-24 animate-[fade-up_0.6s_ease-out] max-[600px]:py-16">
          <p className="[font-family:var(--font-mono)] text-[0.65rem] tracking-[0.15em] uppercase text-accent mb-4">
            Working document · not for distribution
          </p>
          <h1 className="[font-family:var(--font-display)] text-[clamp(2rem,5vw,3rem)] font-light leading-[1.2] mb-8 tracking-[-0.02em]">
            The forecasting layer for civilization
          </h1>
          <p className="text-[1.15rem] text-[var(--theme-text-muted)] max-w-[520px] mx-auto leading-[1.6]">
            A synthesis of the bigger bet:{" "}
            <span className="[font-family:var(--font-editorial)] italic">
              farness
            </span>{" "}
            as the open-source AI lab building the foresight stack — encoded
            law, calibrated populations, mechanistic simulation, and markets on
            every consequential cell of government and policy data.
          </p>
        </header>

        <div className="prose-content">
          <section>
            <h2>The bet</h2>
            <p>
              AI alignment is not a values problem. It is a{" "}
              <em>consequence-visibility</em> problem. If every consequential
              action — by a person, an organization, or an AI — came with a
              calibrated forecast of its effects, scored against reality, with
              feedback into the predictor, most of what we call alignment
              dissolves into ordinary decision-making. The bottleneck is not
              getting AI to want the right things. The bottleneck is making
              consequences visible <em>before</em> they happen.
            </p>
            <p>
              Build the infrastructure for that visibility and you have done
              more for alignment than any preference-tuning regime. That
              infrastructure is what{" "}
              <span className="[font-family:var(--font-editorial)] italic">
                farness
              </span>{" "}
              builds.
            </p>
          </section>

          <section>
            <h2>What AI&apos;s job actually is</h2>
            <p>
              Yoshua Bengio&apos;s &ldquo;Scientist AI&rdquo; agenda gets about
              eighty percent of the way: AI should be a Bayesian inference
              engine that produces causal and probabilistic answers, not an
              actor. But he frames non-agency as a <em>safety</em> proposal — a
              way to dodge agentic risk. We propose something stronger and more
              operational: forecasting isn&apos;t a safer mode for AI, it&apos;s{" "}
              <em>the job description</em>.
            </p>
            <p>
              That reframing dissolves alignment instead of trying to solve it.
              If AI&apos;s role is to forecast consequences against given
              objectives, AI never needs values. Only humans, or systems derived
              from humans, do.
            </p>
            <p>
              The mental model: cascading OKRs at civilization scale. Every
              organization that functions already runs on nested objectives —
              top-level outcomes, mid-level results, low-level actions, each
              level scored against the level above. AI sits at every node as the
              forecasting layer. Given any action, predict its consequences
              against the OKRs in scope. Humans own the OKR tree. The question{" "}
              <em>what should the AI do in situation X?</em> collapses to{" "}
              <em>
                what does it forecast for each option&apos;s consequences
                against the OKRs in scope?
              </em>
            </p>
            <p>
              Value forecasting closes the recursion. The top of the OKR tree
              has to come from somewhere. If it comes from current human
              preferences as expressed in 2026 RLHF labels, we&apos;ve locked in
              present-day confusion. If it comes from{" "}
              <em>
                forecasted post-reflection values with uncertainty
                quantification
              </em>
              , the OKR tree updates as humanity updates. This is empirical
              moral reasoning, not philosophy.
            </p>
          </section>

          <section>
            <h2>Two levels of harness</h2>
            <p>
              Forecasting-as-harness operates at two levels, and both matter.
            </p>
            <p>
              <strong>Level one</strong> is the one above: AI&apos;s job is to
              forecast. The discipline of forecasting — KPIs, options, base
              rates, confidence intervals, disconfirming evidence, resolution
              rules, calibration scoring — is the harness on AI. It makes AI
              outputs accountable, scoreable, and revisable.
            </p>
            <p>
              <strong>Level two</strong> is structural and equally important:
              AI does forecasting by{" "}
              <em>harnessing computational tools</em>, not by being an oracle.
              The model conducts microsim, structural economic models,
              agent-based simulators, synthetic populations, statistical
              methods, and other LLMs when text-pattern reasoning is genuinely
              the best available approach. The AI is the conductor; the tools
              do the heavy lifting; the calibration discipline keeps the whole
              system honest.
            </p>
            <p>
              This is a real architectural difference from the frontier lab
              consensus. They train oracles that absorb text and emit text,
              with tools bolted on as features. We train{" "}
              <em>conductors</em> from the ground up — models whose default
              behavior on a consequential forecasting question is to decompose
              into tool calls, parameterize them, run them, integrate outputs,
              and produce a calibrated distribution with an audit trail of
              which tools were called and why. Closer to how a senior analyst
              uses Excel, Python, Stata, and domain knowledge than to how a
              chat assistant produces an answer.
            </p>
            <p>
              The phasing follows naturally. Today, the orchestration is
              mostly human and lightweight — pick the right model, run it,
              format the output. Tomorrow, the orchestration is itself an AI
              that has learned which tool to call when, with which parameters,
              and how to propagate uncertainty across composed results. The
              calibration-native foundation model we describe later is
              specifically a model trained as this kind of conductor, not as a
              text oracle.
            </p>
          </section>

          <section>
            <h2>The infrastructure gap</h2>
            <p>
              If AI&apos;s job is forecasting, the alignment field has badly
              mis-invested. RLHF, constitutional AI, preference tuning — these
              are all interventions on the LLM&apos;s <em>values</em> rather
              than on its <em>forecasting capacity</em>. The high-leverage
              investments are different:
            </p>
            <ul>
              <li>
                <strong>World models</strong> — high-fidelity simulators of
                social, economic, and physical systems. Guy Orcutt&apos;s 1957
                program, finally compute-feasible.
              </li>
              <li>
                <strong>Forecasting protocols</strong> — structured discipline
                that turns predictions into scorable artifacts: KPIs, options,
                base rates, disconfirming evidence, confidence intervals,
                resolution rules.
              </li>
              <li>
                <strong>Resolution infrastructure</strong> — prediction markets
                and verified-outcome corpora that close the loop between
                forecast and reality.
              </li>
              <li>
                <strong>Value forecasters</strong> — empirical predictions of
                what humanity would value after extended reflection, tested
                against historical survey data.
              </li>
              <li>
                <strong>Calibration-native models</strong> — foundation models
                trained from scratch to think in distributions, not modes; to
                preserve heterogeneity, not collapse it.
              </li>
            </ul>
            <p>
              The LLM is one component. Everything else is the rest. Most
              alignment funding is going to the one component.{" "}
              <span className="[font-family:var(--font-editorial)] italic">
                farness
              </span>{" "}
              builds the rest.
            </p>
          </section>

          <section>
            <h2>The stack</h2>
            <p>
              Two independent organizations, one coherent stack, with
              PolicyEngine as an adjacent partner nonprofit. Each open-source,
              each load-bearing for the others.
            </p>
            <blockquote>
              <p>
                <strong>Axiom Foundation</strong> — encode the law.
              </p>
              <p>
                <strong>Farness</strong> — simulate, forecast, and trade the
                consequences.
              </p>
            </blockquote>
            <h3>Axiom Foundation — the computable layer for all of law</h3>
            <p>
              Axiom is an independent 501(c)(3) building open infrastructure
              for encoded law: corpus (statutes, regulations, guidance, case
              law), RuleSpec (a typed DSL for executable encoding), Citator
              (the dependency graph of holdings and modifications), and an
              LLM-assisted encoder pipeline. Tax is the wedge; the eventual
              scope is every parameter in every statute, regulation,
              ordinance, and holding — federal, state, local.
            </p>
            <p>
              Without Axiom, &ldquo;forecast the impact of policy X&rdquo; has
              to bottom out in hand-encoded rules that nobody can audit. With
              Axiom, every policy parameter becomes a machine-readable,
              testable, traceable artifact.
            </p>
            <h3>Farness — the AI lab, simulation engine, and market venue</h3>
            <p>
              Farness is the integrated operating layer. Four components, one
              brand, one org:
            </p>
            <ul>
              <li>
                <strong>The forecasting protocol</strong> — KPIs, options, base
                rates, disconfirming evidence, confidence intervals, resolution
                rules, calibration scoring. The discipline that turns
                forecasts into scorable artifacts. Already shipping as a
                Python package, CLI, MCP server, and Claude/Codex skill.
              </li>
              <li>
                <strong>The Farness simulation engine</strong> — the
                computational layer that combines microsim (PolicyEngine-style
                mechanistic rules over Axiom-encoded law), structural economic
                models, agent-based components, statistical methods, and LLM
                judgment for genuinely irreducible questions. Includes the
                synthetic-population substrate: <strong>ARCH</strong> (the
                ground-truth set of government statistics) and{" "}
                <strong>MICROPLEX</strong> (the calibrated synthetic
                micro-data file that preserves joint distributions and
                demographic structure while preserving privacy). MICROPLEX is
                the only path to training-scale population data that
                preserves heterogeneity without leaking real individuals —
                which means it is the only substrate on which
                calibration-native AI can be trained at scale.
              </li>
              <li>
                <strong>The market venue</strong> — initially on Manifold (MIT
                license, play money, full API), eventually on a forked
                open-source regulated venue. Every consequential ARCH cell and
                every Axiom-encoded policy parameter gets a continuously-quoted
                market with calibration history.
              </li>
              <li>
                <strong>The research arm</strong> — calibration-native
                foundation models trained as tool-orchestrators (described
                later), value-forecasting research, calibration science, and
                open-source releases of every artifact.
              </li>
            </ul>
            <p>
              The simulation engine takes a deterministic policy state (drawn
              from Axiom-encoded statutes at a given time, possibly sampled
              from the joint distribution of Farness policy markets) and
              produces a distribution over ARCH cells. That distribution is
              both the forecast and the market maker&apos;s prior.
            </p>
          </section>

          <section>
            <h2>AIs in silico — the judgment-to-mechanism loop</h2>
            <p>
              The Farness simulation engine is not pure mechanism. Reality
              contains pieces that aren&apos;t yet captured in any
              computational model — emergent behavioral responses, structural
              changes outside the training distribution, political dynamics,
              regime shifts, novel interactions. For these, LLM judgment is
              the right tool, not a fallback.
            </p>
            <p>
              The methodology has a name worth preserving: <em>AIs in silico</em>
              . AI collaborating with mechanistic simulation, in silico,
              to forecast the future. This is the framing that originally
              motivated the simulation work and the brand it should be
              referred to internally and in research output.
            </p>
            <p>
              The structural feature is a closed loop:
            </p>
            <ol>
              <li>
                <strong>Judgment.</strong> The orchestrator routes a question
                to LLM judgment when the computational models don&apos;t
                capture what matters. The LLM produces a distribution with
                explicit uncertainty.
              </li>
              <li>
                <strong>Resolution.</strong> The forecast meets reality
                through markets or published outcomes. Calibration is scored.
              </li>
              <li>
                <strong>Evaluation.</strong> We benchmark and evaluate LLM
                judgment specifically — where does it help, where does it
                hurt, what kinds of questions does it improve calibration on,
                what kinds does it not?
              </li>
              <li>
                <strong>Migration.</strong> When LLM judgment consistently
                captures something the computational models miss, the team
                works to formalize that pattern into the simulation engine —
                as a microsim rule, a structural equation, an agent behavior,
                or a new component. Successful judgment becomes mechanism.
              </li>
              <li>
                <strong>Frontier advance.</strong> The irreducibility frontier
                moves outward. The LLM&apos;s job becomes harder questions;
                the computational layer becomes more comprehensive. The
                system gets better at both layers simultaneously.
              </li>
            </ol>
            <p>
              This is how good empirical science already works: phenomena that
              were once judged by experts (weather, disease prognosis,
              structural failure) incrementally got encoded into mechanistic
              models as understanding accumulated. Farness runs this loop
              programmatically, at scale, with markets as the ground-truth
              feedback signal.
            </p>
            <p>
              The competitive moat compounds across both layers. The
              computational model gets more accurate over time as judgment
              gets migrated in. The LLM judgment gets better trained on the
              irreducible residual. Neither layer alone is the moat; the loop
              between them is.
            </p>
          </section>

          <section>
            <h2>The product: policy futures</h2>
            <p>
              The headline product is a new category of open-source prediction
              market: <em>policy futures</em>. Three coupled market types fall
              out of the stack naturally.
            </p>
            <p>
              <strong>Outcome markets</strong> on every cell of government
              published data — every BLS series, every BEA NIPA cell, every
              Census ACS variable by geography, every IRS SOI table. Government
              statistics resolve automatically on official publication, on known
              schedules. No human adjudicator, no settlement dispute. The
              marginal cost of making a market in another ARCH cell, once
              MICROPLEX and the simulation engine are running, is near zero.
            </p>
            <p>
              <strong>Policy state markets</strong> on every Axiom-encoded
              parameter — the CTC monthly value in 2027, the federal minimum
              wage on a given date, the SALT cap dollar limit in TY2027, the
              SNAP work-requirement age threshold. Existing political prediction
              markets cover whether a bill passes; policy futures cover what the
              specific number is at a given time.
            </p>
            <p>
              <strong>Conditional markets</strong> on outcomes given policy
              states. Given the Senate version of a tax bill passes by Q2, what
              is the 2028 official child poverty rate? Given SALT is fully
              lifted, what is FY2028 federal individual income tax revenue?
              These markets are the unique product of the integrated stack.
              Nobody else has the encoded-policy corpus, the calibrated
              populations, the microsim engine, the market infrastructure, and
              the calibration-native models simultaneously. Each piece exists
              somewhere; the integration does not.
            </p>
            <p>
              The point of comparison: CBO and JCT produce one number per
              scenario, six months late, with no uncertainty quantification.
              Policy futures produce continuously updated probability
              distributions, transparent, calibrated, open, and scored against
              reality on every publication.
            </p>
          </section>

          <section>
            <h2>The proof of concept lives on Manifold</h2>
            <p>
              Manifold Markets is MIT-licensed, fully open source, API-driven,
              play-money. Every constraint that matters for an open-source-only
              thesis is already satisfied. We do not need a regulated real-money
              venue to prove the thesis. We need a public, working,
              calibration-tracked Farness market that quotes hundreds of ARCH
              cells and policy parameters with conditional pricing, running on
              Manifold next quarter. That establishes the category in public on
              play money. Real-money venue follows when the regulatory path is
              clear and aligned with the open-source rule.
            </p>
            <p>
              The play-money constraint is not a limitation, it is a feature: it
              removes the regulatory complexity that would otherwise consume the
              first two years, and it lets us run thousands of markets
              programmatically while we build the muscle. Calibration scores
              published openly are credible regardless of whether the underlying
              currency is real or play. Weather forecasters and superforecasters
              built their reputations the same way.
            </p>
            <p>
              When the time comes, the regulated path becomes a build-it
              project, not a partner-with-someone project. Forking Manifold and
              pursuing CFTC approval as the world&apos;s first open-source
              Designated Contract Market is itself a category-defining move that
              attracts the right talent and capital. Closed-source competitors
              (Kalshi, FiscalNote, Polymarket) keep their lanes. We do not need
              theirs.
            </p>
          </section>

          <section>
            <h2>Calibration-native foundation models</h2>
            <p>
              Current frontier LLMs are architecturally and objective-function
              wrong for forecasting. RLHF is anti-calibration by design — it
              rewards confident, decisive answers because users prefer them.
              Models actively get trained <em>away</em> from honest
              uncertainty. They produce modes, not distributions. They collapse
              population heterogeneity to averages. They hallucinate with
              uncalibrated confidence at every reasoning step. They also
              treat tool use as an afterthought — bolted on as a feature
              rather than baked into the training objective.
            </p>
            <p>
              The Farness research arm builds an alternative architecture, in
              which the model is trained as a <em>tool-orchestrator</em> from
              pretraining, not as an oracle with tool-use added later:
            </p>
            <ul>
              <li>
                <strong>Distribution-output models.</strong> Not a single
                softmax over tokens. Explicit distributions over claims,
                answers, and decisions, weighted by both aleatoric and epistemic
                uncertainty.
              </li>
              <li>
                <strong>
                  Population-of-perspectives pretraining.
                </strong>{" "}
                Training data tagged with the population subgroup it represents
                — demographic, ideological, expert vs. lay, time period. At
                inference, the model produces the <em>distribution</em> of
                perspectives, not the mode.
              </li>
              <li>
                <strong>Calibration loss as first-class pretraining.</strong>{" "}
                Brier and log-score terms against held-out resolution data,
                wherever resolved forecasts are available — prediction markets,
                GSS time series, scientific replication corpora.
              </li>
              <li>
                <strong>Hierarchical uncertainty propagation.</strong>{" "}
                Architectural mechanism for uncertainty to flow through
                reasoning steps, not just exist at outputs. Bayesian neural
                networks at scale, finally cracked.
              </li>
              <li>
                <strong>Tool-orchestration as a first-class capability.</strong>{" "}
                The model is trained to route forecasting questions to the
                right tool — microsim, structural model, agent-based
                simulator, statistical method, or LLM judgment — with the
                right parameters, with appropriate uncertainty propagation
                across composed results. Tool selection, parameter
                generation, and result integration are pretraining
                objectives, not RLHF add-ons. The model knows when its
                uncertainty is &ldquo;I haven&apos;t seen this
                pattern&rdquo; versus &ldquo;this requires actual
                simulation.&rdquo;
              </li>
              <li>
                <strong>Resolution-grounded RL.</strong> Post-training reward is
                calibration on resolved forecasts, not human preference on
                confident-sounding answers. Training away from sycophancy by
                construction.
              </li>
            </ul>
            <p>
              No frontier lab is doing this as a first-class research program.
              They cannot — their product economics require confident
              assistants, and the market they serve wants helpful answers, not
              calibrated ones. We can ship a model that says &ldquo;I don&apos;t
              know, and here is the shape of my uncertainty&rdquo; because
              uncertainty <em>is</em> the product.
            </p>
          </section>

          <section>
            <h2>Open source, all the way down</h2>
            <p>
              The whole stack is 100% open source. Not open core, not
              dual-licensed, not eventually-open. Open. The models, the
              weights, the methods, the simulation engine, the encoded law, the
              MICROPLEX outputs, the market protocol, the calibration history.
            </p>
            <p>
              This is a constraint with real cost. We give up
              proprietary-trading magnitude monetization. We give up the
              fastest path to a CFTC-regulated real-money venue (Kalshi
              partnership is off the table — they are closed-source). We give up
              the traditional VC ceiling. We accept slower compounding on
              several axes.
            </p>
            <p>
              The constraint also resolves several tensions. Talent: the best
              researchers want their work seen, not hidden. Open source is the
              single most effective recruiting tool in AI. Funders: alignment
              capital (Open Philanthropy, Survival and Flourishing Fund,
              Astera, Schmidt Futures, Mozilla, sovereign AI programs) flows to
              public-good infrastructure in ways it does not flow to closed
              labs. Thesis credibility: the consequence-visibility thesis only
              works if consequences are actually visible. Closed forecasting
              infrastructure is a contradiction in terms.
            </p>
            <p>
              The realistic envelope, given the constraint: $30–200M annual
              operating budget at maturity. Mozilla, Apache Foundation,
              Wikimedia, AI2 in spirit. Specifically for forecasting
              infrastructure. The financial ceiling is lower than the closed
              alternative; the mission ceiling is dramatically higher. It is
              the right trade for this thesis.
            </p>
          </section>

          <section>
            <h2>What this is not</h2>
            <p>
              <em>Not a next-Anthropic.</em> We do not aim to train
              frontier-scale general-purpose chat models. We train
              calibration-native specialized models, on a different objective
              and data mix, at the scale the forecasting workload requires.
            </p>
            <p>
              <em>Not a hedge fund.</em> A small, publicly-disclosed fund
              operates as the truth-telling layer — every trade and forecast
              public, P&amp;L as the most credible marketing artifact possible —
              but it is not the revenue center. Open source erases proprietary
              alpha; the fund exists to demonstrate the thesis, not to capture
              Rehoboam-scale wealth.
            </p>
            <p>
              <em>Not FiscalNote.</em> Policy-intelligence subscription
              businesses sell closed legislative predictions to corporate
              lobbyists. We build open infrastructure that displaces the need
              for those subscriptions and serves a different audience:
              governments, researchers, advocacy organizations, AI labs hedging
              deployment risk, citizens, long-horizon forecasters.
            </p>
            <p>
              <em>Not Kalshi or Polymarket.</em> Existing regulated and
              crypto-native prediction markets cover headline events at low
              granularity. We cover the full Axiom × ARCH grid
              mechanistically, open-source, with conditional pricing
              included.
            </p>
            <p>
              <em>Not an oracle.</em> The frontier-lab consensus is to train
              models that absorb text and emit confident text. We train
              conductors: models whose default behavior on a consequential
              question is to route to the right computational tool, run it,
              and integrate the result with calibrated uncertainty. The
              orchestra is the simulation engine, MICROPLEX, Axiom-encoded
              law, statistical methods, and LLM judgment for the irreducible
              residual. The model is the conductor.
            </p>
            <p>
              <em>Not a static research lab.</em> Every market resolution is a
              labeled training example. The flywheel is structural: more
              markets, more resolutions, more calibration data, better models,
              better forecasts, more markets.
            </p>
          </section>

          <section>
            <h2>Where this lands organizationally</h2>
            <p>
              Three legally independent organizations, technically integrated as
              one stack. Each open-source, each with its own governance and
              funding.
            </p>
            <ul>
              <li>
                <strong>Axiom Foundation</strong> — 501(c)(3). Mission: a
                computable layer for all of law. Max as founder and (probably)
                interim CEO during the buildout period; succession to Ariel
                Kennan or similar within 12–18 months. Ballmer Group as
                anchor funder. PolicyEngine, MyFriendBen, Nava, Gary Community
                Ventures, Amplifi, WorkMoney, and others as ecosystem partners.
              </li>
              <li>
                <strong>Farness</strong> — the AI lab, simulation engine, and
                market venue, integrated under one brand and one org. Likely
                a 501(c)(3) or PBC with mission-locked governance, depending
                on regulatory shape. Owns farness.ai (already secured).
                Founder: Max. Absorbs the work previously framed under the
                Cosilico brand — ARCH, MICROPLEX, the simulation engine — into
                Farness as the computational layer of the integrated stack.
                Building from a base of existing work (Farness Python
                package, Claude plugin, MCP server, the existing simulation
                work, the Society-in-Silico manuscript). Initial product
                wedge: Manifold-hosted policy futures and ARCH outcome
                markets, plus the open-source calibration-native model
                research program.
              </li>
              <li>
                <strong>PolicyEngine</strong> — continues independently as the
                tax-and-benefits microsim engine, serving governments and
                advocacy organizations. Max steps to Chair / Founder role,
                successor CEO. Adjacent partner to Axiom and Farness, not
                merged.
              </li>
            </ul>
            <p>
              <em>Society in Silico</em> — the book — is the public manifesto
              that ties the three together. It is Max&apos;s flagship
              publication and the place the integrated thesis lives in
              long-form prose.
            </p>
          </section>

          <section>
            <h2>The category-defining naming</h2>
            <p>
              Categories without names belong to whoever names them first.
              Working terms we should establish in writing and in practice:
            </p>
            <ul>
              <li>
                <strong>Forecasting-as-harness</strong> — the alignment thesis.
                The contraction <em>farness</em> = <em>fo</em>recasting{" "}
                <em>a</em>s ha<em>rness</em> encodes it.
              </li>
              <li>
                <strong>Policy futures</strong> — the market category. Parallels
                interest-rate futures, weather futures, energy futures. Signals
                tradeable, regulated, institutional-grade.
              </li>
              <li>
                <strong>Calibration-native foundation models</strong> — the
                model category. Distinguished from RLHF-tuned chat models by
                training objective, not just fine-tuning.
              </li>
              <li>
                <strong>AIs in silico</strong> — the methodology. AI
                collaborating with mechanistic simulation, in silico, to
                forecast the future. Names the judgment-to-mechanism loop
                that is the structural advantage of the Farness simulation
                engine.
              </li>
              <li>
                <strong>Society in Silico</strong> — the book and the broader
                public manifesto. Computational models of social systems used
                for democratic policy reasoning, written for a general
                audience.
              </li>
              <li>
                <strong>Consequence visibility</strong> — the alignment
                principle. Reframe alignment as the problem of making
                consequences visible before actions, rather than installing
                preferences after them.
              </li>
              <li>
                <strong>The forecasting layer for civilization</strong> — the
                product framing. What the stack is, when you zoom all the way
                out.
              </li>
            </ul>
          </section>

          <section>
            <h2>Honest caveats and open questions</h2>
            <p>
              <strong>Regulatory uncertainty on conditional markets.</strong>{" "}
              Outcome-only event contracts are CFTC-blessed via Kalshi.
              Conditional contracts on policy-outcome combinations may require
              new contract categories. Plan for litigation as part of the
              category-creation process, not a side effect of it.
            </p>
            <p>
              <strong>Liquidity bootstrapping is compound.</strong> Conditional
              markets need both policy and outcome legs liquid, plus traders
              willing to take the conditional spread. Microsim-driven market
              making solves the cold-start for outcome markets; conditional
              markets need real counterparties from institutional hedgers
              (insurers, REITs, banks, agricultural producers, public-sector
              unions) whose P&amp;L is policy-sensitive.
            </p>
            <p>
              <strong>Simulation engine becomes production infrastructure.</strong>{" "}
              Markets quote continuously; simulations need to produce updated
              priors fast enough to follow policy news. PolicyEngine&apos;s
              current research-grade cadence is the wrong order of magnitude.
              Production-grade microsim is an engineering hard requirement, not
              a nice-to-have.
            </p>
            <p>
              <strong>Political sensitivity of policy markets is real.</strong>{" "}
              Markets that price &ldquo;child poverty under reform X = 12%&rdquo;
              can be politically weaponized. Editorial standards, neutral
              framing, and a clear separation between forecast and advocacy
              matter from day one. The Society-in-Silico neutral-infrastructure
              framing helps; it is not sufficient on its own.
            </p>
            <p>
              <strong>Calibration-native foundation models are research,
              not engineering.</strong> Hierarchical uncertainty propagation at
              scale, training-objective design for calibration without
              sacrificing capability, cheap evaluation of distributional
              quality — these are open research problems. Plan for 18–36
              months between starting the program and shipping a model that
              meaningfully beats post-trained frontier baselines on real
              benchmarks.
            </p>
            <p>
              <strong>The fairness homophone is permanent.</strong>{" "}
              <em>Farness</em> will be misheard as <em>fairness</em> in audio
              and conversational contexts. Mitigated by branding investment,
              never solved. We accept the cost in exchange for the etymological
              and thesis-carrying work the name does.
            </p>
          </section>

          <section>
            <h2>What we are building toward</h2>
            <p>
              At maturity, the integrated stack looks like this. Every law is
              encoded in Axiom and queryable as code. Every household,
              individual, and firm is simulatable through the Farness
              simulation engine — microsim, structural, agent-based, LLM
              judgment, MICROPLEX populations — at the scale and granularity
              any policy question requires. Every consequential ARCH cell —
              every published government statistic — has a continuously-quoted
              Farness market with calibration history. Every consequential
              policy parameter has a Farness market on its future value. Every
              relevant counterfactual has a conditional market on outcomes
              given policy state. Calibration-native foundation models trained
              as tool-orchestrators read and reason over the whole graph. The
              judgment-to-mechanism loop runs continuously, with successful
              LLM judgment migrating into the computational layer over time.
              Every market resolution feeds the next training cycle.
            </p>
            <p>
              The world this produces is one where the consequences of
              consequential decisions are visible before the decisions are
              made, with calibrated uncertainty, scored against reality, and
              open to anyone to query, audit, replicate, or extend.
            </p>
            <p>
              That is the foresight layer for civilization. That is what{" "}
              <span className="[font-family:var(--font-editorial)] italic">
                farness
              </span>{" "}
              is for.
            </p>
            <p className="text-center mt-16">
              <Link
                href="/thesis"
                className="inline-flex items-center gap-2 py-4 px-8 [font-family:var(--font-display)] text-[0.9rem] no-underline bg-[var(--theme-text)] text-[var(--theme-bg)] border border-[var(--theme-text)] rounded-lg transition-all duration-200 hover:bg-accent hover:border-accent hover:no-underline"
              >
                Read the thesis →
              </Link>
            </p>
          </section>
        </div>

        <footer className="text-center py-24 mt-16 border-t border-[var(--theme-border)] text-[var(--theme-text-muted)] text-[0.85rem]">
          <p>
            Working synthesis by{" "}
            <a href="https://maxghenis.com">Max Ghenis</a>. Living document.
            Not for distribution.
          </p>
        </footer>
      </article>
    </div>
  );
}
