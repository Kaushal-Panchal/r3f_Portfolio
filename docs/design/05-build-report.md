# 05 Build Report: Kaushal Panchal, Hero Select

Built from `04-spec.md`, including the 5 must-change items in its section 10. Architecture and budgets come from `03-tech-plan.md`. Nothing has been committed. The old code is still in commit 3d21777.

## 1. What was built

- **A prerendered single screen.** `npm run build` runs the client build, then an SSR build of `src/entry-server.jsx`. `scripts/prerender.mjs` then writes the rendered app and two font preloads into `dist/index.html`, and `scripts/size-check.mjs` enforces the budgets. The client hydrates with `hydrateRoot`. Every string, every link and the poster are in the HTML, so the page reads fully with JS off.
- **Layout is pure CSS.** Four layouts (L, M, phone, landscape phone) plus the short-height drops (D1 to D5, and compact phone) are all media queries, so the first paint is already the final layout.
- **3D is a lazy chunk.** `three/gate.js` probes for WebGL2 with `failIfMajorPerformanceCaveat` and checks the renderer string, Save-Data, 2g, `deviceMemory`, core count and `?3d=0`. After `load`, it fetches the model and imports `Stage.jsx` in parallel.
  - R3F runs with `frameloop="never"`. `three/loop.js` decides when to render: a 60fps cap, idle attract at 60 and then 30fps, on demand only under reduced motion, and stopped when the tab is hidden or the hero is off screen.
  - `three/quality.js` steps the DPR down (2, 1.5, 1) and finally falls back to the poster.
  - An error boundary and context-loss handlers fall back to the poster.
- **Head.** One GLB of 310 KB (meshopt, 33,754 vertices, 67,357 triangles, 7 draw calls, 4 programs, 2 lights). The material is stock standard with a fresnel rim in the selected ability's accent, plus a glint band on the glasses (no extra draws).
  - Rest yaw is `-0.25` rad, which faces screen-left toward the name (GD item 3). I verified it by screenshot: the nose points left in both the poster and the live head.
  - Implemented behaviour:
    - Intro: glasses lift 0.3 head-heights, slam with pop, squash to 0.94, then one SVG crackle.
    - Cursor tracking is clamped to yaw 25° and pitch 12°.
    - Gaze goes to a hovered ability or mission, to Team up when the cursor is near it, and to the selected card.
    - Per-ability reactions: glint, 360 spin, squash and bounce, nod.
    - Poke wobble with cycling lines.
    - Drag to spin with a spring back, on mouse and touch.
    - Idle look-around with a 2px bob, a glint every 6s and a crackle every 10s.
