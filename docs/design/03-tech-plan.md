# 03 Tech Plan: performance, architecture, assets

Owner: Senior Engineer. Inputs: `01-game-design.md`, `02-ux-direction.md`, the current build (commit 3d21777).
Priorities, in order: (1) all content is readable at once and without WebGL, (2) 60 fps or better, adapted to the device, (3) the 3D delight.

Rule for the whole build: **the HTML page is the product. The 3D head is an enhancement that may arrive late or never.**

---

## 0. What changed in the repo in this phase

- `public/HeadWithGoggles.glb` was replaced with the optimized model (4,813,640 B to 310,064 B, -93.6%). It is a drop-in replacement. I checked it in the current production build with no code change, because drei's `useGLTF` already registers the meshopt decoder. The change is not visible at on-screen size (section 4). To roll back: `git checkout HEAD -- public/HeadWithGoggles.glb`.
- `src/` was not touched.

---

## 1. Audit of the current build (3d21777), ranked by impact

Measured on a production build (`vite build` into the scratchpad, then `vite preview`). I could not take live fps numbers. The browser pane stayed hidden for the whole session, so rAF was throttled to about 20 per second and any frame-time number from it would be wrong. I ranked frame costs from draw-call and triangle counts that I took by wrapping `WebGL2RenderingContext.prototype.draw*`, and from the code itself.

| # | Problem | Evidence | Costs | Impact |
|---|---|---|---|---|
| 1 | **Boot overlay hides all content until the GLB has loaded.** It stays for at least 1.3 s and up to 14 s. | `ui/Boot.jsx`: `MIN_MS 1300`, `MAX_MS 14000`, and it waits on `useProgress` | Time to readable: at least 1.3 s on fibre. On Lighthouse "Slow 4G" (about 200 KB/s), the 296 KB JS plus the 4.8 MB GLB take about 26 s, so visitors get the 14 s cap. | Critical |
| 2 | **No HTML content without JS.** `#root` is empty. Everything renders after one JS chunk of 1,056 KB (296 KB gzip, 237 KB brotli) has downloaded, parsed and run. three.js is in that same chunk. There is no code split. | `dist/assets/index-*.js` | Time to readable: parsing and running 1 MB of JS takes about 0.2 s on M1 and about 1 to 1.5 s on a Pixel 6a-class phone. With no JS, the page is blank. | Critical |
| 3 | **No WebGL fallback, and no error boundary.** R3F's `<Canvas>` catches a context-creation error and then rethrows it (`if (error) throw error`, react-three-fiber.esm.js:256). `App` has no boundary, so React unmounts the whole root and the page goes **blank**. A 404 or decode error inside Suspense does the same. | Read in `node_modules/@react-three/fiber` | Readability on any device without WebGL, or with WebGL blocklisted (some corporate laptops, older Androids, privacy browsers) | Critical |
| 4 | **The 4.8 MB model.** The 4 skin-coloured and black meshes are flat-shaded exports with 4 unique vertices per quad (Face: 67,854 vertices, but only 17,010 unique positions). `JOINTS_0` and `WEIGHTS_0` are present on 3 meshes with no skin to use them. There is no compression. | `gltf-transform inspect` plus my own analysis script | 4.8 MB on the wire, about 5 MB of vertex data on the GPU, and a parse and upload hitch | High (fixed, section 4) |
| 5 | **205 MB of unused GLBs in `public/`** (ArmGesture, SittingIdle, StandingPose, Waving, about 51 MB each). They are tracked in git and copied into `dist/` on every build. | My scratch build output was **203 MB** | Deploy size, host file-size limits, and anyone can download them | High (delete in the build phase) |
| 6 | **The canvas renders everything, all the time.** Full-viewport canvas at DPR up to 1.75: 1792x1344 = 2.4 MP on a 1024x768 window, about 3.4 MP on a 1440x900 window. MSAA, `alpha`, `powerPreference: 'high-performance'` (wakes the discrete GPU on dual-GPU Macs). `frameloop="always"`, so it renders at 120 fps on ProMotion even when idle. 47 draw calls a frame, about 361K vertex indices (about 120K triangles), 6 `MeshStandardMaterial` with 4 point lights. | Draw counter in the pane, `World.jsx`, `Head.jsx` | GPU fill rate and battery. This is the main frame cost on Intel Iris and mid-range Android. | High |
| 7 | **Compositing load above an always-animating canvas.** `backdrop-filter: blur(22px)` on the console and `blur(10px)` on 5 slot buttons, so 6 blur regions re-sample the canvas every frame. A grain layer at `inset: -50%` (4x the viewport area) uses an SVG `feTurbulence` with `numOctaves=4`, `mix-blend-mode: overlay` and an animated transform. Halftone with a mask layer, a fade layer. That makes 4 full-screen layers blended over the canvas. | `styles.css` | Compositor and GPU time on every frame. This is usually the biggest cost after the canvas itself on integrated GPUs and phones. | High |
| 8 | **Overdraw effects.** An additive dust field (650 points, full screen, transparent), 5 additive glow sprites, 2 additive scanner planes, and wireframe cages with `depthTest: false`. | `Bits.jsx`, `Abilities3D.jsx`, `Head.jsx` | Fill rate | Medium |
| 9 | **Fonts.** Render-blocking Google Fonts CSS from 2 third-party origins, with 3 families and 4 or more weights. | `index.html` | 300 to 600 ms of DNS and TLS on mobile before the text has its real face, plus a font swap | Medium |
| 10 | **Main-thread work every frame.** 5 label projections with `style.transform` writes. A cursor rAF loop that never stops, even when idle. `pointerover` changes React state for the cursor. | `Abilities3D.jsx`, `Cursor.jsx` | Less than 0.5 ms a frame, but the cursor loop stops the page from ever going quiet | Low |
| 11 | **Hygiene.** `@react-three/postprocessing` and `postprocessing` are installed but never used. drei `useGLTF` sets up a `DRACOLoader` that points at the gstatic CDN. `public/index.html` is a stale CRA file. `useResizeKick` fires 3 timed resize events. | | Supply chain and confusion | Low |

