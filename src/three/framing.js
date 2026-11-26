import * as THREE from 'three'

// The camera sits on +z looking at the origin. "Tan space" is x / depth and
// y / depth as seen from the camera, which is independent of the fov.
export const CAM_Z = 6
export const NEAR = 0.1
export const FAR = 30
export const PAD = 0.04 // poster has 4% transparent padding on every side

const v = new THREE.Vector3()

// Square in tan space that bounds the rest-pose silhouette, padded.
export function silhouetteSquare(root) {
  root.updateWorldMatrix(true, true)
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  root.traverse((o) => {
    if (!o.isMesh) return
    const pos = o.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld)
      const d = CAM_Z - v.z
      const tx = v.x / d
      const ty = v.y / d
      if (tx < x0) x0 = tx
      if (tx > x1) x1 = tx
      if (ty < y0) y0 = ty
      if (ty > y1) y1 = ty
    }
  })
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const side = Math.max(x1 - x0, y1 - y0) / (1 - 2 * PAD)
  return { cx, cy, side }
}

// Map the square onto the head box (px, relative to the canvas) and write an
// off-centre perspective projection for a canvas of W x H px.
export function applyFraming(camera, sq, W, H, box) {
  const k = box.S / sq.side // px per tan unit
  const left = sq.cx - sq.side / 2 - box.x / k
  const right = left + W / k
  const top = sq.cy + sq.side / 2 + box.y / k
  const bottom = top - H / k
  camera.projectionMatrix.makePerspective(left * NEAR, right * NEAR, top * NEAR, bottom * NEAR, NEAR, FAR)
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
}
