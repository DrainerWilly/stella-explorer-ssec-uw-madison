// Small hand-drawn glyphs for STELLA build parts (24×24 viewBox, stroke-based,
// currentColor). Local to the Device Lab so the app-wide icon set stays lean.

const GLYPHS = {
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      {[9, 12, 15].map((p) => (
        <g key={p}>
          <line x1={p} y1="4" x2={p} y2="7" />
          <line x1={p} y1="17" x2={p} y2="20" />
          <line x1="4" y1={p} x2="7" y2={p} />
          <line x1="17" y1={p} x2="20" y2={p} />
        </g>
      ))}
    </>
  ),
  board: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
      {[7, 10, 13, 16].map((x) => (
        <g key={x}>
          <circle cx={x} cy="9.5" r="0.8" fill="currentColor" stroke="none" />
          <circle cx={x} cy="14.5" r="0.8" fill="currentColor" stroke="none" />
        </g>
      ))}
    </>
  ),
  screen: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M6.5 14.5l3-4 2.5 3 2-2.5 3.5 3.5" />
    </>
  ),
  knob: (
    <>
      <circle cx="12" cy="12" r="7" />
      <line x1="12" y1="6.5" x2="12" y2="10" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
  gps: (
    <>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  sd: (
    <>
      <path d="M7 4h8l3 3v13H7z" />
      {[9.5, 11.5, 13.5, 15.5].map((x) => (
        <line key={x} x1={x} y1="5.5" x2={x} y2="8.5" />
      ))}
    </>
  ),
  bolt: <path d="M13 3L6 13.5h5L10.5 21 18 10.5h-5L13 3z" />,
  battery: (
    <>
      <rect x="3.5" y="8" width="15" height="8" rx="1.5" />
      <rect x="19.5" y="10.5" width="2" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <line x1="7" y1="10.5" x2="7" y2="13.5" />
      <line x1="10" y1="10.5" x2="10" y2="13.5" />
      <line x1="13" y1="10.5" x2="13" y2="13.5" />
    </>
  ),
  shell: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="3" />
      <rect x="8" y="7" width="8" height="6" rx="1" />
      <circle cx="12" cy="16.5" r="1.6" />
    </>
  ),
  spectrum: (
    <>
      <path d="M4 17l4-9 3.5 6 3-4.5L20 17" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </>
  ),
  heat: (
    <>
      <path d="M10 14.5V5.5a2 2 0 1 1 4 0v9" />
      <circle cx="12" cy="17.5" r="3" />
    </>
  ),
  sonar: (
    <>
      <circle cx="7" cy="12" r="2.2" />
      <path d="M12 7.5a6.5 6.5 0 0 1 0 9" />
      <path d="M15.5 5a10 10 0 0 1 0 14" />
    </>
  ),
  magnet: (
    <>
      <path d="M7 4v8a5 5 0 0 0 10 0V4" />
      <line x1="7" y1="7.5" x2="10.5" y2="7.5" />
      <line x1="13.5" y1="7.5" x2="17" y2="7.5" />
    </>
  ),
  co2: (
    <>
      <circle cx="9" cy="10" r="4.5" />
      <circle cx="15.5" cy="14.5" r="3" />
      <circle cx="15" cy="7" r="1.8" />
    </>
  ),
  flame: <path d="M12 3.5s5.5 4.5 5.5 10a5.5 5.5 0 1 1-11 0C6.5 9.5 9 8 9.5 5.5c1 1 1.5 2 1.5 3.5 1-1.5 1-3.5 1-5.5z" />,
  dust: (
    <>
      <circle cx="8" cy="9" r="2.4" />
      <circle cx="15.5" cy="7.5" r="1.5" />
      <circle cx="16.5" cy="13.5" r="2" />
      <circle cx="9.5" cy="16" r="1.4" />
      <circle cx="13" cy="18.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  thermo: (
    <>
      <path d="M10.5 13.5V5a1.5 1.5 0 1 1 3 0v8.5a3.5 3.5 0 1 1-3 0z" />
      <line x1="16.5" y1="6" x2="19.5" y2="6" />
      <line x1="16.5" y1="9" x2="19.5" y2="9" />
    </>
  ),
  cable: (
    <>
      <rect x="3.5" y="9" width="5" height="6" rx="1" />
      <rect x="15.5" y="9" width="5" height="6" rx="1" />
      <path d="M8.5 12h3c2 0 2-3 4-3" />
    </>
  ),
}

// Extra props (x, y, width, height, style) pass through so the icon can be
// placed as a nested <svg> inside the build-rig diagram.
export default function PartIcon({ name, className = 'h-5 w-5', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {GLYPHS[name] || GLYPHS.chip}
    </svg>
  )
}
