// Adaptive quality (03 section 3.5). Measures frame cost only while the loop
// renders every 60fps tick, so intentional 30fps idle and on-demand frames are
// never mistaken for a slow device.
//
// Levels: 3 High (DPR 2, 2.6 MP), 2 Mid (DPR 1.5, 1.4 MP), 1 Low (DPR 1, 0.6 MP), 0 Poster.

const LEVELS = {
  3: { dpr: 2, mp: 2.6e6 },
  2: { dpr: 1.5, mp: 1.4e6 },
  1: { dpr: 1, mp: 0.6e6 },
}
const WINDOW = 90
const TARGET = 1000 / 60

const p95 = (arr) => {
  const s = Array.from(arr).sort((a, b) => a - b)
  return s[Math.floor(s.length * 0.95)] || 0
}

export function dprFor(level, w, h) {
  const L = LEVELS[level]
  const device = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  let dpr = Math.min(device, L.dpr)
  const px = Math.max(1, w * h)
  if (px * dpr * dpr > L.mp) dpr = Math.sqrt(L.mp / px)
  return Math.max(0.5, Math.round(dpr * 100) / 100)
}

export function createQuality({ tier, size, onChange }) {
  const q = new URLSearchParams(location.search)
  const pinned = q.get('level')
  let level = tier === 'poster' ? 1 : tier === 'high' ? 3 : tier === 'low' ? 1 : 2
  if (pinned) level = Math.max(0, Math.min(3, Number(pinned)))
  let w = size.width
  let h = size.height
  let deltas = []
  let cpus = []
  let bad = 0
  let good = 0
  let ups = 0
  let flips = 0
  let lastDir = 0
  let frozen = !!pinned || tier === 'poster'
  let graceUntil = performance.now() + 1000
  let slowSince = 0

  const emit = () => onChange(level, tier === 'poster' ? 1 : level > 0 ? dprFor(level, w, h) : 0)

  const step = (dir) => {
    if (frozen) return
    if (dir > 0 && (level >= 3 || ups >= 2)) return
    if (dir < 0 && level <= 0) return
    if (lastDir && dir !== lastDir) flips++
    if (flips >= 3) frozen = true
    lastDir = dir
    if (dir > 0) ups++
    else ups = 0
    level += dir
    graceUntil = performance.now() + 2000
    emit()
  }

  return {
    get level() {
      return level
    },
    apply(sz) {
      w = sz.width
      h = sz.height
      graceUntil = performance.now() + 2000
      emit()
    },
    grace() {
      graceUntil = performance.now() + 2000
      deltas = []
      cpus = []
    },
    sample(delta, cpu) {
      if (performance.now() < graceUntil) return
      deltas.push(delta)
      cpus.push(cpu)
      if (deltas.length < WINDOW) return
      const pd = p95(deltas)
      const pc = p95(cpus)
      deltas = []
      cpus = []
      if (pd > TARGET * 1.25) {
        good = 0
        bad++
        if (level === 1 && pd > 33) {
          slowSince = slowSince || performance.now()
          if (performance.now() - slowSince > 3000) step(-1)
        } else slowSince = 0
        if (bad >= 2 && level > 1) {
          bad = 0
          step(-1)
        }
      } else if (pd < TARGET * 1.1 && pc < 2) {
        // At a 60 cap the delta sits at 16.7ms even with headroom, so headroom
        // is judged by a clean cadence plus a low CPU cost per frame.
        bad = 0
        slowSince = 0
        good++
        if (good >= 4) {
          good = 0
          step(1)
        }
      } else {
        bad = 0
        good = 0
      }
    },
    dispose() {},
  }
}
