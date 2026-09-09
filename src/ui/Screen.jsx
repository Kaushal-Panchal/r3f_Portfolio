import { useEffect } from 'react'
import { abilities, missions, origin, profile, stats, tabs } from '../data'
import { useStore } from '../store'
import { setLabel } from '../labels'
import { useCountUp } from '../useCountUp'

export function Labels() {
  return (
    <div className="labels" aria-hidden="true">
      {abilities.map((a, i) => (
        <div key={a.id} className="label" ref={setLabel(i)}>
          {a.name}
        </div>
      ))}
    </div>
  )
}

function Powers() {
  const i = useStore((s) => s.ability)
  const a = abilities[i]
  const level = useCountUp(a.level)

  return (
    <>
      <div className="con-head">
        <span className="con-kicker">Power {a.code} · {a.tag}</span>
        <span className="con-meta">{a.years}</span>
      </div>
      <h2 className="con-title">{a.name}</h2>
      <div className="meter">
        <div className="meter-top">
          <span>Power level</span>
          <b>{level}</b>
        </div>
        <div className="meter-bar">
          <i className="meter-fill" style={{ width: `${a.level}%` }} />
        </div>
      </div>
      <div className="console-body">
        <p className="con-body">{a.blurb}</p>
        <div className="chips">
          {a.stack.map((s) => (
            <span className="chip" key={s}>{s}</span>
          ))}
        </div>
        <div className="proof">
          <span>Receipts</span>
          {a.proof}
        </div>
      </div>
    </>
  )
}

function Origin() {
  return (
    <>
      <div className="con-head">
        <span className="con-kicker">Origin story</span>
        <span className="con-meta">2018 to now</span>
      </div>
      <h2 className="con-title">How I got here</h2>
      <div className="console-body">
        {origin.map((o) => (
          <div className="origin-item" key={o.id}>
            <div className="origin-top">
              <span className="origin-org">{o.org}</span>
              <span className="origin-when">{o.period}</span>
            </div>
            <div className="origin-role">{o.title} · {o.place}</div>
            <p className="origin-line">{o.line}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function Missions() {
  return (
    <>
      <div className="con-head">
        <span className="con-kicker">Missions</span>
        <span className="con-meta">{missions.length} shipped</span>
      </div>
      <h2 className="con-title">Things that went live</h2>
      <div className="console-body">
        {missions.map((m) => (
          <div className="mission" key={m.id} style={{ '--m': m.accent }}>
            <div className="mission-top">
              <span className="mission-name">{m.name}</span>
              <span className="mission-metric">{m.metric}</span>
            </div>
            <div className="mission-org">{m.org} · {m.year}</div>
            <p className="mission-line">{m.line}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function Signal() {
  const links = [
    { k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
    { k: 'LinkedIn', v: 'kaushal-panchal', href: profile.linkedin },
    { k: 'GitHub', v: 'Kaushal-Panchal', href: profile.github },
    { k: 'Phone', v: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
  ]
  return (
    <>
      <div className="con-head">
        <span className="con-kicker">Signal</span>
        <span className="con-meta">Usually quick</span>
      </div>
      <h2 className="shout">
        Got something hard? <em>Let’s build it.</em>
      </h2>
      <div className="console-body">
        <p className="con-body" style={{ marginBottom: 14 }}>
          Up for product work where AI, real time 3D and actually shipping all show up in the same room.
        </p>
        {links.map((l) => (
          <a
            className="link"
            key={l.k}
            href={l.href}
            target={l.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
          >
            <span>{l.k}</span>
            <b>{l.v}</b>
          </a>
        ))}
      </div>
    </>
  )
}

const PANELS = { powers: Powers, origin: Origin, missions: Missions, signal: Signal }

export default function Screen() {
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)
  const ability = useStore((s) => s.ability)
  const setAbility = useStore((s) => s.setAbility)
  const setHoverAbility = useStore((s) => s.setHoverAbility)
  const Panel = PANELS[tab] ?? Powers
  const accent = abilities[ability].color

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        setAbility(ability + 1)
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setAbility(ability - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ability, setAbility])

  return (
    <div className="screen">
      <header className="top">
        <div className="badge">
          <b className="badge-full">KAUSHAL PANCHAL</b>
          <b className="badge-short">KP</b>
          <span>Open to work</span>
        </div>
        <nav className="tabs">
          {tabs.map((t) => (
            <button key={t.id} data-on={tab === t.id ? '1' : '0'} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="lockup">
        <p className="script">product</p>
        <h1 className="giant">ENGINEER.</h1>
      </div>

      <aside className="rail">
        <p className="pitch">
          I build AI stuff that <em>actually ships.</em>
        </p>
        <div className="rail-title">Loadout</div>
        {abilities.map((a, i) => (
          <button
            key={a.id}
            className="slot"
            style={{ '--c': a.color }}
            data-on={i === ability ? '1' : '0'}
            onClick={() => setAbility(i)}
            onMouseEnter={() => setHoverAbility(i)}
            onMouseLeave={() => setHoverAbility(null)}
          >
            <i>{a.code}</i>
            <em>{a.name}</em>
            <u />
          </button>
        ))}
        <p className="hint">
          Click a node, or hit <b>↑ ↓</b>
        </p>
      </aside>

      <div className="stage" aria-hidden="true" />

      <section className="console" style={{ '--c': accent }}>
        <div className="panel-in" key={tab === 'powers' ? `powers-${ability}` : tab}>
          <Panel />
        </div>
      </section>

      <footer className="bottom">
        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.l}>
              <b>{s.v}</b>
              <span>{s.l}</span>
            </div>
          ))}
        </div>
        <div className="where">
          {profile.location}
          <br />
          Built with three.js
        </div>
      </footer>
    </div>
  )
}
