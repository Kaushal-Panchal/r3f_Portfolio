import { useEffect, useRef, useState } from 'react'

/* Rolls a number up to its target. Small thing, but selecting a power should feel like something. */
export function useCountUp(target, ms = 650) {
  const [n, setN] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(a + (target - a) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  return n
}
