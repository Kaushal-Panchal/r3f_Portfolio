import { abilities, missionAbilities, missionCopy, missions } from '../content'
import { emit, setState, useStore } from '../store'

// Phone layout or a touch-first device opens the sheet; desktop flips on hover/focus.
const wantsSheet = () =>
  window.matchMedia('(max-width: 1199.98px), (max-height: 519.98px), (hover: none)').matches

export default function Missions() {
  const ability = useStore((s) => s.ability)
  const linkedIds = abilities[ability].missions
  const accent = abilities[ability].color

  return (
    <section className="miss" aria-labelledby="miss-tab">
      <h2 className="tab" id="miss-tab">
        {missionCopy.label}
      </h2>
      <ul className="miss-grid">
        {missions.map((m, i) => {
          const linkedIdx = linkedIds.indexOf(m.id)
          const linkedNames = missionAbilities[m.id].map((k) => abilities[k].name).join(', ')
          return (
            <li key={m.id} className="mcell" style={{ '--i': i }}>
              <button
                type="button"
                className="mcard card"
                data-mission={m.id}
                data-linked={linkedIdx >= 0 ? '1' : '0'}
                style={{ '--accent': accent, '--ring-delay': `${Math.max(0, linkedIdx) * 30}ms` }}
                aria-label={`${m.name}: ${m.number} ${m.label}`}
                aria-describedby={`m-${m.id}-one m-${m.id}-detail m-${m.id}-links`}
                aria-haspopup="dialog"
                onClick={() => wantsSheet() && setState({ sheet: { type: 'mission', id: m.id } })}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'mouse') return
                  setState({ hoverMission: m.id })
                  emit('glance', { kind: 'mission', id: m.id })
                }}
                onPointerLeave={() => setState({ hoverMission: null })}
                onFocus={() => setState({ hoverMission: m.id })}
                onBlur={() => setState({ hoverMission: null })}
              >
                <span className="ring" aria-hidden="true" />
                <span className="mface mfront">
                  <span className="mtop" id={`m-${m.id}-num`}>
                    <span className="mnum">{m.number}</span>
                    <span className="mlabel">{m.label}</span>
                  </span>
                  <span className="mname" id={`m-${m.id}-name`}>
                    {m.name}
                  </span>
                  <span className="mone" id={`m-${m.id}-one`}>
                    {m.oneLiner}
                  </span>
                </span>
                <span className="mface mback">
                  <span className="mback-top">
                    <span className="mname">{m.name}</span>
                    <span className="mnum-chip">{m.number}</span>
                  </span>
                  <span className="mdetail" id={`m-${m.id}-detail`}>
                    {m.detail}
                  </span>
                  <span className="mlinks" aria-hidden="true">
                    {missionAbilities[m.id].map((k) => (
                      <span key={k} className="mlink" style={{ '--accent': abilities[k].color }}>
                        {abilities[k].chip}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="sr-only" id={`m-${m.id}-links`}>
                  Linked to: {linkedNames}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