What to keep from the old build: pointer state lives outside React (`engine.js`), damped motion with `damp()`, no React re-render per frame, and the resize kick idea (done more tightly, section 3.6).

---

## 2. Performance budget

### 2.1 Device tiers

| Tier | Reference devices | Start settings | Notes |
|---|---|---|---|
| **High** | M1/M2 MacBook Air, any recent dGPU, iPhone 13 and newer, Pixel 8 | DPR up to 2, MSAA, all idle details | Starts at Mid and is promoted after 2 s of headroom (section 3.5) |
| **Mid** (the default for anything with WebGL) | Intel Iris Xe laptop at 1080p or 1440p, iPhone 12 (A14, 60 Hz), Pixel 6a (Mali-G78, 60 Hz) | DPR up to 1.5, MSAA, idle loop at 30 fps after 10 s with no input | The design target. Every pass/fail number below is set for this tier. |
| **Low** | Intel UHD 6xx, Mali-G52 or Adreno 5xx class, 2 GB phones, Chromebooks | DPR 1.0, no glint, idle loop at 30 fps | Reached by stepping down at runtime, or by a gate hint |
| **Static** | No WebGL2, a software renderer (SwiftShader, llvmpipe), `failIfMajorPerformanceCaveat`, Save-Data, 2g, `deviceMemory <= 2` or `hardwareConcurrency <= 2`, `?3d=0` | Poster image, no three.js download | Same content and interactions (game design section 4) |

### 2.2 Frame-time targets

- **Render cap of 60 fps on every display.** On 120 Hz screens, render on every second vsync with a timestamp accumulator that allows 1 ms of jitter, so pacing stays even. Native refresh (up to 120) only on High tier, and only while the user is dragging the head, where latency is felt. CSS animations run at native rate on the compositor anyway.
- Pass bar on Mid-tier devices, production build, 20 s scenario runs (section 5):
  - rAF delta p95 <= **17.5 ms** at the 60 cap, and dropped frames (delta > 25 ms) <= **1%**.
  - At native 120 (High tier, while dragging): p95 <= **9.0 ms**.
  - Render CPU (`useFrame` work plus `gl.render`) p95 <= **3 ms**. Our JS in `useFrame` <= **1 ms**.
  - GPU, where `EXT_disjoint_timer_query_webgl2` exists: <= **6 ms** a frame on Mid.
  - Long tasks (> 50 ms) after first paint: **0** during interaction. At most **one** at 3D init, and it must be <= 100 ms (shaders are precompiled with `renderer.compileAsync`).
