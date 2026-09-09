import { Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { abilities } from '../data'
import { useStore } from '../store'
import { view, damp } from '../engine'
import { useMedia } from '../useMedia'
import { Dust, PowerRing } from './Bits'
import Head from './Head'
import Abilities3D from './Abilities3D'

/* r3f sizes the canvas from a ResizeObserver, which never fires if the document
   is hidden when the tree mounts (background tab, bfcache restore). One nudge
   once it is visible keeps the scene from staying 300x150. */
function useResizeKick() {
  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event('resize'))
    const raf = requestAnimationFrame(kick)
    const t1 = setTimeout(kick, 250)
    const t2 = setTimeout(kick, 1200)
    const onVisible = () => document.visibilityState === 'visible' && kick()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', kick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', kick)
    }
  }, [])
}

function Rig({ compact }) {
  const { camera } = useThree()
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    view.ex = damp(view.ex, view.px, 3.4, d)
    view.ey = damp(view.ey, view.py, 3.4, d)
    camera.position.set(view.ex * 0.42, -view.ey * 0.26, compact ? 9.6 : 8.2)
    camera.lookAt(view.ex * 0.14, -view.ey * 0.06, 0)
  }, -1)
  return null
}

export default function World() {
  useResizeKick()
  const compact = useMedia('(max-width: 980px)')
  const accent = useStore((s) => abilities[s.ability].color)

  return (
    <div className="canvas-layer" aria-hidden="true">
      <Canvas
        dpr={[1, compact ? 1.5 : 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 42, near: 0.1, far: 90, position: [0, 0, 8.2] }}
      >
        <Rig compact={compact} />
        <ambientLight intensity={0.75} color="#a9a2c4" />
        <Dust count={compact ? 320 : 650} />
        <Suspense fallback={null}>
          <group position={[compact ? 0 : -0.44, compact ? 1.78 : -0.52, 0]}>
            <PowerRing radius={compact ? 1.42 : 2.18} color={accent} />
            <Head size={compact ? 2.0 : 2.86} accent={accent} />
            <Abilities3D compact={compact} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}
