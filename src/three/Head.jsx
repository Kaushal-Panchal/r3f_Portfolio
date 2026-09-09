import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { view, damp } from '../engine'
import { glowTexture } from './common'

const URL = '/HeadWithGoggles.glb'
useGLTF.preload(URL)

/* Sweeping scan bar. Cheap, and it does most of the work. */
function Scanner({ height = 3.2, width = 3.6, color = '#2fd8ff' }) {
  const bar = useRef()
  const echo = useRef()
  const soft = glowTexture()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cycle = (t * 0.26) % 1
    const y = -height / 2 + cycle * height
    const fade = Math.sin(cycle * Math.PI)
    if (bar.current) {
      bar.current.position.y = y
      bar.current.material.opacity = 0.9 * fade
    }
    if (echo.current) {
      echo.current.position.y = y - 0.09
      echo.current.material.opacity = 0.24 * fade
    }
  })

  return (
    <group>
      <mesh ref={bar} raycast={() => null}>
        <planeGeometry args={[width, 0.016]} />
        <meshBasicMaterial
          map={soft}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={echo} raycast={() => null}>
        <planeGeometry args={[width * 0.8, 0.24]} />
        <meshBasicMaterial
          map={soft}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function Head({ size = 3, accent = '#2fd8ff', ...props }) {
  const { scene } = useGLTF(URL)
  const grp = useRef()

  /* Normalise whatever the export shipped: centre it, scale it to `size`. */
  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((o) => {
      if (o.isCamera || o.isLight) o.visible = false
      if (o.isMesh) {
        o.frustumCulled = false
        o.castShadow = false
        o.receiveShadow = false
      }
    })
    const box = new THREE.Box3().setFromObject(root)
    const span = new THREE.Vector3()
    const centre = new THREE.Vector3()
    box.getSize(span)
    box.getCenter(centre)
    const k = size / Math.max(0.001, span.y)
    const wrap = new THREE.Group()
    root.scale.setScalar(k)
    root.position.set(-centre.x * k, -centre.y * k, -centre.z * k)
    wrap.add(root)
    return wrap
  }, [scene, size])

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const t = state.clock.elapsedTime
    if (grp.current) {
      const idleY = Math.sin(t * 0.22) * 0.15
      const idleX = Math.sin(t * 0.31 + 1.2) * 0.05
      grp.current.rotation.y = damp(grp.current.rotation.y, view.ex * 0.5 + idleY, 2.2, d)
      grp.current.rotation.x = damp(grp.current.rotation.x, view.ey * 0.24 + idleX, 2.2, d)
      grp.current.position.y = Math.sin(t * 0.5) * 0.06
    }
  })

  return (
    <group {...props}>
      <group ref={grp}>
        <primitive object={model} />
      </group>
      <Scanner height={size * 1.15} width={size * 1.5} color={accent} />
      {/* warm haze from above, cool city bounce from below */}
      <pointLight position={[-2.6, 3.4, 4.4]} intensity={58} distance={18} color="#fff4e2" />
      <pointLight position={[3.4, 0.9, -2.2]} intensity={30} distance={13} color="#e23b3b" />
      <pointLight position={[-2.8, -1.8, 2.4]} intensity={14} distance={12} color="#6a9dff" />
      <pointLight position={[1.4, -2.6, 1.8]} intensity={12} distance={12} color={accent} />
    </group>
  )
}
