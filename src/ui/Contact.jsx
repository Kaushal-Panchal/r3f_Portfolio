import { contact } from '../content'
import { emit, showToast, useStore } from '../store'

function copyEmail() {
  try {
    navigator.clipboard?.writeText(contact.email).catch(() => {})
  } catch {
    /* clipboard can be blocked; the mailto link still opens */
  }
  showToast(contact.toast)
}

function Shades() {
  return (
    <svg className="shades" viewBox="0 0 24 10" aria-hidden="true" focusable="false">
      <path d="M0 0h24v3h-2v3h-2v2h-5V6h-2V3h-2v3H9v2H4V6H2V3H0z" />
    </svg>
  )
}

export default function Contact() {
  const toast = useStore((s) => s.toast)
  return (
    <section className="contact" aria-label="Contact">
      <a
        className="teamup btn btn-cyan"
        href={contact.mailto}
        data-gaze="teamup"
        aria-label={`${contact.teamUp}: email ${contact.email}`}
        onClick={copyEmail}
        onPointerEnter={(e) => e.pointerType === 'mouse' && emit('nod')}
      >
        <span className="teamup-label">{contact.teamUp}</span>
        <span className="email-label">{contact.email}</span>
        <span className="teamup-sub" aria-hidden={toast ? 'true' : undefined}>
          {contact.email}
        </span>
        <span className="teamup-toast" data-show={toast ? '1' : '0'} aria-hidden="true">
          <Shades />
          {contact.toast}
        </span>
      </a>
      <a className="btn btn-paper social" href={contact.linkedinHref} target="_blank" rel="noopener noreferrer">
        {contact.linkedin}
      </a>
      <a className="btn btn-paper social" href={contact.githubHref} target="_blank" rel="noopener noreferrer">
        {contact.github}
      </a>
    </section>
  )
}

// Phone toast slot, and the single live region for every layout.
export function Toast() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="toast-slot" aria-live="polite" role="status">
      {toast && (
        <p className="toast">
          <Shades />
          {toast}
        </p>
      )}
    </div>
  )
}
