# vietnamesesignage

A web app for recreating the visual language of classic Vietnamese street-vendor signage — bold typography, clashing saturated color, hard-edged drop shadows, and the slightly-crooked charm of a hand-mounted vinyl banner. Built as a reaction to AI-generated shop graphics losing that human, off-kilter quality.

## What's here right now

- **`index.html`** — a working prototype of the sign generator. Pick a shop category (khách sạn, quán cơm, hớt tóc, nail-spa, cầm đồ, karaoke, and more), hit the 🎲 button to shuffle in an authentic clashing color/type combo, and click any line of text to edit it directly. `🔤 Hệ font UTM` opens the type panel: pick the UTM face for each line, see which faces are running genuine vs. substituted, and load your own UTM files.
- **`js/utm-fonts.js`** — the UTM font system: 37 signage-relevant faces from the UTM pack, each mapped to its Western origin, the sign lines it suits, and a metric-tuned open substitute. Plus cap-height measurement, genuine-UTM pickup, and the drop-in loader.
- **`docs/utm-font-system.md`** — how that system works and the full face-by-face mapping table.
- **`docs/typography-sizing-research.md`** — research on the actual fonts used by Vietnamese sign shops (the UTM font pack and its licensing problems), legally-safe font substitutes with confirmed Vietnamese glyph support, and text-sizing ratios measured directly off real reference photos.

## Running it

No build step. Serve the folder with anything static:

```
python3 -m http.server 8000
```

(Serve rather than opening the file directly — the optional `fonts/manifest.json` loader needs `fetch`, and it degrades quietly over `file://`.)

## Typography

The signs are set in the **UTM pack** — the ~500-face collection every Vietnamese
sign shop actually uses. It is also legally unshippable: the faces are
unauthorized Vietnamese-diacritic grafts onto commercial typefaces. So the app
models the system without shipping the files:

- **37 signage-relevant UTM faces** are catalogued across nine groups (nén, sans đậm, hình học, chân dày, có chân, chữ khắc, viết tay, thư pháp, chữ vuông), each declaring which sign lines it suits.
- **Genuine UTM files are used when present.** `@font-face` rules are built from `local()` only, so a machine with the real fonts installed gets the real fonts. Nothing is downloaded and nothing is redistributed.
- **Otherwise a tuned open substitute stands in** — weight, variable width axis, tracking, slant and cap height all pushed toward the UTM face. All 24 substitutes were checked against the full 134-character Vietnamese repertoire; every stack ends in Be Vietnam Pro so per-glyph fallback can never drop a diacritic.
- **You can load your own UTM files** by dragging them onto the type panel, or via `fonts/manifest.json`. They stay in that browser and are never committed.
- **Text is sized by cap height, not font size** — measured live off whichever font actually resolved. That is how sign painters work, and it means swapping a face never moves the layout, so the ratios measured off the reference photos (1.00 / 0.93 / 0.70 / 0.58 for the Mười Em hotel sign) render literally.

See **`docs/utm-font-system.md`** for the full mapping.

## Design system, in short

- All-caps, extremely bold display type. One line (usually the business name) sometimes gets a script/cursive treatment instead of block caps — this varies by shop, not a fixed rule.
- Each line of information gets its own saturated color rather than relying on size alone for hierarchy: category, name, tagline, and price/contact each read differently.
- Hard-edged drop shadows and colored outlines only — no soft blur, no gradients (except karaoke signage, where a rainbow/chrome gradient name is authentically part of the vernacular, not an AI tell).
- There's no single "biggest = business name" rule. What gets the largest text depends on what's actually selling that business — service type for a barbershop, price for a budget motel, brand name for a beer garden. See the research doc for measured proportions.

## Roadmap

- ~~Extend each category preset with a `heroField`~~ — done: every category declares its own visual anchor and cap-height ratios, plus a line `order` where the name sits above the category (hớt tóc).
- ~~Source and embed the recommended open-source fonts~~ — done: 24 substitutes loaded from Google Fonts, all Vietnamese-complete.
- Chaos/randomize engine that deliberately mismatches category and template.
- Street-photo compositor: place the finished sign into a real street background (pole, leaves, motorbike blur).
- Real PNG/print export.
- Default the canvas to the real standee ratio (portrait 1:2–1:2.7) instead of the current board shape.
- Bilingual mode with the legally-mandated ¾-size rule for foreign-language text.

## License

**No UTM font files are in this repo, and none should be added.** They are
unauthorized derivatives of commercial typefaces and are not safe to
redistribute; `fonts/` is gitignored for that reason. The app speaks the whole
UTM vocabulary through `local()` pickup and user-supplied drop-ins instead. See
`docs/utm-font-system.md` and `docs/typography-sizing-research.md`.
