import Icon from '../Icon.jsx'

// Pastel gallery card matching the home-page lesson cards. Clicking opens the
// animation's detail view.
export default function AnimationCard({ animation, onOpen }) {
  return (
    <button
      onClick={() => onOpen(animation.id)}
      className={`group flex cursor-pointer flex-col rounded-card bg-${animation.color} p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lift`}
    >
      {/* top row: label + badge */}
      <div className="mb-7 flex items-start justify-between">
        <span className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 text-cink">
            <Icon name={animation.icon} className="h-[18px] w-[18px]" />
          </span>
          <span className="text-sm font-bold text-cink/70">{animation.label}</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-cink/80">
          <Icon name="play" className="h-3 w-3" />
          {animation.badge}
        </span>
      </div>

      {/* title */}
      <h3 className="text-xl font-extrabold leading-snug tracking-tight text-cink">
        {animation.title}
      </h3>

      {/* description */}
      <p className="mt-2 text-[13px] font-medium leading-relaxed text-cink/60">
        {animation.description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-cink/70 transition-transform group-hover:translate-x-0.5">
        Open animation
        <Icon name="chevron" className="h-4 w-4" />
      </span>
    </button>
  )
}
