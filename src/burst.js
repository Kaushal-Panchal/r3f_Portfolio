// Comic burst geometry. Pure functions, used by the prerender and the client.
//
// The burst lives in the "stage" (hero zone minus the caption strip). Spike tips
// reach the stage inset (16px at the sides and top, 8px at the bottom). Valley
// points lie on an ellipse whose top sits at head box top + 0.10 * S, which is
// the 10% break-out the head is allowed above the burst.

// 14 irregular spikes: angle jitter (radians) and tip reach (0..1 of the box).
const SPIKES = [
  [0.02, 1.0], [-0.05, 0.86], [0.04, 0.97], [-0.02, 0.8], [0.05, 1.0], [-0.04, 0.9], [0.02, 0.84],
  [-0.03, 1.0], [0.04, 0.88], [-0.05, 0.98], [0.03, 0.82], [-0.02, 0.95], [0.05, 0.87], [-0.04, 1.0],
]
// Small per-variant wobble for the 3-frame "line boil".
const BOIL = [
  [0, 0],
  [0.012, -0.01],
  [-0.01, 0.012],
]

export function headBox(stageW, stageH, phone) {
  const S = phone ? Math.min(0.85 * stageW, 0.85 * stageH) : Math.min(0.72 * stageW, 0.7 * stageH)
  return { x: (stageW - S) / 2, y: (stageH - S) / 2, S }
}

// Returns polygon points in stage pixels.
export function burstPoints(stageW, stageH, phone, variant = 0) {
  const inset = { l: 16, r: 16, t: 16, b: 8 }
  const box = { x0: inset.l, y0: inset.t, x1: stageW - inset.r, y1: stageH - inset.b }
  const hb = headBox(stageW, stageH, phone)
  const cx = stageW / 2
  // Valley ellipse: centred on the head box, top at head top + 0.1 S.
  const vTop = hb.y + 0.1 * hb.S
  const cy = hb.y + hb.S * 0.56
  const ry = cy - vTop
  const rx = Math.min(hb.S * 0.5, (box.x1 - box.x0) * 0.42)
  const [bj, br] = BOIL[variant % BOIL.length]
  const pts = []
  const n = SPIKES.length
  for (let i = 0; i < n; i++) {
    const [jit, reach] = SPIKES[i]
    // tip
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + jit + bj
    const tip = rayToBox(cx, cy, a, box)
    const k = 0.62 + 0.38 * (reach + br)
    pts.push([cx + (tip[0] - cx) * Math.min(1, k), cy + (tip[1] - cy) * Math.min(1, k)])
    // valley halfway to the next spike
    const av = -Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2 + bj * 0.5
    pts.push([cx + Math.cos(av) * rx, cy + Math.sin(av) * ry])
  }
  return pts
}

function rayToBox(cx, cy, a, box) {
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  let t = Infinity
  if (dx > 1e-6) t = Math.min(t, (box.x1 - cx) / dx)
  if (dx < -1e-6) t = Math.min(t, (box.x0 - cx) / dx)
  if (dy > 1e-6) t = Math.min(t, (box.y1 - cy) / dy)
  if (dy < -1e-6) t = Math.min(t, (box.y0 - cy) / dy)
  return [cx + dx * t, cy + dy * t]
}

export const toAttr = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

export const toClipPath = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`

export function pointInPolygon(x, y, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Prerender reference stage (tier L at 1440x900) until the client measures.
export const REF_STAGE = { w: 448, h: 564, phone: false }
