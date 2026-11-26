import * as THREE from 'three'
import { abilities } from '../content'
import { emit, getState, on, prefersReducedMotion, subscribe } from '../store'
import { CAM_Z, silhouetteSquare } from './framing'
import { loop } from './loop'

// Rest pose: a quarter turn toward screen-left, toward the name (negative yaw
// turns the face to -x). The poster is rendered at exactly this pose.
export const REST_YAW = -0.25
const YAW_MAX = THREE.MathUtils.degToRad(25)
const PITCH_MAX = THREE.MathUtils.degToRad(12)

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt))
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easePop = (t) => {
  const c1 = 1.56
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export function createHead(gltf, patchMaterial) {
  const model = gltf.scene
  const uniforms = {
    uRim: { value: new THREE.Color(abilities[0].hex) },
    uRimStrength: { value: 0.32 },
    uGlint: { value: 0 },
  }
  let glasses = null
  model.traverse((o) => {
    if (o.name === 'Cube') glasses = o
    if (o.isMesh) {
      o.frustumCulled = false
      const glint = o.parent?.name === 'Cube' || o.name === 'Cube' || o.parent === glasses
      patchMaterial(o.material, uniforms, glint && o.material.name === 'Base')
    }
  })

  // Normalise: centre the bounds, scale to height 1.
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const centre = box.getCenter(new THREE.Vector3())
  const k = 1 / size.y
  model.scale.setScalar(k)
  model.position.set(-centre.x * k, -centre.y * k, -centre.z * k)

  const squash = new THREE.Group()
  squash.add(model)
  const pivot = new THREE.Group()
  pivot.add(squash)
  const root = new THREE.Group()
  root.add(pivot)

  pivot.rotation.set(0, REST_YAW, 0)
  const square = silhouetteSquare(root)
  const glassesY0 = glasses ? glasses.position.y : 0

  const hemi = new THREE.HemisphereLight('#FFE9D2', '#3A2C8C', 1.7)
  const key = new THREE.DirectionalLight('#FFF1E0', 2.6)
  key.position.set(-2.2, 2.8, 4)
  const lights = [hemi, key]

  // ---- controller state ----
  const s = {
    yaw: REST_YAW,
    pitch: 0,
    spin: 0,
    spinVel: 0,
    dragging: false,
    lastInput: performance.now(),
    lastMove: -1e9,
    cursor: null,
    glance: null, // { el, until }
    tracking: false,
    timelines: [],
    glintAllowed: true,
    nextGlint: 0,
    nextCrackle: 0,
    introDone: false,
    lastT: performance.now(),
    settled: false,
  }
  const reduced = () => prefersReducedMotion()
  const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const input = (now = performance.now()) => {
    s.lastInput = now
    loop.invalidate()
  }

  const play = (dur, fn) => {
    s.timelines.push({ t0: performance.now(), dur, fn })
    loop.invalidate()
  }

  const headCentre = () => {
    const r = loop.headRect
    if (!r?.slot) return null
    const c = r.slot.getBoundingClientRect()
    return { x: c.left + r.x + r.S / 2, y: c.top + r.y + r.S / 2 }
  }

  const gazeAt = (px, py) => {
    const c = headCentre()
    if (!c) return [REST_YAW, 0]
    const yaw = clamp((px - c.x) / (window.innerWidth * 0.4), -1, 1) * YAW_MAX
    const pitch = clamp((py - c.y) / (window.innerHeight * 0.4), -1, 1) * PITCH_MAX
    return [yaw, pitch]
  }
  const gazeAtEl = (el) => {
    if (!el) return [REST_YAW, 0]
    const r = el.getBoundingClientRect()
    return gazeAt(r.left + r.width / 2, r.top + r.height / 2)
  }

  // ---- inputs ----
  const offs = []
  if (fine) {
    const onMove = (e) => {
      if (!s.introDone) return
      s.cursor = { x: e.clientX, y: e.clientY }
      s.lastMove = performance.now()
      s.tracking = true
      input(s.lastMove)
    }
    const onLeave = () => {
      s.tracking = false
      input()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    offs.push(() => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    })
  }

  offs.push(
    on('glance', ({ kind, index, id }) => {
      if (reduced()) return
      const el = kind === 'ability' ? document.querySelector(`[data-ability="${index}"]`) : document.querySelector(`[data-mission="${id}"]`)
      s.glance = { el, until: performance.now() + 1200 }
      input()
    }),
    on('nod', () => {
      if (reduced()) return
      s.glance = { el: document.querySelector('[data-gaze="teamup"]'), until: performance.now() + 1200 }
      play(420, (t, o) => (o.pitch += Math.sin(t * Math.PI * 2) * 0.16 * (1 - t)))
      input()
    }),
    on('select', (i) => {
      uniforms.uRim.value.set(abilities[i].hex)
      const card = document.querySelector(`[data-ability="${i}"]`)
      const visibleCard = card && card.offsetParent ? card : document.querySelector('.abil-chips')
      if (reduced()) {
        s.glance = { el: visibleCard, until: Infinity }
        input()
        return
      }
      s.glance = { el: visibleCard, until: performance.now() + 1200 }
      s.timelines = s.timelines.filter((tl) => tl.keep)
      if (i === 0) {
        if (s.glintAllowed) play(480, (t) => (uniforms.uGlint.value = t))
      } else if (i === 1) {
        play(480, (t, o) => (o.spin += easeInOut(t) * Math.PI * 2))
      } else if (i === 2) {
        play(450, (t, o) => {
          const a = Math.sin(t * Math.PI)
          if (t < 0.4) o.sy *= 1 - 0.1 * Math.sin((t / 0.4) * Math.PI)
          else o.y += a * 0.05
        })
      } else {
        s.glance = { el: document.querySelector('.miss-grid'), until: performance.now() + 900 }
        play(450, (t, o) => (o.pitch += Math.sin(t * Math.PI) * 0.22))
      }
      input()
    }),
    on('poke', () => {
      if (reduced()) return
      play(420, (t, o) => (o.roll += Math.sin(t * Math.PI * 4) * 0.16 * (1 - t)))
      input()
    }),
    on('dragStart', () => {
      if (reduced()) return
      s.dragging = true
      emit('drag', 0)
      input()
    }),
    on('drag', (dx) => {
      if (reduced() || !s.dragging) return
      s.spin += dx * 0.012
      s.spinVel = dx * 0.012 * 60
      input()
    }),
    on('dragEnd', () => {
      s.dragging = false
      input()
    })
  )
  offs.push(
    subscribe(() => {
      const st = getState()
      if (reduced() && st.three === 'live') loop.invalidate()
    })
  )

  const startIntro = () => {
    if (reduced() || !glasses) {
      s.introDone = true
      return
    }
    // Glasses lift 0.3 head-heights (250ms), slam (150ms, pop), squash (180ms), one crackle.
    const lift = 0.3 / model.scale.y
    play(250, (t) => (glasses.position.y = glassesY0 + lift * easeOut(t)))
    setTimeout(() => {
      play(150, (t) => (glasses.position.y = glassesY0 + lift * (1 - easePop(t))))
      setTimeout(() => {
        emit('crackle')
        play(180, (t, o) => (o.sy *= 1 - 0.06 * Math.sin(t * Math.PI)))
        setTimeout(() => {
          s.introDone = true
          glasses.position.y = glassesY0
          input()
        }, 190)
      }, 150)
    }, 250)
  }

  const o = { pitch: 0, spin: 0, roll: 0, sy: 1, y: 0 }

  function update(now) {
    const dt = Math.min(0.05, Math.max(0, (now - s.lastT) / 1000))
    s.lastT = now
    const rm = reduced()

    // Target gaze.
    let ty = REST_YAW
    let tp = 0
    const idle = !rm && s.introDone && now - s.lastInput > 5000
    if (s.glance && now < s.glance.until) [ty, tp] = gazeAtEl(s.glance.el)
    else if (!rm && fine && s.tracking && s.cursor) {
      const tu = document.querySelector('[data-gaze="teamup"]')
      const r = tu?.getBoundingClientRect()
      const near = r && s.cursor.x > r.left - 160 && s.cursor.x < r.right + 160 && s.cursor.y > r.top - 160 && s.cursor.y < r.bottom + 160
      ;[ty, tp] = near ? gazeAtEl(tu) : gazeAt(s.cursor.x, s.cursor.y)
    }
    if (idle) {
      const t = now / 1000
      ty = REST_YAW + Math.sin(t * 0.5) * 0.28
      tp = Math.sin(t * 0.37) * 0.07
      if (now > s.nextGlint) {
        s.nextGlint = now + 6000
        if (s.glintAllowed) play(480, (k) => (uniforms.uGlint.value = k))
      }
      if (now > s.nextCrackle) {
        s.nextCrackle = now + 10000
        emit('crackle')
      }
    } else {
      s.nextGlint = now + 3000
      s.nextCrackle = now + 6000
    }

    // Timelines add offsets.
    o.pitch = 0
    o.spin = 0
    o.roll = 0
    o.sy = 1
    o.y = 0
    s.timelines = s.timelines.filter((tl) => {
      const t = clamp((now - tl.t0) / tl.dur, 0, 1)
      tl.fn(t, o)
      if (t >= 1 && tl.fn.length < 2) uniforms.uGlint.value = 0
      return t < 1
    })

    // Drag spin springs back.
    if (!s.dragging) {
      const acc = -70 * s.spin - 11 * s.spinVel
      s.spinVel += acc * dt
      s.spin += s.spinVel * dt
      if (Math.abs(s.spin) < 1e-4 && Math.abs(s.spinVel) < 1e-3) {
        s.spin = 0
        s.spinVel = 0
      }
    }

    if (rm) {
      s.yaw = ty
      s.pitch = tp
    } else {
      s.yaw = damp(s.yaw, ty, 6, dt)
      s.pitch = damp(s.pitch, tp, 6, dt)
    }

    const bob = idle && loop.headRect ? (Math.sin(now / 1000 * 1.6) * 2 * square.side * CAM_Z) / loop.headRect.S : 0
    pivot.rotation.set(s.pitch + o.pitch, s.yaw + s.spin + o.spin, o.roll)
    pivot.position.y = bob + o.y
    squash.scale.set(1 / Math.sqrt(o.sy), o.sy, 1 / Math.sqrt(o.sy))

    s.settled =
      s.timelines.length === 0 &&
      Math.abs(s.yaw - ty) < 1e-3 &&
      Math.abs(s.pitch - tp) < 1e-3 &&
      s.spin === 0 &&
      !s.dragging
  }

  function mode(now) {
    if (s.dragging) return 'drag'
    if (reduced()) return s.settled && !loop.dirty ? 'settled' : 'demand'
    if (s.timelines.length || !s.settled || now - s.lastMove < 1500) return 'active'
    if (s.introDone && now - s.lastInput > 5000) return 'idle'
    if (s.glance && now < s.glance.until) return 'active'
    return 'settled'
  }

  return {
    root,
    lights,
    square,
    update,
    mode,
    startIntro,
    idleFor: (now) => now - s.lastInput,
    idleDueIn: (now) => (reduced() ? -1 : Math.max(0, s.lastInput + 5000 - now)),
    setGlintAllowed: (v) => (s.glintAllowed = v),
    dispose: () => offs.forEach((f) => f()),
  }
}
