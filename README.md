# vietnamesesignage

A web app for recreating the visual language of classic Vietnamese street-vendor signage — bold typography, clashing saturated color, hard-edged drop shadows, and the slightly-crooked charm of a hand-mounted vinyl banner. Built as a reaction to AI-generated shop graphics losing that human, off-kilter quality.

## What's here right now

- **`index.html`** — a working prototype of the sign generator. Pick a shop category (khách sạn, quán cơm, hớt tóc, nail-spa, cầm đồ, karaoke, and more), hit the 🎲 button to shuffle in an authentic clashing color/type combo, and click any line of text to edit it directly.
- **`docs/typography-sizing-research.md`** — research on the actual fonts used by Vietnamese sign shops (the UTM font pack and its licensing problems), legally-safe font substitutes with confirmed Vietnamese glyph support, and text-sizing ratios measured directly off real reference photos.

## Running it

No build step — it's a single static HTML file. Open `index.html` in a browser, or serve the folder with anything static:

```
python3 -m http.server 8000
```

## Design system, in short

- All-caps, extremely bold display type. One line (usually the business name) sometimes gets a script/cursive treatment instead of block caps — this varies by shop, not a fixed rule.
- Each line of information gets its own saturated color rather than relying on size alone for hierarchy: category, name, tagline, and price/contact each read differently.
- Hard-edged drop shadows and colored outlines only — no soft blur, no gradients (except karaoke signage, where a rainbow/chrome gradient name is authentically part of the vernacular, not an AI tell).
- There's no single "biggest = business name" rule. What gets the largest text depends on what's actually selling that business — service type for a barbershop, price for a budget motel, brand name for a beer garden. See the research doc for measured proportions.

## Roadmap

- Extend each category preset with a `heroField` — which line renders as the visual anchor — instead of a fixed hierarchy.
- Chaos/randomize engine that deliberately mismatches category and template.
- Street-photo compositor: place the finished sign into a real street background (pole, leaves, motorbike blur).
- Real PNG/print export.
- Source and embed the recommended open-source fonts (Anton, Be Vietnam Pro, Yeseva One) instead of relying on system fonts.

## License

Font choices and licensing constraints are documented in `docs/typography-sizing-research.md` — worth reading before embedding any fonts sourced from Vietnamese print-shop font packs (most are unauthorized derivatives of commercial typefaces and aren't safe to redistribute).
