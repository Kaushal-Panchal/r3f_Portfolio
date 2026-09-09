/* Pointer state, mutated outside React so moving the mouse never re-renders. */

export const view = {
  px: 0, py: 0, // raw, normalised -1..1
  ex: 0, ey: 0, // eased, what the scene follows
  reduced: false,
  coarse: false,
}

export function initEngine() {
  view.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  view.coarse = window.matchMedia('(pointer: coarse)').matches
  if (import.meta.env?.DEV) window.__view = view

  const onPointer = (e) => {
    view.px = (e.clientX / window.innerWidth) * 2 - 1
    view.py = (e.clientY / window.innerHeight) * 2 - 1
  }
  const onLeave = () => {
    view.px = 0
    view.py = 0
  }

  if (!view.coarse) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave)
  }
  return () => {
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('pointerleave', onLeave)
  }
}

export const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))
