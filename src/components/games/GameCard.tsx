// @ts-nocheck
import { motion, useReducedMotion } from 'framer-motion'
import Icon from '../Icon'
import { GAME_ACCENT } from '../../data/games'

// A playful arcade card: tilted sticker icon, crayon-dashed border on hover,
// difficulty shown as little rockets, and the player's earned stars.
export default function GameCard({ game, index = 0, record, onPlay }) {
  const reduce = useReducedMotion()
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  const stars = record?.stars ?? 0
  const rockets = game.difficulty === 'Easy' ? 1 : game.difficulty === 'Medium' ? 2 : 3

  return (
    <motion.button
      initial={{ opacity: 0, y: reduce ? 0 : 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -6, rotate: index % 2 === 0 ? -1 : 1 }}
      onClick={() => onPlay(game.id)}
      aria-label={`Play ${game.title}`}
      style={{ '--accent': accent }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-white/10 bg-white/[0.05] p-5 text-left backdrop-blur-sm transition-colors hover:border-[color:var(--accent)]/60 hover:bg-white/[0.08]"
    >
      {/* corner glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ backgroundColor: accent }}
      />

      <div className="relative flex items-start justify-between">
        {/* sticker-style icon */}
        <span
          className="grid h-14 w-14 rotate-[-4deg] place-items-center rounded-2xl border-2 shadow-[0_6px_16px_-6px_var(--accent)] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110"
          style={{ backgroundColor: `${accent}26`, borderColor: `${accent}66`, color: accent }}
        >
          <Icon name={game.icon} className="h-7 w-7" />
        </span>

        <span className="flex flex-col items-end gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-game text-[10px] font-bold uppercase tracking-wider text-white/60">
            {game.category}
          </span>
          {/* difficulty as rockets */}
          <span className="flex items-center gap-0.5" title={`Difficulty: ${game.difficulty}`}>
            {[0, 1, 2].map((i) => (
              <Icon
                key={i}
                name="rocket"
                className="h-3.5 w-3.5"
                style={{ color: i < rockets ? accent : 'rgb(255 255 255 / 0.15)' }}
              />
            ))}
          </span>
        </span>
      </div>

      <h3 className="relative mt-4 font-game text-2xl font-extrabold leading-tight tracking-tight text-white">
        {game.title}
      </h3>
      <p className="relative mt-0.5 font-game text-[13px] font-semibold" style={{ color: accent }}>
        {game.tagline}
      </p>
      <p className="relative mt-2.5 text-sm leading-relaxed text-white/60">{game.description}</p>

      <div className="relative mt-5 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-game text-sm font-extrabold text-[#101426] transition-transform group-hover:scale-105"
          style={{ backgroundColor: accent }}
        >
          <Icon name="play" className="h-4 w-4" />
          Play · {game.minutes} min
        </span>

        {/* earned stars */}
        <span className="flex items-center gap-0.5" title={stars ? `Your best: ${stars} stars` : 'No patch yet'}>
          {[0, 1, 2].map((i) => (
            <Icon
              key={i}
              name="star"
              className="h-4 w-4"
              style={{ color: i < stars ? '#ffd97a' : 'rgb(255 255 255 / 0.14)' }}
            />
          ))}
        </span>
      </div>
    </motion.button>
  )
}