- **Drag-to-spin only inside the burst (GD item 4).** The hit layer is clipped to the burst polygon and carries `touch-action: none`, so touches outside the burst are never captured.
- **Poster pipeline.** In dev, `?poster=900` renders the production camera and materials at the rest pose into a 900px transparent PNG (via the dev-only `/__poster` sink). It was encoded to AVIF and WebP at 480 and 900. The 3D camera uses an off-centre projection fitted so the rest-pose silhouette square lands exactly on the head box.
- **Fonts.** Self-hosted from the npm `@fontsource` packages and subset by `npm run fonts`, which needs Python fontTools: Kaushan Script (only the glyphs of the name), Anton latin, and Atkinson Hyperlegible Next variable 400 to 800. The fallback `@font-face` rules carry `size-adjust` and ascent/descent overrides that I computed with fontTools against Arial, Impact and Brush Script.
- **OG image.** `public/og.png` (1200x630, 74 KB): the brush name, the `PRODUCT ENGINEER` plate, and the head in the burst.
- **Dependencies.** Runtime: `react`, `react-dom`, `three`, `@react-three/fiber`. Removed: `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `zustand`. The dev dependencies add three `@fontsource` packages.
- **Test hooks**, all working in the production build:
  - `?perf` loads a lazy overlay (fps, p50/p95/p99 frame time, CPU time, renders per second, draws, triangles, long tasks, and a HIDDEN/THROTTLED warning), plus `window.__perf.snapshot()` and `__perf.bench(n)`.
  - `?zones` outlines the hero zone, warns if text intersects it, and adds `window.__swapCheck()`.
  - `?3d=0` and `?3d=1`, `?tier=low|mid|high`, `?level=0..3`, `?motion=reduce` (an attribute-scoped copy of the reduced-motion rules), and `?savedata`.

## 2. File map

| Path | Role |
|---|---|
| `index.html` | Meta and OG tags, the reduced-motion test hook, and the `<!--app-->` and `<!--preload-->` markers |
| `src/main.jsx` | Hydrates, starts the 3D gate after hydration, lazy-loads `?perf` and `?zones` |
| `src/entry-server.jsx` | `renderToString(<App/>)` for the prerender |
| `src/App.jsx` | Page structure and global keys (1 to 4, Esc) |
| `src/content.js` | Copy deck, verbatim from spec section 3 |
| `src/store.js` | Tiny external store (`useSyncExternalStore`), event bus, toast and caption helpers |
| `src/burst.js` | Burst geometry (14 spikes, valley ellipse at head top + 0.1 S), head box, point-in-polygon |
| `src/ui/Identity.jsx`, `Career.jsx`, `Abilities.jsx`, `Missions.jsx`, `Contact.jsx`, `Sheet.jsx`, `Hero.jsx` | The UI components (spec section 5) |
| `src/three/gate.js` | Capability gate. Entry bundle, no three import. |
| `src/three/Stage.jsx` | Lazy: Canvas, error boundary, framing, quality, compile and swap, context loss |
| `src/three/head.js` | Model setup, lights, gaze, reactions, intro, idle, drag spring |
| `src/three/framing.js` | Rest-pose silhouette square and the off-centre projection |
| `src/three/loop.js` | Render scheduler and perf ring buffers |
| `src/three/quality.js` | DPR policy and adaptive levels |
| `src/perf/overlay.js`, `src/perf/zones.js` | `?perf` overlay and bench; `?zones` overlay and swap check |
| `src/styles.css` | Tokens, components, the 4 layouts, the drops, reduced motion |
| `src/assets/` | `head.glb` (moved from `public/`), posters, grain tile, 3 fonts |
| `scripts/fonts.mjs`, `prerender.mjs`, `size-check.mjs` | Build tooling |
| `.claude/launch.json` | Adds `portfolio-prod` (`vite preview` on 4173) |
| `public/og.png` | Share image |

## 3. Measured numbers

All numbers come from the production build (`vite preview`). The browser pane reported **hidden** for every measurement, even right after `tabs_select` and `preview_start`. Its rAF was throttled to about 15/s, and the `?perf` overlay flagged it as THROTTLED.

| Metric | Value | Status |
|---|---|---|
| Entry JS | 54.7 KB gz (171 KB raw) | Measured, budget 70 |
| 3D chunks (three + R3F 216.6, Stage 27.5) | 237.8 KB gz | Measured, budget 250 |
| `index.html` (prerendered) | 22.5 KB raw, 5.5 KB gz | Measured, budget 20 gz |
| CSS | 38.3 KB raw, 14.4 KB gz (Kaushan and grain are inlined because they are under 4 KB) | Measured |
| Fonts | 2 files, 45.1 KB, plus Kaushan 3.4 KB inlined | Measured, budget 100 |
| Poster | AVIF 13.7 / 26.4 KB, WebP 17.9 / 27.8 KB | Measured, budget 35 |
| Model | 310,064 B | Measured, budget 320 KB |
| `dist/` | **207.2 MB with the 4 Mixamo GLBs, 1.61 MB without** (site files only) | Measured. The GLBs are untouched in `public/`. |
| Text present before JS | Every spec string is in the served HTML (checked with curl). With `?3d=0` the only JS request is the entry chunk. | Measured |
| 3D start | Stage, three and GLB requests start at about 388 ms, after DCL (77 ms) and `load` (86 ms), locally | Measured (localhost) |
| Console errors | 0 (default, `?3d=0`, `?perf`, `?zones`, `?motion=reduce`) | Measured |
| Long tasks | 0 at load | Measured (pane hidden) |
| Draw calls / triangles / programs | 7 / 67,357 / 4 | Measured |
| Canvas | 1440x900: 448x564 at DPR 1.5 = 0.57 MP. 390x844: 168x180 at DPR 1.5 = 0.07 MP. | Measured (M1, start level Mid) |
| Synthetic frame cost (`__perf.bench(150)`, forced render plus 1px readback, M1) | 1440x900: CPU p50 0.3 / p95 0.6 ms, CPU+GPU p50 2.5 / p95 4.1 ms. 390x844: CPU p95 0.3, CPU+GPU p95 2.1 ms. | Measured, but this is cost per frame, not cadence |
| Poster to 3D swap | Silhouette bounding box differs by **1 px** (S = 323) | Measured (`__swapCheck`) |
| **FPS and p95 rAF delta** | | **NOT MEASURED.** The pane was hidden. The overlay is ready: open `http://localhost:4173/?perf` with the pane visible. |
| FCP / LCP / Lighthouse | FCP read 632 ms in the hidden pane, which is not trustworthy | **NOT MEASURED** (no Lighthouse run) |

