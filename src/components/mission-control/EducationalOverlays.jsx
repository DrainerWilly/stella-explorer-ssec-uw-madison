import Icon from '../Icon.jsx'
import { LABEL, ACCENT, ACCENT_INK } from './mcStyles.js'

const SECTIONS = [
  {
    title: 'How to read this view',
    body: [
      'Earth is in the center of the scene.',
      'Colored markers are satellite missions — each color matches a science category.',
      'Curved paths are modeled orbital paths; the bright line on Earth is the selected mission’s ground track.',
      'The time controls change the simulation time, moving every satellite together.',
    ],
  },
  {
    title: 'Why different orbits matter',
    body: [
      'Earth-observing satellites use different orbit paths to support different science goals. Some repeatedly image the same regions, while others collect global observations over time.',
    ],
  },
  {
    title: 'From orbit to data',
    body: [
      'Satellite instruments detect reflected or emitted electromagnetic energy. Scientists process those measurements into imagery, maps, and data products.',
    ],
    lessons: [
      { label: 'What Is the Electromagnetic Spectrum?', page: 'lesson-ems' },
      { label: 'How Landsat Images Are Made', page: 'lesson-landsat' },
    ],
  },
]

export default function EducationalOverlays({ open, onClose, onOpenLesson }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="How to use Mission Control"
      onClick={onClose}
    >
      <div
        className="scroll-soft max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0b1a3d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={LABEL}>Mission Control</div>
            <h2 className="mt-0.5 text-lg font-light tracking-wide text-white">
              Exploring the view
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Icon name="plus" className="h-4 w-4 rotate-45" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {SECTIONS.map((s) => (
            <section key={s.title} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-white">
                {s.title}
              </h3>
              <ul className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-white/60">
                {s.body.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {s.lessons && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {s.lessons.map((l) => (
                    <button
                      key={l.page}
                      onClick={() => {
                        onClose()
                        onOpenLesson(l.page)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/75 hover:text-white"
                    >
                      {l.label}
                      <Icon name="chevron" className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT, color: ACCENT_INK }}
        >
          Start exploring
        </button>
      </div>
    </div>
  )
}
