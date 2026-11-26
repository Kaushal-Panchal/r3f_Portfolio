// Regenerates the 3 self-hosted font files in src/assets/fonts from the
// @fontsource packages (npm). Needs Python fontTools (pip install fonttools brotli).
// Run with: npm run fonts. The outputs are committed, so a normal build never runs this.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, statSync } from 'node:fs'

const out = 'src/assets/fonts'
mkdirSync(out, { recursive: true })
const nm = 'node_modules'

// 1. Kaushan Script: only the glyphs of "Kaushal Panchal".
execFileSync('pyftsubset', [
  `${nm}/@fontsource/kaushan-script/files/kaushan-script-latin-400-normal.woff2`,
  '--text=Kaushal Panchal',
  '--layout-features=kern,liga,calt',
  '--flavor=woff2',
  `--output-file=${out}/kaushan-title.woff2`,
])

// 2. Anton: the fontsource latin file is already the Google "latin" range.
copyFileSync(`${nm}/@fontsource/anton/files/anton-latin-400-normal.woff2`, `${out}/anton-latin.woff2`)

// 3. Atkinson Hyperlegible Next: variable, wght axis limited to 400..800.
execFileSync('fonttools', [
  'varLib.instancer',
  `${nm}/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2`,
  'wght=400:800',
  '-o',
  `${out}/atkinson-next-latin-var.woff2`,
])

for (const f of ['kaushan-title', 'anton-latin', 'atkinson-next-latin-var']) {
  console.log(f, statSync(`${out}/${f}.woff2`).size, 'bytes')
}
