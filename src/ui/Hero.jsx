import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { meta, system, abilities } from '../content'
import { burstPoints, pointInPolygon, REF_STAGE, toAttr, toClipPath } from '../burst'
import { emit, getState, hideCaption, nextPokeLine, on, prefersReducedMotion, setLoadingText, showCaption, showToast, useStore } from '../store'
import posterAvif480 from '../assets/poster-480.avif'
import posterAvif900 from '../assets/poster-900.avif'
import posterWebp480 from '../assets/poster-480.webp'
import posterWebp900 from '../assets/poster-900.webp'

setLoadingText(system.loading)

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect
// Phone and landscape-phone layouts share the 85% head box and have no caption strip.
const isPhoneLayout = () => typeof window !== 'undefined' && !window.matchMedia('(min-width: 1200px) and (min-height: 520px)').matches

// Bolt anchors: spike tip indices (tips are the even points).
const BOLTS = [
  { tip: 2, rot: 18 },
  { tip: 10, rot: 200 },
  { tip: 22, rot: -30 },
]
const TICKS = [{ tip: 6 }, { tip: 18 }]

function Bolt({ x, y, rot, k }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${k})`}>
      <path className="bolt" d="M-4-22 8-22 2-6 12-6-8 22-3 2-12 2z" />
    </g>
  )
}

function Tick({ x, y, k }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k})`}>
      <path className="tick tick-red" d="M-7 4 7-6" transform="translate(-3 3)" />
      <path className="tick" d="M-7 4 7-6" />
    </g>
  )
}

