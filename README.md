# Kaushal Panchal · Product Engineer

A hero select screen instead of a portfolio. One page, no scrolling, pick a power and the whole
thing reacts.

**Live:** [kaushal-panchal.netlify.app](https://kaushal-panchal.netlify.app)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

## The screen

Three zones that never fight each other. Text left, hero centre, console right, and the giant
type sits above all of it.

- **Centre.** My head model, watching the cursor, with a scan bar sweeping him, a power ring
  that repaints itself in whatever is selected, and five power nodes on a wheel around him. The
  wheel is sized to clear both side panels, so nothing ever lands on his face.
- **Left.** The pitch, then the loadout. Five powers, click to swap.
- **Right.** Four tabs. Powers is the selected ability with a power level that rolls up and the
  receipts behind it. Origin is the work history. Missions is what shipped. Signal is contact.
- **Bottom.** Five years, three Fortune 500 rollouts, five to six engineers, a million dollars
  processed.

Three ways to pick a power: the rail, the node itself, or the arrow keys. They all drive one
piece of state, so the ring, the node, the rail and the panel move together.

## Look

Lifted from Spider-Verse poster art. Warm haze at the top falling into deep indigo, film grain,
halftone dots, and black display type with red and blue chromatic offsets on everything that
matters. The bottom of the frame fades to dark so the hero is grounded instead of cropped.

## Stack

React 18 · Vite · @react-three/fiber · drei · three 0.166 · zustand

The head is the only asset. Everything else is generated: GLSL for the drifting dust, plain
geometry for the wheel, CSS for the sky and the grain.

## How it works

- The canvas is fixed behind the layout. The screen grid is `pointer-events: none` with its
  panels opted back in, so the cursor reaches the 3D nodes through the gaps.
- Pointer state lives outside React in `src/engine.js`, mutated in place and read from the render
  loop, so moving the mouse never causes a re-render.
- Node labels are DOM, positioned by projecting each node every frame. Crisp text, no React work.
- Respects `prefers-reduced-motion`, and drops the wheel and particle counts on small screens.

## Notes

- `public/HeadWithGoggles.glb` is the only runtime fetch. It was 9.1 MB. Pruning the skinning
  data the model never used and quantizing the vertex attributes took it to 4.8 MB with no visual
  change, and `KHR_mesh_quantization` needs no decoder at runtime. The original is in git history.
- The four Mixamo rigs the first version loaded (about 205 MB, which is why it used to crawl) are
  out of the tree. Also still in git history.
- Contact is direct links, not the old EmailJS form, whose keys were committed in plain text.