- Idle: no input for 10 s means the attract loop renders at **30 fps**. Settled with reduced motion, or tab hidden, or canvas off screen: **0 renders**.

### 2.3 Scene budget (inside the canvas)

| Item | Budget | Plan |
|---|---|---|
| Draw calls | <= **12** | Head 7 (6 meshes, the glasses `Cube` has 2 primitives), glint and crackle <= 3, 2 spare. The black meshes may be joined into one (3 head draws) if they share one material, but `Cube` stays separate for the glasses drop. |
| Triangles | <= **75K** | Head 67,357. Everything else <= 5K. |
| Vertices uploaded | <= **40K** | Head 33,754 |
| Lights | <= **2** | 1 warm directional key plus 1 hemisphere (warm sky, indigo ground). The rim light and the ability tint come from a fresnel term in the material, not from extra lights. |
| Materials | <= 4 programs | Toon or lambert-based, with the fresnel rim added through `onBeforeCompile`. No PBR env map, no transmission, no shadows, no post-processing. |
| Transparent and additive layers in WebGL | <= 2, and only small screen areas | Never full-screen |
| Canvas pixels | Mid <= **1.4 MP**, High <= **2.6 MP**, Low <= **0.6 MP** | The canvas covers only the HERO ZONE (UX 2): 456x696 at 1440x900 is 1.27 MP at DPR 2 and 0.71 MP at DPR 1.5. Phones: 358x248 at DPR 1.5 is 0.2 MP. This cuts pixels by about 60% compared with full-screen. |

### 2.4 DPR policy

`dpr = min(devicePixelRatio, tierCap)`, then lowered until `canvasW * canvasH * dpr^2 <= pixelCap`. Tier caps: High 2.0, Mid 1.5, Low 1.0. Never set DPR above the device DPR. MSAA (`antialias: true`) stays on at every level, because it is cheap on tiled mobile GPUs and the hair strands need it. DPR changes go through R3F `setDpr`, which needs no context re-create. No `AdaptiveDpr`, because blurring the image on movement looks cheap.

### 2.5 Byte budgets (compressed on the wire)

| Asset | Budget | Expected |
|---|---|---|
| HTML, prerendered, with inline critical CSS | <= 20 KB | about 12 KB |
| Initial JS (entry: React, react-dom, app UI, zustand) | <= **70 KB gz** | about 46 KB (react and react-dom measured at 46.3 KB gz) plus about 15 KB of app code |
| Fonts | <= 100 KB, at most 2 preloaded files | Self-hosted woff2, latin subset. Kaushan Script uses `text=` subsetting (about 5 KB). |
| Poster image (hero 3/4 render) | <= 35 KB | AVIF or WebP at 2 widths (480w, 900w) |
| Grain tile | <= 4 KB | 128 px PNG (UX 6) |
| Lazy 3D chunk (three, R3F, scene, meshopt decoder) | <= **250 KB gz** | Measured probe: three and R3F 217 KB gz, scene and GLTFLoader about 20 KB gz, meshopt decoder 6.5 KB gz |
| Model | <= **320 KB raw** | **310 KB raw, 217 KB gzip, 201 KB brotli** |
| `dist/` total | < 2 MB | A size check fails the build above this (it catches the 203 MB of stray GLBs) |

### 2.6 Time to readable

"Readable" means every text block is painted in its final layout, with fallback fonts at matched metrics (no layout shift on font swap).

| Network | Readable | Interactive (tabs work) | 3D head live |
|---|---|---|---|
| Desktop on cable | <= 0.6 s | <= 0.9 s | <= 1.5 s |
| Lighthouse mobile (Slow 4G, 4x CPU) | <= **1.5 s** (LCP <= 2.0 s, the poster or the title) | <= 2.5 s, TBT <= 150 ms | <= 4 s. The poster shows until then, so nothing waits. |
| Regular 4G, about 10 Mbps, Pixel 6a | <= 1.0 s | <= 1.5 s | <= 2.0 s (game design asks for the drop in under 2 s) |

CLS = 0. The poster and the canvas take the same reserved box.

---

## 3. Architecture

### 3.1 Shape

