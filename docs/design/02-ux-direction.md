# 02 UX/UI Direction: "Hero Select: Kaushal"

Owner: Senior UX/UI Designer. Status: direction locked, ready to merge with the Game Designer interaction spec (01) and the Engineer performance plan (03) into the unified spec.

One sentence: a fighting-game character select screen where the character is Kaushal's head in a comic burst, and every word of proof (who, what he ships, where he worked) sits on solid paper or ink plates that read in under 30 seconds on a phone.

Readability beats style every time they conflict. Style lives in the frame (sky, burst, lightning, title offsets, hard shadows). Information lives on flat, high-contrast plates.

---

## 1. References (research)

Game UI

| # | Reference | URL | Pattern worth stealing |
|---|---|---|---|
| 1 | Persona 5 menus (Atlus CEDEC talk, via Siliconera) | https://www.siliconera.com/what-makes-the-ui-and-menus-in-persona-games-so-good/ | Strict 3-color system (red, black, white, no secondaries except HP/MP), and the info always sits on the white side. We copy this: ink + paper carry text, red/blue/cyan only decorate. |
| 2 | Hashino on P5 / Metaphor menus (Kotaku) | https://kotaku.com/metaphor-refantazio-persona-5-menu-ui-hashino-1851667088 | Director admits P5's angular menus were "impossible to read at first". Lesson: tilt the plate, never the paragraph. Only headings and plates rotate. |
| 3 | Persona 5 Tactica UI (Inverse) | https://inverse.com/gaming/persona-5-tactica-user-interface | Calmer baselines and a more readable text face kept the P5 energy while fixing legibility. Our split: wild display type, sober text face. |
| 4 | Persona 3 Reload UI (GamesRadar) | https://www.gamesradar.com/persona-3-reloads-ui-goes-hard-and-one-indie-dev-reckons-theyve-figured-out-why | Character art owns one side, menu owns the other, with zero overlap. Big motion, but text lands on solid fields. |
| 5 | VALORANT agent select / interface preview (Riot) | https://playvalorant.com/en-us/news/game-updates/preview-the-future-of-valorant-s-interface/ | Classic zoning: roster/ability row at the bottom, huge agent art in the middle, name + role + description on a dark solid plate to the side. Ability slots show key, icon and name together. |
| 6 | Marvel Rivals hero gallery (PC Gamer) | https://www.pcgamer.com/games/fps/marvel-rivals-hero-gallery-ui-used-to-look-a-lot-cooler-but-also-a-lot-harder-to-use | The cooler early concept lost to a plain grid because it was harder to use. Proof that every option must be visible at once (no wheels, no hidden scroll). |
| 7 | Marvel Rivals 2D/3D art style (PC Gamer) | https://www.pcgamer.com/games/third-person-shooter/marvel-rivals-heroes-leap-off-the-page-thanks-to-the-devs-meshing-2d-and-3d-together-to-make-the-eye-catching-art-style | 3D hero framed by flat comic graphics. Exactly our burst + 3D head combo: 2D frame, 3D star. |
| 8 | Street Fighter 6 select / challenger screen (Destructoid) | https://www.destructoid.com/street-fighter-6-new-challenger-screens-customizable-capcom/ | Graffiti energy in the backdrop, but the fighter name is a giant flat block of type on a solid band. Loud frame, quiet label. |
| 9 | Spider-Verse title sequence (Art of the Title) | https://artofthetitle.com/title/spider-man-into-the-spider-verse | Misregistered red/blue print offsets, halftone, hand-drawn type, animated "on twos". We use offsets and stepped timing for decoration only, never on body copy. |
| 10 | Spider-Verse CSS text styles (LogRocket) | https://dev.to/logrocket/5-ways-to-style-text-with-css-inspired-by-the-spider-verse-3ahk | Cheap, crisp offset-shadow title with plain `text-shadow` (no filters, no blur). That is our title recipe. |
| 11 | Hades art direction (Kotaku, Art of Hades) | https://kotaku.com/the-art-of-hades-1845420064 | Text-heavy game that stays readable: dialogue and boon text always on dark solid frames, ornate art pushed to the edges. |
| 12 | Hi-Fi Rush (Unreal developer interview) | https://www.unrealengine.com/en-US/developer-interviews/hi-fi-rush-was-inspired-by-shaun-of-the-dead-and-futurama | Thick outlines, cel shading, UI motion synced to a beat. Snappy, short, punchy transitions instead of long fades. |

