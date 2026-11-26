// ?perf overlay. A lazy chunk: visitors never download it.
// Reads the scheduler's ring buffers and shows cadence, frame time and cost.
import { gate } from '../three/gate'
import { getState } from '../store'

const pct = (arr, p) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(s.length * p))]
}

export async function mountPerfOverlay() {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText =
    'position:fixed;right:8px;top:8px;z-index:1000;font:12px/1.35 ui-monospace,Menlo,monospace;background:#14112B;color:#FFF8EC;padding:8px 10px;border:2px solid #FFF8EC;min-width:250px;white-space:pre;pointer-events:none'
  document.body.appendChild(el)

  let longTasks = 0
  try {
    new PerformanceObserver((l) => (longTasks += l.getEntries().length)).observe({ type: 'longtask', buffered: true })
  } catch {
    /* longtask is Chromium only */
  }

  // rAF cadence of the page, independent of whether we render.
  const cadence = []
  let lastRaf = performance.now()
  const raf = (t) => {
    cadence.push(t - lastRaf)
    if (cadence.length > 120) cadence.shift()
    lastRaf = t
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  let perfMod = null
  let lastRenders = 0
  let lastT = performance.now()

  const snapshot = () => {
    const p = perfMod?.perf
    const n = p ? Math.min(p.n, 120) : 0
    const deltas = []
    const cpu = []
    if (p) {
      for (let i = 0; i < n; i++) {
        const k = (p.n - 1 - i + p.deltas.length) % p.deltas.length
        deltas.push(p.deltas[k])
        cpu.push(p.cpu[k])
      }
    }
    const now = performance.now()
    const rps = p ? ((p.renders - lastRenders) * 1000) / (now - lastT) : 0
    const info = p?.gl?.info?.render
    const canvas = p?.gl?.domElement
    const cad50 = pct(cadence, 0.5)
    return {
      visible: document.visibilityState === 'visible',
      throttled: cad50 > 40,
      three: getState().three,
      gate: gate.reason,
      tier: gate.tier,
      renderer: gate.renderer,
      level: p?.level ?? null,
      dpr: p?.dpr ?? null,
      canvasMP: canvas ? +((canvas.width * canvas.height) / 1e6).toFixed(2) : 0,
      mode: p?.mode ?? 'n/a',
      rafFps: cad50 ? +(1000 / cad50).toFixed(1) : 0,
      rafP95: +pct(cadence, 0.95).toFixed(2),
      renderedFrames: n,
      frameP50: +pct(deltas, 0.5).toFixed(2),
      frameP95: +pct(deltas, 0.95).toFixed(2),
      frameP99: +pct(deltas, 0.99).toFixed(2),
      fps: deltas.length ? +(1000 / (deltas.reduce((a, b) => a + b, 0) / deltas.length)).toFixed(1) : 0,
      cpuP95: +pct(cpu, 0.95).toFixed(3),
      dropped: p?.dropped ?? 0,
      dropPct: p && p.n ? +((100 * p.dropped) / p.n).toFixed(2) : 0,
      rendersPerSec: +rps.toFixed(1),
      totalRenders: p?.renders ?? 0,
      drawCalls: info?.calls ?? 0,
      triangles: info?.triangles ?? 0,
      longTasks,
      gpuMs: 'n/a',
    }
  }
  // Synthetic cost per frame: N forced renders, each followed by a 1px readback so
  // the GPU work is included. Works even when rAF is throttled (hidden pane).
  const bench = async (n = 150) => {
    perfMod = perfMod || (await import('../three/loop'))
    const { loop, perf } = perfMod
    const gl = perf.gl.getContext()
    const px = new Uint8Array(4)
    const cpu = []
    const total = []
    for (let i = 0; i < n; i++) {
      const t0 = performance.now()
      loop.renderNow()
      const t1 = performance.now()
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
      const t2 = performance.now()
      if (i >= 20) {
        cpu.push(t1 - t0)
        total.push(t2 - t0)
      }
    }
    const c = perf.gl.domElement
    return {
      frames: cpu.length,
      cpuP50: +pct(cpu, 0.5).toFixed(2),
      cpuP95: +pct(cpu, 0.95).toFixed(2),
      cpuGpuP50: +pct(total, 0.5).toFixed(2),
      cpuGpuP95: +pct(total, 0.95).toFixed(2),
      canvas: [c.width, c.height],
      drawCalls: perf.gl.info.render.calls,
      triangles: perf.gl.info.render.triangles,
      programs: perf.gl.info.programs?.length,
    }
  }
  window.__perf = { snapshot, bench, reset: () => perfMod && Object.assign(perfMod.perf, { n: 0, dropped: 0 }) }

  setInterval(async () => {
    if (!perfMod && getState().three === 'live') perfMod = await import('../three/loop')
    const s = snapshot()
    lastRenders = perfMod?.perf.renders ?? 0
    lastT = performance.now()
    const warn = !s.visible || s.throttled ? '\n!! HIDDEN / THROTTLED: discard this run' : ''
    el.style.borderColor = warn ? '#E8322E' : '#FFF8EC'
    el.textContent =
      `3d ${s.three} (${s.gate}) tier ${s.tier} L${s.level ?? '-'}\n` +
      `dpr ${s.dpr ?? '-'}  canvas ${s.canvasMP} MP  mode ${s.mode}\n` +
      `rAF ${s.rafFps} fps  p95 ${s.rafP95} ms\n` +
      `render ${s.fps} fps  p50 ${s.frameP50}  p95 ${s.frameP95}  p99 ${s.frameP99}\n` +
      `cpu p95 ${s.cpuP95} ms  gpu ${s.gpuMs}\n` +
      `drops ${s.dropped} (${s.dropPct}%)  renders/s ${s.rendersPerSec}\n` +
      `draws ${s.drawCalls}  tris ${s.triangles}  longtasks ${s.longTasks}` +
      warn
  }, 500)
}
