import { BUILD_PHOTO_BY_ID } from '../../data/buildPhotos'
import { sourceAssetUrl } from '../../data/sourceReferences'
import type { ScaffoldingModel } from '../../data/scaffolding'

export type ScaffoldComparisonMode = 'before' | 'after' | 'side-by-side' | 'overlay'

interface ScaffoldPhotoComparisonProps {
  model: ScaffoldingModel
  mode: ScaffoldComparisonMode
  onChangeMode: (mode: ScaffoldComparisonMode) => void
}

const MODES: readonly ScaffoldComparisonMode[] = ['before', 'after', 'side-by-side', 'overlay']

export default function ScaffoldPhotoComparison({
  model,
  mode,
  onChangeMode,
}: ScaffoldPhotoComparisonProps) {
  const before = BUILD_PHOTO_BY_ID.get(model.beforePhotoId)
  const after = BUILD_PHOTO_BY_ID.get(model.afterPhotoId)
  if (!before || !after) return null

  return (
    <section aria-labelledby="scaffold-photo-comparison-title" className="sq2-panel mt-4 rounded-sm p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Official photo comparison
          </p>
          <h3 id="scaffold-photo-comparison-title" className="mt-1 text-sm font-semibold text-white">
            {model.label}: before and after
          </h3>
        </div>
        <fieldset className="flex flex-wrap rounded-sm border border-white/10 p-1">
          <legend className="sr-only">Photo comparison mode</legend>
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChangeMode(item)}
              aria-pressed={mode === item}
              className={`sq2-focus rounded-sm px-2 py-1.5 text-[9px] font-semibold capitalize transition ${
                mode === item ? 'bg-white text-[#03101c]' : 'text-slate-500 hover:text-white'
              }`}
            >
              {item === 'side-by-side' ? 'side-by-side' : item}
            </button>
          ))}
        </fieldset>
      </div>

      {mode === 'side-by-side' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PhotoCard photo={before} label="Before · arrows identify temporary material" />
          <PhotoCard photo={after} label="After · cleared reference" />
        </div>
      ) : mode === 'overlay' ? (
        <figure className="mt-4">
          <div className="relative min-h-64 overflow-hidden rounded-sm border border-white/10 bg-black/40">
            <img src={sourceAssetUrl(before.assetPath)} alt={before.alt} className="absolute inset-0 h-full w-full object-contain" />
            <img src={sourceAssetUrl(after.assetPath)} alt="" className="absolute inset-0 h-full w-full object-contain opacity-50 mix-blend-screen" />
          </div>
          <figcaption className="mt-2 text-[10px] leading-4 text-slate-500">
            Overlay is a visual comparison only; the photographs have different framing. Keep the arrows visible in the Before reference.
          </figcaption>
        </figure>
      ) : (
        <div className="mt-4">
          <PhotoCard
            photo={mode === 'before' ? before : after}
            label={mode === 'before' ? 'Before · arrows identify temporary material' : 'After · cleared reference'}
          />
        </div>
      )}
    </section>
  )
}

function PhotoCard({
  photo,
  label,
}: {
  photo: NonNullable<ReturnType<typeof BUILD_PHOTO_BY_ID.get>>
  label: string
}) {
  const source = sourceAssetUrl(photo.assetPath)
  return (
    <figure className="overflow-hidden rounded-sm border border-white/10 bg-black/30">
      <div className="grid min-h-64 place-items-center p-2">
        <img src={source} alt={photo.alt} className="max-h-[32rem] w-full object-contain" />
      </div>
      <figcaption className="border-t border-white/10 px-3 py-2">
        <p className="text-[10px] text-slate-300">{label}</p>
        <a
          href={source}
          target="_blank"
          rel="noreferrer noopener"
          className="sq2-focus mt-1 inline-block text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-300 hover:text-white"
        >
          Enlarge official image ↗
        </a>
      </figcaption>
    </figure>
  )
}