Portfolios

| # | Reference | URL | Pattern worth stealing |
|---|---|---|---|
| 13 | Bruno Simon | https://bruno-simon.com | The gold standard of playful 3D, and content still lives in flat overlay panels opened from a clear icon menu. 3D for delight, 2D for reading. |
| 14 | Henry Heffernan | https://www.henryheffernan.com | 3D room, but the actual portfolio is a normal, legible flat UI on an in-world screen. The 3D never carries the text. |
| 15 | Jesse Zhou ("Jesse's Ramen") | https://jesse-zhou.com | One strong themed 3D object as the hero, a single obvious START control. One hero, one action. |
| 16 | Brittany Chiang | https://brittanychiang.com | The recruiter benchmark: name, role, one-line pitch, then experience entries as date + "Role at Company" + one paragraph. Our career card uses that exact anatomy. |

Takeaway applied below: (a) loud frame, quiet plates; (b) three fixed zones, art never under text; (c) all options and all proof visible at once; (d) offsets and stepped motion only on decoration.

---

## 2. Layout zoning

Rules for every breakpoint:

- `html, body { height: 100dvh; overflow: hidden; }`. The page never scrolls.
- The HERO ZONE is a hard rectangle. No DOM text, label, tooltip or chip may intersect it. The R3F canvas is sized to exactly this rectangle (not full screen). Dev build ships a debug overlay that draws the rect and warns in console if any text node's bounding box intersects it.
- The one allowed exception inside the hero zone is a decorative, `aria-hidden` tone-on-tone word (see 5.2). It is art, not content.
- Text may sit directly on the sky only inside the SKY-SAFE BAND (top 40% of viewport height). Everything below that is on a paper card or ink plate.
- When height is short, drop lines in priority order (section 2.5). Never shrink text below the minimums.

### 2.1 Desktop 1440 x 900 (32px outer margin, 24px gutter)

```
x:  32            464 488                  944 968             1408
y:24 +---------------+ +--------------------+ +-----------------+
     | L1 TITLE      | |                    | | R1 DETAIL PANEL |
     | L2 CLASS PLATE| |   HERO ZONE        | |  (selected      |
     | L3 PITCH(sky) | |   burst + 3D head  | |   ability)      |
 324 +---------------+ |   TEXT-FREE        | |                 |
     | L4 STATS      | |                    | +-----------------+ 400
 440 +---------------+ |                    | | R2 SHIPPED      |
     | L5 CAREER RUN | |                    | |  (always shown) |
     |               | +--------------------+-+-----------------+ 720
     |               | | B  ABILITY BAR (5 tiles)               | 744
 788 +---------------+ |                                        |
 804 | L6 CONTACT    | |                                        |
 868 +---------------+ +----------------------------------------+ 868
```

| Zone | Box (x, y, w, h) | Contents |
|---|---|---|
| L1 Title lockup | 32, 28, 432, 160 | "Kaushal / Panchal" brush, 2 lines, rotated -4deg, zap marks |
| L2 Class plate | 32, 196, 300, 40 | Ink plate "PRODUCT ENGINEER" + "LV 5" chip |
| L3 Pitch | 32, 248, 432, 56 | 2 lines, ink directly on sky (y 304 = 34% of 900, inside sky-safe band) |
| L4 Stats card | 32, 324, 432, 100 | 4 stats |
| L5 Career run card | 32, 440, 432, 348 | 3 roles, always visible |
| L6 Contact bar | 32, 804, 432, 64 | Email CTA + LinkedIn + GitHub + Resume |
| HERO ZONE | 488, 24, 456, 696 | Canvas + burst SVG. Text-free |
| R1 Detail panel | 968, 24, 440, 376 | Selected ability |
| R2 Shipped card | 968, 416, 440, 304 | 5 shipped things, always visible |
| B Ability bar | 488, 744, 920, 124 | 5 tiles at 168 x 124, gap 20 |

### 2.2 Desktop 1280 x 720 (24px margin, 16px gutter). Also used for any landscape viewport with height 640 to 799px.

