import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { abilities } from '../data'
import { useStore } from '../store'
import { view, damp } from '../engine'
import { glowTexture } from './common'
import { labelEls } from '../labels'

/* A flat-ish wheel around the hero, so nothing ever hides behind his head. */
const RX = 2.15
const RY = 1.56
const RZ = 0.7
const A0 = abilities.map((_, i) => -Math.PI / 2 + 0.63 + (i / abilities.length) * Math.PI * 2)
const COLORS = abilities.map((a) => new THREE.Color(a.color))
const DIM = COLORS.map((c) => c.clone().lerp(new THREE.Color('#3a3468'), 0.34))
const EDGE = new THREE.Color('#131024')

function Node({ index }) {
  const grp = useRef()
  const core = useRef()
  const cage = useRef()
  const halo = useRef()
  const ring = useRef()
  const setAbility = useStore((s) => s.setAbility)
  const setHoverAbility = useStore((s) => s.setHoverAbility)
  const setHot = useStore((s) => s.setHot)

  const glow = glowTexture()
  const scale = useRef(1)
  const lit = useRef(0)
  const world = useMemo(() => new THREE.Vector3(), [])
  const ndc = useMemo(() => new THREE.Vector3(), [])
  const { camera, size } = useThree()

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const t = state.clock.elapsedTime
    const { ability, hoverAbility } = useStore.getState()
    const selected = ability === index
    const hovered = hoverAbility === index

    lit.current = damp(lit.current, selected ? 1 : hovered ? 0.82 : 0.44, 5, d)
    scale.current = damp(scale.current, selected ? 1.55 : hovered ? 1.25 : 0.9, 7, d)

    const a = A0[index] + t * 0.055
    if (grp.current) {
      grp.current.position.set(
        Math.cos(a) * RX,
        Math.sin(a) * RY + Math.sin(t * 0.9 + index) * 0.06,
        Math.cos(a) * RZ
      )
      grp.current.scale.setScalar(scale.current)
      grp.current.rotation.y += d * 0.55
      grp.current.rotation.x += d * 0.32
    }
    if (core.current) core.current.color.copy(DIM[index]).lerp(COLORS[index], lit.current)
    if (cage.current) cage.current.opacity = 0.25 + lit.current * 0.45
    if (halo.current) halo.current.opacity = 0.05 + lit.current * 0.34
    if (ring.current) {
      ring.current.opacity = lit.current * 0.9
      ring.current.color.copy(COLORS[index])
    }

    const el = labelEls[index]
    if (el && grp.current) {
      grp.current.getWorldPosition(world)
      ndc.copy(world).project(camera)
      const x = (ndc.x * 0.5 + 0.5) * size.width
      const y = (-ndc.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + 30).toFixed(1)}px, 0) translate(-50%, 0)`
      el.style.opacity = Math.max(0, (lit.current - 0.5) * 2).toFixed(3)
    }
  })

  return (
    <group ref={grp}>
      <mesh
        renderOrder={5}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoverAbility(index)
          setHot(true)
        }}
        onPointerOut={() => {
          setHoverAbility(null)
          setHot(false)
        }}
        onClick={(e) => {
          e.stopPropagation()
          setAbility(index)
        }}
      >
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial ref={core} toneMapped={false} depthTest={false} />
      </mesh>
      <mesh raycast={() => null} scale={1.05} renderOrder={6}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={EDGE} wireframe transparent opacity={0.95} toneMapped={false} depthTest={false} />
      </mesh>
      <mesh raycast={() => null} renderOrder={4}>
        <icosahedronGeometry args={[0.56, 0]} />
        <meshBasicMaterial
          ref={cage}
          color={EDGE}
          wireframe
          transparent
          opacity={0.3}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      <mesh raycast={() => null} renderOrder={3}>
        <ringGeometry args={[0.68, 0.71, 48]} />
        <meshBasicMaterial
          ref={ring}
          transparent
          opacity={0}
          toneMapped={false}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <sprite scale={[1.8, 1.8, 1]} raycast={() => null} renderOrder={2}>
        <spriteMaterial
          ref={halo}
          map={glow}
          color={abilities[index].color}
          transparent
          opacity={0.2}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  )
}

export default function Abilities3D({ compact }) {
  const grp = useRef()

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    if (grp.current) {
      grp.current.rotation.y = damp(grp.current.rotation.y, view.ex * 0.1, 2, d)
      grp.current.rotation.x = damp(grp.current.rotation.x, view.ey * 0.06, 2, d)
    }
  })

  if (compact) return null

  return (
    <group ref={grp}>
      <mesh raycast={() => null} scale={[RX, RY, 1]} position={[0, 0, -0.2]}>
        <torusGeometry args={[1, 0.0028, 6, 200]} />
        <meshBasicMaterial color={EDGE} transparent opacity={0.62} toneMapped={false} />
      </mesh>
      {abilities.map((_, i) => (
        <Node key={i} index={i} />
      ))}
    </group>
  )
}
