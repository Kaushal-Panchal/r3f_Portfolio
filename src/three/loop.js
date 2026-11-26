import { advance } from '@react-three/fiber'

// Frame scheduler. R3F runs with frameloop="never"; this loop decides when a
// frame is worth rendering and calls advance(). Policy (03 section 3.4):
// active motion renders at a 60fps cap, idle attract at 60 then 30fps,
// reduced motion renders on demand only, hidden tab or offscreen stops it.

const RING = 240

export const perf = {
  deltas: new Float32Array(RING), // ms between consecutive rendered frames
  cpu: new Float32Array(RING), // ms spent in update + render
  n: 0,
  renders: 0,
  ticks: 0,
  dropped: 0,
  contiguous: 0,
  level: 0,
  dpr: 0,
  gl: null,
  mode: 'stopped',
  interval: 0,
}

const FRAME60 = 1000 / 60
const FRAME30 = 1000 / 30

export const loop = {
  head: null,
  quality: null,
  running: false,
  started: false,
  raf: 0,
  wake: 0,
  lastRender: 0,
  lastWasContinuous: false,
  dirty: false,
  visible: typeof document !== 'undefined' ? document.visibilityState === 'visible' : true,
  onscreen: true,
  nativeWhileDragging: false,
  idle30Always: false,
  headRect: null,
  unmount: null,

  start(head) {
    this.head = head
    this.started = true
    this.invalidate()
  },

  stop() {
    this.started = false
    this.running = false
    cancelAnimationFrame(this.raf)
    clearTimeout(this.wake)
    perf.mode = 'stopped'
  },

  invalidate() {
    this.dirty = true
    if (!this.started || this.running || !this.visible || !this.onscreen) return
    this.running = true
    this.lastWasContinuous = false
    this.raf = requestAnimationFrame(tick)
  },

  renderNow() {
    const now = performance.now()
    this.head?.update(now)
    advance(now)
    this.lastRender = now
    perf.renders++
  },
}

function tick(now) {
  const L = loop
  if (!L.started || !L.visible || !L.onscreen) {
    L.running = false
    perf.mode = 'paused'
    return
  }
  perf.ticks++
  const h = L.head
  const mode = h ? h.mode(now) : 'settled'
  perf.mode = mode
  if (mode === 'settled' && !L.dirty) {
    // Nothing moves: stop the loop and wake up when idle attract is due.
    L.running = false
    L.lastWasContinuous = false
    clearTimeout(L.wake)
    const due = h ? h.idleDueIn(now) : -1
    if (due >= 0) L.wake = setTimeout(() => L.invalidate(), due)
    return
  }
  let interval = FRAME60
  if (mode === 'drag' && L.nativeWhileDragging) interval = 0
  else if (mode === 'idle' && (L.idle30Always || h.idleFor(now) > 15000)) interval = FRAME30
  else if (mode === 'demand') interval = 0
  perf.interval = interval
  L.raf = requestAnimationFrame(tick)
  if (now - L.lastRender < interval - 2) return
  const delta = now - L.lastRender
  const t0 = performance.now()
  h?.update(now)
  advance(now)
  const cpu = performance.now() - t0
  L.lastRender = now
  L.dirty = false
  perf.renders++
  if (L.lastWasContinuous && mode !== 'demand') {
    const i = perf.n % RING
    perf.deltas[i] = delta
    perf.cpu[i] = cpu
    perf.n++
    if (interval > 0 && delta > interval * 1.5) perf.dropped++
    if (interval === FRAME60) L.quality?.sample(delta, cpu)
  }
  L.lastWasContinuous = mode !== 'demand'
  if (mode === 'demand') {
    L.running = false
    cancelAnimationFrame(L.raf)
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    loop.visible = document.visibilityState === 'visible'
    if (loop.visible) {
      // Safety net for canvases measured while hidden (the 300x150 bug).
      window.dispatchEvent(new Event('resize'))
      loop.quality?.grace()
      loop.invalidate()
    }
  })
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.dispatchEvent(new Event('resize'))
  })
}

export function observeOnscreen(el) {
  const io = new IntersectionObserver(([e]) => {
    loop.onscreen = e.isIntersecting
    if (loop.onscreen) loop.invalidate()
  })
  io.observe(el)
  return () => io.disconnect()
}
