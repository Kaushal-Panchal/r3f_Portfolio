# 01 Game Design: Kaushal Panchal, Hero Select

Owner: Game Designer. Source of truth for every fact: `Kaushal_Panchal_Master_Resume.md`.
House rule: no em-dashes or en-dashes anywhere in copy or UI. Hyphens, commas, periods only.

---

## 1. The fantasy and the mapping

**Fantasy in one line:** You just landed on the hero select screen, and there is only one hero worth picking.

The metaphor is a skin over a recruiter's checklist. Every game element answers one recruiter question, and every headline answer is on screen at first glance with zero interaction. Interaction only adds depth and fun.

| Recruiter question | Hero select element | Visible with zero interaction? |
|---|---|---|
| Who is this? | Hero name (brush title) + the 3D head in the burst panel | Yes |
| What role, what level? | Class line "Product Engineer", rank line "Lead Engineer, AI Products at AutoVRse", stat chips "5 yrs XP", "Leads 5-6 engineers" | Yes |
| Proof of impact? | Missions Cleared row: 4 cards, each led by one real number (20+, 3, 2, $1M) | Yes, numbers and one-liners always shown |
| What shipped? | Same Missions row (names + one-liners); ability cards each carry a "receipt" | Yes. Extra detail on hover / tap |
| What can he do? | Abilities column: 4 ability cards, first one pre-selected and expanded | Yes. Selecting swaps which one is expanded |
| Career history? | Career block: 3 entries (AutoVRse, Mulya, Flipstack) | Yes on desktop. One-line summary on phone, full list in a sheet |
| How do I contact him? | "Team up" button (the "Lock in" button of a hero select screen) + LinkedIn + GitHub | Yes, always, on every layout |

**No power-level percentages.** Skill bars with made-up numbers are dishonest and a recruiter reads them as filler. Each ability instead shows a **receipt**: one real number from the resume that proves it. Same game-stat feel, zero invention.

**Level mechanic, grounded:** "5 yrs XP" is the only level-style stat. It is true (07/2021 to now, and the resume says 5 years).

---

## 2. The first 5 seconds (eye path)

Layout is a Z-pattern built to be read in this order. The 3D head is the hook, but it is used to point at text, not to compete with it.

1. **0.0s - The burst panel and head (center).** Highest motion and color contrast on the page. The head drops into the burst on load and its first look is toward the name, so its gaze hands the eye off to the left.
2. **0.5s - Name, top-left.** "Kaushal Panchal" in black brush script with red/blue offset shadow. Biggest type on screen.
3. **1.0s - "Product Engineer"** directly under the name, bold, second-biggest type.
4. **1.5s - The pitch + rank line.** "I build AI products end to end, from the first prompt to the on-prem rollout." Then "Lead Engineer, AI Products at AutoVRse" and the two stat chips.
5. **2.5s - Abilities column, top-right.** Four card titles readable as a list. AI Systems pre-expanded with its receipt "20+ AI workers in parallel".
6. **3.5s - Missions Cleared, bottom row.** Four big numbers: 20+, 3, 2, $1M. Numbers are the second-loudest thing after the name.
7. **4.5s - "Team up" button, bottom-right.** The Z ends on the call to action.

Rule: nothing animates text in a way that delays reading. All text is final and readable on the first painted frame. No count-up numbers, no typewriter, no intro gate.

---

## 3. Core loop and interaction model

**Core loop:** Look (everything is already visible) -> Pick an ability -> The hero reacts and the matching missions light up -> Contact.

### Abilities are UI cards, not 3D nodes
The orbiting 3D nodes are gone. Abilities are 4 HTML cards in the right column. The 3D head reacts to them from its own zone. This fixes clutter, occlusion and meaning in one move: cards have readable names, the head stays clean.

Exactly **4 abilities** (fewer is more readable than 5). Each card, collapsed: keycap, name, one-liner, receipt number. Expanded (selected): adds a 2-line detail and a tool tag row.

### Selecting an ability does exactly this
1. The selected card expands in place (others collapse to name + one-liner + receipt). Height is reserved so nothing else on the page moves.
2. The 2 linked mission cards get a highlight outline in the ability's accent color. Other missions stay at full readability (no dimming below 90% opacity).
3. The head plays that ability's reaction (section 5) and turns to look at the card.
4. The burst panel's lightning crackle flashes once in the ability's accent.

Ability -> linked missions:
- AI Systems -> VrseBuilder Studio, Enterprise Rollouts
- Real-time 3D -> 3D Web SDK, Enterprise Rollouts (Meta Quest)
- Full-stack -> Mulya, VrseBuilder Studio
- Product Lead -> Enterprise Rollouts, Mulya

Default state on load: AI Systems selected (it is the signature move and the strongest proof).

