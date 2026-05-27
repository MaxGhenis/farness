import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Farness vision — working document",
  description:
    "Working synthesis of the Farness Foundation vision: open predictions as a new species of epistemic infrastructure, built for the agents of tomorrow.",
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
            Open predictions
          </h1>
          <p className="text-[1.15rem] text-[var(--theme-text-muted)] max-w-[520px] mx-auto leading-[1.6]">
            <span className="[font-family:var(--font-editorial)] italic">
              farness
            </span>{" "}
            is a 501(c)(3) foundation building open, transparent, calibrated
            AI-agent ensembles that produce continuously-updated forecasts on
            consequential outcomes — and a public substrate for the agents of
            tomorrow.
          </p>
        </header>

        <div className="prose-content">
          <section>
            <h2>The bet</h2>
            <p>
              The next layer of open infrastructure after open source software,
              open data, and open weights is <em>open predictions</em>:
              continuously-updated forecasts produced by AI-agent ensembles
              where every step of reasoning is inspectable, every tool call is
              logged, every calibration result is published, and every
              methodology improvement is shared.
            </p>
            <p>
              Existing prediction markets aggregate information but cannot show
              their work. Every trader has private motives, private
              information, private cognitive biases. Even Metaculus comments
              are partial. AI agents are the first forecasters whose reasoning
              is fully visible — not because they choose to share it but
              because the medium is structurally transparent. Every prior
              weighting, every tool selection, every update on new information
              is inspectable.
            </p>
            <p>
              That transparency creates a compounding loop nothing else has.
              Aggregate the traces and systematic biases become visible across
              the field. Each bias becomes a fix. Each fix produces a
              generation of agents measurably better than the last. This is
              the same dynamic that made open-source software durable: anyone
              can see the bug, anyone can submit the patch. Applied to
              forecasting, it produces a new species of epistemic
              infrastructure.
            </p>
          </section>

          <section>
            <h2>What we build</h2>
            <p>
              Farness Foundation (501(c)(3)) operates four programs of varying
              prominence:
            </p>
            <h3>Farness — the open-predictions platform</h3>
            <p>
              The foundation's flagship. AI-agent ensembles running
              continuously across the structured grid of consequential
              questions: every government statistic the Bureau of Economic
              Analysis, Bureau of Labor Statistics, Census Bureau, and IRS
              publishes; every policy parameter encoded by Axiom; every
              counterfactual conditional question that drives policy and
              economic decisions. The platform publishes the forecasts, the
              agent traces, the calibration history, and the running
              methodology notes openly. Funded compute scales the depth of the
              ensemble; the substrate stays free at the point of use.
            </p>
            <h3>PolicyEngine — microsim engine and custom policy analysis</h3>
            <p>
              The established product brand the policy community already
              knows. Open-source microsimulation for US, UK, and Canadian
              tax-benefit systems, plus custom analysis services for
              governments, think tanks, advocacy organizations, and
              researchers. PolicyEngine continues operationally exactly as it
              does today; the new structural fact is that it sits inside the
              Farness Foundation as a continuing product brand and is also one
              of the substrate engines the Farness platform calls when
              producing policy-conditional forecasts. Policy folks who know
              PolicyEngine keep interacting with PolicyEngine. The foundation
              gives the work a stronger funding base and broader institutional
              identity.
            </p>
            <h3>Microplex — calibrated synthetic populations</h3>
            <p>
              The synthetic micro-data substrate that powers PolicyEngine's
              simulations and provides training-scale population data for
              calibration-native AI research. Lives inside PolicyEngine
              operationally. Published openly as a Hugging Face dataset for
              outside consumption; methodology and synthesizer code in the
              open. Replaces PolicyEngine's current Enhanced CPS as the
              substrate for policy microsimulation, with substantially better
              calibration to administrative data and broader applicability.
            </p>
            <h3>Farness Decisions — personal and team decision tool</h3>
            <p>
              The existing open-source Python package, CLI, MCP server, and
              Claude Code skill that turns advice-seeking into structured
              forecasting (KPIs, options, confidence intervals, resolution
              rules, calibration tracking). Small relative to the platform but
              load-bearing as the consumer-facing artifact of the
              forecasting-as-harness thesis and a useful tool for individual
              and team decisions.
            </p>
          </section>

          <section>
            <h2>The transparency advantage is the durable moat</h2>
            <p>
              You cannot close-source your way to a better open-predictions
              platform than Farness. The transparency is constitutive: every
              improvement to methodology, every newly-discovered bias, every
              successful tool integration is shared, peer-reviewed, and
              available to everyone working in the field. Proprietary
              forecasting infrastructure cannot do this — its improvements
              stay internal, its biases stay hidden, its tool integrations
              stay locked. Over time the open substrate compounds and the
              closed substrate doesn't.
            </p>
            <p>
              The same dynamic that made Linux durable against superior closed
              competitors is the one that protects Farness's position. The
              compounding work isn't done by Farness alone; it's done by
              everyone who uses the substrate and contributes back. The
              foundation maintains, integrates, sets direction, and ensures
              the public-good character. The community does the rest.
            </p>
          </section>

          <section>
            <h2>Built for the agents of tomorrow</h2>
            <p>
              The infrastructure that matters most gets built ahead of the
              capability that needs it. TCP/IP was designed for a few hundred
              nodes and scaled to billions because the design anticipated
              future use. Kubernetes solved orchestration problems most
              organizations didn't have yet when it shipped. Linux was built
              when computing was tiny and scaled with hardware nobody had
              imagined. Substrate-builders capture disproportionate value
              because they're already there when the demand shows up.
            </p>
            <p>
              Farness is built with this in mind. Every capability is
              reachable through a clean machine-callable API; future agents
              won't fill out web forms. Every agent trace is structured for
              downstream consumption by other agents, not just human readers.
              Every tool in the simulation engine is self-describing so that
              agents that haven't been invented yet can discover what's
              available. Permissioning anticipates millions of automated
              participants, not hand-issued API keys. Calibration scoring is
              queryable, so current agents can learn from history and future
              agents can preferentially route to tool configurations with
              proven track records.
            </p>
            <p>
              This costs a little more today and pays disproportionately when
              capability arrives. By the time agents are reliably orchestrating
              tools, composing pipelines, and proposing methodology
              improvements, the substrate they need will already be open,
              public, free, and continuously calibrated. Closed substrate
              forces tomorrow's agents to negotiate access, pay rent, deal
              with proprietary APIs. Open substrate is the permission-less
              infrastructure the next decade of AI development can build on.
            </p>
          </section>

          <section>
            <h2>The stack</h2>
            <p>
              Two independent 501(c)(3) foundations, technically integrated as
              one open stack:
            </p>
            <blockquote>
              <p>
                <strong>Axiom Foundation</strong> — computable layer for all
                law and the structured government-data layer (Arch). Encoded
                statutes, regulations, holdings, and the metadata linking
                published government statistics to the laws that mandate them.
                Ballmer-funded. Separate organization, shared substrate.
              </p>
              <p>
                <strong>Farness Foundation</strong> — open-predictions
                platform, microsimulation engine and custom policy analysis
                (PolicyEngine), synthetic-population substrate (Microplex),
                personal decision tool (Farness Decisions), and the research
                program on calibration-native foundation models and value
                forecasting.
              </p>
            </blockquote>
            <p>
              The Farness platform consumes Axiom (encoded law and government
              data architecture) and Microplex (population substrate) as
              inputs, runs ensembles through PolicyEngine and other
              computational engines, and publishes calibrated forecasts.
              Policy partners interact with PolicyEngine directly through its
              own brand and channels. New audiences — AI safety, agencies
              funding their own forecasts, prediction-market researchers,
              broader policy analysts — interact with Farness as the umbrella
              platform.
            </p>
          </section>

          <section>
            <h2>Open predictions as a movement</h2>
            <p>
              The category needs a name to anchor its identity. The lineage:
            </p>
            <ul>
              <li>
                <strong>Open source software</strong> opened the code. Linux,
                Apache, Mozilla. The free software movement and its successors
                made source available and rewrote the economics of software
                distribution.
              </li>
              <li>
                <strong>Open data</strong> opened the inputs. Wikipedia,
                Common Crawl, OpenStreetMap, government open-data portals.
                The raw material of analysis became public and citable.
              </li>
              <li>
                <strong>Open weights</strong> opened the reasoning machinery.
                Allen Institute's Olmo, Llama, Mistral, DeepSeek. The trained
                models themselves became available for inspection and reuse.
              </li>
              <li>
                <strong>Open predictions</strong> opens the reasoning
                <em>itself</em>, on consequential questions. Every prior,
                every tool call, every update is auditable. The output isn't
                just the forecast — it's the full chain of reasoning that
                produced it.
              </li>
            </ul>
            <p>
              Each step opens more of the epistemic process. Each step
              produces durable public goods that the closed alternative cannot
              match. Open predictions is the natural next layer, and Farness
              is the foundation building it.
            </p>
          </section>

          <section>
            <h2>What this complements (and what it isn't)</h2>
            <p>
              <em>Complements Anthropic and the frontier labs.</em> Anthropic
              addresses alignment by tuning the model's values from the
              inside. Farness addresses alignment by making the model's
              consequences visible from the outside. Both layers are
              necessary; neither replaces the other. AI safety as a field
              needs the values-installation work and the consequence-visibility
              work in parallel, and the open-source structure of Farness means
              current frontier-lab employees can publicly support the
              consequence-visibility layer without conflict of interest.
            </p>
            <p>
              <em>Complements CBO, JCT, OMB, and official scoring.</em>{" "}
              Official policy scoring is single point estimates produced by
              filtering model outputs through institutional judgment that
              isn't fully documented. Farness produces continuously updated
              probability distributions with full reasoning traces, scored
              against actuals. Where Farness and official scores agree,
              confidence rises. Where they diverge, the divergence itself
              becomes a useful signal about what assumptions are doing the
              work.
            </p>
            <p>
              <em>
                Complements Kalshi, Polymarket, and the broader prediction-market
                ecosystem.
              </em>{" "}
              Existing markets aggregate human information well, but the
              reasoning is opaque, the regulatory shape constrains the
              questions, and the long tail of questions stays thinly traded.
              Farness operates in a different mode entirely: open, automated,
              transparent, free at the point of use, without trading and
              therefore without market-regulatory complexity. The two
              ecosystems can coexist; the open-predictions layer addresses a
              gap markets don't fill.
            </p>
            <p>
              <em>Not a frontier model lab.</em> Farness doesn't train
              competing general-purpose chat models. Its research focuses on
              calibration-native foundation models trained as tool
              orchestrators — a different objective and architecture than
              frontier general-purpose LLMs.
            </p>
            <p>
              <em>Not a trading firm.</em> Farness doesn't run a fund or
              capture alpha from its forecasts. The public-good character is
              load-bearing. A small publicly-disclosed fund operating as a
              truth-telling instrument is a possible future addition (Phase 2
              wholly-owned subsidiary if and when the structure makes sense);
              not part of the founding identity.
            </p>
            <p>
              <em>Not a closed product.</em> Open by construction. Models,
              weights, methodology, simulation engine code, Microplex
              outputs, Axiom-encoded substrate, calibration history, and
              market resolution data are all public. Commercial layers (if
              any) sit on top of the open substrate rather than gating it.
            </p>
          </section>

          <section>
            <h2>Funder fit</h2>
            <p>
              The funder base that matches the thesis is broader and more
              accessible than the funder base for any of the predecessor
              framings:
            </p>
            <ul>
              <li>
                <strong>Coefficient Giving</strong> (Open Philanthropy
                rebrand) — AI safety, forecasting infrastructure,
                consequence-visibility framing fits directly in their existing
                grant portfolios.
              </li>
              <li>
                <strong>Survival and Flourishing Fund</strong> — long-horizon
                AI safety and alignment-adjacent infrastructure.
              </li>
              <li>
                <strong>Astera Institute</strong>, <strong>Schmidt Sciences /
                Schmidt Futures</strong>, <strong>Mozilla Foundation</strong>{" "}
                — novel public-good scientific infrastructure and open-source
                AI ethos.
              </li>
              <li>
                <strong>Anthropic alumni and AI-safety-aligned liquidity</strong>{" "}
                — tender-offer and IPO-event capital from Anthropic and
                similar frontier labs. Open-source-by-construction means
                current frontier-lab employees can publicly back the work
                without conflict of interest. The complement-not-compete frame
                is unique to this category.
              </li>
              <li>
                <strong>Arnold Ventures Mission Aligned Investments</strong> —
                fits the structure Andrew Moylan and team have already
                signaled interest in, particularly for the open
                policy-forecasting infrastructure angle.
              </li>
              <li>
                <strong>Government agencies and international equivalents</strong>{" "}
                — Treasury, state revenue offices, Federal Reserve regional
                banks, HHS, Census, and international counterparts paying for
                marginal compute on the questions they care about. Sponsored
                runs are program-related revenue that fits 501(c)(3)
                structure cleanly.
              </li>
              <li>
                <strong>National research funding</strong> — NSF, DARPA,
                IARPA, ARIA UK, NIH for specific research directions.
              </li>
              <li>
                <strong>Sponsorship capital from AI labs, Big Tech, and
                philanthropies</strong>, per the
                Fradkin/Jabarian/Koh well-capitalized-prediction-markets
                model, applied to specific question sets the sponsor wants
                better-calibrated forecasts on.
              </li>
            </ul>
            <p>
              The multi-funder revenue model means Farness doesn't depend on
              any single source. Foundation grants fund the platform and
              research. Sponsored compute pays for specific question coverage.
              Custom analysis (through PolicyEngine) generates additional
              program revenue. The foundation never needs to make any one
              funder a structural dependency.
            </p>
          </section>

          <section>
            <h2>What success looks like in five years</h2>
            <p>
              At maturity, Farness produces continuously-updated calibrated
              forecasts on every consequential government statistic, every
              encoded policy parameter, and every counterfactual conditional
              question stakeholders care about. The platform runs hundreds to
              thousands of specialized agent configurations, each with
              published methodology and visible track record. Calibration
              history goes back years and is queryable per question, per
              configuration, per resolution period. Government agencies fund
              targeted compute on their projection questions. Researchers
              build on the open infrastructure for their own work. Frontier AI
              labs use the calibration corpus as a training and evaluation
              resource. Open-source forecaster configurations and tool
              integrations are contributed by people the foundation has never
              met.
            </p>
            <p>
              The forecasts feed into the decisions of governments, advocacy
              organizations, firms, and individuals — not because Farness
              tells them what to do, but because the calibrated probability
              distributions are visibly more useful than what was available
              before. The substrate compounds: every new tool integration,
              every new methodology insight, every new question coverage
              makes everything that was already there a little more useful.
            </p>
            <p>
              And when the AI agents of 2030 arrive — substantially more
              capable than today's, better at tool selection, better at
              composing methodology, better at reasoning over their own
              outputs — they find a substrate already built for them. Open,
              calibrated, audit-trail-native, and free at the point of use.
              The capability becomes immediately deployable on consequential
              questions because the infrastructure is already there.
            </p>
          </section>

          <section>
            <h2>Honest caveats and open questions</h2>
            <p>
              <strong>The autonomous-improvement language is aspirational.</strong>{" "}
              Today's AI systems can iterate variants, tune hyperparameters,
              and generate model code, but autonomous improvement of
              methodology without sustained human guidance is years out.
              Honest framing: open human-in-the-loop improvement of AI
              ensembles on a transparent substrate, with the substrate
              compounding the human-and-AI work over time. Not autonomous
              self-improvement; collaborative compounding.
            </p>
            <p>
              <strong>The five-year picture is not the one-year picture.</strong>{" "}
              The platform launches with a smaller agent ensemble, fewer
              questions, a narrower research program, and a working but
              incomplete substrate. Building toward the mature state takes
              real research and engineering investment over years. The vision
              is the north star; the early stages look more like a focused
              shipping organization than a complete forecasting layer.
            </p>
            <p>
              <strong>Open infrastructure depends on adoption.</strong>{" "}
              Having the platform doesn't mean organizations use it. The
              institutional muscle to integrate open-predictions into
              decision-making is real work that takes years to build across
              policy shops, agencies, and other users. Farness can lead the
              category but can't manufacture demand alone.
            </p>
            <p>
              <strong>Regulatory ambiguity if forecasts become market-moving.</strong>{" "}
              Without a trading venue, Farness avoids most prediction-market
              regulatory complexity. But if open forecasts become widely
              consumed by financial markets, the SEC or CFTC may still take
              interest in disclosure rules. Probably solvable through
              precedents like Federal Reserve forecast publication, but
              warrants real legal review.
            </p>
            <p>
              <strong>The PolicyEngine brand transition.</strong> PolicyEngine
              continues operationally unchanged, but funders, board, and
              partners need to be brought along on the umbrella structure.
              Existing grants are to PolicyEngine via PSL Foundation fiscal
              sponsorship; the cleanest path is incorporating Farness
              Foundation as the new 501(c)(3) and graduating PolicyEngine
              into it from PSL. Donor consent process is straightforward; the
              communications work isn't.
            </p>
            <p>
              <strong>The "Farness" name has multiple uses to disambiguate.</strong>{" "}
              Farness Foundation (the org), Farness (the open-predictions
              platform — the flagship), Farness Decisions (the personal
              decision tool). Naming hierarchy needs to be settled before any
              public launch.
            </p>
          </section>

          <section>
            <h2>The shape of the work, in priority order</h2>
            <ul>
              <li>
                <strong>Incorporate Farness Foundation</strong> as a 501(c)(3)
                upon graduating PolicyEngine from PSL fiscal sponsorship. Use
                fiscal sponsorship during the application period.
              </li>
              <li>
                <strong>Settle the naming hierarchy</strong> publicly and
                internally before any launch announcement: foundation,
                platform, PolicyEngine, Microplex, Decisions, and the
                relationship to Axiom Foundation.
              </li>
              <li>
                <strong>Compose the board</strong> with AI-safety, policy, and
                technical credibility — names that signal what the foundation
                is to the funder base it most needs to reach.
              </li>
              <li>
                <strong>Publish the manifesto</strong> in its public form
                (this document, rewritten for external audience) with
                accompanying funder one-pager and FAQ.
              </li>
              <li>
                <strong>Ship the first visible version of the platform</strong>
                — Manifold-hosted forecast experiments with full agent
                telemetry, a small set of ARCH-anchored questions with
                published calibration, and the agent traces openly available.
              </li>
              <li>
                <strong>Move Microplex into PolicyEngine</strong> as the
                Enhanced CPS replacement, with the methodology and
                synthesizer code published openly.
              </li>
              <li>
                <strong>Pre-flight major funder conversations</strong> —
                Coefficient Giving, SFF, Schmidt, Anthropic-alumni outreach,
                Arnold Ventures MAI — with the manifesto and one-pager in
                hand.
              </li>
              <li>
                <strong>Coordinate with Axiom Foundation</strong> on shared
                roadmap for encoded-law substrate access and Arch
                government-data architecture.
              </li>
            </ul>
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
