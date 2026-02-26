import Link from "next/link";

export function Header({ activePage }: { activePage?: "thesis" | "paper" }) {
  return (
    <header className="sticky top-0 z-100 w-full backdrop-blur-[16px] bg-[var(--theme-header-bg)] border-b border-[var(--theme-border)]">
      <div className="w-full max-w-[1080px] mx-auto px-8 py-3 flex items-center justify-between max-md:px-4 max-md:py-2">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline font-[var(--font-display)] text-[1.2rem] font-medium text-[var(--theme-text)] hover:no-underline"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 bg-accent text-[#0c0e13] font-[var(--font-display)] font-semibold text-base rounded-[5px]">
            F
          </span>
          <span className="tracking-[0.02em]">arness</span>
        </Link>
        <nav className="flex gap-7 items-center max-md:gap-4">
          <Link
            href="/thesis"
            className={`font-[var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:text-[var(--theme-text)] hover:no-underline ${
              activePage === "thesis"
                ? "text-accent"
                : "text-[var(--theme-text-muted)]"
            }`}
          >
            Thesis
          </Link>
          <Link
            href="/paper"
            className={`font-[var(--font-body)] text-[0.82rem] font-normal no-underline transition-colors duration-200 hover:text-[var(--theme-text)] hover:no-underline ${
              activePage === "paper"
                ? "text-accent"
                : "text-[var(--theme-text-muted)]"
            }`}
          >
            Paper
          </Link>
          <a
            href="https://github.com/MaxGhenis/farness"
            className="font-[var(--font-body)] text-[0.82rem] font-normal text-[var(--theme-text-muted)] no-underline transition-colors duration-200 hover:text-[var(--theme-text)] hover:no-underline py-[0.3em] px-[0.85em] border border-[var(--theme-border-strong)] rounded-lg ml-1 hover:border-accent hover:text-accent"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
