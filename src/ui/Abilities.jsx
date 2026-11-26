import { useEffect, useRef } from 'react'
import { abilities, abilityCopy, missionAbilities } from '../content'
import { emit, selectAbility, setState, useStore } from '../store'

export function AbilityCards() {
  const ability = useStore((s) => s.ability)
  const hoverMission = useStore((s) => s.hoverMission)
  const linked = hoverMission ? missionAbilities[hoverMission] : []
  const refs = useRef([])
  const pressRef = useRef([])

  // Keycap press feedback for keys 1 to 4.
  useEffect(() => {
    const onKey = (e) => {
      const n = Number(e.key)
      if (n >= 1 && n <= 4) {
        const el = pressRef.current[n - 1]
        if (el) {
          el.dataset.pressed = '1'
          setTimeout(() => (el.dataset.pressed = '0'), 90)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onKeyDown = (e) => {
    let next = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = ability + 1
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = ability - 1
    if (next === null) return
    e.preventDefault()
    const n = (next + 4) % 4
    selectAbility(n)
    refs.current[n]?.focus()
  }

  return (
    <section className="abil" aria-labelledby="abil-h">
      <div className="abil-head">
        <h2 className="abil-title" id="abil-h">
          {abilityCopy.label}
        </h2>
        <span className="abil-hint" aria-hidden="true">
          {abilityCopy.hint}
        </span>
      </div>
      <div className="abil-cards" role="radiogroup" aria-label={abilityCopy.groupName} onKeyDown={onKeyDown}>
        {abilities.map((a, i) => {
          const on = i === ability
          return (
            <div
              key={a.id}
              ref={(el) => (refs.current[i] = el)}
              className="acard card"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              data-on={on ? '1' : '0'}
              data-ability={i}
              aria-label={`${a.name}: ${a.receipt}`}
              style={{ '--accent': a.color }}
              onClick={() => selectAbility(i)}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return
                setState({ hoverAbility: i })
                emit('glance', { kind: 'ability', index: i })
              }}
              onPointerLeave={() => setState({ hoverAbility: null })}
            >
              {a.tab && <span className="tab tab-small acard-tab">{a.tab}</span>}
              <div className="acard-head">
                <span ref={(el) => (pressRef.current[i] = el)} className="keycap" data-pressed="0" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="acard-name">{a.name}</span>
                <span className="receipt">{a.receipt}</span>
              </div>
              <p className="acard-line">
                <span className="acard-one">{a.oneLiner}</span>
                <span className="linked-dot" data-show={linked.includes(i) ? '1' : '0'} aria-hidden="true" />
              </p>
              <div className="acard-more">
                <p className="acard-detail">{a.detail}</p>
                <ul className="tags" aria-label="Tags">
                  {a.tags.map((t) => (
                    <li className="tag" key={t}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function AbilityChips() {
  const ability = useStore((s) => s.ability)
  const a = abilities[ability]
  const refs = useRef([])
  const onKeyDown = (e) => {
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = ability + 1
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = ability - 1
    if (next === null) return
    e.preventDefault()
    const n = (next + 4) % 4
    selectAbility(n)
    refs.current[n]?.focus()
  }
  return (
    <section className="abil-m card" aria-label={abilityCopy.label}>
      {/* Visual tab only: the page has a single "Abilities" heading. */}
      <p className="tab" aria-hidden="true">
        {abilityCopy.label}
      </p>
      <div className="abil-chips" role="radiogroup" aria-label={abilityCopy.groupName} onKeyDown={onKeyDown}>
        {abilities.map((x, i) => (
          <button
            type="button"
            key={x.id}
            ref={(el) => (refs.current[i] = el)}
            className="achip"
            role="radio"
            aria-checked={i === ability}
            aria-label={`${x.name}: ${x.receipt}`}
            tabIndex={i === ability ? 0 : -1}
            style={{ '--accent': x.color }}
            data-on={i === ability ? '1' : '0'}
            onClick={() => selectAbility(i)}
          >
            {x.chip}
          </button>
        ))}
      </div>
      <div className="abil-m-info" style={{ '--accent': a.color }} aria-live="polite">
        <span className="receipt">{a.receipt}</span>
        <span className="abil-m-line">{a.oneLiner}</span>
      </div>
    </section>
  )
}

