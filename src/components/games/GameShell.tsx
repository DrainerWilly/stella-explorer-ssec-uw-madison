// @ts-nocheck
import Icon from '../Icon'
import { GAME_ACCENT } from '../../data/games'

const IOSEVKA =
  "'Iosevka', 'Iosevka Nerd Font', 'Iosevka Fixed', 'Roboto Mono', 'SFMono-Regular', Consolas, monospace"

// Shared play frame for every game, styled to match the Remote Sensing Games
// gallery: a black backdrop, monospace (Iosevka) headings, and minimal chrome.
export default function GameShell({ game, onExit, scoreChip, progressPct, children }) {
  const accent = GAME_ACCENT[game.color] || '#CDEBFF'
  return (
    <main
      className="cm-games-play order-1 relative flex-1 overflow-x-hidden overflow-y-auto scroll-soft bg-black lg:order-2"
      style={{ '--accent': accent }}
    >
      <div className="relative mx-auto max-w-3xl px-5 py-6 sm:px-8 lg:py-8">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition-colors hover:text-white"
        >
          <Icon name="back" className="h-4 w-4" />
          Games
        </button>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center border"
              style={{ borderColor: `${accent}66`, color: accent, backgroundColor: `${accent}18` }}
            >
              <Icon name={game.icon} className="h-6 w-6" />
            </span>
            <div>
              <h1
                className="text-2xl font-semibold leading-tight text-white sm:text-[1.7rem]"
                style={{ fontFamily: IOSEVKA }}
              >
                {game.title}
              </h1>
              <p className="mt-0.5 text-[13px]" style={{ color: accent }}>
                {game.tagline}
              </p>
            </div>
          </div>
          {scoreChip != null && (
            <span
              className="shrink-0 border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white"
              style={{ fontFamily: IOSEVKA }}
            >
              {scoreChip}
            </span>
          )}
        </div>

        {progressPct != null && (
          <div className="mt-5 h-1.5 w-full overflow-hidden bg-white/10">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: accent }}
            />
          </div>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
