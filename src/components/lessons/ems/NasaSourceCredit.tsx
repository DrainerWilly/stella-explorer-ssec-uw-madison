// @ts-nocheck
import { CITATION } from '../../../data/nasaEmsSources'

// One consistent NASA citation style across the lesson.
//  variant="quote"   → visually distinct blockquote + "…p. X."
//  variant="adapted" → small footer label "…pp. X–Y."
export default function NasaSourceCredit({ variant = 'adapted', page, pages, children }) {
  if (variant === 'quote') {
    return (
      <figure className="my-3 rounded-2xl border-l-4 border-ink/30 bg-cream px-4 py-3">
        <blockquote className="text-sm font-semibold leading-relaxed text-ink/85 sm:text-base">
          “{children}”
        </blockquote>
        <figcaption className="mt-2 text-[11px] font-semibold text-faint">
          {CITATION.quote(page)}
        </figcaption>
      </figure>
    )
  }
  return (
    <p className="mt-2 text-[11px] font-semibold text-faint">{CITATION.adapted(pages)}</p>
  )
}
