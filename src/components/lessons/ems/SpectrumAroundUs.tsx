// @ts-nocheck
import EmsHeroDiagram from './EmsHeroDiagram'
import NasaSourceCredit from './NasaSourceCredit'
import { AROUND_US, QUOTES } from '../../../data/emsLessonContent'

export default function SpectrumAroundUs({ band, onJumpToRegion }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">The spectrum around us</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/80 sm:text-base">{AROUND_US.intro[band]}</p>
      <NasaSourceCredit variant="quote" page={QUOTES.fullRange.page}>{QUOTES.fullRange.text}</NasaSourceCredit>

      <div className="mt-4">
        <EmsHeroDiagram band={band} onJumpToRegion={onJumpToRegion} />
      </div>
      <NasaSourceCredit variant="adapted" pages={AROUND_US.pages} />
    </div>
  )
}
