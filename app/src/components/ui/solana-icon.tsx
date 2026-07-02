/** Solana wordmark glyph (three slanted bars) with the brand gradient. */
export function SolanaIcon({ size = 16, className }: { size?: number; className?: string }) {
  const id = "sol-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 397 311"
      className={className}
      aria-hidden
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="360" y1="-37" x2="141" y2="383" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <path d="M64 237a12 12 0 0 1 9-4h316a6 6 0 0 1 5 11l-63 62a12 12 0 0 1-9 4H6a6 6 0 0 1-5-11l63-62Z" />
        <path d="M64 4a12 12 0 0 1 9-4h316a6 6 0 0 1 5 11l-63 62a12 12 0 0 1-9 4H6a6 6 0 0 1-5-11L64 4Z" />
        <path d="M333 120a12 12 0 0 0-9-4H8a6 6 0 0 0-5 11l63 62a12 12 0 0 0 9 4h316a6 6 0 0 0 5-11l-63-62Z" />
      </g>
    </svg>
  );
}
