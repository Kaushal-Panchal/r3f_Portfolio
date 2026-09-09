export const dustVertex = /* glsl */ `
attribute float aScale;
attribute float aSeed;
uniform float uTime;
uniform float uDpr;
varying float vFade;

void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.2 + aSeed * 6.283) * 0.7;
  p.y += cos(uTime * 0.15 + aSeed * 4.1) * 0.6;
  p.z += sin(uTime * 0.11 + aSeed * 2.7) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * uDpr * (30.0 / max(0.6, -mv.z));
  vFade = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 1.2 + aSeed * 21.0));
}
`

export const dustFragment = /* glsl */ `
uniform vec3 uColor;
varying float vFade;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d);
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a * vFade * 0.7);
  #include <colorspace_fragment>
}
`
