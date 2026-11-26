import { identity } from '../content'

function Zap({ className }) {
  return (
    <svg className={`zap ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path className="zap-red" d="M13 1 4 14h6l-2 9 10-14h-6l3-8z" />
      <path className="zap-ink" d="M13 1 4 14h6l-2 9 10-14h-6l3-8z" />
    </svg>
  )
}

export default function Identity() {
  return (
    <header className="id">
      {/* Red and blue offset copies are CSS pseudo-elements with empty alt text,
          so the name is in the DOM and the accessibility tree exactly once. */}
      <h1 className="title" data-gaze="name">
        <span className="tl" data-text={identity.first}>
          {identity.first}
        </span>{' '}
        <span className="tl" data-text={identity.last}>
          {identity.last}
        </span>
        <Zap className="zap-3" />
      </h1>
      <p className="plate">
        <span className="plate-full">{identity.cls}</span>
        <span className="plate-merged">{identity.clsMerged}</span>
        <Zap className="zap-1" />
        <Zap className="zap-2" />
      </p>
      <p className="chip xp-chip">{identity.xp}</p>
      <p className="pitch">{identity.pitch}</p>
      <p className="rank">{identity.rank}</p>
      <ul className="chips" aria-label="Quick facts">
        {identity.chips.map((c) => (
          <li className="chip" key={c}>
            {c}
          </li>
        ))}
      </ul>
    </header>
  )
}
