import { useEffect } from 'react'
import World from './three/World'
import Screen, { Labels } from './ui/Screen'
import Cursor from './ui/Cursor'
import Boot from './ui/Boot'
import { initEngine } from './engine'

export default function App() {
  useEffect(() => initEngine(), [])

  return (
    <>
      <div className="sky" />
      <World />
      <div className="fade-bottom" />
      <div className="halftone" />
      <div className="grain" />
      <Labels />
      <Screen />
      <Cursor />
      <Boot />
    </>
  )
}