```
index.html (prerendered at build time: all text, links, the poster <img>, inline critical CSS)
  └─ main.jsx (entry, <= 70 KB gz): hydrateRoot(<App/>). UI, store, keyboard. NO three imports.
       └─ three/gate.js (tiny, no three): reads capability and tier, then after first paint:
            ├─ fetch(modelUrl) starts at once (ArrayBuffer, runs in parallel with the chunk)
            └─ import('./three/Stage.jsx')  ← lazy chunk: three, R3F, Head, scheduler, quality
                 └─ <ErrorBoundary fallback={<Poster/>}> <Canvas ...> </ErrorBoundary>
       └─ perf/PerfOverlay.jsx is lazy and only loads with ?perf (0 bytes for visitors)
```

- **Prerender.** `vite build`, then `vite build --ssr src/entry-server.jsx`, then `scripts/prerender.mjs` runs `renderToString(<App/>)` and writes the result into `dist/index.html`. The client calls `hydrateRoot`. Content is static data, so this is about 40 lines and needs no framework. With JS off, every word, link and `mailto:` still works.
- **No blocking loader of any kind.** The hero zone shows the poster at once (from the HTML). It is the loading state, the static fallback and the error fallback. When the first 3D frame is ready (after `compileAsync`), the canvas fades in over the poster (opacity, 200 ms) and then the poster is set to `visibility: hidden`. Game design asks for a halftone silhouette plus "Loading hero". I propose the poster plus a small "Loading hero" chip instead, because it is the same head and makes a better first frame. I flag this for the GD/UX merge.
- **When to load 3D.** Start after `load`, or after `requestIdleCallback` (timeout 300 ms), whichever comes first. Then the fonts, the poster and the entry JS never compete with three.js for bandwidth. The model is a hashed asset (`src/assets/head.glb?url`), so it gets `Cache-Control: immutable`. It is fetched as an ArrayBuffer and passed to `GLTFLoader.parse`, so it downloads in parallel with the chunk.
- **Loader.** Use `GLTFLoader` from `three/examples/jsm` with `MeshoptDecoder` from `three/examples/jsm/libs/meshopt_decoder.module.js`. That decoder is self-contained: the wasm is inlined, there is no CDN and no worker. Drop drei. Nothing we need from it is worth bringing in three-stdlib's second GLTFLoader and its DRACOLoader CDN default. Remove `@react-three/postprocessing` and `postprocessing`.
- **Errors.** An error boundary wraps `<Stage>`. It catches context creation failures, model fetch or decode failures and shader errors. On `webglcontextlost`: show the poster and stop the loop. On `webglcontextrestored`: mount again once. A second loss leaves the poster in place for the session.
- **Vite config.** `build.target: 'es2020'`. Lower `chunkSizeWarningLimit` back to the default. Vite already preloads a dynamic chunk's dependencies only when the import runs, so three is never fetched early.

### 3.2 Capability gate (`three/gate.js`, no three import, runs once)

1. URL overrides: `?3d=0` gives the poster, `?3d=1` forces 3D, `?tier=low|mid|high` forces a tier (for tests).
2. Static if any of these: `navigator.connection?.saveData`, or `effectiveType` is `slow-2g` or `2g`, or `navigator.deviceMemory <= 2`, or `navigator.hardwareConcurrency <= 2`.
3. Probe: create a WebGL2 context with `{ failIfMajorPerformanceCaveat: true }` on a throwaway 1x1 canvas, then release it with `WEBGL_lose_context`. If it returns null, use static.
4. Read the renderer string from `WEBGL_debug_renderer_info` (or `RENDERER` in Firefox). It is static if it matches `/SwiftShader|llvmpipe|softpipe|Software|Microsoft Basic/`. It is a Low hint if it matches `/Mali-(4|T|G5[12])|Adreno \(TM\) [3-5]\d\d|PowerVR|Intel.*HD Graphics/`.
5. Everyone else starts at **Mid**. Runtime measurement decides from there (no detect-gpu, because that pulls its benchmark data from a CDN).

The result goes in the store as `three: 'static' | 'loading' | 'live' | 'failed'` and `tier`. The UI never branches on it for content. Only the hero zone does.

### 3.3 Canvas setup

```jsx
<Canvas
  frameloop="never"                 // we drive frames with advance(), section 3.4
  dpr={dprFromPolicy}
  gl={{ antialias: true, alpha: true, powerPreference: 'default', stencil: false,
        depth: true, preserveDrawingBuffer: false }}
  camera={{ fov: 30, near: 0.1, far: 20 }}   // narrow fov for a portrait framing inside the zone
  style={{ position: 'absolute', inset: 0 }} // sized to the HERO ZONE only, never full-screen
/>
```

