// Debug overlay, opt-in via ?zones: outlines the hero zone and warns if
// any text node's box intersects it. The caption strip, the decorative word
// and visually hidden text are the allowed exceptions.

function textRects(root) {
  const out = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let n
  while ((n = walker.nextNode())) {
    if (!n.textContent.trim()) continue
    const p = n.parentElement
    if (!p || p.closest('.hero, .sr-only, [aria-hidden="true"], .sheet-root, .popover')) continue
    const cs = getComputedStyle(p)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) if (r.width && r.height) out.push({ r, text: n.textContent.trim().slice(0, 40) })
  }
  return out
}

// Bounding box of non-transparent pixels, in CSS px of the drawn area.
function alphaBox(source, sx, sy, sw, sh, outW, outH) {
  const c = document.createElement('canvas')
  c.width = outW
  c.height = outH
  const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(source, sx, sy, sw, sh, 0, 0, outW, outH)
  const d = x.getImageData(0, 0, outW, outH).data
  let x0 = outW, y0 = outH, x1 = -1, y1 = -1
  for (let y = 0; y < outH; y++)
    for (let i = 0; i < outW; i++)
      if (d[(y * outW + i) * 4 + 3] > 24) {
        if (i < x0) x0 = i
        if (i > x1) x1 = i
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  return { x0, y0, x1, y1 }
}

// Poster vs live 3D: silhouette bounding boxes inside the head box (spec 5.2, 2px rule).
window.__swapCheck = async () => {
  const { loop } = await import('../three/loop')
  const canvas = document.querySelector('.canvas-slot canvas')
  const img = document.querySelector('.poster')
  const hb = document.querySelector('.headbox').getBoundingClientRect()
  if (!canvas || !img) return 'no canvas or poster'
  const cr = canvas.getBoundingClientRect()
  const S = Math.round(hb.width)
  const k = canvas.width / cr.width
  loop.renderNow()
  const live = alphaBox(canvas, (hb.left - cr.left) * k, (hb.top - cr.top) * k, hb.width * k, hb.height * k, S, S)
  // naturalWidth is density-corrected by srcset, so decode a copy at full size.
  const full = new Image()
  full.src = img.currentSrc || img.src
  await full.decode()
  const poster = alphaBox(full, 0, 0, full.naturalWidth, full.naturalHeight, S, S)
  const diff = Math.max(Math.abs(live.x0 - poster.x0), Math.abs(live.y0 - poster.y0), Math.abs(live.x1 - poster.x1), Math.abs(live.y1 - poster.y1))
  return { S, live, poster, maxDiffPx: diff }
}

export function watchZones() {
  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText = 'position:fixed;z-index:999;pointer-events:none;outline:2px dashed #E8322E;outline-offset:-2px'
  document.body.appendChild(box)
  const check = () => {
    const hero = document.querySelector('.hero')
    if (!hero) return
    const z = hero.getBoundingClientRect()
    Object.assign(box.style, { left: `${z.left}px`, top: `${z.top}px`, width: `${z.width}px`, height: `${z.height}px` })
    const hits = textRects(document.body).filter(({ r }) => r.right > z.left + 0.5 && r.left < z.right - 0.5 && r.bottom > z.top + 0.5 && r.top < z.bottom - 0.5)
    if (hits.length) console.warn('[zones] text intersects the hero zone:', hits.map((h) => h.text))
    window.__zoneHits = hits.map((h) => h.text)
  }
  check()
  window.addEventListener('resize', () => requestAnimationFrame(check))
  setTimeout(check, 1500)
}
