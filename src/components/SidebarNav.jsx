import Icon from './Icon.jsx'

// Each item also carries a real photo (official sources: NASA/USGS imagery,
// the STELLA project site, and NASA's public Images API), used by the home
// page's Explore grid. The sidebar itself shows only the line-icon glyph.
export const NAV = [
  {
    id: 'home',
    icon: 'home',
    label: 'Home',
    image: 'assets/nasa/earth-day-8k.jpg',
    imageAlt: 'NASA Blue Marble image of Earth from space',
  },
  {
    id: 'mission-control',
    icon: 'tracker',
    label: 'Satellite Tracker',
    image: 'assets/media/landsat-in-orbit.jpg',
    imageAlt: 'Rendered view of a Landsat satellite in orbit above a mountainous coastline',
  },
  {
    id: 'animations',
    icon: 'animation',
    label: 'Animations',
    image: 'assets/nasa/ems-diagram-09172025.jpg',
    imageAlt: 'NASA diagram of the electromagnetic spectrum from radio waves to gamma rays',
  },
  {
    id: 'games',
    icon: 'games',
    label: 'Space Arcade',
    image: 'assets/home/pillars-of-creation.jpg',
    imageAlt: 'The Pillars of Creation, imaged by the Hubble Space Telescope',
  },
  {
    id: 'lessons',
    icon: 'lessons',
    label: 'Lessons',
    image: 'assets/home/stella-field-lesson.jpg',
    imageAlt: 'Students and an educator examining vegetation during a STELLA field session',
  },
  {
    id: 'device',
    icon: 'device',
    label: 'STELLA Device Lab',
    image: 'assets/stella/stella-1-2.png',
    imageAlt: 'The white 3D-printed STELLA-1.2 instrument with its touchscreen and rotary knob',
  },
  {
    id: 'data-viz',
    icon: 'viz',
    label: 'Data Visualizer',
    image: 'assets/stella/stella-q2.png',
    imageAlt: 'The STELLA-Q2 pocket spectrometer with a live spectrum on its display',
  },
  {
    id: 'data',
    icon: 'data',
    label: 'Data & graphs',
    image: 'landsat/false-color.jpg',
    imageAlt: 'Near-infrared false-color Landsat image of Florida with vegetation shown in red',
  },
]

export default function SidebarNav({ className = '', active = 'home', onNavigate }) {
  return (
    <nav
      className={`z-10 flex shrink-0 items-center gap-1 border-t border-black/5 bg-cream px-2 py-2
                 lg:m-3 lg:w-[88px] lg:flex-col lg:gap-2 lg:rounded-panel lg:border-t-0 lg:px-0 lg:py-5 ${className}`}
      aria-label="Primary"
    >
      {/* logo: desktop only at top */}
      <div className="hidden lg:mb-3 lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:overflow-hidden lg:rounded-2xl lg:bg-white lg:p-1.5 lg:shadow-soft">
        <img
          src={`${import.meta.env.BASE_URL}assets/brand/ssec-logo.png`}
          alt="SSEC"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex w-full items-center justify-around gap-1 lg:flex-1 lg:flex-col lg:justify-start lg:gap-2.5">
        {NAV.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative grid h-11 w-11 place-items-center rounded-full transition-all duration-200
                ${
                  isActive
                    ? 'bg-ink text-app shadow-soft'
                    : 'bg-surface text-ink/70 hover:bg-surface hover:text-ink hover:shadow-soft lg:bg-surface/70'
                }`}
            >
              <Icon name={item.icon} className="h-[22px] w-[22px]" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
