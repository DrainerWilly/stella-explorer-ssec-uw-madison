// @ts-nocheck
import { useState } from 'react'
import Icon from './Icon'

// A credited, click-to-play video. Shows a poster + play button and only
// downloads the (large) clip when the user presses play.
export default function MediaVideo({ video, aspect = 'aspect-video', className = '' }) {
  const [playing, setPlaying] = useState(false)
  if (!video) return null

  const base = import.meta.env.BASE_URL
  const src = `${base}${video.file}`
  const poster = video.poster ? `${base}${video.poster}` : undefined

  return (
    <figure className={className}>
      <div className={`relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 ${aspect}`}>
        {playing ? (
          <video
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${video.title}`}
            className="group relative block h-full w-full"
          >
            {poster ? (
              <img
                src={poster}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#0b1a3d] to-[#04091c]" />
            )}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
                <Icon name="play" className="ml-0.5 h-8 w-8 text-white" />
              </span>
            </span>
            {video.title && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-left text-sm font-bold text-white sm:text-base">
                {video.title}
              </span>
            )}
          </button>
        )}
      </div>

      {(video.blurb || video.credit) && (
        <figcaption className="mt-2 space-y-1">
          {video.blurb && <p className="text-[13px] leading-relaxed text-muted">{video.blurb}</p>}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-faint">
            <span className="font-semibold">{video.credit}</span>
            {video.sourceUrl && (
              <a
                href={video.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
              >
                Source ↗
              </a>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  )
}
