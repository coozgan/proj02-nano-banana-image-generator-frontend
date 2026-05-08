interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Refined banana monogram — single-stroke geometric mark.
 * Replaces the emoji to give the brand a credible identity.
 */
export function Logo({ size = 22, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Nano Banana"
    >
      <path
        d="M5 17.5 C 4 11, 8 4, 14 4 C 14 4, 16.2 4, 17.2 5.2 C 17.2 5.2, 16 6, 16 8 C 17 13, 12.8 19, 6 19 C 5 19, 5 18.4, 5 17.5 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* tiny stem dot */}
      <circle cx="14" cy="4" r="0.9" fill="currentColor" />
    </svg>
  );
}
