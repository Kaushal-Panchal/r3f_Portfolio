# 04 Build Spec: Kaushal Panchal, Hero Select

This is the single source of truth for the build. It merges 01-game-design.md (content and behaviour, owned by the Game Designer) with 02-ux-direction.md (presentation, owned by UX/UI). If this file and an earlier doc disagree, this file wins. House rule: no em dashes or en dashes anywhere, in copy or in code comments that ship.

---

## 0. Resolved conflicts

| # | Topic | Decision | Why |
|---|---|---|---|
| 1 | Ability count | 4 abilities (Game Designer). Accents: AI Systems cyan, Real-time 3D pink, Full-stack lime, Product Lead amber. Orange is dropped. | GD owns content. Amber/cyan/lime/pink are the four accents furthest apart and all pass 6.5:1 or more with ink. |
| 2 | Ability placement | Vertical cards in the right column that expand in place (GD). UX's bottom ability bar and separate detail panel are removed. | GD owns the interaction model. |
| 3 | Contact | "Team up" block at bottom-right, the end of the Z (GD). UX's left-column contact bar is removed. On phone, the contact bar is pinned to the bottom (GD). | GD owns behaviour. It fits in the layout without losing anything. |
| 4 | Shipped work | GD's 4 Missions replace UX's 5-row shipped list. Pulse now lives in the Product Lead detail, and the chat agent in the VrseBuilder detail. The UX stats card is removed: the numbers live on the missions and the stat chips. | GD owns content. It also removes duplicate numbers. |
| 5 | Mobile model | GD's model is adopted: ability chips, a 2x2 missions grid, bottom sheets, and a pinned contact bar. UX's swapping Player card is dropped. | GD's model shows every proof number on the first frame without a tap, and that beats UX's version. |
| 6 | Text inside the burst (readability override) | "Loading hero", "Drag to spin" and the poke lines go in a **caption strip** on a solid plate at the bottom of the hero zone, not above the head. On phone, poke lines show in the toast slot. | A bubble above the head would collide with the head breaking the frame, the drag spin and the intro drop. Text must never touch the face. |
| 7 | Linked-mission highlight (readability override) | A stacked ring is used: 4px accent outside the ink border, plus a 2px ink outer line. | Accent alone measures 1.0 to 2.9:1 against cream sky, lavender sky and paper. Accent next to ink is always 6.5:1 or more. |
| 8 | Dimming (readability override) | Nothing is ever dimmed. GD allowed 90% opacity; this spec uses 100%. | Selection adds emphasis. It never removes contrast. |
| 9 | Mission hover detail (readability override) | The card **flips** to a back face in the same box. Keyboard focus flips it too. GD had the detail fading in under the one-liner in reserved space. | Reserving 4 to 6 extra lines per card would overflow the bottom band or force text under 15px. |
| 10 | Career at 1280x720 | All 3 entries stay visible in compact rows (company, role, dates). The one-line summary plus popover only appears below 640px height. | It fits, and more proof on screen is better. |
| 11 | Head break-out | The head may break the burst's top edge by at most 10% of head height (GD's number). | Agreed. |
| 12 | Loading state | A static **poster** of the head (from 03) replaces GD's halftone silhouette. The same poster is also the no-WebGL and weak-device fallback. The `Loading hero` chip shows on desktop only. On phone, the poster alone is the loading state. | The poster is in the prerendered HTML, so the first frame already shows the real head. A chip in a 168px phone hero would crowd the face. |
| 13 | Intro (behaviour change, flagged to GD) | The head no longer drops in. The poster already shows the head at first paint, and a drop would make it vanish and reappear. New intro: crossfade from the poster to the 3D head at the identical rest pose. Then the glasses pop up and slam back down ("deal with it"), the head squashes, and one cyan crackle fires. | A seamless swap with no layout or image jump (03). |
| 14 | Phone hero size | The phone hero zone is 168px wide (was 140), and the title column is 180px. Under 700px height, `5 yrs XP` becomes a chip under the class plate instead of joining the class line. | The head is now 143px at 844 tall, close to GD's ~132 target. The merged class line would not fit in 180px. |
| 15 | Fonts | Same three families as before, self-hosted (03 section 3.8). Section 2.2 lists the exact files. | Engineer's plan. |

---

## 1. Non-negotiable rules

1. `html, body { height: 100dvh; overflow: hidden }`. The page never scrolls at any size. Only a bottom sheet can scroll internally, and only if it overflows.
2. **Hero zone:** a fixed rectangle per layout (section 4). The R3F canvas is exactly this rectangle. No DOM text may intersect it, except the caption strip (row 6 above) and the aria-hidden decorative word. A dev-only overlay outlines the zone and logs a warning if any text node's rect intersects it.
3. **Text surfaces:** text sits on a paper card, ink plate, violet plate or accent chip (ink text only), or directly on the sky in the top 40% of viewport height (ink text only). Text never sits on bare sky below 40%.
4. Every surface is 100% opaque. There is no `backdrop-filter`, no blur, and no translucent card anywhere.
5. Type never shrinks below the minimums: body 15px desktop and 14px phone, labels 12px, Anton 16px. When space runs out, lines are dropped in the order given in section 4.6.
6. All text is final and readable on the first painted frame. Nothing waits for 3D. There are no count-ups and no typewriter effects.
7. Only `transform` and `opacity` animate.

---

## 2. Tokens