| Zone | Box (x, y, w, h) | Notes |
|---|---|---|
| L1 Title | 24, 20, 400, 120 | Brush 64px |
| L2 Class plate | 24, 146, 280, 34 | |
| L3 Pitch | 24, 188, 400, 48 | 17/24, 2 lines; bottom 236 = 33% of 720 |
| L4 Stats | 24, 248, 400, 80 | |
| L5 Career run | 24, 340, 400, 280 | 3 entries x 80px; description clamped to 1 line |
| L6 Contact | 24, 636, 400, 60 | Buttons 52px tall |
| HERO ZONE | 440, 20, 400, 560 | Text-free |
| R1 Detail | 856, 20, 400, 292 | |
| R2 Shipped | 856, 328, 400, 252 | 5 rows x 40px + header |
| B Ability bar | 440, 596, 816, 100 | 5 tiles at 150 x 100, gap 16 |

Between 1280 and 1440 wide, interpolate column widths with `clamp()`; the 3-column structure is identical. Between 1024 and 1279 wide, the left and right columns shrink to min 360px and the hero zone absorbs the loss (min 320px wide).

### 2.3 Mobile 390 x 844 (16px margin). Design-checked at 390 x 664 (Safari with toolbars).

```
y  12 +----------------------------------+
      | M1 Title (1 line)        [mail]  |
      |    CLASS PLATE                   |
  104 +----------------------------------+
      | M2 HERO ZONE (text-free)         |  height clamp(150px, 30dvh, 260px)
  352 +----------------------------------+
  360 | M3 ABILITY BAR  [1][2][3][4][5]  |  76px
  436 +----------------------------------+
  448 | M4 INFO CARD                     |
      |  default = Player card           |
      |  (pitch, stats, career, contact) |
      |  ability selected = detail+proof |
  828 +----------------------------------+  bottom = 100dvh - 16px
```

| Zone | Box at 390x844 | At 390x664 |
|---|---|---|
| M1 Title + plate | 16, 12, 358, 84 (title 40px, plate 30px; mail icon button 44x44 at x 330) | same |
| M2 HERO ZONE | 16, 104, 358, 248 | 16, 104, 358, 160 |
| M3 Ability bar | 16, 360, 358, 76 (5 tiles 66 x 76, gap 7) | 16, 272, 358, 76 |
| M4 Info card | 16, 448, 358, 380 | 16, 360, 358, 288 |

Mobile rules:
- Proof is the DEFAULT. The info card opens as the Player card: pitch (2 lines), 4 stats, 3 career rows (role at company, years), 4 contact buttons. Selecting an ability swaps the card to that ability's detail and its proof (which shipped work, where). A 44x44 close button and tapping the selected tile again returns to the Player card.
- The info card may scroll internally only if its content overflows (tiny phones). It then shows a 24px paper-to-transparent fade at the bottom edge as a cue. The page itself never scrolls.
- Portrait tablets and anything under 1024 wide use this mobile stack with widths scaled up to max 560px, centred.
- Landscape phones (height under 500px): two columns, hero zone left 40%, ability bar + info card right 60%.

### 2.4 Background sky across zones

The sky gradient is fixed to the viewport height (not to content), so percentages map to the same pixels as the zone tables: at 900px tall the sky-safe band ends at y 360; at 720px at y 288. All L1 to L3 content ends above those lines.

### 2.5 Content drop order on short screens (never shrink type instead)

1. Career entry description lines (keep role, company, dates).
2. Pitch goes from 2 lines to 1 line (shorter variant supplied by copy).
3. Shipped row sublines (keep names).
4. Ability tile sublines (keep key, glyph, name).
5. Hero zone height shrinks to its minimum (desktop 360px, mobile 150px).

---

## 3. Typography

Google Fonts, `display=swap`, latin subset, preload the two above-the-fold files.

| Role | Family | Weights | Use |
|---|---|---|---|
| Brush | Kaushan Script | 400 | Title lockup only. Load with `&text=KaushalPnc` to ship only those glyphs (tiny file). |
| Display | Anton | 400 | Caps headings, class plate, stat numbers, ability name in detail panel. Never below 16px. |
| Text | Atkinson Hyperlegible Next (fallback: Atkinson Hyperlegible, then system-ui) | 400, 600, 800 | Everything else. Built for legibility: distinct I/l/1, open apertures. |

Type scale (desktop 1440 / 1280 / mobile 390):

| Token | Size | Family, weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| title | 84 / 64 / 40 | Kaushan 400 | 0.92 | 0 | Name |
| display-xl | 40 / 34 / 28 | Anton | 1.0 | 0.01em | Stat numbers, detail ability name |
| display-m | 22 / 20 / 16 | Anton | 1.1 | 0.04em | Class plate, card header tabs |
| body-l | 19 / 17 / 15 | Atkinson 600 | 1.45 | 0 | Pitch, detail tagline |
| body | 16 / 15 / 14 | Atkinson 400 | 1.45 | 0 | Bullets, career descriptions, shipped sublines |
| body-strong | 17 / 16 / 15 | Atkinson 800 | 1.3 | 0 | Role names, shipped names, ability tile names (mobile tile name: 12px label token) |
| label | 13 / 13 / 12 | Atkinson 800 | 1.3 | 0.02em | Dates, stat labels, chips, key caps |

