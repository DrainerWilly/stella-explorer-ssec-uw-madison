// @ts-nocheck
import Icon from '../../Icon'
import ImageWithAttribution from './ImageWithAttribution'
import SunToSatelliteDiagram from './SunToSatelliteDiagram'
import { HERO } from '../../../data/landsatLessonContent'

export default function LandsatHero({ band, onStart }) {
  return (
    <section className="overflow-hidden rounded-panel bg-gradient-to-br from-cream to-cream2 p-5 shadow-soft sm:p-7">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted shadow-soft">
            <Icon name="satellite" className="h-3.5 w-3.5" />
            Landsat 8/9
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {HERO.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{HERO.subtitle}</p>

          <p className="mt-4 rounded-2xl bg-surface/70 p-3 text-sm font-semibold text-ink/80">
            {HERO.note}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{HERO.gradeNote[band]}</p>

          <div className="mt-5">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-app transition-all hover:scale-[1.02] hover:opacity-90"
            >
              Start exploring
              <Icon name="chevron" className="h-4 w-4 rotate-90" />
            </button>
          </div>

          <div className="mt-5">
            <SunToSatelliteDiagram steps={HERO.pipeline} />
          </div>
        </div>

        <ImageWithAttribution imageId="hero" aspect="aspect-[4/3]" />
      </div>
    </section>
  )
}
