// Inline SVG icon set. Strokes use currentColor so icons inherit text color.
// Usage: <Icon name="home" className="h-5 w-5" />

const paths = {
  // brand mark — abstract satellite / spectrum "S"
  logo: (
    <>
      <path d="M5 8.5C5 6.6 6.6 5 8.5 5H15a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h6.5c1.9 0 3.5-1.6 3.5-3.5" />
      <circle cx="18.5" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
    </>
  ),
  lessons: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 20.5z" />
      <path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H19" />
    </>
  ),
  // STELLA handheld device / spectrometer
  device: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="2.5" />
      <circle cx="12" cy="9" r="2.4" />
      <path d="M9 14.5h6M9 17h4" />
    </>
  ),
  data: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-3M12 16V8M16 16v-6M20 16v-9" />
    </>
  ),
  satellite: (
    <>
      <path d="m6.5 9.5 3-3 4 4-3 3z" />
      <path d="m9 13-3.5 3.5M14.5 7.5 18 4" />
      <path d="M14 14a4 4 0 0 1-4 4" />
      <path d="M17 14a7 7 0 0 1-7 7" />
    </>
  ),
  apps: (
    <>
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="7" cy="17" r="2.2" />
      <circle cx="17" cy="17" r="2.2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.2M12 19v2.2M4.4 7l1.9 1.1M17.7 15.9l1.9 1.1M4.4 17l1.9-1.1M17.7 8.1l1.9-1.1" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6" />
      <path d="M4.5 17h15" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  spectrum: (
    <>
      <path d="M4 12h16" />
      <path d="M4 8h16M4 16h16" opacity="0.5" />
      <circle cx="8" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="13" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-7 5-12 14-12 0 9-5 13-11 13-2 0-3-1-3-3z" />
      <path d="M9 16c2-3 4-5 7-6" />
    </>
  ),
  heat: (
    <>
      <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4" />
      <circle cx="12" cy="14" r="2" />
    </>
  ),
  water: (
    <>
      <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m10.5 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </>
  ),
  pause: (
    <>
      <rect x="7" y="6" width="3.2" height="12" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.8" y="6" width="3.2" height="12" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  reset: (
    <>
      <path d="M19 12a7 7 0 1 1-2.05-4.95" />
      <path d="M19 4v3.5h-3.5" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  back: <path d="m15 6-6 6 6 6" />,
  arrowRight: <path d="M4 12h14M13 6l6 6-6 6" />,
  star: (
    <path
      d="m12 4 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 17.8l.9-5L4.8 9.3l5-.7z"
      fill="currentColor"
      stroke="none"
    />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5" />
      <path d="M5 18.5h14" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4m0 0 3 3m-3-3L9 7" />
      <path d="M6 11.5H5a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6.5a1 1 0 0 0-1-1h-1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  // animations nav — sparkle / motion
  animation: (
    <>
      <path d="M5 6c0 3-2 5-2 5s2 2 2 5c0-3 2-5 2-5s-2-2-2-5z" />
      <path d="M14 4c0 4-3 7-3 7s3 3 3 7c0-4 3-7 3-7s-3-3-3-7z" />
      <circle cx="19" cy="17.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // mission control — a satellite orbiting a planet
  orbit: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-30 12 12)" />
      <circle cx="19.2" cy="7.6" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  cloud: (
    <path d="M7.5 18h9a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.2 10.2 3.9 3.9 0 0 0 7.5 18z" />
  ),
  snow: (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
      <path d="M12 3l-2 2m2-2 2 2M12 21l-2-2m2 2 2-2" />
    </>
  ),
  // game controller
  games: (
    <>
      <path d="M8 9.5H5.8A2.8 2.8 0 0 0 3 12.3v1.4A2.8 2.8 0 0 0 5.8 16.5c1.2 0 1.8-.8 2.6-1.6.5-.5 1-.9 1.6-.9h4c.6 0 1.1.4 1.6.9.8.8 1.4 1.6 2.6 1.6A2.8 2.8 0 0 0 21 13.7v-1.4a2.8 2.8 0 0 0-2.8-2.8H16" />
      <path d="M6.5 12v2M5.5 13h2" />
      <circle cx="16" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="13.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5A1.5 1.5 0 0 0 4 7c0 1.7 1.4 3 3.2 3M16 5.5h2.5A1.5 1.5 0 0 1 20 7c0 1.7-1.4 3-3.2 3" />
      <path d="M12 12v3M9 20h6M10 20c0-1.5.7-2.5 2-2.5s2 1 2 2.5" />
    </>
  ),
  // sine wave
  wave: <path d="M3 12c2.5 0 2.5-6 5-6s2.5 12 5 12 2.5-6 5-6h1" />,
  // light rays from a point
  rays: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
}

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.7, ...rest }) {
  const node = paths[name]
  if (!node) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {node}
    </svg>
  )
}
