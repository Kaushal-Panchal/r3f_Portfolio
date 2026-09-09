import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

const LINES = ['suiting up', 'loading five powers', 'kaushal panchal, product engineer']
const MIN_MS = 1300
const MAX_MS = 14000

export default function Boot() {
  const [done, setDone] = useState(false)
  const [line, setLine] = useState(0)
  const bar = useRef()
  const { progress, active } = useProgress()
  const ready = !active && progress >= 100
  const readyRef = useRef(ready)
  readyRef.current = ready

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true)
      return
    }
    const timers = LINES.map((_, i) => setTimeout(() => setLine(i), 200 + i * 420))
    const t0 = performance.now()
    let closed = false
    const int = setInterval(() => {
      if (closed) return
      const elapsed = performance.now() - t0
      const timed = Math.min(90, (elapsed / MIN_MS) * 90)
      const pct = readyRef.current ? Math.max(timed, 96) : timed
      if (bar.current) bar.current.style.width = `${pct}%`
      if ((readyRef.current && elapsed > MIN_MS) || elapsed > MAX_MS) {
        closed = true
        clearInterval(int)
        if (bar.current) bar.current.style.width = '100%'
        setTimeout(() => setDone(true), 180)
      }
    }, 60)
    return () => {
      timers.forEach(clearTimeout)
      clearInterval(int)
    }
  }, [])

  return (
    <div className="boot" data-done={done ? '1' : '0'} aria-hidden={done}>
      <div className="boot-inner">
        <div className="boot-word">HOLD UP.</div>
        <div className="boot-line">{LINES[line]}</div>
        <div className="boot-bar">
          <i ref={bar} />
        </div>
      </div>
    </div>
  )
}