Hard minimums: body 15px desktop, 14px mobile. Labels 12px. Display (Anton) 16px. Labels are sentence case. ALL CAPS is reserved for Anton at 16px or larger, max 3 words.

Title treatment (L1):
```css
.title {
  font: 400 var(--title-size)/0.92 "Kaushan Script", cursive;
  color: var(--ink);
  transform: rotate(-4deg);
  text-shadow:
    -0.05em 0.05em 0 var(--red),   /* red offset down-left */
     0.05em 0.04em 0 var(--blue);  /* blue offset down-right */
}
```
- Ink sits on top, so the glyph itself always has 15.8:1 against cream; offsets never exceed 0.06em so letter shapes stay crisp.
- Three small jagged "zap" marks (ink fill with a 3px red offset copy) sit outside the glyph bounding boxes, like the poster's ticks above the title. Decorative, `aria-hidden`.
- The title is the real `<h1>` text, not an image.

---

## 4. Color tokens and contrast

### 4.1 Tokens

| Token | Hex | Role |
|---|---|---|
| --sky-0 | #F7EDDC | Sky top, hazy cream (0%) |
| --sky-1 | #F0DCC6 | Warm haze (32%) |
| --sky-2 | #9C86E0 | Saturated lavender (50%). Chosen to avoid the old grey-mauve mud |
| --sky-3 | #3A2C8C | Indigo (66%) |
| --sky-4 | #15103A | Deep night violet (100%) |
| --ink | #14112B | Primary text, outlines, hard shadows |
| --ink-2 | #46405F | Secondary text on paper |
| --ink-muted | #C9C2EA | Secondary text on ink/violet plates |
| --paper | #FFF8EC | Card fill |
| --paper-2 | #F3E8D4 | Hover fill, highlighted rows |
| --plate | #241A5E | Violet plate (alt dark surface) |
| --red | #E8322E | Offset shadows, zap marks. Not a text color |
| --red-ink | #B81E1E | Red when used as text on paper |
| --blue | #4F6BFF | Offset shadows. Not a text color |
| --blue-ink | #2C3FCC | Blue when used as text/links on paper |
| --cyan | #3FE8FF | Lightning, primary CTA fill, focus halo |
| --a-ai | #3FE8FF | Ability accent 1 (AI systems) |
| --a-product | #FFB020 | Ability accent 2 (product) |
| --a-3d | #FF5FAE | Ability accent 3 (3D web) |
| --a-stack | #B6F23A | Ability accent 4 (full stack) |
| --a-lead | #FF7A45 | Ability accent 5 (leading and shipping) |

Ability names and count come from the Game Designer spec; the five accents map to the five resume skill groups by default and are reassigned in order if the list changes.

Gradient:
```css
background: linear-gradient(180deg,
  #F7EDDC 0%, #F0DCC6 32%, #9C86E0 50%, #3A2C8C 66%, #15103A 100%);
```
Interpolate in plain sRGB (the values in 4.2 were computed that way). The lavender stop keeps the crossover saturated instead of grey.

### 4.2 Contrast results (WCAG 2.x, computed by `scratchpad/contrast.mjs` and `scan.mjs`)

Text pairs we use:

