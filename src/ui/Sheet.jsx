import { useEffect, useRef } from 'react'
import { career, identity, missions, system } from '../content'
import { setState, useStore } from '../store'
import { CareerEntries } from './Career'

function MissionBody({ id }) {
  const m = missions.find((x) => x.id === id)
  if (!m) return null
  return (
    <>
      <p className="sheet-num">
        <span className="mnum">{m.number}</span>
        <span className="mlabel">{m.label}</span>
      </p>
      <h2 className="sheet-title" id="sheet-title">
        {m.name}
      </h2>
      <p className="sheet-text">{m.oneLiner}</p>
      <p className="sheet-text">{m.detail}</p>
    </>
  )
}

function CareerBody() {
  return (
    <>
      <h2 className="sheet-title" id="sheet-title">
        {career.label}
      </h2>
      <p className="sheet-rank">{identity.rank}</p>
      <CareerEntries />
      <p className="origin">{career.origin}</p>
    </>
  )
}

export default function Sheet() {
  const sheet = useStore((s) => s.sheet)
  const panel = useRef(null)
  const closeBtn = useRef(null)
  const lastFocus = useRef(null)
  const drag = useRef(null)

  const close = () => setState({ sheet: null })

  useEffect(() => {
    if (!sheet) return
    lastFocus.current = document.activeElement
    closeBtn.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('button, a[href]')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lastFocus.current?.focus?.()
    }
  }, [sheet])

  // Swipe down on the panel closes it.
  const onPointerDown = (e) => {
    drag.current = { y: e.clientY, id: e.pointerId }
  }
  const onPointerMove = (e) => {
    if (!drag.current || !panel.current) return
    const dy = Math.max(0, e.clientY - drag.current.y)
    panel.current.style.transform = `translateY(${dy}px)`
  }
  const onPointerUp = (e) => {
    if (!drag.current || !panel.current) return
    const dy = e.clientY - drag.current.y
    panel.current.style.transform = ''
    drag.current = null
    if (dy > 60) close()
  }

  return (
    <div className="sheet-root" data-open={sheet ? '1' : '0'} inert={sheet ? undefined : ''}>
      <div className="scrim" onClick={close} aria-hidden="true" />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        ref={panel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="handle" aria-hidden="true" />
        <button type="button" className="btn btn-paper sheet-close" ref={closeBtn} onClick={close}>
          {system.close}
        </button>
        {sheet?.type === 'mission' && <MissionBody id={sheet.id} />}
        {sheet?.type === 'career' && <CareerBody />}
      </div>
    </div>
  )
}
