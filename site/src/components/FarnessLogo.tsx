/**
 * Farness logo mark — "The Vanishing Point"
 *
 * Two perspective lines converging toward (but not touching) a luminous
 * focal point, evoking seeing far, uncertainty narrowing to clarity,
 * and a confidence interval collapsing to a point estimate.
 *
 * Design principles:
 * - Lines terminate INTO the dot, never touching each other (avoids play-button)
 * - Subtle taper from left→right suggests spatial recession
 * - Top line slightly thinner than bottom for asymmetric depth
 * - Dot is structurally essential, not decorative — must survive at 16px
 * - Open form with generous negative space between rails
 */
export function FarnessLogoMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Farness"
    >
      {/* Glow halo — subtle depth cue */}
      <circle
        cx="21.5"
        cy="14"
        r="5.5"
        fill="var(--color-accent)"
        opacity="0.1"
      />
      {/* Upper perspective rail — slightly thinner for asymmetric depth */}
      <line
        x1="2"
        y1="4.5"
        x2="17"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Lower perspective rail — slightly bolder, grounding the mark */}
      <line
        x1="2"
        y1="23.5"
        x2="17"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Focal point — the golden vanishing point where uncertainty resolves */}
      <circle cx="21.5" cy="14" r="3.2" fill="var(--color-accent)" />
    </svg>
  );
}

/**
 * Full wordmark: logo mark + "farness" text.
 * Used in the header navigation. Lowercase for approachability
 * while the serif display font provides gravitas.
 */
export function FarnessWordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-[0.4em]">
      <FarnessLogoMark size={size} />
      <span className="tracking-[0.02em] lowercase">farness</span>
    </span>
  );
}
