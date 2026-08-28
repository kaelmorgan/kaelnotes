function Mark({ clipId }: { clipId: string }) {
  return (
    <g clipPath={`url(#${clipId})`}>
      <rect width="64" height="64" rx="14" fill="#31475A" />
      <path d="M42 0h22v22L42 0Z" fill="#F7F4EE" />
      <path
        d="M17 13h8v16.2L42.2 13H50L32.4 32 50 51h-7.8L25 35.8V51h-8V13Z"
        fill="#F7F4EE"
      />
      <rect x="18" y="55.5" width="28" height="2" rx="1" fill="#E8EEF2" />
    </g>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="kael-notes-mark-clip">
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <Mark clipId="kael-notes-mark-clip" />
    </svg>
  );
}

export function Logo() {
  return (
    <svg
      viewBox="0 0 292 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-auto"
      role="img"
      aria-labelledby="kael-notes-logo-title"
    >
      <title id="kael-notes-logo-title">Kael Notes</title>
      <defs>
        <clipPath id="kael-notes-lockup-clip">
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <Mark clipId="kael-notes-lockup-clip" />
      <text
        x="80"
        y="42"
        fill="#1C1917"
        fontSize="22"
        fontWeight="600"
        letterSpacing="3.4"
        style={{ fontFamily: "var(--font-ui), ui-sans-serif, system-ui, sans-serif" }}
      >
        KAEL NOTES
      </text>
    </svg>
  );
}