### 2.1 Color
```css
:root {
  --sky-0:#F7EDDC; --sky-1:#F0DCC6; --sky-2:#9C86E0; --sky-3:#3A2C8C; --sky-4:#15103A;
  --ink:#14112B; --ink-2:#46405F; --ink-muted:#C9C2EA;
  --paper:#FFF8EC; --paper-2:#F3E8D4; --plate:#241A5E;
  --red:#E8322E; --red-ink:#B81E1E; --blue:#4F6BFF; --blue-ink:#2C3FCC; --cyan:#3FE8FF;
  --a-ai:#3FE8FF; --a-3d:#FF5FAE; --a-stack:#B6F23A; --a-lead:#FFB020;
  --burst-top:#2A1F8F; --burst-bottom:#5B4BD6; --tone-word:#221A55;
  --scrim:rgba(20,17,43,.6);
}
body { background: linear-gradient(180deg, var(--sky-0) 0%, var(--sky-1) 32%, var(--sky-2) 50%, var(--sky-3) 66%, var(--sky-4) 100%) fixed; }
```
- The gradient spans the viewport height and is interpolated in plain sRGB.
- Red and blue are used only for offset shadows and zap marks. They are never used as text or as a fill behind text.
- Accent colors appear as text only on ink or violet plates. On paper they appear as fills with ink text on top, or as stripes and dots with a 2px ink stroke.

