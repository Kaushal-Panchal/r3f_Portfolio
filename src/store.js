import { create } from 'zustand'
import { abilities } from './data'

export const useStore = create((set) => ({
  tab: 'powers',
  setTab: (tab) => set((s) => (s.tab === tab ? s : { tab })),

  ability: 0,
  setAbility: (i) =>
    set({ ability: ((i % abilities.length) + abilities.length) % abilities.length, tab: 'powers' }),

  hoverAbility: null,
  setHoverAbility: (hoverAbility) =>
    set((s) => (s.hoverAbility === hoverAbility ? s : { hoverAbility })),

  hot: false,
  setHot: (hot) => set((s) => (s.hot === hot ? s : { hot })),
}))
