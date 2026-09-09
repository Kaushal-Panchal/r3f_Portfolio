import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { dustVertex, dustFragment } from './glsl'

/* Snow-ish specks drifting across the sky. */
export function Dust({ count = 700, color = '#eef5ff' }) {
  const mat = useRef()
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1

  const [positions, scales, seeds] = useMemo(() => {
    const p = new Float32Array(count * 3)
    const s = new Float32Array(count)
    const d = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 26
      p[i * 3 + 1] = (Math.random() - 0.5) * 16
      p[i * 3 + 2] = (Math.random() - 0.5) * 16 - 3
      s[i] = 0.5 + Math.random() * 2.4
      d[i] = Math.random()
    }
    return [p, s, d]
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: dpr },
      uColor: { value: new THREE.Color(color) },
    }),
    [color, dpr]
  )

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += Math.min(dt, 0.05)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* The flat comic ring that sits behind the hero and takes the power colour. */
export function PowerRing({ radius = 2.35, color = '#ffd23f' }) {
  const grp = useRef()
  const thick = useRef()
  const thin = useRef()
  const target = useMemo(() => new THREE.Color(color), [color])

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const t = state.clock.elapsedTime
    if (grp.current) {
      grp.current.rotation.z = Math.sin(t * 0.12) * 0.12
      grp.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.012)
    }
    if (thick.current) thick.current.color.lerp(target, 1 - Math.exp(-4 * d))
    if (thin.current) thin.current.color.lerp(target, 1 - Math.exp(-4 * d))
  })

  return (
    <group ref={grp} position={[0, 0, -1.6]}>
      <mesh raycast={() => null}>
        <ringGeometry args={[radius, radius + 0.055, 128]} />
        <meshBasicMaterial ref={thick} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh raycast={() => null}>
        <ringGeometry args={[radius + 0.24, radius + 0.256, 128]} />
        <meshBasicMaterial ref={thin} transparent opacity={0.4} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh raycast={() => null} rotation={[0, 0, Math.PI * 0.18]}>
        <ringGeometry args={[radius + 0.5, radius + 0.512, 96, 1, 0, Math.PI * 0.62]} />
        <meshBasicMaterial color="#eef5ff" transparent opacity={0.35} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