## 4. Acceptance checklist (spec section 9)

Sizes checked: 1440x900, 1280x720, 390x844, 390x664, plus 1920x1080, 1366x768, 1200x600, 1024x768, 768x1024, 412x915, 393x851, 375x667, 360x800, 360x740, 844x390, 740x360 and 667x375. "Clip check" is a DOM script that looks for any visible text outside the viewport, outside its card or chip, or under the fixed phone contact bar.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | No scrollbar, nothing clipped | PASS | `scrollHeight == innerHeight` at all sizes. Clip check is clean everywhere. The only flag is the brush title's font content box above the top edge; the glyphs themselves are visible in the screenshots. |
| 2 | Required content readable at first paint | PASS | Prerendered. Desktop shows all 4 names and receipts. Phone shows all 4 names (`AI`, `3D`, `Full-stack`, `Lead`) plus the selected receipt (GD item 2). Under 800px tall the career bar reads `Now at AutoVRse. Leads 5-6 engineers.` (GD item 1). |
| 3 | No text over the head or burst | PASS | `?zones` reports zero hits at every size. The caption strip is the only exception. |
| 4 | No text on bare sky below 40% | PASS | Everything below the identity block sits on cards or plates. |
| 5 | Minimum type sizes | PASS | Tokens: body 15/14, labels 13/12, Anton at least 16 |
| 6 | No blur or translucency, opaque cards, 3px ink border | PASS | No `backdrop-filter` anywhere |
| 7 | AI selected on load, 2 linked rings, nothing dimmed | PASS | linked = `1100` (VrseBuilder, Rollouts) |
| 8 | Keys 1 to 4 select; nothing outside the abilities column moves | PASS | Box snapshot of every other region identical across 1 to 4. Esc returns to AI. |
| 9 | Tab order and focus rings | PASS | Order: ability radiogroup, 4 missions, Team up, LinkedIn, GitHub, then the hidden Poke button. Double ring: paper outline plus ink. |
| 10 | Mission flip on hover or focus, same size | PASS | CSS `:hover` / `:focus-within` crossfade, so it works without JS too. The back face fits at L, M and D1. |
| 11 | Phone sheets fit, contact bar visible | PASS | Mission sheet 223px and career sheet 373px, no internal scroll. The sheet sits above the pinned bar, which stays above the scrim. |
| 12 | Team up / Email: mail, copy, toast | PASS | `href=mailto:`, clipboard write, `Email copied. Talk soon.` (inside the button on desktop, in the toast slot on phone). The live region is announced on every layout. |
| 13 | One model, no orbit nodes, no 3D text | PASS | |
| 14 | No em or en dashes; strings match section 3 | PASS | Scan of `src`, `scripts`, `index.html`, `dist` HTML/JS/CSS and `docs/design`: 0 hits. Strings come from `content.js`. |
| 15 | Reduced motion | PASS | Checked with `?motion=reduce` (the OS setting cannot be emulated in this pane): no CSS animations, fades of 120ms or less, no intro or idle, head pose swaps instantly toward the selected card, frames render on demand only. |
| 16 | `?3d=0` | PASS | Poster shown, state `static`, only the entry JS requested, linked rings and SVG bolts still work |
| 17 | JS disabled | PASS (by construction) | Prerendered HTML holds all strings, links and the poster. AI shows expanded. Mission flips are CSS. I did not toggle JS off in the pane. |
| 18 | Swap jump of 2px or less, CLS 0 | PASS | 1px measured. Poster and canvas share the head box. The img has width and height set. |
| 19 | No loader or overlay over text | PASS | `Loading hero` is a chip in the caption strip only |
| 20 | Size check, Lighthouse 95+, frame targets | PARTIAL | Size check PASS (Mixamo GLBs reported, not counted). Lighthouse and frame cadence NOT MEASURED (pane hidden). |

