import { useEffect, useRef, useState } from 'react'

// Tracks recent pointer/keyboard activity and reports whether the UI should
// currently be considered "active" (visible). Used to auto-hide the floating
// time bar after a period of inactivity and bring it back on the next
// mouse/touch/key event — similar to a video player's control bar.
export default function useAutoHide(idleMs = 3200) {
  const [active, setActive] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    const wake = () => {
      setActive(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setActive(false), idleMs)
    }

    wake() // start visible, then begin the idle countdown

    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel']
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [idleMs])

  return active
}
