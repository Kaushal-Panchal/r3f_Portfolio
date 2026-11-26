// Writes the server-rendered app into dist/index.html and adds preload links
// for the two above-the-fold fonts (Anton and Atkinson Hyperlegible Next).
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const ssrDir = resolve('dist-ssr')
const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)

const html = render()
const assets = readdirSync(resolve(dist, 'assets'))
const font = (prefix) => assets.find((f) => f.startsWith(prefix) && f.endsWith('.woff2'))
const preloads = ['anton-latin', 'atkinson-next-latin-var']
  .map(font)
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')

const file = resolve(dist, 'index.html')
let page = readFileSync(file, 'utf8')
if (!page.includes('<!--app-->')) throw new Error('index.html has no <!--app--> marker')
page = page.replace('<!--app-->', html).replace('<!--preload-->', preloads)
writeFileSync(file, page)
rmSync(ssrDir, { recursive: true, force: true })
console.log(`prerendered ${(Buffer.byteLength(page) / 1024).toFixed(1)} KB into dist/index.html`)