- No R3F pointer handlers on meshes. R3F only raycasts objects that have handlers, so this costs nothing. Drag-spin and poke are DOM pointer events on the hero zone element. A poke counts if the pointer is inside the head's projected bounding ellipse, which is computed once a frame from the bounding sphere. There is no raycast against 67K triangles. Keyboard users get a visually hidden "Poke the hero" button inside the zone.
- `Cube` is the pixel-shade glasses. It is a separate node with 2 primitives (black frame and white pixels), so the glasses drop from game design is possible. The optimizer keeps node names and hierarchy (no `join` or `flatten` across `Cube`).
- Materials: the Face, HairExtrude, Brows, Beard and Cube meshes ship **without normals**. GLTFLoader turns on `flatShading`, which gives exactly the faceted look of the original per-quad normals. Any custom material must keep `flatShading: true` on those meshes. `Hairs` keeps its smooth normals.

### 3.4 Frameloop policy (our scheduler, outside React)

One rAF loop owned by `Stage` calls R3F's `advance(now)` only when a frame is needed:

| State | Renders |
|---|---|
| Intro, reaction, tween not settled (any damped value delta > 1e-4), pointer moved within 1.5 s, dragging | Every frame at the cap (60, or native on High while dragging) |
| Idle attract (no input for 5 s, game design) | 60 fps for the first 10 s, then **30 fps** (look-around and breathing are slow, so 30 is smooth enough) |
| Reduced motion | **On demand only.** One frame per state change (pose swap to the selected card), no idle loop, no pointer follow |
| `document.hidden`, or the hero zone is not intersecting (IntersectionObserver, threshold 0), or quality level 0 | **Loop stopped.** No rAF, no timers. Resumes on visible or intersecting. |

`prefers-reduced-motion` is read with `matchMedia` and a change listener, so it is live. On resume, the time delta is clamped to 50 ms (as in the old `damp` usage), so nothing jumps.

### 3.5 Adaptive quality (our own controller, about 60 lines, no drei)

drei's `PerformanceMonitor` measures how often frames arrive. That reads our intentional 30 fps idle and on-demand frames as a performance problem. We measure frame cost only while we are rendering every tick:

- Window: 90 rendered frames in a row. Metric: p95 of the rAF delta, plus p95 of render CPU time.
- **Step down** if p95 delta > 1.25x the target interval (> 20.8 ms at 60) in 2 windows in a row.
- **Step up** if p95 delta < 0.8x the target and CPU p95 < 4 ms in 4 windows in a row. At most 2 step-ups after any step-down (flip-flop guard). After 3 flips, freeze the level.
- Ignore the first 1 s after mount (upload and compile) and 2 s after any resize, visibility change or DPR change.
- Levels: **3** High (DPR 2, glint and crackle in canvas, native rate while dragging) > **2** Mid (DPR 1.5) > **1** Low (DPR 1.0, no glint, idle at 30) > **0** Poster. Go to level 0 if at level 1 the p95 stays > 33 ms for 3 s. Then unmount the Canvas and call `renderer.dispose()` and `forceContextLoss()` to free the GPU.
- Quality never changes layout or content (game design rule).

### 3.6 Resize and the 300x150 bug

Mount `<Canvas>` only when `document.visibilityState === 'visible'` and the hero zone has a non-zero size (measured with a ResizeObserver on the zone). That removes the root cause. As a safety net, dispatch one `resize` event on `visibilitychange` to visible and on `pageshow` when `persisted` is true. No timers.

### 3.7 CSS effects: allowed, and how

The layer stack from back to front:
1. Sky. A body gradient plus the grain tile. Static, one layer.
2. Burst SVG and halftone pattern. Static.
3. Canvas (transparent, hero zone only).
4. Lightning SVG.
5. UI cards. Opaque.

At most **6 composited layers** in total, checked in the DevTools Layers panel.

