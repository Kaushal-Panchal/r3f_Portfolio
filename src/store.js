import { useSyncExternalStore } from 'react'

// A tiny store. React reads it with useSyncExternalStore; the 3D side reads it
// with getState() and subscribe(), so moving the mouse never re-renders React.

const listeners = new Set()

const initial = {
  ability: 0,
  hoverAbility: null,
  hoverMission: null,
  sheet: null, // { type: 'mission', id } | { type: 'career' }
  popover: false,
  toast: null, // string or null
  caption: null, // { kind: 'loading' | 'poke' | 'drag', text }
  three: 'pending', // pending | loading | live | static | failed
  selectSeq: 0, // bumps on every selection, drives one-shot effects
}
let state = initial

export const getState = () => state

export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  let changed = false
  for (const k in next) {
    if (next[k] !== state[k]) {
      changed = true
      break
    }
  }
  if (!changed) return
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useStore(selector) {
  // The server snapshot is the prerendered state, so hydration always matches
  // the HTML; React then re-renders with the live state.
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial)
  )
}

export function selectAbility(i) {
  const n = ((i % 4) + 4) % 4
  setState((s) => ({ ability: n, selectSeq: s.selectSeq + 1 }))
  emit('select', n)
}

// Event bus for one-shot moments (head reactions, pokes, gaze hints).
const bus = new Map()
export function on(type, fn) {
  if (!bus.has(type)) bus.set(type, new Set())
  bus.get(type).add(fn)
  return () => bus.get(type).delete(fn)
}
export function emit(type, payload) {
  bus.get(type)?.forEach((fn) => fn(payload))
}

// Toast with a single timer.
let toastTimer = 0
export function showToast(text, ms = 2500) {
  clearTimeout(toastTimer)
  setState({ toast: text })
  toastTimer = setTimeout(() => setState({ toast: null }), ms)
}

// Caption strip: one item at a time. Priority: loading > poke > drag.
let captionTimer = 0
// A poke always shows (it is a direct response to the visitor), then loading, then the drag hint.
const rank = { poke: 3, loading: 2, drag: 1 }
export function showCaption(kind, text, ms) {
  const cur = state.caption
  if (cur && rank[cur.kind] > rank[kind]) return
  clearTimeout(captionTimer)
  setState({ caption: { kind, text } })
  if (ms) captionTimer = setTimeout(() => hideCaption(kind), ms)
}
export function hideCaption(kind) {
  if (!state.caption || (kind && state.caption.kind !== kind)) return
  // If the hero is still loading when a poke line ends, bring the loading chip back.
  setState({ caption: kind !== 'loading' && state.three === 'loading' ? { kind: 'loading', text: loadingText } : null })
}
let loadingText = ''
export const setLoadingText = (t) => (loadingText = t)

// Poke lines cycle in order.
let pokeIdx = 0
export function nextPokeLine(lines) {
  const line = lines[pokeIdx % lines.length]
  pokeIdx++
  return line
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  (document.documentElement.dataset.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
