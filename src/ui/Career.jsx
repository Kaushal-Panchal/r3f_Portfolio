import { useEffect, useRef } from 'react'
import { career, identity } from '../content'
import { setState, useStore } from '../store'

export function CareerEntries({ full = true }) {
  return (
    <ol className="career-list">
      {career.entries.map((e) => (
        <li className="career-entry" key={e.company}>
          <div className="career-row">
            <span className="career-co">{e.company}</span>
            {e.now && <span className="now-chip">{career.now}</span>}
            <span className="career-role">{e.role}</span>
            <span className="career-dates">{e.dates}</span>
          </div>
          {full && <p className="career-line">{e.oneLiner}</p>}
        </li>
      ))}
    </ol>
  )
}

function Popover() {
  const open = useStore((s) => s.popover)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setState({ popover: false })
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.career-more')) setState({ popover: false })
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    ref.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div
      className="popover card"
      id="career-popover"
      role="dialog"
      aria-label={career.label}
      data-open={open ? '1' : '0'}
      ref={ref}
      tabIndex={-1}
      aria-hidden={!open}
    >
      <p className="popover-rank">{identity.rank}</p>
      <CareerEntries />
      <p className="origin">{career.origin}</p>
    </div>
  )
}

export default function Career() {
  const open = useStore((s) => s.popover)
  return (
    <section className="career card" aria-labelledby="career-tab">
      <h2 className="tab" id="career-tab">
        {career.label}
      </h2>
      <div className="career-body">
        <CareerEntries />
        <p className="origin">{career.origin}</p>
      </div>
      <div className="career-short">
        <p className="career-summary">{career.summary}</p>
        <button
          type="button"
          className="btn btn-paper career-more"
          aria-expanded={open}
          aria-controls="career-popover"
          onClick={() => setState({ popover: !open })}
        >
          {career.button}
        </button>
      </div>
      <Popover />
    </section>
  )
}

export function CareerBar() {
  return (
    <button type="button" className="career-bar btn btn-paper" onClick={() => setState({ sheet: { type: 'career' } })} aria-haspopup="dialog">
      <span className="career-bar-long">{career.summary}</span>
      <span className="career-bar-short">{career.summaryShort}</span>
      <svg className="chev" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M6 4l4 4-4 4" />
      </svg>
    </button>
  )
}