| Effect | Allowed form | Not allowed |
|---|---|---|
| Grain | One static 128 px PNG tile at 6% opacity, as a `background-image` on the sky layer, **under** the canvas and the cards. Removed under `prefers-contrast: more`. | SVG `feTurbulence` at runtime, animated grain, `mix-blend-mode` over the canvas or over text, any layer larger than the viewport |
| Red/blue offsets | Static `text-shadow` on display type of 24 px and up (the title, plates). Hover "snap" is done with transform on pseudo-elements. | Offsets on body text, animated `text-shadow` or `box-shadow`, `filter: drop-shadow` animation |
| Comic burst | One inline SVG, static. The "punch" is `transform: scale` on its wrapper (with `will-change` only while it runs). Line boil is 3 stacked paths that swap opacity in steps at 8 fps for 600 ms, then stop. That repaints only the burst box. | Path morphing, `stroke-dashoffset` loops, continuous boil |
| Cyan lightning | SVG bolts. The flicker is `opacity` on the bolt group only, on its own layer. In-canvas crackle only on level 3, at most 1 draw call. | Lightning that crosses text zones, flashing more than 3 times a second |
| Halftone | SVG `<pattern>` clipped to the burst, static | Full-screen masked halftone layers |
| Panels | Opaque fills | `backdrop-filter` anywhere (this matches UX 4.3) |
| Cursor | System cursor | A custom cursor rAF loop |

Every animation runs on `transform` or `opacity` only (UX 6). Reduced motion removes all decorative animation.

### 3.8 Fonts

Self-host the woff2 files: download them once from Google Fonts during the build phase, then subset with `glyphhanger` or `pyftsubset` to latin. This removes 2 third-party origins. Preload the 2 files above the fold (Anton, and Atkinson Hyperlegible Next 400). Use `font-display: swap` with `size-adjust`, `ascent-override` and similar fallback overrides, so the swap does not move anything. Load Kaushan Script with only the title glyphs. This changes UX section 3 only in where the fonts come from, not in which fonts we use.

### 3.9 Proposed file layout

```
src/main.jsx, src/entry-server.jsx, src/App.jsx, src/ui/*, src/data.js, src/store.js
src/three/gate.js        capability + tier (no three)
src/three/Stage.jsx      lazy: Canvas, scheduler, quality controller, error boundary
src/three/Head.jsx       model, materials, reactions
src/perf/PerfOverlay.jsx lazy, ?perf only
src/assets/head.glb      hashed by Vite. Delete public/*.glb (all 5) once this is in.
scripts/prerender.mjs, scripts/size-check.mjs, scripts/optimize-head.mjs (the recipe in section 4.4)
```

---

## 4. Asset work: the head model

### 4.1 Findings

- 6 nodes: `Face` (skin, textured), `HairExtrude`, `Brows`, `Hairs`, `Beard`, `Cube` (the pixel glasses: `Base` black frame plus `Shadow` white pixels). Bounds: about 2.0 x 3.1 x 2.2 units.
- `Face`, `HairExtrude`, `Brows`, `Beard` and `Cube` are **flat-shaded quad meshes**. Each quad has 4 vertices of its own with a face normal. For example, Face has 67,854 vertices but only 17,010 unique positions. Welding does nothing while the normals differ. Remove the normals, and those meshes weld 4:1. GLTFLoader then uses `flatShading` and the image is the same.
- `JOINTS_0` and `WEIGHTS_0` are on Face, HairExtrude and Beard, but the file has no skin. They are dead bytes.
- The texture is a 1024 PNG of 148 KB that is almost all flat skin colour. As WebP at q88 it is **6.4 KB**.
- The 9 MB original (b1793ea) has the same geometry. Its render differs from the current file in 0.1% of pixels, so there is nothing better to start from.

### 4.2 Candidates

All candidates are in `/private/tmp/claude-501/-Users-workmac-Work-SideProjects-r3f-Portfolio/bd7c6165-2452-4f99-9632-31e19a9de003/scratchpad/models/`. I compared them in a throwaway three.js page (scratchpad `viewer/index.html`) with the old lighting rig. The head was 390 CSS px tall at DPR 2, which matches the on-screen size in the UX hero zone. I used 2 poses (yaw 0.25, and yaw -0.7 with pitch 0.2 at 1.3x). I also checked at 260 px (phone) and at 1.6x magnification. "Δpx" is the share of head pixels where any channel differs by more than 16/255 from the current file.