GD item 5 (no screen shake, no glitch or chromatic animation on text, no sound) holds: none of these were added.

## 5. Deviations from 04-spec (flagged for review)

1. **Desktop starts at 1200px wide, not 1024.** Between 1024 and 1199, with columns at 312, ability names wrapped to 3 lines and mission labels overflowed their cards (a measured clip-check failure). That range now uses the phone stack, centred at a max of 560px.
2. **Compact phone under 800px tall, not 700.** The full phone stack needs about 797px, so 360x740 and 375x667 overflowed. Under 800 the compact rules apply (chips dropped, `5 yrs XP` under the plate, title 36, hero 132, tiles 96), and the career bar shows the GD item 1 line.
3. **Landscape is orientation based.** It applies to landscape with height under 520, at any width, so 667x375 is no longer a broken phone stack. Under 820px wide, mission one-liners are hidden. Under 380px tall, the hero is 84px.
4. **Decorative `SHIP IT.` removed.** The burst always covered the middle letters, so it read as "SH IT." in every placement I tried. That is not worth the risk with a recruiter panel. UX can bring it back with a placement that never splits the word.
5. **The phone toast floats** above the contact bar instead of having a reserved row. That frees the row, and it lands at the spec position at 844.
6. **Small layout tweaks.** At D1 the Team up block becomes button plus stacked links (2 x 44px) so LinkedIn and GitHub stay visible. Mission dots move to the top right at D1. The back face puts the name and the number chip on one row so the detail fits at M.
7. **Columns** use `max(312, min(440, 31.25vw, (100vw - margins - 320) / 2))`. That matches the M boxes exactly. At L the left column is 440 instead of 432 and the hero 448 instead of 456 (8px off).
8. **Quality step-up** is judged on a clean cadence plus CPU p95 under 2ms. At a 60fps cap the delta never drops below 16.7ms, so 03's "delta below 0.8x target" rule could never trigger.

## 6. Known gaps

- **FPS, p95 frame time and Lighthouse are not measured.** The pane stayed hidden. The owner should open the pane, load `http://localhost:4173/?perf`, run scenarios S1 to S6 from 03 section 5, and read `__perf.snapshot()`. Run Lighthouse mobile against `vite preview` as well.
- **Real devices not tested:** iPhone 12, Pixel 6a, Intel Iris.
- **`og:image` is relative** (`/og.png`). Twitter needs an absolute URL, so set it once the domain is known.
- **Fallback metrics** for `Anton fallback` are tuned to Impact. iOS and Android have no Impact, so the next font in the stack is used without overrides there, which can mean a small reflow on the swap.
- **Dev only:** HMR of `Hero.jsx` orphans the canvas until a reload. This cannot happen in production.
- **Owner decision pending:** the 4 Mixamo GLBs (205.5 MB) are still copied into `dist/`.

## 7. Round 2 fixes (recruiter review 1)

