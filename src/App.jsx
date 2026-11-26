import { useEffect } from 'react'
import Identity from './ui/Identity'
import Career, { CareerBar } from './ui/Career'
import Hero from './ui/Hero'
import { AbilityCards, AbilityChips } from './ui/Abilities'
import Missions from './ui/Missions'
import Contact, { Toast } from './ui/Contact'
import Sheet from './ui/Sheet'
import { getState, selectAbility, setState } from './store'

function useGlobalKeys() {
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const s = getState()
      if (e.key === 'Escape') {
        if (s.sheet) return setState({ sheet: null })
        if (s.popover) return setState({ popover: false })
        if (s.ability !== 0) selectAbility(0)
        return
      }
      const n = Number(e.key)
      if (n >= 1 && n <= 4 && !s.sheet) selectAbility(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  useGlobalKeys()
  return (
    <>
      <div className="page">
        <Identity />
        <Career />
        <AbilityCards />
        <AbilityChips />
        <div className="bottom">
          <Missions />
          <Contact />
        </div>
        <CareerBar />
        <Toast />
        <Hero />
      </div>
      <Sheet />
    </>
  )
}