| Pair | FG | BG | Ratio | Need | Result |
|---|---|---|---|---|---|
| Title ink on sky top | #14112B | #F7EDDC | 15.81 | 3.0 | PASS |
| Pitch ink on sky 32% | #14112B | #F0DCC6 | 13.76 | 4.5 | PASS |
| Ink on sky 36% | #14112B | #DDC9CC | 11.62 | 4.5 | PASS |
| Ink on sky 40% (sky-safe limit) | #14112B | #CBB6D2 | 9.75 | 4.5 | PASS |
| ink-2 on sky 32% | #46405F | #F0DCC6 | 7.30 | 4.5 | PASS |
| Ink on paper | #14112B | #FFF8EC | 17.37 | 4.5 | PASS |
| Ink on paper-2 | #14112B | #F3E8D4 | 15.12 | 4.5 | PASS |
| ink-2 on paper | #46405F | #FFF8EC | 9.21 | 4.5 | PASS |
| ink-2 on paper-2 | #46405F | #F3E8D4 | 8.01 | 4.5 | PASS |
| red-ink on paper | #B81E1E | #FFF8EC | 6.13 | 4.5 | PASS |
| blue-ink on paper | #2C3FCC | #FFF8EC | 7.39 | 4.5 | PASS |
| Paper on ink plate | #FFF8EC | #14112B | 17.37 | 4.5 | PASS |
| Paper on violet plate | #FFF8EC | #241A5E | 14.37 | 4.5 | PASS |
| ink-muted on ink | #C9C2EA | #14112B | 10.82 | 4.5 | PASS |
| ink-muted on violet plate | #C9C2EA | #241A5E | 8.95 | 4.5 | PASS |
| Cyan text on ink | #3FE8FF | #14112B | 12.40 | 4.5 | PASS |
| Cyan text on violet plate | #3FE8FF | #241A5E | 10.26 | 4.5 | PASS |
| Amber on ink | #FFB020 | #14112B | 10.03 | 4.5 | PASS |
| Pink on ink | #FF5FAE | #14112B | 6.55 | 4.5 | PASS |
| Lime on ink | #B6F23A | #14112B | 13.76 | 4.5 | PASS |
| Orange on ink | #FF7A45 | #14112B | 7.09 | 4.5 | PASS |
| Ink on cyan (CTA, chips) | #14112B | #3FE8FF | 12.40 | 4.5 | PASS |
| Ink on amber | #14112B | #FFB020 | 10.03 | 4.5 | PASS |
| Ink on pink | #14112B | #FF5FAE | 6.55 | 4.5 | PASS |
| Ink on lime | #14112B | #B6F23A | 13.76 | 4.5 | PASS |
| Ink on orange | #14112B | #FF7A45 | 7.09 | 4.5 | PASS |
| Paper on red-ink | #FFF8EC | #B81E1E | 6.13 | 4.5 | PASS |
| Paper on sky-3 / sky-4 | #FFF8EC | #3A2C8C / #15103A | 10.37 / 17.04 | 4.5 | PASS (allowed, but we still use plates) |

Non-text (UI components, 3:1):

| Pair | Ratio | Result | Consequence |
|---|---|---|---|
| Ink border vs paper | 17.37 | PASS | Every card and tile gets a 3px ink border |
| Ink border vs sky-1 | 13.76 | PASS | |
| Paper card vs sky-3 | 10.37 | PASS | |
| Paper card vs sky-2 | 2.88 | FAIL | Card edges are defined by the ink border, not the fill |
| Cyan halo vs sky-4 | 12.17 | PASS | |
| Cyan halo vs sky-0 | 1.27 | FAIL | Focus ring is ink inner ring + cyan outer halo, so one always passes |
| Cyan / amber fill vs paper | 1.40 / 1.73 | FAIL | Accent shapes on paper always carry a 2px ink stroke |

Rejected pairs (documented so nobody reintroduces them):

| Pair | Ratio | Why rejected |
|---|---|---|
| Ink on red #E8322E | 4.30 | Fails body. Red is never a button fill with text |
| Paper on red #E8322E | 4.04 | Fails body |
| Paper on blue #4F6BFF / ink on blue | 4.08 / 4.26 | Fails body. Blue is shadow-only |
| Paper on sky-2 (50%) | 2.88 | The dead band |
| Ink on sky 56% / paper on sky 54% | 3.82 / 3.85 | The dead band |

### 4.3 The readability rule

1. Text sits on exactly one of: paper card, ink plate, violet plate, accent chip (ink text), or the sky-safe band (top 40% of viewport, ink text only).
2. Nothing textual between 40% and 66% of viewport height unless it is on a plate. The crossover band (roughly 50% to 58%) fails for both ink and paper, so it is reserved for the hero burst and the decorative word.
3. No blur, no translucency on text surfaces. Card fills are 100% opaque. No `backdrop-filter` anywhere.
4. Film grain and halftone live under the cards, never above text.
5. Accent colors are text only on ink or violet plates. On paper, accents are fills with ink text or stripes with an ink stroke.
6. Unselected content is never dimmed below its normal color. Selection adds emphasis to related items; it never removes contrast from the rest.

---

## 5. Component specs