export default function Hero() {
  const stageRef = useRef(null)
  const burstRef = useRef(null)
  const boltsRef = useRef(null)
  const posterRef = useRef(null)
  const crackleRef = useRef(null)
  const [stage, setStage] = useState(REF_STAGE)
  const three = useStore((s) => s.three)
  const caption = useStore((s) => s.caption)
  const ability = useStore((s) => s.ability)
  const selectSeq = useStore((s) => s.selectSeq)

  useIso(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setStage({ w: Math.round(r.width), h: Math.round(r.height), phone: isPhoneLayout() })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pts = useMemo(() => [0, 1, 2].map((v) => burstPoints(stage.w, stage.h, stage.phone, v)), [stage])
  const vb = `0 0 ${stage.w} ${stage.h}`
  // Bolts scale with the stage so they stay decorative on a 168px phone hero.
  const k = Math.max(0.5, Math.min(1, stage.w / 420))

  // One-shot effects on selection: bolts flash 2 frames, burst punch, line boil.
  useEffect(() => {
    if (selectSeq === 0 || prefersReducedMotion()) return
    boltsRef.current?.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 66, easing: 'steps(2, end)' })
    burstRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
      { duration: 150, easing: 'ease-out' }
    )
    const boil = burstRef.current?.querySelectorAll('.boil')
    boil?.forEach((p, i) =>
      p.animate(
        [0, 1, 2, 0, 1].map((k) => ({ opacity: k === i ? 1 : 0 })),
        { duration: 600, easing: 'steps(5, end)' }
      )
    )
    if (ability === 0) crackle()
  }, [selectSeq])

  const crackle = () => {
    if (prefersReducedMotion()) return
    crackleRef.current?.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }, { opacity: 0 }], {
      duration: 260,
      easing: 'steps(4, end)',
    })
  }

  useEffect(() => {
    const offs = [
      on('crackle', crackle),
      on('poke', () => {
        const line = nextPokeLine(system.pokes)
        if (isPhoneLayout()) showToast(line, 2000)
        else showCaption('poke', line, 2000)
        if (getState().three !== 'live' && !prefersReducedMotion()) {
          posterRef.current?.animate(
            [{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0)' }],
            { duration: 420, easing: 'ease-out' }
          )
        }
      }),
    ]
    return () => offs.forEach((f) => f())
  }, [])

  // Caption: Loading hero (desktop, only while loading), Drag to spin once.
  useEffect(() => {
    if (three === 'loading') showCaption('loading', system.loading)
    else hideCaption('loading')
    if (three === 'live' && !isPhoneLayout() && window.matchMedia('(hover: hover)').matches) {
      const t = setTimeout(() => showCaption('drag', system.drag, 6000), 1400)
      const off = on('drag', () => hideCaption('drag'))
      return () => {
        clearTimeout(t)
        off()
      }
    }
  }, [three])

  // Pointer input only inside the burst polygon: drag to spin, tap to poke.
  const drag = useRef(null)
  const onPointerDown = (e) => {
    const r = stageRef.current.getBoundingClientRect()
    if (!pointInPolygon(e.clientX - r.left, e.clientY - r.top, pts[0])) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, moved: 0, last: e.clientX }
    emit('dragStart')
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.last
    d.last = e.clientX
    d.moved += Math.abs(dx)
    if (d.moved > 6) emit('drag', dx)
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved <= 6) emit('poke')
    emit('dragEnd')
  }

  const acc = abilities[ability].color

  return (
    <section className="hero" aria-label="Hero" data-three={three} style={{ '--accent': acc }}>
      <div className="stage" ref={stageRef}>
        <div className="burst" ref={burstRef} aria-hidden="true">
          <svg className="b-copy b-red" viewBox={vb} preserveAspectRatio="none" focusable="false">
            <polygon points={toAttr(pts[0])} />
          </svg>
          <svg className="b-copy b-blue" viewBox={vb} preserveAspectRatio="none" focusable="false">
            <polygon points={toAttr(pts[0])} />
          </svg>
          <svg className="b-main" viewBox={vb} preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id="burstFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--burst-top)" />
                <stop offset="1" stopColor="var(--burst-bottom)" />
              </linearGradient>
              <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.3" fill="#fff" />
              </pattern>
            </defs>
            {pts.map((p, i) => (
              <polygon key={i} className={`boil boil-${i}`} points={toAttr(p)} />
            ))}
            <polygon className="dots" points={toAttr(pts[0])} />
          </svg>
        </div>
        <div className="headbox">
          <picture>
            <source type="image/avif" srcSet={`${posterAvif480} 480w, ${posterAvif900} 900w`} sizes="(max-width: 1199.98px) 142px, 330px" />
            <source type="image/webp" srcSet={`${posterWebp480} 480w, ${posterWebp900} 900w`} sizes="(max-width: 1199.98px) 142px, 330px" />
            <img
              ref={posterRef}
              className="poster"
              data-hidden={three === 'live' ? '1' : '0'}
              src={posterWebp900}
              width="900"
              height="900"
              alt={meta.headAlt}
              decoding="async"
              fetchpriority="high"
            />
          </picture>
          <svg className="crackle" ref={crackleRef} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <path d="M6 30 16 34 10 42 22 46" />
            <path d="M94 26 84 32 92 38 80 44" />
            <path d="M8 74 18 70 14 82 26 80" />
            <path d="M92 70 82 74 90 84 78 86" />
          </svg>
        </div>
        <div className="canvas-slot" id="canvas-slot" aria-hidden="true" />
        <svg className="bolts" ref={boltsRef} viewBox={vb} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {BOLTS.map((b, i) => {
            const [x, y] = pts[0][b.tip]
            return <Bolt key={i} x={x} y={y} rot={b.rot} k={k} />
          })}
          {TICKS.map((t, i) => {
            const [x, y] = pts[0][t.tip]
            return <Tick key={i} x={x} y={y} k={k} />
          })}
        </svg>
        <div
          className="hit"
          style={{ clipPath: toClipPath(pts[0]) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden="true"
        />
        <button type="button" className="sr-only poke-btn" onClick={() => emit('poke')}>
          {system.poke}
        </button>
      </div>
      <div className="caption" aria-live="polite">
        {caption && (
          <span className={`cap cap-${caption.kind}`} key={caption.text}>
            {caption.text}
          </span>
        )}
      </div>
    </section>
  )
}