| # | Review item | Fix | Verified |
|---|---|---|---|
| 1 | Phone mission card blank after its sheet closes | The flip now applies only in the desktop layout, on `:hover` and `:focus-visible`. Before, it also ran on `:focus-within` at every size. | 390x844 prod: the card is focused after Esc and its front stays visible (opacity 1) |
| 3 | Phone hero has no title or employer | `Lead Engineer, AI Products at AutoVRse` is now a full-width row under the pitch, in strong 14px, on every portrait phone layout | 390x844, 390x664, 375x667, 360x740 and 412x915: no clipping, career row above the contact bar |
| 4 | Desktop `CAREER` tab hits the chips | Career card top margin 16 to 26 or 28px. L spacing tightened to compensate. | Tab clears the chips by about 10px at 1440x900 and 12px at 1280x720. Career content fits. |
| 5 | `MISSIONS CLEARED` covers the first card | The tab now sits fully above the grid, 2 to 4px clear, on desktop and phone. The bottom band grows by the tab height and the gap above it shrinks. Compact phone gets tighter row gaps and 84px tiles under 700 tall. | No tab and card overlap at any size checked |
| 6 | Phone career chevron points up | It points right | prod 390x844 |
| 7 | Desktop flip ghosting | The front fades out over 60ms, then goes `visibility: hidden`. The back waits 60ms before fading in, so the two faces never show together. | prod 1440x900 hover: clean back face |
| 9 | Mission dots have no meaning | Dots removed. The back face now shows labelled ability chips (`AI`, `3D`, `Full-stack`, `Lead`, from the copy deck). The screen-reader text `Linked to: ...` is unchanged. | prod hover screenshot |
| 10 | `Signature move` sticker sits on the collapsed card | Shown only while AI Systems is expanded | 1440x900 |
| extra | Phone mission label wrapped to 3 lines on narrow tiles | Phone labels use the full tile width | 360x740 clip check is clean |

Not changed, because each needs owner content or a content decision: links to shipped work and a résumé PDF (item 2), `5 yrs XP` against a 2022 graduation (item 8), and the nice-to-have copy changes.

The size check still passes after the rebuild: entry 54.7 KB gz, 3D 237.8 KB gz. The clip and overlap DOM check is clean at 1440x900, 1280x720, 1200x600, 1366x660, 390x844, 390x664, 375x667, 360x740 and 412x915. `vite preview` is still running on 4173. FPS is still not measured, because the pane is still hidden.

## 8. Round 3 fixes (recruiter review 2)

| # | Review item | Fix | Verified (prod) |
|---|---|---|---|
| 1 | Bolt reads as an apostrophe ("Kaushal'") | The zap marks moved off the name. Two now sit beside the class plate, and one sits above the K on desktop. None is at a line end. | 1440x900 zoom, 390x844 |
| 2 | Title versus job line | `Product Engineer` stays the headline. The job line now reads `Now: Lead Engineer, AI Products at AutoVRse` (copy changed in `content.js`, and it also appears in the career popover and sheet). | One line at 1440, 390 and 360 |
| 3 | Email hidden on phone, small on desktop | The phone and landscape contact bars now show the address itself (`krdpanchal@gmail.com`, 13px, 12px under 375 wide) on a double-width cyan button, with LinkedIn and GitHub sharing the rest. On desktop the address under Team up is now body-l 800. | 390x844 and 360x740: the address fits inside its button. No page scroll. |
| 4 | "Poke the hero" did nothing | The poke line now outranks `Loading hero` in the caption strip, so it always shows; on phone it goes to the toast. When it ends during loading, the loading chip comes back. The head wobbles when live, the poster wobbles when static, and with reduced motion only the line shows. | 1440: `Deal with it.` shown. 390: toast shown. |
| 5 | Empty space in the expanded Product Lead card | The expanded card sizes to its content, capped at the old reserved height (L 280, M 180). Only the abilities column reflows. | Lead card 280 to 220px, 15px under the tags |
| 6 | Accessible names and duplicate name text | Radios (cards and phone chips) get `name: receipt` labels. Mission buttons get `name: number label`. Team up gets `Team up: email krdpanchal@gmail.com`, so the toast is no longer in the name. The red and blue title copies are CSS pseudo-elements with empty alt text, so "Kaushal" appears once in page text. The phone `Abilities` tab is now a decorative `<p>`, so the headings are Career, Abilities, Missions cleared. | Read from the DOM on the production build |

Unchanged, by instruction: the sunglasses, proof links and résumé.

Known side effect: at 390x844 the transient toast (2s) overlaps the career row, because the new job line pushed that row down by 26px.

Size check passes: entry 54.8 KB gz, 3D 237.8 KB gz. `vite preview` is still on 4173 and the viewport is reset. FPS is still not measured, because the pane is hidden.