| Candidate | File | gzip | Verts | Tris | Δpx >16 | Verdict |
|---|---|---|---|---|---|---|
| current (`public/`, 3d21777) | 4,813,640 | 1,983,796 | 158,687 | 115,110 | - | baseline |
| clean-meshopt (strip skin attributes and compress, keep normals) | 1,788,172 | - | 158,517 | 115,110 | ~0 | Too big, because the normals block welding |
| flat-mo (drop flat normals, weld, meshopt) | 579,132 | 417,913 | 57,416 | 115,110 | **0.00%** | Same image, -88% |
| flat-e05 / e1 / e2 (also simplify Face) | 345K / 263K / 179K | 272K / 211K / 146K | 32K / 24K / 15K | 64K / 47K / 30K | 1.1 / 1.9 / 3.2% | **Rejected.** Flat shading turns the larger Face triangles into blotchy facets on the forehead and cheeks, visible at 1x. |
| hair1-mo (simplify the black meshes only, error 0.001) | 352,944 | 259,296 | 33,754 | 67,357 | 1.6 to 2.1% | Not visible at on-screen size. Differences are confined to the rims of the hair strands. |
| **hair1-mohigh** (as above, meshopt level `high` with filters) | **310,064** | **217,386** | **33,754** | **67,357** | 1.8% (pixel-identical to hair1-mo) | **Chosen. Now in `public/`.** |
| hair2-mo (error 0.002) | 293,052 | 210,984 | 27,938 | 55,604 | 2.6 to 3.0% | The mustache outline shifts slightly at 1.6x. Only 43 KB smaller than the chosen file. Not worth it. |
| hair3-mo (error 0.004) | 251,024 | 175,842 | 23,944 | 47,563 | 3.8 to 4.7% | Visible change to the strands at the sideburn. Rejected. |
| hair1-draco | 162,612 | 151,097 | 33,754 | 67,357 | (draco is lossy) | **Rejected.** It saves 66 KB gzip on the model but needs about 75 KB gzip of decoder (wrapper 11.6 KB plus wasm 63 KB), a worker and decode time. The net result is about even, with more moving parts. |

Chosen file, per mesh (before → after, verts/tris): Face 67,854/33,926 → **17,071/33,926** (welded only, geometry unchanged). HairExtrude 28,512/14,256 → 2,648/5,292. Brows 15,360/7,680 → 1,540/3,072. Hairs 23,409/47,376 → 10,533/21,195. Beard 22,856/11,428 → 1,714/3,428. Cube 696/444 → 248/444.

Effect: wire size **-93.6%** (gzip -89%). Triangles -41%. Vertex data on the GPU goes from about 5.3 MB to about 0.9 MB, including indices. Load and parse in the test page: 13 to 24 ms, against 32 to 72 ms for the current file.

Required extensions: `EXT_meshopt_compression`, `KHR_mesh_quantization`, `EXT_texture_webp`. The WebP texture needs Safari 14 or newer, and all evergreen browsers have it. The meshopt filters (level `high`) decode fine with both three's own decoder and three-stdlib's decoder (I checked both).

### 4.3 Later, needs an art call (not done)

- Smooth-shading the Face with computed normals would let the Face be simplified by another 50 to 60%. It changes the look from faceted to smooth. Decide this together with the toon material.
- The texture could go to 512 px (it would save about 4 MB of VRAM with mips). The detail sits in the centre 430 px of the 1024 texture, so check the eyes and beard edge before doing it.

### 4.4 Recipe (to go in `scripts/optimize-head.mjs`)

Uses `@gltf-transform/core@4`, `functions@4`, `extensions@4`, `meshoptimizer` and `sharp`. Source: the current `public/HeadWithGoggles.glb` from git (3d21777).

```js
for each primitive: setAttribute('JOINTS_0', null); setAttribute('WEIGHTS_0', null)
for nodes Face, HairExtrude, Brows, Beard, Cube: setAttribute('NORMAL', null)   // flat shading at runtime
await doc.transform(dequantize(), prune(), dedup(), weld())
const plan = { HairExtrude: [0.3, 0.001], Brows: [0.4, 0.001], Hairs: [0.45, 0.001], Beard: [0.3, 0.001] } // [ratio, error]
for (node of plan) simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio, error, lockBorder: false })
await doc.transform(prune(), textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 88 }),
                    meshopt({ encoder: MeshoptEncoder, level: 'high' }))
```

