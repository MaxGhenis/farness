import Link from "next/link";
import { FarnessLogoMark } from "./FarnessLogo";

export function Header({ activePage }: { activePage?: "thesis" | "paper" }) {
  return (
    <header className="sticky top-0 z-100 w-full backdrop-blur-[16px] bg-[var(--theme-header-bg)] border-b border-[var(--theme-border)]">
      <div className="w-full max-w-[1080px] mx-auto px-8 py-3 flex items-center justify-between max-md:px-4 max-md:py-2">
        <Link
          href="/"
          className="flex items-center gap-[0.35em] no-underline [font-family:var(--font-display)] text-[1.2rem] font-medium text-[var(--theme-text)] hover:no-underline"
        >
          <FarnessLogoMark size={28} />
          <span className="tracking-[0.02em]">farness</span>
        </Link>
        <nav className="flex gap-7 items-center max-md:gap-4">
          <Link
            href="/thesis"
            className={`[font-family:var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:text-[var(--theme-text)] hover:no-underline ${
              activePage === "thesis"
                ? "text-accent"
                : "text-[var(--theme-text-muted)]"
            }`}
          >
            Thesis
          </Link>
          <a
            href="/paper/"
            className={`[font-family:var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:text-[var(--theme-text)] hover:no-underline ${
              activePage === "paper"
                ? "text-accent"
                : "text-[var(--theme-text-muted)]"
            }`}
          >
            Paper
          </a>
          <a
            href="https://github.com/MaxGhenis/farness"
            className="[font-family:var(--font-body)] text-[0.82rem] font-normal text-[var(--theme-text-muted)] no-underline transition-colors duration-200 hover:text-[var(--theme-text)] hover:no-underline py-[0.3em] px-[0.85em] border border-[var(--theme-border-strong)] rounded-lg ml-1 hover:border-accent hover:text-accent"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
