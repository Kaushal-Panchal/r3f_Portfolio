// Capability gate. No three.js import here: this file ships in the entry bundle.
// Decides static poster vs live 3D, picks a start tier, and kicks off the lazy
// 3D chunk and the model fetch only after the page has painted.
import { setState } from '../store'
import modelUrl from '../assets/head.glb?url'

export const gate = { tier: 'mid', reason: '', renderer: '', modelUrl }

function probe() {
  try {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const gl = c.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return null
    let renderer = ''
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    renderer = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return renderer
  } catch {
    return null
  }
}

export function decide() {
  const q = new URLSearchParams(location.search)
  const force = q.get('3d')
  if (force === '0') return { ok: false, reason: '?3d=0' }
  const nav = navigator
  const conn = nav.connection
  if (force !== '1') {
    if (conn?.saveData || q.has('savedata')) return { ok: false, reason: 'save-data' }
    if (conn && /(^|-)2g$/.test(conn.effectiveType || '')) return { ok: false, reason: '2g' }
    if (nav.deviceMemory && nav.deviceMemory <= 2) return { ok: false, reason: 'deviceMemory<=2' }
    if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return { ok: false, reason: 'cores<=2' }
  }
  const renderer = probe()
  if (renderer === null) return { ok: false, reason: 'no webgl2 or major performance caveat' }
  gate.renderer = renderer
  if (force !== '1' && /SwiftShader|llvmpipe|softpipe|Software|Microsoft Basic/i.test(renderer)) return { ok: false, reason: 'software renderer' }
  let tier = 'mid'
  if (/Mali-(4|T|G5[12])|Adreno \(TM\) [3-5]\d\d|PowerVR|Intel.*HD Graphics/i.test(renderer)) tier = 'low'
  const qt = q.get('tier')
  if (qt === 'low' || qt === 'mid' || qt === 'high') tier = qt
  return { ok: true, tier, reason: 'ok' }
}

const whenVisible = () =>
  new Promise((res) => {
    if (document.visibilityState === 'visible') return res()
    const on = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', on)
        res()
      }
    }
    document.addEventListener('visibilitychange', on)
  })

const afterLoad = () =>
  new Promise((res) => {
    const go = () => {
      const ric = window.requestIdleCallback || ((f) => setTimeout(f, 1))
      ric(res, { timeout: 300 })
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
  })

export async function startThree() {
  const d = decide()
  gate.reason = d.reason
  if (!d.ok) {
    setState({ three: 'static' })
    return
  }
  gate.tier = d.tier
  await afterLoad()
  setState({ three: 'loading' })
  const model = fetch(modelUrl).then((r) => {
    if (!r.ok) throw new Error(`model ${r.status}`)
    return r.arrayBuffer()
  })
  model.catch(() => {})
  try {
    const [{ mountStage }] = await Promise.all([import('./Stage.jsx'), whenVisible()])
    mountStage({ model, tier: d.tier })
  } catch (err) {
    console.warn('[3d] fell back to the poster:', err?.message || err)
    setState({ three: 'failed' })
  }
}
