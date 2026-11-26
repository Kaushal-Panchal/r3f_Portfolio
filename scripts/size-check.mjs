// Budget gate (04-spec section 8, 03-tech-plan section 2.5). Exits 1 on a breach.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const dist = resolve('dist')
// The four Mixamo GLBs in public/ are kept on the owner's request and are not part of the site.
const OWNER_PENDING = new Set(['ArmGesture.glb', 'SittingIdle.glb', 'StandingPose.glb', 'Waving.glb'])

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
const files = walk(dist)
const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length
const kb = (n) => `${(n / 1024).toFixed(1)} KB`
const rows = []
let fail = false
const check = (label, value, limit, unit = '') => {
  const ok = value <= limit
  if (!ok) fail = true
  rows.push(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(34)} ${kb(value).padStart(10)} ${unit.padEnd(4)} (limit ${kb(limit)})`)
}

const html = readFileSync(join(dist, 'index.html'), 'utf8')
const entryName = html.match(/<script type="module"[^>]*src="\/assets\/([^"]+)"/)?.[1]
const js = files.filter((f) => f.endsWith('.js'))
const entry = js.find((f) => f.endsWith(entryName))
const isTool = (f) => /\/(overlay|zones)-/.test(f)
// Everything lazy that is not a dev tool belongs to the 3D path (Stage, three, R3F).
const three = js.filter((f) => f !== entry && !isTool(f))
const other = js.filter((f) => f !== entry && !three.includes(f))

check('index.html', gz(join(dist, 'index.html')), 20 * 1024, 'gz')
check('entry JS', gz(entry), 70 * 1024, 'gz')
check('3D chunk', three.reduce((a, f) => a + gz(f), 0), 250 * 1024, 'gz')
const fonts = files.filter((f) => f.endsWith('.woff2'))
check(`fonts (${fonts.length} files)`, fonts.reduce((a, f) => a + statSync(f).size, 0), 100 * 1024)
const posterMax = Math.max(0, ...files.filter((f) => /poster-/.test(f)).map((f) => statSync(f).size))
check('largest poster file', posterMax, 35 * 1024)
const glb = files.filter((f) => f.endsWith('.glb') && !OWNER_PENDING.has(f.split('/').pop()))
check('model', glb.reduce((a, f) => a + statSync(f).size, 0), 320 * 1024)
const css = files.filter((f) => f.endsWith('.css'))
rows.push(`info  CSS ${css.map((f) => `${kb(statSync(f).size)} (${kb(gz(f))} gz)`).join(', ')}`)
for (const f of other) rows.push(`info  other chunk ${f.split('/').pop()} ${kb(gz(f))} gz`)

const site = files.filter((f) => !OWNER_PENDING.has(f.split('/').pop()))
const siteBytes = site.reduce((a, f) => a + statSync(f).size, 0)
const pending = files.filter((f) => OWNER_PENDING.has(f.split('/').pop()))
const pendingBytes = pending.reduce((a, f) => a + statSync(f).size, 0)
check('dist/ (site files)', siteBytes, 2 * 1024 * 1024)
if (pending.length) rows.push(`WARN  dist/ also holds ${pending.length} Mixamo GLBs (${(pendingBytes / 1e6).toFixed(1)} MB), owner decision pending. Total ${((siteBytes + pendingBytes) / 1e6).toFixed(1)} MB.`)

console.log(rows.join('\n'))
if (fail) {
  console.error('size-check: budget exceeded')
  process.exit(1)
}