### Desktop (mouse + keyboard)
- **Hover ability card:** card lifts, red/blue offset shadow widens, head glances at it. Preview only, nothing expands.
- **Click ability card or press 1-4:** select (as above). Up/Down arrows cycle. Tab order: abilities, missions, contact.
- **Hover mission card:** card lifts, its 1-line detail fades in under the one-liner (space reserved, no layout shift), linked abilities get a small accent dot, head looks down at it.
- **Cursor anywhere:** head tracks the cursor, clamped (yaw +/-25 deg, pitch +/-12 deg), smoothed.
- **Drag on the head:** spin it like a character viewer. Releases with a spring back to facing front. Classic hero select move.
- **Click the head:** "poke" easter egg (section 4).
- **Click email button:** opens mailto and copies the address, toast "Email copied. Talk soon."
- **Esc:** returns selection to AI Systems.

### Touch (phone, tablet)
- **Tap ability chip:** select. Head turns toward the chip row and plays the reaction.
- **Tap mission tile:** opens a bottom sheet (max 60% height, fits without scrolling) with the full mission copy. Tap outside or swipe down to close.
- **Tap "Career" line:** bottom sheet with the 3 career entries + education.
- **Drag the head:** spin. **Tap the head:** poke.
- No hover states, no tilt/gyro (iOS permission prompt is not worth it). Head idles with a slow look-around instead of cursor tracking.
- Contact bar is pinned to the bottom of the viewport and always visible.

---

## 4. States and feedback

| State | What happens |
|---|---|
| **Loading** | All HTML text paints immediately, never waits for 3D. The burst panel is drawn (SVG/CSS) with a halftone silhouette of the head inside and small text "Loading hero". When the GLB is ready, the head drops in. If load exceeds 4s, show the static head image instead and swap to 3D silently when ready. |
| **Intro (once)** | Head drops into the burst from above (Miles mid-fall nod), squash on landing, one cyan crackle, then the sunglasses slide down onto the face ("deal with it"). Total 1.2s. Text is already readable underneath the whole time. |
| **Idle / attract** | After 5s with no input: slow look-around, 2px breathing bob, a light glint sweep across the glasses every ~6s, a soft crackle every ~10s. Content never auto-changes. No auto-cycling abilities (it would move text while someone reads). |
| **Hover** | Lift + shadow offset widen (120ms), head glance. Desktop only. |
| **Select** | Card expands, linked missions outlined, head reaction, single crackle flash in accent color. Under 500ms, interruptible by the next selection. |
| **Poke (click/tap head)** | Quick wobble + comic speech bubble inside the burst panel, above the head, never over text. Cycles through the poke lines in the copy deck. |
| **No WebGL / low memory** | Static pre-rendered image of the head (3/4 view, glasses on) inside the burst. Every piece of content and interaction works the same. Ability selection still highlights missions and still flashes the CSS crackle. |
| **Reduced motion** | No intro drop, no spins, no wobble, no crackle flashes, no shadow animation, static grain. Head sits in a fixed 3/4 pose and only swaps pose (instant, no tween) to look toward the selected card. Selection is a color/outline change only. |
| **Low-end device** | Quality steps down automatically (lower DPR, no grain animation, simpler crackle) before ever dropping frames. Layout and content never change with quality. |

### Juice: cheap, high impact
1. **Offset shadow snap:** red/blue offsets on cards and buttons jump from 2px to 6px on hover/select. Pure CSS, reads as "comic".
2. **Keycap press:** pressing 1-4 visibly depresses the keycap on that card.
3. **Crackle flash:** one burst of cyan lightning around the head on select, tinted per ability. 2D overlay, not 3D.
4. **Burst punch:** burst panel scales 1.00 -> 1.03 -> 1.00 on select (150ms).
5. **Stamp-in:** mission numbers land with a 150ms scale stamp on first paint, staggered 60ms. Final value shown from frame one, no count-up.
6. **Glasses glint:** a specular sweep across the pixel shades in idle.
7. **Email copied toast** with a tiny "deal with it" shades icon.

### Avoid (hurts readability or FPS)
Screen shake, glitch or chromatic effects on text, particles or lightning crossing text zones, bloom/DOF post-processing, count-up numbers, typewriter text, auto-rotating content, sound on by default, custom cursors that hide the pointer, flashing faster than 3 times per second, any intro that blocks the content.

---

## 5. The 3D hero

**Does:**
- Lives inside the burst panel. It may break the burst's top edge slightly (the "Miles over the type" overlap, max ~10% of the head), but never enters a text zone.
- Tracks the cursor (desktop), idles with a look-around (touch).
- Uses its gaze to direct attention: looks at the name on load, at a card on hover/select, down at a mission on hover, at "Team up" when the cursor nears it (plus a small nod).
- Plays one short reaction per ability:
  - AI Systems: cyan crackle around the head, glasses glint.
  - Real-time 3D: a full 360 spin (shows off that it is real 3D).
  - Full-stack: squash and bounce, like a block landing on a stack.
  - Product Lead: confident nod toward the Missions row.
