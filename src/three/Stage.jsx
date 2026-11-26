import { Component, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { setState } from '../store'
import { CAM_Z, FAR, NEAR, applyFraming, silhouetteSquare } from './framing'
import { createHead } from './head'
import { createQuality } from './quality'
import { loop, observeOnscreen, perf } from './loop'

const q = new URLSearchParams(location.search)
const POSTER = import.meta.env.DEV && q.has('poster') ? Number(q.get('poster')) || 900 : 0

class Boundary extends Component {
  state = { err: null }
  static getDerivedStateFromError(err) {
    return { err }
  }
  componentDidCatch(err) {
    console.warn('[3d] fell back to the poster:', err?.message || err)
    setState({ three: 'failed' })
  }
  render() {
    return this.state.err ? null : this.props.children
  }
}

function parseModel(buffer) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  return new Promise((res, rej) => loader.parse(buffer, '', res, rej))
}

// Rim light and glasses glint, added to the stock standard material.
function patchMaterial(mat, uniforms, glint) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = uniforms.uRim
    shader.uniforms.uRimStrength = uniforms.uRimStrength
    shader.uniforms.uGlint = uniforms.uGlint
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 uRim;\nuniform float uRimStrength;\nuniform float uGlint;'
      )
      .replace(
        '#include <opaque_fragment>',
        `{
          vec3 vd = normalize(vViewPosition);
          float fr = pow(1.0 - clamp(abs(dot(normal, vd)), 0.0, 1.0), 3.0);
          outgoingLight += uRim * fr * uRimStrength;
          ${
            glint
              ? `float gx = -vViewPosition.x + vViewPosition.y * 0.6;
          float band = 1.0 - smoothstep(0.0, 0.05, abs(gx - mix(-0.7, 0.7, uGlint)));
          outgoingLight += vec3(1.0) * band * step(0.001, uGlint) * step(uGlint, 0.999) * 1.4;`
              : ''
          }
        }
        #include <opaque_fragment>`
      )
  }
  mat.customProgramCacheKey = () => (glint ? 'rim-glint' : 'rim')
  mat.needsUpdate = true
}

function Scene({ gltf, tier }) {
  const { gl, camera, scene, size, setDpr } = useThree()
  const head = useRef(null)

  // Build once: normalise, patch materials, compute framing at rest pose.
  if (!head.current) head.current = createHead(gltf, patchMaterial)
  const h = head.current

  // Framing follows the head box element (poster and canvas share it).
  useLayoutEffect(() => {
    const slot = gl.domElement.parentElement
    const box = POSTER ? null : document.querySelector('.headbox')
    camera.position.set(0, 0, CAM_Z)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
    const reframe = () => {
      const W = size.width
      const H = size.height
      let rect = { x: 0, y: 0, S: Math.min(W, H) }
      if (box) {
        const c = gl.domElement.getBoundingClientRect()
        const b = box.getBoundingClientRect()
        rect = { x: b.left - c.left, y: b.top - c.top, S: b.width }
      }
      applyFraming(camera, h.square, W, H, rect)
      loop.headRect = { ...rect, cw: W, ch: H, slot }
      loop.invalidate()
    }
    camera.updateProjectionMatrix = reframe
    reframe()
  }, [size.width, size.height])

  // Quality: DPR policy and adaptive level.
  useEffect(() => {
    const qc = createQuality({
      tier,
      size,
      onChange: (lvl, dpr) => {
        setDpr(dpr)
        perf.level = lvl
        perf.dpr = dpr
        h.setGlintAllowed(lvl >= 2)
        loop.nativeWhileDragging = lvl >= 3
        loop.idle30Always = lvl <= 1
        if (lvl === 0) {
          setState({ three: 'static' })
          loop.stop()
          setTimeout(() => loop.unmount?.(), 0)
        }
      },
    })
    loop.quality = qc
    qc.apply(size)
    return () => qc.dispose()
  }, [size.width, size.height])

  // Precompile, render the first frame at rest, then hand over from the poster.
  useEffect(() => {
    let dead = false
    scene.add(h.root)
    const lights = h.lights
    lights.forEach((l) => scene.add(l))
    const go = async () => {
      try {
        if (gl.compileAsync) await gl.compileAsync(scene, camera)
      } catch {
        /* compileAsync is an optimisation only */
      }
      if (dead) return
      loop.start(h)
      loop.renderNow()
      if (POSTER) {
        const url = gl.domElement.toDataURL('image/png')
        await fetch('/__poster', { method: 'POST', body: url })
        document.title = 'poster saved'
        return
      }
      setState({ three: 'live' })
      h.startIntro()
    }
    go()
    return () => {
      dead = true
      loop.stop()
      scene.remove(h.root)
      lights.forEach((l) => scene.remove(l))
    }
  }, [])

  // Context loss: poster until restored, and a second loss keeps the poster.
  useEffect(() => {
    const el = gl.domElement
    let losses = 0
    const lost = (e) => {
      e.preventDefault()
      losses++
      loop.stop()
      setState({ three: 'static' })
    }
    const restored = () => {
      if (losses > 1) return
      loop.start(h)
      loop.renderNow()
      setState({ three: 'live' })
    }
    el.addEventListener('webglcontextlost', lost)
    el.addEventListener('webglcontextrestored', restored)
    return () => {
      el.removeEventListener('webglcontextlost', lost)
      el.removeEventListener('webglcontextrestored', restored)
    }
  }, [])

  useEffect(() => observeOnscreen(gl.domElement), [])
  useEffect(() => () => h.dispose(), [])

  return null
}

function StageRoot({ model, tier }) {
  const [gltf, setGltf] = useState(null)
  useEffect(() => {
    let dead = false
    model
      .then(parseModel)
      .then((g) => !dead && setGltf(g))
      .catch((err) => {
        console.warn('[3d] fell back to the poster:', err?.message || err)
        setState({ three: 'failed' })
      })
    return () => {
      dead = true
    }
  }, [])
  if (!gltf) return null
  return (
    <Boundary>
      <Canvas
        frameloop="never"
        dpr={1}
        flat={false}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: !!POSTER,
        }}
        camera={{ manual: true, near: NEAR, far: FAR, position: [0, 0, CAM_Z] }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          perf.gl = gl
        }}
      >
        <Scene gltf={gltf} tier={tier} />
      </Canvas>
    </Boundary>
  )
}

export function mountStage({ model, tier }) {
  let slot = document.getElementById('canvas-slot')
  if (POSTER) {
    slot = document.createElement('div')
    slot.style.cssText = `position:fixed;left:0;top:0;width:${POSTER}px;height:${POSTER}px;z-index:99;background:transparent`
    document.body.appendChild(slot)
    window.devicePixelRatio = 1
  }
  if (!slot) throw new Error('no canvas slot')
  const root = createRoot(slot)
  root.render(<StageRoot model={model} tier={POSTER ? 'poster' : tier} />)
  loop.unmount = () => {
    loop.stop()
    root.unmount()
  }
}
