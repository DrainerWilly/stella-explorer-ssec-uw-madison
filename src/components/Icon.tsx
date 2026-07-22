// @ts-nocheck
// Inline SVG icon set. Strokes use currentColor so icons inherit text color.
// Usage: <Icon name="home" className="h-5 w-5" />

const paths = {
  // brand mark: abstract satellite / spectrum "S"
  logo: (
    <>
      <path d="M5 8.5C5 6.6 6.6 5 8.5 5H15a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h6.5c1.9 0 3.5-1.6 3.5-3.5" />
      <circle cx="18.5" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  home: (
    <>
      <path d="M3.6 10.9 12 4.3l8.4 6.6" />
      <path d="M5.9 9.8v8.9a1.6 1.6 0 0 0 1.6 1.6h9a1.6 1.6 0 0 0 1.6-1.6V9.8" />
      <path d="M9.7 20.3v-4.6a2.3 2.3 0 0 1 4.6 0v4.6" />
    </>
  ),
  // lessons: an open book, i.e. something to read through
  lessons: (
    <>
      <path d="M12 7.4v11.9" />
      <path d="M12 7.4C10.3 6 8.1 5.4 5.4 5.7a1.1 1.1 0 0 0-1 1.1v9.6a1.1 1.1 0 0 0 1.2 1.1c2.4-.3 4.5.3 6.4 1.8" />
      <path d="M12 7.4c1.7-1.4 3.9-2 6.6-1.7a1.1 1.1 0 0 1 1 1.1v9.6a1.1 1.1 0 0 1-1.2 1.1c-2.4-.3-4.5.3-6.4 1.8" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 20.5z" />
      <path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H19" />
    </>
  ),
  // STELLA handheld device: the real instrument's screen over its rotary knob
  device: (
    <>
      <rect x="7" y="3.3" width="10" height="17.4" rx="2.4" />
      <rect x="9.1" y="5.9" width="5.8" height="4.6" rx="0.9" />
      <circle cx="12" cy="14.6" r="2" />
      <path d="M9.8 18.6h4.4" />
    </>
  ),
  // data & graphs: a plotted line over axes, with its data points
  data: (
    <>
      <path d="M4.2 3.9v14.9a1.4 1.4 0 0 0 1.4 1.4h14.4" />
      <path d="M7.6 15.6 11 11.4l3.1 2.5 4.8-6.1" />
      <circle cx="7.6" cy="15.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="11.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.1" cy="13.9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.9" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
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
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2.05 2.05 0 0 1 0 2.9 2.05 2.05 0 0 1-2.9 0l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.17a2.06 2.06 0 0 1-4.12 0V21a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2.05 2.05 0 0 1-2.9 0 2.05 2.05 0 0 1 0-2.9l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03h-.17a2.06 2.06 0 0 1 0-4.12h.17A1.7 1.7 0 0 0 4.6 8.82a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2.05 2.05 0 0 1 0-2.9 2.05 2.05 0 0 1 2.9 0l.06.06A1.7 1.7 0 0 0 9.04 4.4a1.7 1.7 0 0 0 1.03-1.56v-.17a2.06 2.06 0 0 1 4.12 0v.17a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2.05 2.05 0 0 1 2.9 0 2.05 2.05 0 0 1 0 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.17a2.06 2.06 0 0 1 0 4.12h-.17A1.7 1.7 0 0 0 19.4 15z" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6" />
      <path d="M4.5 17h15" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M8.4 13.4a6 6 0 1 1 7.2 0c-.8.7-1.1 1.4-1.1 2.1h-5c0-.7-.3-1.4-1.1-2.1z" />
      <path d="M9.6 18h4.8M10.4 21h3.2" />
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
  // satellite tracker: a spacecraft riding a tilted orbit around the globe.
  // Distinct from `globe`, which stays a plain planet for generic use.
  tracker: (
    <>
      <circle cx="12" cy="12" r="5.2" />
      <path d="M6.8 12h10.4" />
      <ellipse cx="12" cy="12" rx="2.5" ry="5.2" />
      <ellipse cx="12" cy="12" rx="9.1" ry="3.7" transform="rotate(-30 12 12)" />
      <circle cx="20.1" cy="8.3" r="1.5" fill="currentColor" stroke="none" />
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
  // animations nav: one wave tightening left to right at constant amplitude,
  // which is the electromagnetic spectrum these animations walk through.
  animation: (
    <path d="M2.6 12c2.07-5.4 4.13-5.4 6.2 0s3.27 5.4 4.9 0 2.67-5.4 4 0 2.2 5.4 3.3 0" />
  ),
  // mission control: a satellite orbiting a planet
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
  // STELLA Data Visualizer: a spectrum, i.e. the wavelength bands STELLA reads
  viz: (
    <>
      <path d="M3.2 20.3h17.6" />
      <path d="M5.6 20.3v-4.6M9.2 20.3v-8.4M12.8 20.3v-12.2M16.4 20.3v-6.8M20 20.3v-9.6" />
    </>
  ),
  // game controller
  games: (
    <>
      <rect x="2.6" y="8" width="18.8" height="10" rx="5" />
      <path d="M7.4 11.6v3M5.9 13.1h3" />
      <circle cx="15.7" cy="11.9" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="18.1" cy="14.2" r="1.05" fill="currentColor" stroke="none" />
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
  // telescope on a tripod
  telescope: (
    <>
      <path d="M4.5 11.5 17 5l2.5 4.5L7 16z" />
      <path d="M17 5l1.2-.6 2.6 4.7-1.3.7" />
      <path d="M9 15l-3 6M11.5 14.5 14 21M10.5 14.8v2.5" />
      <circle cx="5.2" cy="12.6" r="1.3" />
    </>
  ),
  // little rocket
  rocket: (
    <>
      <path d="M12 3c2.8 1.8 4 4.6 4 7.6 0 2-.5 3.8-1.3 5.4h-5.4A11.9 11.9 0 0 1 8 10.6C8 7.6 9.2 4.8 12 3z" />
      <circle cx="12" cy="9.5" r="1.7" />
      <path d="M9.3 14.5 7 17.5l3-.5M14.7 14.5l2.3 3-3-.5" />
      <path d="M11 18.5c0 1.2.4 2 1 2.5.6-.5 1-1.3 1-2.5" />
    </>
  ),
  // paint palette
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.9-.9 1.5-1.9-.5-1.3.2-2.6 1.7-2.6h1.8a3.5 3.5 0 0 0 3.5-3.6A8.7 8.7 0 0 0 12 3.5z" />
      <circle cx="8" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.3" cy="9.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="13.6" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  // two playing cards (memory game)
  cards: (
    <>
      <rect x="4" y="6.5" width="9" height="12" rx="1.6" transform="rotate(-8 8.5 12.5)" />
      <rect x="11" y="5.5" width="9" height="12" rx="1.6" transform="rotate(7 15.5 11.5)" />
      <path d="M15 9.6c.5-1 2-1 2.3.2.2 1-1 1.8-1.7 2.4-.7-.5-2-1.1-1.9-2.1.1-1.2 1.6-1.4 1.3-.5z" fill="currentColor" stroke="none" />
    </>
  ),
  // ringed planet
  planet: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M3.5 14.5c2.4 1.7 6.3 2.4 10.5 1.6 4.1-.8 7-2.7 6.5-4.6-.2-.9-1.3-1.5-2.9-1.8M6.6 9.7c-1.9.2-3.2.9-3.4 1.9" />
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