- Can be dragged to spin and poked.
- Glasses drop on intro. The GLB has a separate node named `Cube` that is almost certainly the pixel shades (other nodes: Face, HairExtrude, Brows, Hairs, Beard). Engineer to confirm; if it is not separable, skip the drop and keep the glint.

**Does not:**
- No text, labels, or UI in 3D space. Ever.
- No orbiting nodes, no extra 3D models, no body.
- No camera fly-throughs, no zooming into the face, no orbit controls beyond the drag-spin.
- No fake talking, lip sync, or face morphing (the model has no rig or morphs).
- No real-time shadows, no post-processing, no heavy environment maps.
- Never blocks clicks on UI. The canvas only takes pointer input inside the burst area.

Note for engineering: the GLB is 4.8 MB. It needs compression (meshopt/Draco + compressed texture) to keep the head drop under ~2s on mobile. Not a design decision, but it decides whether the intro lands.

---

## 6. Copy deck

Every on-screen string. Facts only from the resume. Casual, punchy, no em/en-dashes.

### Meta and share card (Twitter preview is the real first impression)
- Page title: `Kaushal Panchal, Product Engineer`
- Meta description / OG description: `I build AI products end to end, from the first prompt to the on-prem rollout.`
- OG image (1200x630): poster-style render of the hero screen: name in brush script, "Product Engineer", head in the burst. No small text.
- Head image alt text: `Stylised 3D head of Kaushal wearing pixel-art sunglasses`

### Identity block
- Name: `Kaushal Panchal`
- Class: `Product Engineer`
- Pitch: `I build AI products end to end, from the first prompt to the on-prem rollout.`
- Rank line: `Lead Engineer, AI Products at AutoVRse`
- Stat chips: `5 yrs XP` / `Leads 5-6 engineers` / `Bangalore, India`

### Abilities
- Section label: `Abilities`
- Keyboard hint (desktop only, next to the label): `Press 1-4`

**1. AI Systems** (tag: `Signature move`)
- One-liner: `Multi-agent AI that does real work, not demos.`
- Receipt: `20+ AI workers in parallel`
- Detail: `A planner chain fans out to 20+ workers at once. Auto failover across OpenAI, Anthropic, Gemini and Azure. A grounding layer so the model only outputs what the engine can actually run.`
- Tags: `Multi-agent orchestration` `OpenRouter` `Provider failover` `SSE streaming` `Runtime grounding` `Human-in-the-loop` `ElevenLabs` `Flux`

**2. Real-time 3D**
- One-liner: `3D on the web and in VR, built to ship.`
- Receipt: `1 SDK, 2 production apps`
- Detail: `3D websites, a 3D panorama tour tool, a reusable 3D web SDK, and VR training on Meta Quest. Yes, this page counts.`
- Tags: `React-Three-Fiber` `3D web SDK` `Panorama tours` `Meta Quest` `MERN`

**3. Full-stack**
- One-liner: `Front to back, plus the servers it runs on.`
- Receipt: `$1M in transactions`
- Detail: `React and Node apps with the plumbing done right. Concurrent worker pipelines, real-time WebSockets, and the AWS, Docker and Nginx setup to run it all.`
- Tags: `React` `Node.js` `Express` `MongoDB` `Supabase` `AWS` `Docker` `Nginx` `WebSockets` `Tailwind`

**4. Product Lead**
- One-liner: `Roadmap, team and client. Handled.`
- Receipt: `Leads 5-6 engineers`
- Detail: `Works directly with the CEO and CTO, owns the roadmap, and embeds with client IT and security teams. Built Pulse, a dashboard that lets partners improve their own modules from real usage data.`
- Tags: `Roadmap ownership` `Team lead` `On-prem delivery` `Analytics dashboards` `Partner tooling`

### Missions Cleared
- Section label: `Missions cleared`

**VrseBuilder Studio**
- Number: `20+` / label: `AI workers in parallel`
- One-liner: `Type a training brief in plain words. Get a playable VR experience back. No code.`
- Detail (hover / sheet): `A 4-agent planning chain, 4 model providers with auto failover, live streaming, and a chat agent that edits the VR content in real time.`

**Enterprise Rollouts**
- Number: `3` / label: `on-prem enterprise rollouts`
- One-liner: `AstraZeneca, Amazon and JSW. Embedded with their IT and security teams.`
- Detail: `Shipped Amazon's warehouse safety training on Meta Quest into US facilities.`

**3D Web SDK**
- Number: `2` / label: `production apps sped up`
- One-liner: `Turned the Godrej MHE project into a reusable 3D web SDK.`
- Detail: `Also built 3D websites and VTP, a 3D panorama tour tool, for clients like Grasim Liva.`

