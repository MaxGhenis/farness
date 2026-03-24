import Link from "next/link";
import { Header } from "@/components/Header";

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 overflow-x-auto"
      style={{
        background: "linear-gradient(180deg, #172633 0%, #0F1A24 100%)",
        border: "1px solid #2B3D4B",
      }}
    >
      <pre className="[font-family:var(--font-mono)] text-[0.78rem] leading-[1.75] text-[#E8F0F5] whitespace-pre-wrap m-0">
        {children}
      </pre>
    </div>
  );
}

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 border-b border-[#D9E4EC] last:border-b-0">
      <div className="mb-8">
        <div className="[font-family:var(--font-mono)] text-[0.68rem] tracking-[0.12em] uppercase text-[#A94E80] mb-3">
          {kicker}
        </div>
        <h2 className="[font-family:var(--font-display)] text-[clamp(1.6rem,3vw,2.3rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#14202B]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="bg-[#F7FAFC] text-[#14202B] min-h-screen grain-overlay">
      <Header activePage="docs" />
      <main className="max-w-[1100px] mx-auto px-8 max-md:px-4 pb-24">
        <header className="py-20 max-md:py-14 border-b border-[#D9E4EC]">
          <div className="[font-family:var(--font-mono)] text-[0.72rem] tracking-[0.12em] uppercase text-[#A94E80] mb-5">
            Documentation
          </div>
          <h1 className="[font-family:var(--font-display)] text-[clamp(2.1rem,5vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-[#14202B] max-w-[820px] mb-6">
            Use farness with Codex, Claude Code, or the local CLI.
          </h1>
          <p className="text-[1.02rem] text-[#415463] leading-[1.7] max-w-[760px] mb-8">
            The install story is package-first. The PyPI package now includes the
            CLI, MCP server, and packaged Codex and Claude skills. The CLI itself is
            local-only and does not call an LLM or require an API key.
          </p>

          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <div className="rounded-2xl bg-white border border-[#D9E4EC] p-5">
              <div className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] text-[#A94E80] mb-2">
                Recommended
              </div>
              <div className="[font-family:var(--font-display)] text-[1.1rem] font-semibold text-[#14202B] mb-2">
                Codex + MCP
              </div>
              <p className="text-[0.88rem] leading-[1.6] text-[#415463] m-0">
                Best path if you want native tools, persistent decisions, and the
                `$farness` trigger.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#D9E4EC] p-5">
              <div className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] text-[#5E7A8D] mb-2">
                Local
              </div>
              <div className="[font-family:var(--font-display)] text-[1.1rem] font-semibold text-[#14202B] mb-2">
                CLI / Python
              </div>
              <p className="text-[0.88rem] leading-[1.6] text-[#415463] m-0">
                Use this if you want a decision log and calibration loop without any
                agent integration.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#D9E4EC] p-5">
              <div className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] text-[#5E7A8D] mb-2">
                Plugin
              </div>
              <div className="[font-family:var(--font-display)] text-[1.1rem] font-semibold text-[#14202B] mb-2">
                Claude Code
              </div>
              <p className="text-[0.88rem] leading-[1.6] text-[#415463] m-0">
                Use the plugin if you want the slash-command flow and Claude-specific
                integration.
              </p>
            </div>
          </div>
        </header>

        <Section kicker="Install" title="Install the package and choose a path">
          <div id="install" className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
            <div className="space-y-4">
              <h3 className="[font-family:var(--font-display)] text-[1.2rem] font-semibold text-[#14202B]">
                1. Codex with MCP
              </h3>
              <p className="text-[0.92rem] text-[#415463] leading-[1.65]">
                This gives Codex native tools, access to stored decisions, and a
                reusable `$farness` skill.
              </p>
              <CodeBlock>{`python -m pip install 'farness[mcp]'
farness setup codex
# restart Codex, then use $farness`}</CodeBlock>
            </div>

            <div className="space-y-4">
              <h3 className="[font-family:var(--font-display)] text-[1.2rem] font-semibold text-[#14202B]">
                2. Claude Code local skill
              </h3>
              <p className="text-[0.92rem] text-[#415463] leading-[1.65]">
                This gives Claude Code the same local MCP-backed workflow as Codex,
                but through Claude skills instead of the Codex skill format.
              </p>
              <CodeBlock>{`python -m pip install 'farness[mcp]'
farness setup claude
# restart Claude Code`}</CodeBlock>
            </div>

            <div className="space-y-4">
              <h3 className="[font-family:var(--font-display)] text-[1.2rem] font-semibold text-[#14202B]">
                3. Local CLI / Python
              </h3>
              <p className="text-[0.92rem] text-[#415463] leading-[1.65]">
                This path creates and scores decisions locally. No LLM API key is
                required for these commands.
              </p>
              <CodeBlock>{`python -m pip install farness
farness new "Should we rewrite the auth layer?"
farness list
farness calibration`}</CodeBlock>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white border border-[#D9E4EC] p-6">
            <div className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] text-[#5E7A8D] mb-2">
              Optional
            </div>
            <div className="[font-family:var(--font-display)] text-[1.05rem] font-semibold text-[#14202B] mb-2">
              Claude plugin path
            </div>
            <p className="text-[0.9rem] text-[#415463] leading-[1.65] mb-4">
              If you prefer the older plugin flow instead of local Claude skills, it
              still works:
            </p>
            <CodeBlock>{`claude plugin marketplace add MaxGhenis/farness
claude plugin install farness@maxghenis-plugins
# then use /farness:decide`}</CodeBlock>
          </div>
        </Section>

        <Section kicker="Architecture" title="What each piece actually does">
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {[
              [
                "CLI",
                "Creates, lists, reviews, and scores decisions in ~/.farness/decisions.jsonl.",
              ],
              [
                "MCP server",
                "Exposes the same decision store as native tools, resources, and prompts for agent clients.",
              ],
              [
                "Codex skill",
                "Tells Codex when to use the MCP tools and what the farness workflow should produce.",
              ],
              [
                "Claude skill",
                "Tells Claude Code when to use the same local MCP server. The older plugin path stays optional.",
              ],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-white border border-[#D9E4EC] p-6">
                <div className="[font-family:var(--font-mono)] text-[0.72rem] tracking-[0.04em] text-[#A94E80] mb-3">
                  {title}
                </div>
                <p className="text-[0.9rem] text-[#415463] leading-[1.6] m-0">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="Quickstart" title="Two commands, then restart the client">
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <CodeBlock>{`python -m pip install 'farness[mcp]'
farness setup codex`}</CodeBlock>
            <CodeBlock>{`python -m pip install 'farness[mcp]'
farness setup claude`}</CodeBlock>
          </div>
          <p className="mt-5 text-[0.92rem] text-[#415463] leading-[1.7] max-w-[760px]">
            `farness setup` installs the packaged skill and registers the local MCP
            server with the same Python interpreter that launched `farness`. The last
            step is just restarting Codex or Claude Code.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <CodeBlock>{`farness doctor codex`}</CodeBlock>
            <CodeBlock>{`farness doctor claude`}</CodeBlock>
          </div>
          <p className="mt-5 text-[0.92rem] text-[#415463] leading-[1.7] max-w-[760px]">
            `farness doctor` checks three things: whether the packaged skill is
            installed, whether the agent CLI is on `PATH`, and whether the local MCP
            server is already registered.
          </p>
        </Section>

        <Section kicker="Workflow" title="What to expect from the framework">
          <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
            <div className="space-y-4">
              <p className="text-[0.94rem] text-[#415463] leading-[1.7]">
                The framework is not “ask an LLM for advice.” It is a structured
                decision workflow:
              </p>
              <ol className="list-decimal pl-5 text-[0.92rem] text-[#415463] leading-[1.8]">
                <li>Define the KPI and time horizon.</li>
                <li>Expand the option set beyond the initial framing.</li>
                <li>Anchor on a reference class or base rate.</li>
                <li>Show the mechanism or decomposition.</li>
                <li>Surface disconfirming evidence and traps.</li>
                <li>Give point estimates with 80% confidence intervals.</li>
                <li>Set a review date and score outcomes later.</li>
              </ol>
            </div>
            <CodeBlock>{`Decision: Should we rewrite the auth layer now?
KPI: critical_auth_incidents / 90d
Options: rewrite now | defer 60d | harden existing system
Base rate: 27% of similar infra rewrites produce >40% reliability gains
Forecast (rewrite now): 58% [42, 71]
Disconfirming evidence: ops fixes may solve this faster
Review date: 2026-06-15`}</CodeBlock>
          </div>
        </Section>

        <Section kicker="API keys" title="What needs credentials">
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <div className="rounded-2xl bg-white border border-[#D9E4EC] p-6">
              <div className="[font-family:var(--font-display)] text-[1rem] font-semibold text-[#14202B] mb-2">
                CLI
              </div>
              <p className="text-[0.9rem] leading-[1.6] text-[#415463] m-0">
                No model credentials required. The CLI reads and writes local decision
                records only.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#D9E4EC] p-6">
              <div className="[font-family:var(--font-display)] text-[1rem] font-semibold text-[#14202B] mb-2">
                MCP + skills
              </div>
              <p className="text-[0.9rem] leading-[1.6] text-[#415463] m-0">
                No separate farness API key. Your agent client uses its own normal
                model credentials.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#D9E4EC] p-6">
              <div className="[font-family:var(--font-display)] text-[1rem] font-semibold text-[#14202B] mb-2">
                Experiments
              </div>
              <p className="text-[0.9rem] leading-[1.6] text-[#415463] m-0">
                The experiment runners do call external models and need provider keys
                like `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
              </p>
            </div>
          </div>
        </Section>

        <Section kicker="References" title="Where to go next">
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/paper"
              className="inline-flex items-center gap-2 py-[0.75em] px-5 [font-family:var(--font-display)] text-[0.88rem] font-medium no-underline rounded-lg bg-[#14202B] text-[#FCFDFE]"
            >
              Read the paper
            </Link>
            <a
              href="https://github.com/MaxGhenis/farness/blob/main/docs/agent-workflows.md"
              className="inline-flex items-center gap-2 py-[0.75em] px-5 [font-family:var(--font-display)] text-[0.88rem] font-medium no-underline rounded-lg bg-white text-[#415463] border border-[#BED0DB]"
            >
              Agent workflow markdown
            </a>
            <a
              href="https://github.com/MaxGhenis/farness"
              className="inline-flex items-center gap-2 py-[0.75em] px-5 [font-family:var(--font-display)] text-[0.88rem] font-medium no-underline rounded-lg bg-white text-[#415463] border border-[#BED0DB]"
            >
              Repository
            </a>
          </div>
        </Section>
      </main>
    </div>
  );
}