Shared surface recipe ("panel"): `--paper` fill, 3px `--ink` border, 2px radius, hard shadow `6px 6px 0 var(--ink)`, 20px padding desktop, 16px mobile. Header tab: an `--ink` plate glued to the top-left edge, Anton display-m in paper, rotated -2deg (the only rotated element in a panel). Body text inside panels never rotates.

### 5.1 Title lockup (L1 + L2 + L3)
- L1 as section 3.
- L2 class plate: ink plate, Anton 22px "PRODUCT ENGINEER" in paper, padding 8x14, rotated -2deg, red hard shadow `-4px 4px 0`. Right of it a cyan chip "LV 5" (Anton 18px ink on cyan, 2px ink stroke) with `aria-label="5 years of experience"`.
- L3 pitch: body-l, ink, max 2 lines, max 90 characters. Example: "I build AI products that actually ship. Multi-agent LLMs, real-time 3D, the whole stack."
- No states (static).

### 5.2 Comic burst panel around the hero (HERO ZONE)
- One inline SVG, viewBox matching the hero zone aspect. A 14-spike irregular star polygon inset 16px from the zone edges, spikes uneven (like the poster).
- Layer order, back to front:
  1. Red copy of the burst path, offset (-8px, +8px), fill `--red`.
  2. Blue copy, offset (+8px, +6px), fill `--blue`.
  3. Main burst: fill vertical gradient #2A1F8F to #5B4BD6, 6px `--ink` stroke, `stroke-linejoin: miter`.
  4. Halftone dot pattern inside the burst (SVG `<pattern>`, 6px dots, white at 10% opacity), clipped to the burst.
  5. The R3F canvas (transparent) over the whole hero zone. The head may break the top edge of the burst by up to 15% of its height (the Miles "breaking the frame" moment). It never leaves the hero zone.
  6. Three cyan lightning bolts (SVG, cyan fill, 3px ink stroke so they read on cream and on indigo) anchored at three spikes, plus two ink zap ticks with red offset.
- Decorative tone-on-tone word: "SHIP IT." in Anton, about 1.3x hero-zone width, color #221A55 on the dark sky (1.15:1, intentionally invisible as text), sitting behind the burst's lower third. `aria-hidden="true"`. Hidden on mobile.
- States: default (static); ability selected: the burst stroke and bolt fills flash to the ability accent for 2 frames, then bolts stay in the ability accent; reduced motion: color change only, no flash.

### 5.3 Ability selection UI (B / M3)
Semantics: `role="tablist"` (`aria-label="Abilities"`), each tile `role="tab"` with `aria-controls` pointing at the detail panel. Arrow keys move, Home/End jump, number keys 1 to 5 select from anywhere. One tile is always selected on desktop (the first, on load) so the detail panel is never empty. On mobile none is selected on load (Player card shows).

Tile anatomy, desktop 168 x 124 (1280: 150 x 100; mobile 66 x 76):
- Top-left key cap: 28x28 ink square, label token in paper ("1" to "5").
- Top-right: 32px ability glyph (simple bold SVG, ink, 2.5px stroke).
- Name: body-strong, 1 line, max 14 characters (mobile shows a short name, max 8 characters, at label 12px).
- Subline: label 13px ink-2, 1 line, max 24 characters (hidden at 1280 if height < 680, hidden on mobile).
- Bottom accent stripe: 6px, ability accent, with a 2px ink top edge.

| State | Visual |
|---|---|
| Default | Paper fill, 3px ink border, `4px 4px 0 ink` shadow |
| Hover | `translateY(-3px)`, accent stripe grows to 12px, cursor pointer |
| Pressed | `translate(2px, 2px)`, shadow reads as 2px (hard shadow drawn by a pseudo-element so we move it with transform, not animate box-shadow) |
| Selected | Ink fill, paper name, ink-muted subline, key cap inverted (paper with ink digit), full-height 8px accent bar on the left, double offset shadow `-6px 6px 0 red, 6px 6px 0 blue`, `translateY(-6px)`, `aria-selected="true"` |
| Focus-visible | 3px ink outline at 3px offset plus a 3px cyan halo outside it (`box-shadow: 0 0 0 9px cyan` on a pseudo-element). Visible on paper and on night sky |
| Selected + focus | Selected visuals plus the same focus ring |