**Mulya**
- Number: `$1M` / label: `in transactions`
- One-liner: `Built a remittance platform for Indian freelancers, end to end. 100 active users.`
- Detail: `Cashfree payments, invoice PDFs, and the AWS and Docker setup. All of it.`

### Career
- Section label: `Career`
- `AutoVRse` / `Lead Engineer, AI Products` / `2023 to now` / `Drove the shift from services to product. Leads 5-6 engineers.`
- `Mulya` / `Software Developer` / `2022 to 2023` / `Led the fintech remittance platform. $1M in transactions.`
- `Flipstack Technologies` / `SDE Intern` / `2021 to 2022` / `Sole dev on a real-time delivery tracking dashboard. Shipped 2 more full-stack apps.`
- Origin line (desktop at 900px+ height, and in the phone sheet): `B.Tech, Computer Science, Lovely Professional University, 2018 to 2022`
- Phone one-line summary: `Now at AutoVRse. Before: Mulya, Flipstack.`

### Contact
- Primary button: `Team up`
- Button subtext (desktop): `krdpanchal@gmail.com`
- Phone contact bar: `Email` / `LinkedIn` / `GitHub`
- Links: `mailto:krdpanchal@gmail.com`, `https://linkedin.com/in/kaushal-panchal-a20220172`, `https://github.com/Kaushal-Panchal`
- Copy toast: `Email copied. Talk soon.`

**Phone number: not shown.** This link goes to ~500K followers. A public phone number invites spam and scam calls and gets scraped, and recruiters reach out by email or LinkedIn anyway. It stays on the resume for people already in a process.

### System and easter egg strings
- Loading: `Loading hero`
- Drag hint (shown once, desktop, fades after first drag or 6s, inside burst bottom edge): `Drag to spin`
- Poke lines (cycle in order): `Deal with it.` / `Still not taking them off.` / `Okay, okay. Email me.`

### Deliberately left out (not invented, not claimed)
- Skill percentages or bars. Replaced by receipts.
- "Open to work" or availability claims. Not in the resume.
- "Fortune 500" as a headline label. The resume uses it, but the client names (AstraZeneca, Amazon, JSW) are stronger and cannot be disputed. Use the names.
- RAG (resume marks it as experimenting), three.js internals, shaders/GLSL (not in resume).
- CGPA, languages spoken, interests (low signal for a 30s visit).
- A resume download button, unless the owner provides a PDF.

---

## 7. Constraints check (no page scroll)

Layout uses `100dvh`, no page scroll at any listed size. Detail never pushes layout: expanded states use reserved space or sheets/popovers.

### 1440x900 (desktop)
- Top band (~60%): Identity column left (name 2 lines, class, pitch, rank, chips, full 3-entry Career + origin line) | Burst + head center | Abilities column right (3 collapsed cards + 1 expanded with detail and tags).
- Bottom band (~30%): Missions Cleared, 4 cards in a row (number, label, one-liner, detail on hover) | "Team up" block bottom-right with LinkedIn and GitHub under it.
- Everything in the copy deck is visible except mission details (hover). Fits with room.

### 1280x720 (small laptop)
- Same grid, tighter.
- Career collapses to its one-line summary; full list in a popover on click (anchored away from the head).
- Origin line hidden (shown in the career popover).
- Expanded ability card drops its tag row (detail text stays).
- Mission cards keep number, label, one-liner; detail on hover.
- All headline answers still visible: name, class, pitch, rank, chips, 4 abilities with receipts, 4 missions with numbers, contact.

### 390x844 phone (designed to also fit ~390x664 with in-app browser chrome)
Single column, top to bottom:
1. Name (brush, 2 lines) + "Product Engineer" on the left, burst + head (~132px) on the right. Head never sits under text.
2. Pitch (2 lines).
3. Stat chips row.
4. Abilities: 4 chips in one row (`AI`, `3D`, `Full-stack`, `Lead`), selected ability's one-liner + receipt below (fixed 2-line height).
5. Missions: 2x2 tiles (number, label, name). Tap for a sheet with the one-liner + detail.
6. Career one-line summary (tap for sheet).
7. Contact bar pinned to the bottom: Email, LinkedIn, GitHub.

What collapses on phone: rank line moves into the Career sheet, ability detail and tags move out (one-liner + receipt only), mission one-liners move into sheets, career becomes one line, keyboard and drag hints are hidden.
If visible height is under ~700px: the stat chips row is dropped and "5 yrs XP" joins the class line (`Product Engineer, 5 yrs XP`).
Landscape phone (height under ~500px): two columns, identity + contact left, missions right, head shrinks to ~110px, abilities become chips only.

Every layout passes the 30-second test: who, role, level, proof numbers, shipped work and contact are all on the first frame without a single tap.
