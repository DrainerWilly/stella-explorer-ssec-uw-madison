import Icon from './Icon.jsx'

const NAV = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'lessons', icon: 'lessons', label: 'Lessons', dot: true },
  { id: 'device', icon: 'device', label: 'STELLA device' },
  { id: 'data', icon: 'data', label: 'Data & graphs' },
  { id: 'animations', icon: 'animation', label: 'Animations' },
  { id: 'games', icon: 'games', label: 'Games' },
  { id: 'mission-control', icon: 'orbit', label: 'Mission Control' },
  { id: 'satellite', icon: 'satellite', label: 'Satellite imagery' },
  { id: 'teacher', icon: 'book', label: 'Teacher resources' },
]

export default function SidebarNav({ className = '', active = 'home', onNavigate }) {
  return (
    <nav
      className={`z-10 flex shrink-0 items-center gap-1 border-t border-black/5 bg-cream px-2 py-2
                 lg:m-3 lg:w-[88px] lg:flex-col lg:gap-2 lg:rounded-panel lg:border-t-0 lg:px-0 lg:py-5 ${className}`}
      aria-label="Primary"
    >
      {/* logo — desktop only at top */}
      <div className="hidden lg:mb-3 lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-2xl lg:bg-ink lg:text-app">
        <Icon name="logo" className="h-6 w-6" strokeWidth={1.9} />
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