### 2.2 Type
All fonts are self-hosted woff2 files, downloaded once from Google Fonts and subset at build time. They use `font-display: swap`. Each fallback `@font-face` gets metric overrides (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`), computed with fontaine or capsize, so the font swap causes zero layout shift. There are 3 files in total. Preload only #2 and #3.

| # | File | Family, weight | Subset | Used for | Fallback stack |
|---|---|---|---|---|---|
| 1 | `kaushan-title.woff2` | Kaushan Script 400 | Only the glyphs `K a u s h l P n c` plus space (the string "Kaushal Panchal"), about 5 KB | The name only | `"Kaushan fallback", "Brush Script MT", cursive` |
| 2 | `anton-latin.woff2` | Anton 400 | Google "latin" range (U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD) | Caps headings, class plate, numbers, Team up, tab plates. Never below 16px. Caps come from `text-transform`, so the source strings stay in copy-deck case. | `"Anton fallback", Impact, "Arial Narrow", sans-serif` |
| 3 | `atkinson-next-latin-var.woff2` | Atkinson Hyperlegible Next, variable, `wght` axis instanced to 400 to 800 | Same latin range | All other text. Weights used: 400, 600 and 800. | `"Atkinson fallback", Arial, system-ui, sans-serif` |

Budget: 100 KB or less for all three files combined (03 section 2.5).

| Token | L (1440x900) | M (1280x720) | Phone | Family / weight | Line height |
|---|---|---|---|---|---|
| title | 72 | 56 | 40 (36 under 700px height) | Kaushan | 0.92 |
| num | 40 | 34 | 28 | Anton | 1.0 |
| display | 22 | 20 | 16 | Anton, 0.04em tracking | 1.1 |
| team-up | 40 | 34 | n/a | Anton | 1.0 |
| body-l | 18 | 16 | 15 | Atkinson 600 | 1.45 |
| body | 15 | 15 | 14 | Atkinson 400 | 1.4 |
| strong | 16 | 16 | 14 | Atkinson 800 | 1.3 |
| label | 13 | 13 | 12 | Atkinson 800, 0.02em tracking | 1.3 |

**Title:** ink color, `rotate(-4deg)`, with this shadow:
```css
text-shadow: -0.05em 0.05em 0 var(--red), 0.05em 0.04em 0 var(--blue);
```
It is a real `<h1>`. Three decorative zap marks sit outside the glyph boxes, each an ink fill with a 3px red offset copy, marked `aria-hidden`.

### 2.3 Shape, space, shadow
- **Spacing:** 4, 8, 12, 16, 24, 32px.
- **Shape:** 2px radius. Cards and buttons use a 3px ink border; chips use a 2px ink border.
- **Comic offset shadow:** two pseudo-elements behind each card. The red one sits at (-N, +N) and the blue one at (+N, +N). Rest N = 2px; hover or selected N = 6px. The pseudo-elements move with `transform`. Never animate `box-shadow`.
- **Section tab plate:** ink fill, paper text in `display` size, 6px by 12px padding, `rotate(-2deg)`, red hard shadow (-4px, 4px). It sits on the top border of its card and overlaps the border by half its height. Tabs and the class plate are the only rotated elements. Body text never rotates.
- **Focus ring (all interactive elements):** 3px paper ring at 3px offset, then a 3px ink ring outside it. On every point of the gradient, at least one ring measures 3.8:1 or more.
- **Linked ring:** 4px accent ring outside the 3px ink border, then a 2px ink outer line. Draw it on a pseudo-element and show or hide it with opacity.
- **Grain:** one static 128px PNG tile at 6% opacity on the sky layer only. It sits under all cards, has no blend mode, and is not animated.

### 2.4 Motion
```
--ease-out: cubic-bezier(.2,.8,.2,1)   --ease-pop: cubic-bezier(.34,1.56,.64,1)   --twos: steps(2,end)
--t-press: 90ms   --t-hover: 120ms   --t-ui: 160ms   --t-flip: 120ms   --t-sheet: 200ms
```

---

## 3. Copy deck (final)

Render these strings exactly as written.

**Meta:**
- Page title: `Kaushal Panchal, Product Engineer`
- Description and OG description: `I build AI products end to end, from the first prompt to the on-prem rollout.`
- OG image (1200x630): poster render with the brush name, "Product Engineer", and the head in the burst. No small text.
- Head alt text: `Stylised 3D head of Kaushal wearing pixel-art sunglasses`

**Identity:**
- Name: `Kaushal Panchal`
- Class: `Product Engineer`
- Pitch: `I build AI products end to end, from the first prompt to the on-prem rollout.`
- Rank line: `Lead Engineer, AI Products at AutoVRse`
- Stat chips: `5 yrs XP`, `Leads 5-6 engineers`, `Bangalore, India`
- Merged class line (short screens): `Product Engineer, 5 yrs XP`

**Abilities:**
- Section label: `Abilities`
- Keyboard hint (desktop only): `Press 1-4`

| # | Name | Phone chip | Tab on card | One-liner | Receipt | Detail | Tags |
|---|---|---|---|---|---|---|---|
| 1 | AI Systems | `AI` | `Signature move` | Multi-agent AI that does real work, not demos. | 20+ AI workers in parallel | A planner chain fans out to 20+ workers at once. Auto failover across OpenAI, Anthropic, Gemini and Azure. A grounding layer so the model only outputs what the engine can actually run. | Multi-agent orchestration, OpenRouter, Provider failover, SSE streaming, Runtime grounding, Human-in-the-loop, ElevenLabs, Flux |
| 2 | Real-time 3D | `3D` | none | 3D on the web and in VR, built to ship. | 1 SDK, 2 production apps | 3D websites, a 3D panorama tour tool, a reusable 3D web SDK, and VR training on Meta Quest. Yes, this page counts. | React-Three-Fiber, 3D web SDK, Panorama tours, Meta Quest, MERN |
| 3 | Full-stack | `Full-stack` | none | Front to back, plus the servers it runs on. | $1M in transactions | React and Node apps with the plumbing done right. Concurrent worker pipelines, real-time WebSockets, and the AWS, Docker and Nginx setup to run it all. | React, Node.js, Express, MongoDB, Supabase, AWS, Docker, Nginx, WebSockets, Tailwind |
| 4 | Product Lead | `Lead` | none | Roadmap, team and client. Handled. | Leads 5-6 engineers | Works directly with the CEO and CTO, owns the roadmap, and embeds with client IT and security teams. Built Pulse, a dashboard that lets partners improve their own modules from real usage data. | Roadmap ownership, Team lead, On-prem delivery, Analytics dashboards, Partner tooling |

Linked missions for each ability:
- AI Systems: VrseBuilder Studio, Enterprise Rollouts
- Real-time 3D: 3D Web SDK, Enterprise Rollouts
- Full-stack: Mulya, VrseBuilder Studio
- Product Lead: Enterprise Rollouts, Mulya

**Missions:** section label `Missions cleared`

| Name | Number | Label | One-liner | Detail (back face, sheet) |
|---|---|---|---|---|
| VrseBuilder Studio | 20+ | AI workers in parallel | Type a training brief in plain words. Get a playable VR experience back. No code. | A 4-agent planning chain, 4 model providers with auto failover, live streaming, and a chat agent that edits the VR content in real time. |
| Enterprise Rollouts | 3 | on-prem enterprise rollouts | AstraZeneca, Amazon and JSW. Embedded with their IT and security teams. | Shipped Amazon's warehouse safety training on Meta Quest into US facilities. |
| 3D Web SDK | 2 | production apps sped up | Turned the Godrej MHE project into a reusable 3D web SDK. | Also built 3D websites and VTP, a 3D panorama tour tool, for clients like Grasim Liva. |
| Mulya | $1M | in transactions | Built a remittance platform for Indian freelancers, end to end. 100 active users. | Cashfree payments, invoice PDFs, and the AWS and Docker setup. All of it. |

**Career:**
- Section label: `Career`
- Popover and sheet button: `Full career`

| Company | Role | Dates | One-liner |
|---|---|---|---|
| AutoVRse | Lead Engineer, AI Products | 2023 to now | Drove the shift from services to product. Leads 5-6 engineers. |
| Mulya | Software Developer | 2022 to 2023 | Led the fintech remittance platform. $1M in transactions. |
| Flipstack Technologies | SDE Intern | 2021 to 2022 | Sole dev on a real-time delivery tracking dashboard. Shipped 2 more full-stack apps. |

- Origin line: `B.Tech, Computer Science, Lovely Professional University, 2018 to 2022`
- Summary line: `Now at AutoVRse. Before: Mulya, Flipstack.`
- "Now" chip on the AutoVRse entry: `Now`

**Contact:**
- Button: `Team up`
- Subtext (desktop): `krdpanchal@gmail.com`
- Phone bar buttons: `Email`, `LinkedIn`, `GitHub`
- Desktop links: `LinkedIn`, `GitHub`
- Hrefs: `mailto:krdpanchal@gmail.com`, `https://linkedin.com/in/kaushal-panchal-a20220172`, `https://github.com/Kaushal-Panchal`
- Toast: `Email copied. Talk soon.`
- No phone number is shown. There is no resume button unless the owner supplies a PDF.

**System strings:**
- Loading: `Loading hero`
- Drag hint: `Drag to spin`
- Poke lines (cycle in order): `Deal with it.`, `Still not taking them off.`, `Okay, okay. Email me.`
- Sheet close button: `Close`
- Hidden keyboard button in the hero zone: `Poke the hero`
- Decorative word (aria-hidden, desktop only): `SHIP IT.`

**Accessible names** (visually hidden):
- Ability group: `Abilities. Press 1 to 4 to pick one.`
- Each mission dot set: `Linked to: {ability names}`

---

## 4. Layout

**Tier selection**, checked in this order:
- **Phone:** width under 768, or width under 1024 in portrait.
- **Landscape phone:** height under 520.
- **L:** width 1360 or more, and height 860 or more.
- **M:** everything else with width 1024 or more. Its short-height drops are in section 4.6.

**Desktop columns:**
- Left and right columns: `clamp(312px, 30vw, 440px)`.
- Center: the remaining width, minimum 320px.
- Team up block: always 304px wide.
- Missions width: content width minus 304px minus the gutter.

**Vertical layout:** the bottom band has a fixed height per tier. The top band takes the rest, and the hero zone equals the top band's height.

### 4.1 L, boxes at 1440x900 (32px margin, 24px gutter)

| Zone | x, y, w, h | Content |
|---|---|---|
| Title | 32, 24, 432, 136 | Name on 2 lines ("Kaushal" / "Panchal"), sits on the sky |
| Class plate | 32, 168, auto, 36 | Ink plate, display text, `Product Engineer` |
| Pitch | 32, 216, 432, 52 | body-l, ink on sky |
| Rank line | 32, 276, 432, 22 | strong, ink on sky (ends at 33% of height) |
| Chips | 32, 306, 432, 28 | 3 paper chips |
| Career card | 32, 350, 432, 286 | Tab `Career`, 3 full entries, origin line |
| HERO ZONE | 488, 24, 456, 612 | Caption strip is the bottom 48px (y 588 to 636) |
| Abilities header | 968, 24, 440, 32 | `Abilities` in display text plus `Press 1-4` label, ink on sky |
| Ability cards | 968, 64, 440, 572 | 3 collapsed cards at 76px, 1 expanded card reserved at 280px, 12px gaps |
| Missions tab | 32, 652, auto, 32 | Tab `Missions cleared` |
| Mission cards | 32, 684, 1048, 184 | 4 cards at 244 x 184, x = 32, 300, 568, 836 |
| Team up block | 1104, 684, 304, 184 | Button 304 x 120, then LinkedIn and GitHub at 146 x 52 each from y 816 |

### 4.2 M, boxes at 1280x720 (24px margin, 16px gutter)

| Zone | x, y, w, h | Content |
|---|---|---|
| Title | 24, 20, 400, 104 | 2 lines |
| Class plate | 24, 130, auto, 32 | |
| Pitch | 24, 172, 400, 46 | |
| Rank line | 24, 226, 400, 22 | Ends at 34% of height |
| Chips | 24, 256, 400, 26 | |
| Career card | 24, 294, 400, 184 | Tab, 3 compact rows (company, role, dates), origin line |
| HERO ZONE | 440, 20, 400, 458 | Caption strip is the bottom 44px |
| Abilities header | 856, 20, 400, 28 | |
| Ability cards | 856, 56, 400, 422 | 3 collapsed at 70px, expanded at 180px (no tag row), 10px gaps |
| Missions tab | 24, 494, auto, 28 | |
| Mission cards | 24, 528, 912, 172 | 4 cards at 216 x 172, x = 24, 256, 488, 720 |
| Team up block | 952, 528, 304, 172 | Button 304 x 104, links at 146 x 52 from y 644 |

### 4.3 Phone, 390x844 (16px margin, 358px content width; max content width 560px, centered)

| Zone | x, y, w, h | Content |
|---|---|---|
| Title | 16, 16, 180, 80 | 40px, 2 lines |
| Class plate | 16, 104, auto (max 180), 28 | |
| HERO ZONE | 206, 16, 168, 180 | No caption strip on phone |
| Pitch | 16, 204, 358, 40 | |
| Chips | 16, 252, 358, 28 | label size 12 |
| Abilities card | 16, 300, 358, 124 | Tab `Abilities` on its top border. Inside: 4 chips at 81 x 44, then the receipt chip and one-liner of the selected ability (fixed height) |
| Missions tab + grid | 16, 452, 358, 216 | 2x2 tiles at 175 x 104, 8px gap. The tab overlaps from y 440 |
| Career bar | 16, 680, 358, 44 | Summary line with a chevron. Tapping it opens the career sheet |
| Toast slot | 16, 732, 358, 44 | Empty unless a toast or poke line is showing |
| Contact bar (pinned) | 0, 780, 390, 64 + safe-area inset | Ink plate holding 3 buttons at 114 x 44 |

### 4.4 Phone, 390x664 (any phone height under 700)

The chips row is dropped. `5 yrs XP` moves into the title column as a chip under the class plate (GD intent, see conflict 14). `Leads 5-6 engineers` is still visible as the Product Lead receipt.

| Zone | x, y, w, h |
|---|---|
| Title | 16, 12, 180, 72 (36px) |
| Class plate | 16, 90, auto, 26 |
| `5 yrs XP` chip | 16, 120, auto, 24 |
| HERO ZONE | 206, 12, 168, 132 |
| Pitch | 16, 152, 358, 40 |
| Abilities card | 16, 204, 358, 116 |
| Missions grid | 16, 340, 358, 200 (tiles 175 x 96) |
| Career bar | 16, 548, 358, 44 |
| Contact bar | 0, 600, 390, 64 + inset |

The toast overlays the career bar for its 2.5s life.

### 4.5 Landscape phone (boxes at 844x390)

- **Left column** (x 16, width 396):
  - Title: 1 line at 36px, 16, 12, 280, 44
  - Merged class plate: 16, 58, auto, 26
  - HERO ZONE: 304, 12, 108, 108
  - Pitch: 16, 120, 396, 40
  - Abilities card (chips and receipt line only): 16, 172, 396, 92
  - Career bar: 16, 276, 396, 44
  - Contact row (not pinned): 16, 326, 396, 48
- **Right column** (x 428, width 400):
  - Missions tab and 2x2 grid: 428, 24, 400, 344
  - Tiles are 196 x 168 and also show the one-liner.

### 4.6 Line-drop order for short screens

Desktop. Each threshold also applies everything above it.

| Height | Drop |
|---|---|
| under 860 | Tier M: expanded tag row hidden, career one-liners hidden (compact rows) |
| under 680 | D1: mission one-liners move to the back face (front shows number, label and name; the card is 96px tall; the bottom band is 124px). D2: origin line hidden. |
| under 640 | D3: career becomes the summary line plus a `Full career` button that opens a popover. D4: chips are dropped and the class plate becomes `Product Engineer, 5 yrs XP`. D5: collapsed ability cards hide their one-liner (name, keycap and receipt only, 46px). |
| under 520 | Switch to the landscape phone layout |

Phone, in order:
1. The chips row is dropped and `5 yrs XP` moves under the class plate (under 700).
2. Title drops to 36px and the hero shrinks to 132px.
3. Mission tiles go from 104 to 96px.

Never shrink type below the token sizes. Never drop a mission number, an ability name or receipt, the name, the class, or contact.

---

## 5. Components

Every card is the same base: paper fill, 3px ink border, 2px radius, and comic offset shadow at N = 2px. Unless a component says otherwise, its states are:
- **Hover** (desktop only): `translateY(-3px)` and N = 6px, over 120ms.
- **Pressed:** `translate(2px, 2px)` and N = 0, over 90ms.
- **Focus-visible:** the focus ring.

**5.1 Identity**
- Title and class plate are static.
- Chips: paper fill, 2px ink border, label size, ink text, 6px by 10px padding.
- Pitch, rank line and chips are static.

**5.2 Hero zone and burst**

Layers, back to front:
1. Decorative word `SHIP IT.` in Anton at 1.3x the zone width, color `--tone-word`, behind the lower third. Desktop only, aria-hidden.
2. Red copy of the burst path at (-8, +8).
3. Blue copy of the burst path at (+8, +6).
4. Main burst: 14 irregular spikes, gradient fill from `--burst-top` to `--burst-bottom`, 6px ink stroke with miter joins. Its bounding box is the hero zone inset 16px at the sides, 40px at the top, and 8px above the caption strip.
5. Halftone pattern: 6px white dots at 10% opacity, clipped to the burst.
6. Poster `<img>` (in the prerendered HTML), placed exactly in the **head box**.
7. Canvas, transparent, covering the full hero zone.
8. Three cyan bolts with a 3px ink stroke, plus two ink zap ticks with red offsets.

**Head box.** The poster and the 3D head share this one square.
- The **stage** is the hero zone minus the caption strip (desktop), or the whole hero zone (phone).
- The box is a square of side S, centered horizontally and vertically in the stage.
- Desktop: S = min(0.72 × stageW, 0.70 × stageH).
- Phone: S = min(0.85 × stageW, 0.85 × stageH).

| Layout | Stage (w x h) | S | Head box, absolute (x, y, w, h) |
|---|---|---|---|
| L 1440x900 | 456 x 564 | 328 | 552, 142, 328, 328 |
| M 1280x720 | 400 x 414 | 288 | 496, 83, 288, 288 |
| Phone 390x844 | 168 x 180 | 142 | 219, 35, 142, 142 |
| Phone 390x664 | 168 x 132 | 112 | 234, 22, 112, 112 |
| Landscape 844x390 | 108 x 108 | 92 | 312, 20, 92, 92 |

**Burst geometry.**
- The spike tips reach the stage inset: 16px at the sides, 16px at the top, 8px at the bottom.
- The valley points lie on an ellipse whose top sits at head box top + 0.10 × S. That gap is the 10% break-out.

**Poster image.**
- Transparent-background AVIF, with a WebP fallback, at 480w and 900w (03 budget: 35 KB or less). Use `srcset` with `sizes` equal to S.
- Rendered from the production camera and materials at the **rest pose**: yaw 0.25 rad, pitch 0, glasses on, no crackle. The head silhouette's bounding square fills the image edge to edge, with 4% transparent padding on every side.
- The 3D camera is fitted so that the rest pose silhouette's bounding square lands exactly on the head box. Same framing means no jump at the swap.
- `width` and `height` attributes are set, and the image uses `object-fit: contain`. CLS = 0.

**Swap.**
1. The 3D head renders its first frame at the rest pose.
2. The canvas fades from opacity 0 to 1 over 200ms. With reduced motion, it switches instantly.
3. The poster is set to `visibility: hidden`.
4. Only then does the intro play.

If the poster and the first 3D frame are misaligned by more than 2px at the silhouette's bounding box, that is a bug.

The head's screen-space bounding box always stays inside the stage, and rises at most 10% of S above the burst valley line.

Caption strip (desktop only): content is centered, one item at a time, in this priority:
1. `Loading hero`: ink plate, paper text, label size. Shown only while the 3D state is `loading`. It never shows for `static` or `failed`, because the poster is the final state there.
2. A poke line: a speech bubble with paper fill, 3px ink border, `strong` text in ink, and a tail pointing up at the head. Shown for 2s.
3. `Drag to spin`: ink plate, label size. Shown once on desktop. It hides after the first drag or after 6s.

**5.3 Ability cards** (desktop)

Semantics: `role="radiogroup"` with each card as `role="radio"` and `aria-checked`. Up and Down move the selection and select. Keys 1 to 4 select from anywhere. Esc returns to AI Systems. AI Systems is selected on load.

Collapsed card anatomy:
- A 6px accent stripe on the left with a 2px ink edge.
- Row 1: a 28x28 keycap (ink square, paper digit, label size), the name in `strong`, and the receipt chip right-aligned (accent fill, ink text, label size, 2px ink border).
- Row 2: the one-liner in `body`, 1 line.
- AI Systems also carries a `Signature move` tab plate on its top-right border. It uses the ink tab style and label size.

| State | Visual |
|---|---|
| Default | Base card |
| Hover | Lift and N = 6px. The head glances at the card. Nothing expands. |
| Keycap press (1 to 4) | Keycap `translateY(2px)` for 90ms |
| Selected (expanded) | The card is the expanded height, which is reserved, so nothing else on the page moves. Its header row has an accent fill with the name in ink. The receipt chip flips to an ink fill with accent text. N = 6px. Then come the detail in `body` (up to 5 lines) and the tag row: chips with paper-2 fill, 2px ink border and label size, wrapping to at most 3 rows. The tag row is hidden in tier M. |
| Linked dot (a mission is hovered) | 10px accent dot with a 2px ink stroke at the right edge of row 2 |
| Focus-visible | Focus ring |

Exactly one card is expanded at all times. The expanded slot always reserves the tallest ability's height (L 280px, M 180px).

**Phone abilities card:**
- Four chips at 81 x 44 in `strong` text. A chip's default fill is paper. The selected chip gets the accent fill with ink text and a 4px ink underline bar.
- Below the chips, at a fixed height: the receipt chip, then the one-liner in `body`.
- There is no detail and there are no tags.

**5.4 Mission cards**

Front face, top to bottom:
1. Number in `num` with its label in label size to the right of it, max 2 lines, ink-2.
2. Name in `strong`.
3. One-liner in `body`, max 3 lines (4 lines in tier M).
4. The linked-ability dots sit bottom-right.

Back face: the name, the number as a small chip, and the detail in `body`. The detail is always in the DOM and wired up with `aria-describedby`.

| State | Visual |
|---|---|
| Default | Base card. Numbers stamp in on first paint: scale 1.15 to 1 over 150ms, 60ms stagger, opacity always 1. |
| Hover or focus (desktop) | Lift, N = 6px, and flip to the back face. The flip is a 120ms crossfade with scaleX 0.96 at the midpoint. The head looks down at the card. |
| Linked (the selected ability links to it) | Linked ring in that ability's accent. The ring animates in with opacity over 160ms, with a 30ms stagger. |
| Tap (touch) | Opens the mission sheet |

Phone tile: number, label (max 2 lines) and name only. Tapping it opens the sheet.

**5.5 Career**

Full entry (tier L):
- Row 1: company in `strong`, then role in `body` ink-2, with the dates right-aligned in label size ink-2. AutoVRse also gets the `Now` chip: cyan fill, ink text, 2px ink border.
- Row 2: one-liner in `body`, max 2 lines.
- A 1px ink-2 divider separates entries.

Compact entry (tier M): row 1 only.

Origin line: label size, ink-2, max 2 lines.

Career entries are not interactive. The `Full career` button and the phone career bar are paper buttons with focus rings.

**5.6 Popover (desktop D3) and bottom sheets (phone)**

Popover:
- An opaque paper card, the width of the left column, that opens upward inside the left column. It never enters the hero zone.
- Closes on Esc or a click outside.
- Opens with opacity and a 12px translateY over 160ms.

Sheet:
- Paper fill with a 3px ink top border, 60% max height, a 32x4 ink drag handle, and a 44px `Close` button at top-right.
- Uses the `--scrim` with no blur.
- Opens with translateY over 200ms using `--ease-out`. Swiping down closes it.

Mission sheet contents: number and label, the name in `display`, the one-liner, and the detail.

Career sheet contents: the rank line, then the 3 full entries, then the origin line.

**5.7 Contact**

Team up button:
- Cyan fill with ink text, 3px ink border, comic shadow N = 2px. `Team up` is in the `team-up` size and the email subtext is in `body`.
- Click: open the `mailto` link, copy the address, and show the toast.
- Hover: N = 6px, a lift, and the head nods.

LinkedIn and GitHub: paper buttons in `strong` text, opening in a new tab.

Phone contact bar:
- An ink plate pinned to the bottom.
- `Email` is the cyan button; `LinkedIn` and `GitHub` are paper buttons. All three are 114 x 44.

Toast:
- An ink plate with paper text in `strong` and a small shades icon.
- `aria-live="polite"`, shown for 2.5s.
- Desktop: it replaces the email subtext inside the Team up button for 2.5s, so it never overlaps anything.
- Phone: it shows in the toast slot.

Hit targets are at least 44 x 44 everywhere.

---

## 6. Behaviour

Summary of 01-game-design.md. The Game Designer owns this section.

- **Selecting an ability**, finished in under 500ms and interruptible:
  1. The card expands.
  2. The linked missions get the linked ring.
  3. The head turns to the card and plays its reaction:
     - AI Systems: cyan crackle and a glint on the glasses.
     - Real-time 3D: a full 360 spin.
     - Full-stack: a squash and bounce.
     - Product Lead: a nod toward the missions.
  4. The burst bolts flash once in the accent (2 frames, `--twos`) and then hold that accent.
  5. Burst punch: the SVG burst only scales 1, then 1.03, then 1 over 150ms.
- **Head:**
  - Desktop: it tracks the cursor, clamped to yaw +/-25 deg and pitch +/-12 deg. You can drag to spin it and it springs back.
  - Click or tap: poke. It wobbles and the next poke line shows.
  - Touch: it does an idle look-around instead of tracking the cursor.
  - It looks at the name on load and at Team up when the cursor is near it.
  - The canvas takes pointer input only inside the burst polygon.
- **Intro (once):**
  - All text and the poster are painted at frame 0 from the prerendered HTML.
  - The title's red and blue offsets slide from 0 to their final position over 240ms.
  - The burst scales from 0.85 to 1 over 380ms with `--ease-pop`.
  - After the swap (section 5.2), over 900ms total:
    1. The glasses (`Cube`, confirmed separable in 03) lift 0.3 head-heights over 250ms.
    2. They slam back down over 150ms with `--ease-pop`.
    3. The head squashes to 0.94 on the y axis and returns, over 180ms.
    4. One cyan crackle fires.
  - Cursor tracking and the idle loop start only after the intro.
- **Idle** (after 5s with no input):
  - Look-around and a 2px breathing bob.
  - A glint every ~6s and a crackle every ~10s.
  - Content never changes on its own. Nothing flashes more than 3 times a second.
- **Loading and fallback:**
  - The poster is the loading state, the no-WebGL state, the weak-device state (quality level 0) and the error state. Every UI behaviour stays the same in all of them.
  - In the static state, ability selection still flashes the SVG bolts and still shows the linked rings.
  - Poke works on the poster as well: a CSS wobble of the `<img>`, plus the poke line.
  - Keyboard users get a visually hidden `Poke the hero` button inside the hero zone.
- **No JS:**
  - Every string, every link and the poster are readable.
  - AI Systems is shown expanded, as prerendered.
  - Mission back faces still work on desktop, because they use CSS `:hover` and `:focus-within`.
  - Only ability switching, sheets and the toast need JS.
- **Reduced motion:**
  - No intro, spin, wobble, crackle, bob, lift, shadow slide, flip animation or burst punch.
  - The head holds a fixed 3/4 pose and swaps pose instantly to face the selected card.
  - Selection changes color and the ring only.
  - Flip and sheet transitions become opacity changes of 120ms or less.
- **`prefers-contrast: more`:** remove the grain, halftone and decorative word.

---

## 7. Contrast (computed, WCAG 2.x)

Scripts: `scratchpad/contrast.mjs`, `scan.mjs`, `merge.mjs`.

| Pair | Ratio | Need |
|---|---|---|
| Ink on sky 0% / 32% / 40% | 15.81 / 13.76 / 9.75 | 4.5 |
| Ink-2 on sky 32% | 7.30 | 4.5 |
| Ink on paper / paper-2 | 17.37 / 15.12 | 4.5 |
| Ink-2 on paper / paper-2 | 9.21 / 8.01 | 4.5 |
| Paper on ink / violet plate | 17.37 / 14.37 | 4.5 |
| Ink-muted on ink | 10.82 | 4.5 |
| Ink on cyan / lime / amber / pink | 12.40 / 13.76 / 10.03 / 6.55 | 4.5 |
| Cyan / lime / amber / pink on ink | 12.40 / 13.76 / 10.03 / 6.55 | 4.5 |
| Red-ink / blue-ink on paper | 6.13 / 7.39 | 4.5 |
| Paper sheet vs scrim over content | 6.63 | 3 (UI) |
| Ink border vs sky at 50% | 6.03 | 3 (UI) |
| Paper focus ring vs sky at 56% / 66% / 100% | 4.54 / 10.37 / 17.04 | 3 (UI) |

**Rejected pairs:**
- Ink or paper on red: 4.30 / 4.04.
- Paper or ink on blue: 4.08 / 4.26.
- Paper on sky at 50%: 2.88.
- Ink on sky at 56%: 3.82.
- Accent alone on paper: 1.26 to 2.65.
- Accent alone on sky at 0 to 50%: 1.01 to 2.41.

---

## 8. Performance constraints

Source: `03-tech-plan.md`, which owns the details. Presentation must stay inside these limits.

**Page shape**
- `index.html` is prerendered and holds every string, link and the poster. It hydrates with `hydrateRoot`.
- There is no loader or overlay of any kind.
- three.js is a lazy chunk, started after `load` or idle. Its URL is never in the entry bundle.

**Budgets**
- **Bytes:** HTML 20 KB or less, entry JS 70 KB gz or less, fonts 100 KB or less (3 files, 2 preloaded), poster 35 KB or less, grain 4 KB or less, 3D chunk 250 KB gz or less, model 320 KB or less (actual: 310 KB), `dist/` under 2 MB. `scripts/size-check.mjs` fails the build above these.
- **Time to readable:** 0.6s or less on desktop cable, 1.5s or less on Lighthouse mobile. LCP 2.0s or less, TBT 150ms or less, **CLS 0**.
- **Frame:** capped at 60fps on every display. Mid-tier p95 rAF delta 17.5ms or less, with 1% or fewer dropped frames. Render CPU p95 3ms or less.

**Canvas (hero zone only)**
- Draw calls: 12 or fewer. Triangles: 75K or fewer. Lights: 2 or fewer. Material programs: 4 or fewer. No shadows, no post-processing, no env map.
- Pixel caps: Mid 1.4 MP, High 2.6 MP, Low 0.6 MP. DPR caps: High 2, Mid 1.5, Low 1.

**3D content allowed:** the head (7 draws). Optionally an in-canvas glint and crackle (3 draws or fewer, quality level 3 only). Nothing else. Burst, halftone, lightning, grain, offsets and the decorative word are all SVG or CSS.

**Quality tiers**

| Level | What changes | What never changes |
|---|---|---|
| 3 High | DPR 2, in-canvas glint and crackle, native refresh while dragging | |
| 2 Mid (default) | DPR 1.5, SVG crackle only | Layout, content, type |
| 1 Low | DPR 1, no glint, idle loop at 30fps | Layout, content, type |
| 0 Poster | Canvas unmounted, poster shown | Layout, content, type, all UI behaviour |

The capability gate sends these straight to Poster: no WebGL2, a software GL renderer, Save-Data or 2g, `deviceMemory` of 2 or less, 2 or fewer CPU cores, or `?3d=0`.

**Render loop**
- Renders only when needed:
  - Every frame at the cap during intro, reactions, pointer movement and drags.
  - 30fps after 10s of idle.
  - On demand only with reduced motion.
  - Stopped when the tab is hidden or the hero zone is offscreen.
- Presentation consequence: with reduced motion, the idle bob, the glint and the look-around are skipped (section 6 matches this).

**CSS layers**
- 6 composited layers or fewer, in this order: sky with grain, burst SVG, canvas, lightning SVG, UI cards. Add the sheet or popover when one is open.
- Grain is a static `background-image` tile under everything. No `mix-blend-mode` over the canvas or text, and no layer larger than the viewport.
- Red and blue `text-shadow` only on display type 24px and up (the title). Plates and cards get their offsets from pseudo-elements, never from animated `box-shadow`.
- Burst boil: 3 stacked paths swapped by opacity at 8fps for 600ms after a selection, then stopped. Lightning flicker is opacity on the bolt group only.
- System cursor only. No custom cursor loop.

**Verification:** run 03 section 5 (`?perf` overlay, scenarios S1 to S6, degradation checks) on the production build.

---

## 9. Acceptance checklist

Verify against screenshots at 1440x900, 1280x720, 390x844 and 390x664, plus one each with reduced motion on and WebGL off.

1. There is no scrollbar and nothing is clipped at any of the 4 sizes.
2. At first paint, without any interaction, these are readable: name, `Product Engineer`, pitch, rank line or `Now at AutoVRse`, `5 yrs XP`, all 4 ability names with receipts, all 4 mission numbers with labels and names, and the Team up / Email button. LinkedIn and GitHub are visible too.
3. No text overlaps the 3D head or the burst at any moment, including the intro, the 360 spin, and a drag. The only exception is the caption strip, which sits below the head.
4. No text sits on bare sky below 40% of viewport height.
5. No text is smaller than 15px on desktop or 14px on phone, labels are at least 12px, and no all-caps text is smaller than 16px.
6. No blurred or translucent panels. Every card is opaque with a 3px ink border.
7. AI Systems is selected on load. Its 2 linked missions (VrseBuilder Studio, Enterprise Rollouts) show the linked ring, and nothing is dimmed.
8. Pressing 1 to 4 selects each ability; nothing outside the abilities column moves.
9. Tabbing through the page shows a visible double focus ring on every control, in this order: abilities, missions, contact.
10. On desktop, hovering or focusing a mission flips it to its detail, and the card size does not change.
11. Phone: tapping a mission tile or the career bar opens a sheet that fits without scrolling. The contact bar stays visible.
12. Clicking Team up or Email opens mail, copies the address, and shows `Email copied. Talk soon.`
13. There is exactly one 3D model, no orbiting nodes, and no 3D text.
14. Searching the DOM text and the page source for the em dash and en dash characters returns zero matches, and every string matches section 3.
15. With reduced motion on, nothing moves except opacity fades of 120ms or less, and the head holds a static pose.
16. With WebGL off (`?3d=0`), the poster head shows in the burst, the network panel shows no three chunk, and everything else works the same.
17. With JavaScript disabled, every string, every link and the poster are readable in the same layout.
18. At the poster-to-3D swap, the head does not jump: the silhouette bounding box moves 2px or less, and CLS is 0.
19. No loader or overlay ever covers the text.
20. The page passes section 8: the size check, Lighthouse mobile at 95 or above, and the 03 frame targets on a Mid device.

---

## 10. Game Designer sign-off

Content, copy and behaviour came through intact, and the readability overrides in section 0 are all good calls. The intro (poster crossfade, then glasses pop and slam, squash, one crackle) is approved: the "deal with it" slam is the real signature beat, and keeping the head visible at first paint matters more than a drop. Juice list intact. Banned list mostly intact, see item 5.

Must-change items:
1. Phone under 700px: `Leads 5-6 engineers` is NOT visible at first paint (only the selected receipt shows, and AI Systems is the default), so at that height the career bar summary becomes `Now at AutoVRse. Leads 5-6 engineers.` and the claim in 4.4 is removed.
2. Acceptance item 2: on phone, require all 4 ability names plus the selected ability's receipt, not all 4 receipts, so nobody crams the chips.
3. The poster rest pose and the 3D rest pose must turn the face toward screen-left (toward the name) on every layout; verify the sign of yaw 0.25, since this gaze is the first-frame eye cue.
4. Drag-to-spin works on touch too, with `touch-action: none` only inside the burst polygon.
5. Add to the banned list: no screen shake, no glitch or chromatic animation on text (the static title offsets are fine), no sound by default.