Expected output: 310,064 B, sha256 `eeefb12d…b2b3dc`.

---

## 5. Measurement plan

### 5.1 Dev perf overlay (`?perf`, works in the production build)

`PerfOverlay` is a lazy chunk, loaded only when `?perf` is in the URL. It shows the following and refreshes 2 times a second:
- fps (rAF cadence) and **p50 / p95 / p99 rAF delta** over the last 120 rendered frames, plus a sparkline
- **render CPU ms** p95 (time around `advance()`)
- **GPU ms** p95 through `EXT_disjoint_timer_query_webgl2` when the browser has it, otherwise "n/a"
- renders per second (proves that idle, hidden and reduced-motion really stop), draw calls, triangles (`renderer.info`), DPR, canvas MP, quality level and tier, and the gate result
- dropped frames (delta > 1.5x the target), and long tasks from a `PerformanceObserver('longtask')`
- a red **HIDDEN / THROTTLED** badge when `document.visibilityState !== 'visible'` or the rAF rate is under 50% of the expected rate. Runs with the badge on are discarded.
- `window.__perf.snapshot()` returns the numbers as JSON, for scripted runs

### 5.2 Protocol

1. `npm run build && npx vite preview --host`. Always measure the production build. LAN devices open `http://<mac-ip>:4173/?perf`.
2. In the Claude browser pane: `preview_start` (or `tabs_select`), then check that `tabs_context` reports the pane is **displayed** before taking any measurement. Then run a 3 s warmup and read `__perf.snapshot()`.
3. Scenarios, 20 s each, each one scripted in the console:
   - **S1** idle (expect 30 fps after 10 s, then a static frame with reduced motion)
   - **S2** continuous pointer sweep using synthetic `pointermove` events
   - **S3** ability cycle, keys 1 to 4 every 600 ms
   - **S4** drag-spin
   - **S5** resize through 1440x900, 1280x720, 390x844 and 390x664
   - **S6** intro on a cold load
4. Devices: M1 Air (Chrome, Safari), an Intel Iris Xe laptop (Chrome or Edge), iPhone 12 (Safari, with Web Inspector timeline), Pixel 6a (Chrome, `chrome://inspect`). If we lack a device, use BrowserStack real devices. Also Chrome DevTools with 4x and 6x CPU throttle.
5. Pass: the section 2.2 numbers on every Mid device and in every scenario. Lighthouse mobile: Performance >= 95, LCP <= 2.0 s, TBT <= 150 ms, CLS = 0.
6. `scripts/size-check.mjs` runs after every build. It fails if the entry is over 70 KB gz, the 3D chunk over 250 KB gz, the model over 320 KB, or `dist/` over 2 MB.

### 5.3 Graceful degradation checks

| Check | How | Expected |
|---|---|---|
| No JS | DevTools, Disable JavaScript | All text, links and the poster are readable. Layout is the same. |
| No WebGL | `?3d=0`. Chrome with `--disable-webgl` or hardware acceleration off. Firefox with `webgl.disabled=true`. | Poster, no three chunk in the Network panel, no console errors except the probe |
| Software GL | Chrome `--use-angle=swiftshader` | Static (gate) |
| Context loss | In the console: `gl.getExtension('WEBGL_lose_context').loseContext()`, then `restoreContext()` | Poster within 1 frame, 3D back after restore. A second loss keeps the poster. |
| Model failure | Block `*.glb` in DevTools | Poster stays. The page never goes blank. |
| Slow network | Slow 4G profile | Text readable at <= 1.5 s, poster shown, the head swaps in later with no layout shift |
| Weak GPU | `?tier=low`, plus 6x CPU throttle | Steps down to DPR 1, then to the poster if p95 stays > 33 ms. Layout does not change. |
| Reduced motion | DevTools, Rendering, emulate `prefers-reduced-motion` | Renders per second = 0 when idle. No intro drop, no idle sway. |
| Hidden tab or offscreen | Switch tabs for 5 s. Rotate a phone to landscape. | The renders counter does not move. No timers fire. |
| bfcache or background mount | Open in a background tab, then front it. Use back/forward. | The canvas is sized correctly, never 300x150. |
| Contrast and Save-Data | `prefers-contrast: more`. `?savedata`, which simulates `saveData` because DevTools cannot set it. | Grain and halftone removed. Static poster. |
