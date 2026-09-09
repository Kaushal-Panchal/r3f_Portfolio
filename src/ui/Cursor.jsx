import { useEffect, useRef } from 'react'
import { useStore } from '../store'

export default function Cursor() {
  const dot = useRef()
  const ring = useRef()
  const hot = useStore((s) => s.hot)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let raf

    const move = (e) => {
      x = e.clientX
      y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const tick = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    const over = (e) => {
      const el = e.target
      const interactive = el.closest?.('a, button, .interactive')
      useStore.getState().setHot(!!interactive)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} data-hot={hot ? '1' : '0'} aria-hidden="true" />
    </>
  )
}
