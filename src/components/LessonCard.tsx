// @ts-nocheck
import { useEffect, useRef, useState } from 'react'

// A big-image "thumb" for the Lessons grid, echoing visualjournal.it: the
// NASA/USGS image dims on hover/focus to reveal the
// lesson caption. The whole thumb is one focusable, keyboard-accessible button.
export default function LessonCard({ lesson, onOpen }) {
  const imgRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // Cached images may already be complete before onLoad can fire.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  const openable = Boolean(lesson.route)

  return (
    <button
      onClick={() => onOpen?.(lesson)}
      aria-label={`${openable ? 'Open lesson' : 'Lesson'}: ${lesson.title}. ${lesson.badge}, ${lesson.minutes} minutes.`}
      className="cm-thumb"
    >
      <img
        ref={imgRef}
        src={`${import.meta.env.BASE_URL}${lesson.image}`}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`cm-thumb__img${loaded ? ' cm-thumb__img--loaded' : ''}`}
      />
      <span aria-hidden="true" className="cm-thumb__scrim" />
      <span className="cm-thumb__credit">{lesson.credit}</span>

      <span className="cm-thumb__cap">
        <span className="cm-thumb__kicker">{lesson.label}</span>
        <span className="cm-thumb__title">{lesson.title}</span>
        <span className="cm-thumb__meta">
          <span>{lesson.meta}</span>
          <svg className="cm-thumb__arrow" width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden="true">
            <path d="M1 5.5h14M11 1l4.5 4.5L11 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </button>
  )
}
