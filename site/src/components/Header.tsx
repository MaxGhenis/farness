import Link from "next/link";
import { FarnessLogoMark } from "./FarnessLogo";

export function Header({ activePage }: { activePage?: "thesis" | "paper" }) {
  return (
    <header
      className="sticky top-0 z-100 w-full backdrop-blur-[16px] border-b"
      style={{
        backgroundColor: "var(--theme-header-bg)",
        borderColor: "var(--theme-border)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between max-md:px-4 max-md:py-3">
        <Link
          href="/"
          className="flex items-center gap-[0.35em] no-underline [font-family:var(--font-display)] text-[1.1rem] font-semibold hover:no-underline tracking-[-0.01em]"
          style={{ color: "var(--theme-text)" }}
        >
          <FarnessLogoMark size={26} />
          <span>farness</span>
        </Link>
        <nav className="flex gap-7 items-center max-md:gap-4">
          <Link
            href="/thesis"
            className={`[font-family:var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:no-underline ${
              activePage === "thesis"
                ? "text-[#A94E80]"
                : "text-[var(--theme-text-muted)]"
            }`}
            style={activePage !== "thesis" ? { color: "var(--theme-text-muted)" } : undefined}
          >
            Thesis
          </Link>
          <a
            href="/paper"
            className={`[font-family:var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:no-underline ${
              activePage === "paper"
                ? "text-[#A94E80]"
                : "text-[var(--theme-text-muted)]"
            }`}
            style={activePage !== "paper" ? { color: "var(--theme-text-muted)" } : undefined}
          >
            Research
          </a>
          <a
            href="https://github.com/MaxGhenis/farness"
            className="[font-family:var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:no-underline"
            style={{ color: "var(--theme-text-muted)" }}
          >
            GitHub
          </a>
          <a
            href="https://github.com/MaxGhenis/farness#installation"
            className="[font-family:var(--font-body)] text-[0.78rem] font-semibold no-underline transition-all duration-200 py-[0.35em] px-[1em] rounded-lg bg-[#14202B] text-[#FCFDFE] hover:no-underline hover:translate-y-[-1px]"
          >
            Install
          </a>
        </nav>
      </div>
    </header>
  );
}
