import { BUILD_PHOTOS, BUILD_PHOTO_BY_ID } from '../data/buildPhotos'
import { sourceAssetUrl } from '../data/sourceReferences'

interface BuildPhotoViewerProps {
  selectedPhotoId: string
  onSelectPhoto: (photoId: string) => void
}

export default function BuildPhotoViewer({
  selectedPhotoId,
  onSelectPhoto,
}: BuildPhotoViewerProps) {
  const activePhoto = BUILD_PHOTO_BY_ID.get(selectedPhotoId) ?? BUILD_PHOTOS[0]
  const activeIndex = BUILD_PHOTOS.findIndex((photo) => photo.id === activePhoto.id)

  const move = (delta: -1 | 1) => {
    const nextIndex = Math.min(BUILD_PHOTOS.length - 1, Math.max(0, activeIndex + delta))
    onSelectPhoto(BUILD_PHOTOS[nextIndex].id)
  }

  return (
    <section aria-labelledby="photo-viewer-title" className="rounded-sm border border-white/10 bg-[#050b17]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Official sequence
          </p>
          <h3 id="photo-viewer-title" className="mt-1 text-sm font-semibold text-white">
            Build instruction photographs
          </h3>
        </div>
        <p className="font-mono text-[10px] text-slate-500">
          {activeIndex + 1} / {BUILD_PHOTOS.length}
        </p>
      </div>

      <figure>
        <div className="relative grid min-h-[30rem] place-items-center overflow-hidden bg-black/40 p-4 sm:min-h-[38rem]">
          <img
            src={sourceAssetUrl(activePhoto.assetPath)}
            alt={activePhoto.alt}
            className="max-h-[45rem] w-full object-contain"
          />
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={activeIndex === 0}
            aria-label="Previous build photograph"
            className="sq2-focus absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#030916]/85 text-white transition hover:bg-cyan-300 hover:text-[#03101c] disabled:cursor-not-allowed disabled:opacity-25"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={activeIndex === BUILD_PHOTOS.length - 1}
            aria-label="Next build photograph"
            className="sq2-focus absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#030916]/85 text-white transition hover:bg-cyan-300 hover:text-[#03101c] disabled:cursor-not-allowed disabled:opacity-25"
          >
            →
          </button>
        </div>
        <figcaption aria-live="polite" className="border-y border-white/10 px-4 py-3">
          <p className="text-xs leading-5 text-slate-300">{activePhoto.caption}</p>
          <p className="mt-1 font-mono text-[9px] text-slate-600">{activePhoto.filename}</p>
        </figcaption>
      </figure>

      <div className="grid grid-cols-5 gap-1.5 p-3 sm:grid-cols-10" aria-label="Build photograph sequence">
        {BUILD_PHOTOS.map((photo) => (
          <button
            type="button"
            key={photo.id}
            onClick={() => onSelectPhoto(photo.id)}
            aria-label={`Show photograph ${photo.sequence}: ${photo.caption}`}
            aria-current={photo.id === activePhoto.id ? 'true' : undefined}
            className={`sq2-focus relative aspect-square overflow-hidden rounded-sm border transition ${
              photo.id === activePhoto.id
                ? 'border-cyan-300 ring-1 ring-cyan-300'
                : 'border-white/10 opacity-55 hover:opacity-100'
            }`}
          >
            <img src={sourceAssetUrl(photo.assetPath)} alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-sm bg-black/75 px-1 font-mono text-[8px] text-white">
              {photo.sequence}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