### 5.4 Detail panel (R1 / M4 in ability mode)
`role="tabpanel"`, `aria-live` off (tab semantics already announce).
- Header band, full panel width, 64px tall (mobile 48px): fill = ability accent, ability name in Anton display-xl ink, key cap on the right. Ink text on every accent passes (6.55:1 minimum).
- Tagline: body-l, ink, 1 sentence, max 70 characters. Example: "Turns a plain-English brief into a playable VR lesson."
- Proof bullets: 3 max, body, each starts with a bold outcome. Max 90 characters each. Custom bullet = 8px accent square with 2px ink stroke.
- "Seen in" row: up to 3 chips naming shipped items (label 13px ink on paper-2, 2px ink border). Clicking a chip pulses the matching row in R2 (desktop) or is plain text on mobile.
- Gear line: label 13px ink-2, comma-separated tools, max 6.
- Content budget is a hard cap. If copy does not fit, cut copy, not font size.
- States: content swap animation only (section 6). No hover states inside except chips (hover: paper fill, underline; focus-visible: same ring as tiles).

### 5.5 Experience: Career run (L5 / mobile Player card)
Always visible. Header tab "CAREER RUN".

Entry anatomy (Brittany Chiang pattern):
- Line 1: role, body-strong ink. Current role gets a "Now" chip (label 12px ink on cyan, 2px ink stroke).
- Line 2: company and dates, label 13px ink-2, e.g. "AutoVRse, Bangalore. 2023 to now".
- Line 3: one-line description, body, ink, clamped to 1 line (dropped first on short screens).
- 1px ink-2 divider between entries.

Entries (from resume): Lead Engineer, AI Products at AutoVRse (03/2023 to now); Software Developer at Mulya (04/2022 to 03/2023); SDE Intern at Flipstack Technologies (07/2021 to 04/2022).

| State | Visual |
|---|---|
| Default | As above |
| Related to selected ability | paper-2 row fill, 6px accent bar on the left edge with 2px ink stroke. Text unchanged |
| Hover / focus | Entries are not interactive (no hover). If a company link is added later, use link styling: blue-ink, 2px underline, focus ring as tiles |

Mobile compact row: "Lead Engineer, AI Products" (body-strong 15px) and "AutoVRse. 2023 to now" (label 12px) on one row pair, no description.

### 5.6 Shipped work (R2 / mobile Player card top item + detail chips)
Always visible on desktop. Header tab "SHIPPED".
Rows (5, from resume): VrseBuilder Studio; Conversational edit agent (inside VrseBuilder); Pulse partner analytics; Amazon warehouse safety training on Meta Quest; 3D web SDK and panorama tour tool. Mulya remittance platform is the swap-in if the Game Designer prefers it over the SDK.

Row anatomy (44px desktop, 40px at 1280):
- Name: body-strong ink. Subline: body ink-2, 1 line, max 48 characters ("AI that builds full VR lessons from a brief").
- Right edge: up to 3 accent dots (10px, 2px ink stroke) for related abilities, with visually hidden text "Uses: AI systems, Product".
- If a public URL exists, the whole row is a link with an arrow glyph and gets hover: paper-2 fill, name underline; focus-visible: the standard ring. If no URL, the row is static. Never invent links.

| State | Visual |
|---|---|
| Related to selected ability | paper-2 fill, 6px accent left bar, name stays ink |
| Pulsed from a detail chip | Accent left bar scales from 6px to 14px and back, 2 frames each |

### 5.7 Stats (L4 / mobile Player card)
Panel without header tab, 4 equal cells divided by 2px ink rules.
- Number: Anton display-xl ink. Label: label 13px ink-2, sentence case, max 2 lines, max 22 characters.
- Stats (resume facts only): "5 yrs" building products; "20+" AI workers running in parallel; "3" Fortune 500 on-prem rollouts; "$1M" moved through Mulya. Alternate: "5-6" engineers led.
- No interaction states. Numbers do not count up on load (instant readability).

### 5.8 Contact (L6 / mobile Player card footer + M1 mail button)
- Primary CTA "Email me": cyan fill, ink text body-strong, 3px ink border, double offset shadow (`-5px 5px 0 red, 5px 5px 0 blue`). Desktop 136 x 56, 1280 124 x 52, mobile 100% width minus icons, 48px tall.
- Secondary buttons: "LinkedIn", "GitHub", "Resume" as text buttons, paper fill, 3px ink border, ink body-strong 15px, 88 x 56 desktop, 82 x 52 at 1280. Mobile: 44 x 44 icon buttons with a 12px text label below.
- "Resume" ships only if the PDF exists in `public/`; otherwise drop it.
- States: hover `translateY(-2px)` and shadow block moves out 2px; pressed `translate(2px,2px)`; focus-visible standard ring; visited unchanged.
- Hit targets: 44 x 44 minimum everywhere, including mobile tiles (66 x 76).

