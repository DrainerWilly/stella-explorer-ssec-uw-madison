import { useState } from 'react'
import Icon from '../../Icon.jsx'
import { IMAGES } from '../../../data/landsatLessonSources.js'

// Shows an official NASA/USGS image with required attribution. If the local
// file in /public/landsat/ is missing, it degrades to a labeled, still-credited
// placeholder (never a broken or fake image).
export default function ImageWithAttribution({ imageId, image, aspect = 'aspect-[4/3]', className = '' }) {
  const meta = image ?? IMAGES[imageId]
  const [ok, setOk] = useState(true)
  if (!meta) return null

  const src = `${import.meta.env.BASE_URL}${meta.file}`

  return (
    <figure className={className}>
      <div className={`relative w-full overflow-hidden rounded-2xl bg-cream ring-1 ring-ink/5 ${aspect}`}>
        {ok ? (
          <img
            src={src}
            alt={meta.alt}
            loading="lazy"
            onError={() => setOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-ink/60 shadow-soft">
              <Icon name="satellite" className="h-5 w-5" />
            </span>
            <p className="text-xs font-bold text-muted">Official {meta.org} image</p>
            <p className="max-w-[22ch] text-[11px] leading-snug text-faint">{meta.alt}</p>
            <a
              href={meta.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-app transition-opacity hover:opacity-90"
            >
              View source ↗
            </a>
          </div>
        )}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-faint">
        <span className="font-semibold">{meta.credit}</span>
        <a
          href={meta.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          View source ↗
        </a>
      </figcaption>
    </figure>
  )
}
