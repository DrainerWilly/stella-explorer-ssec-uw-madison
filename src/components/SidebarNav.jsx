import Icon from './Icon.jsx'

const NAV = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'mission-control', icon: 'globe', label: 'Mission Control' },
  { id: 'animations', icon: 'animation', label: 'Animations' },
  { id: 'games', icon: 'games', label: 'Games' },
  { id: 'lessons', icon: 'lessons', label: 'Lessons', dot: true },
  { id: 'device', icon: 'device', label: 'STELLA device' },
  { id: 'data-viz', icon: 'viz', label: 'Data Visualizer' },
  { id: 'data', icon: 'data', label: 'Data & graphs' },
]

export default function SidebarNav({ className = '', active = 'home', onNavigate }) {
  return (
    <nav
      className={`z-10 flex shrink-0 items-center gap-1 border-t border-black/5 bg-cream px-2 py-2
                 lg:m-3 lg:w-[88px] lg:flex-col lg:gap-2 lg:rounded-panel lg:border-t-0 lg:px-0 lg:py-5 ${className}`}
      aria-label="Primary"
    >
      {/* logo — desktop only at top */}
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
              {item.dot && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral ring-2 ring-cream" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