---

## 6. Motion

Tokens:
```
--ease-out:  cubic-bezier(.2, .8, .2, 1)
--ease-pop:  cubic-bezier(.34, 1.56, .64, 1)   /* small overshoot */
--twos:      steps(2, end)                       /* "on twos" for decoration */
--t-press:   90ms
--t-ui:      160ms
--t-swap:    180ms
```
Only `transform` and `opacity` animate. No animated `box-shadow`, `filter`, `width/height`, or gradients. Hard shadows are pseudo-elements moved with transform.

Intro (first visit, total under 900ms, text readable from first paint):
| Time | What | How |
|---|---|---|
| 0ms | Sky, cards, all text | Painted immediately. Text is never hidden for the intro (also protects LCP) |
| 0 to 240ms | Title offsets | Red/blue shadows slide from 0 to final offset; title scales 1.04 to 1 |
| 0 to 380ms | Burst | scale 0.85 to 1, `--ease-pop`; bolts flash 2 frames at 300ms |
| 120 to 700ms | Head entrance | Owned by Game Designer spec; must stay inside the hero zone |
| 200 to 440ms | Ability tiles | translateY 12px to 0, opacity 0 to 1, 40ms stagger |

Selection:
| Element | Animation |
|---|---|
| Tile press | 90ms translate to pressed |
| Tile select | 160ms `--ease-out` lift to -6px, offset shadows slide out |
| Detail panel swap | Old content opacity to 0 in 80ms; header band wipes in (`scaleX` 0 to 1 from left, 180ms); new content translateX 12px to 0 + opacity, 180ms `--ease-out` |
| Related rows in Career/Shipped | Accent bar `scaleX` 0 to 1, 160ms, 30ms stagger |
| Burst | Stroke/bolt color flash 2 frames (`--twos`), then hold accent |

Idle decoration (desktop high tier only):
- Lightning flicker: a bolt goes to opacity 0.3 for 2 frames at random 3 to 5s intervals.
- Line boil: 3 pre-drawn burst path variants swapped at 8fps for 600ms after each selection, then stop. Never continuous.
- Film grain: one static 128px PNG tile at 6% opacity on the sky layer only. Not animated, no blend mode.

Reduced motion (`prefers-reduced-motion: reduce`):
- Intro skipped; everything is in its final state on first paint.
- Selection: instant state changes; detail content uses an opacity crossfade of 120ms max, no translate.
- No flicker, no boil, no burst flash, no tile lift (selected state is shown by color, bar and shadows only).
- Head: static three-quarter pose, no idle sway, no pointer follow (Game Designer and Engineer to honour).

`prefers-contrast: more`: remove grain, halftone and the decorative word; offsets stay (they are outside glyphs).

---

## 7. Do / Don't

Do
- Put every piece of information on a solid paper or ink plate, or in the top 40% sky band in ink.
- Keep the hero zone a hard, text-free rectangle; size the canvas to it.
- Show all abilities, all three jobs, and the shipped list at the same time on desktop.
- Make the Player card (proof) the default on mobile.
- Use 3px ink borders and hard offset shadows to separate surfaces.
- Use red/blue offsets on the title, the burst, the CTA and the selected tile only.
- Cut copy to fit the budgets; keep text at or above the minimum sizes.
- Use sentence case for labels; caps only for Anton at 16px+.
- Animate transform and opacity only; keep UI transitions under 200ms.
- Write copy that is short, casual and punchy, with no em-dashes. Use periods, commas or "to" for ranges ("2023 to now").

Don't
- Don't place any text, label, tooltip or chip over the 3D head or inside the hero zone.
- Don't put text on the 40% to 66% sky band without a plate. That band fails for both ink and paper at its centre.
- Don't use `backdrop-filter`, blur, or semi-transparent card fills.
- Don't use red or blue as button fills behind text, or accent colors as text on paper.
- Don't add orbiting 3D nodes, floating labels in 3D space, or a second 3D model.
- Don't hide experience or shipped work behind tabs, accordions or hover.
- Don't use 10 to 11px uppercase micro-labels.
- Don't rotate or skew paragraphs; only plates and headings tilt.
- Don't dim unselected content to show selection.
- Don't count up numbers, typewriter text, or delay any text for an intro.
- Don't animate grain, gradients or full-screen layers.
