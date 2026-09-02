# vietnamesesignage

A web app for recreating the visual language of classic Vietnamese street-vendor signage — bold typography, clashing saturated color, hard-edged drop shadows, and the slightly-crooked charm of a hand-mounted vinyl banner. Built as a reaction to AI-generated shop graphics losing that human, off-kilter quality.

## What's here right now

**A wall of signs that fills the whole screen.** Open it and you get a mosaic of
Vietnamese shopfront signs — twenty trades, each with its own type recipe,
palette convention and copy — packed edge to edge with no gaps and no page
scroll. Every seam between two signs is draggable: pull one and it takes space
from its neighbour, that sign's typography re-sizes to its new box, and nothing
else on the wall moves. Resize the window and the whole board re-proportions.

**Two eras, one wall.** The default theme is **SÀI GÒN 1985**, set in Thái
Hiếu's ten faces traced off surviving Saigon shopfronts, on the green painted
board of the reference sheet: signs hang as white-matted photographs with
painted keylines, in enamel inks sampled from the originals — the oxide red and
navy of HIỀN KHÁNH, the works blue of CHỈ SƠN, the maroon and gold of HỒNG KÝ.
Press the era button (or `T`) and the same wall — same layout, same shops, same
words, every hand edit intact — is re-lettered as **PHỐ 2010**: today's
neon vinyl in the UTM system, with its own grammar: per-line ink rotation,
keylines on everything, a flat hierarchy and name banners. A sign keeps its
colour *intent* across the switch, so the wall's rhythm survives while its
century changes.

- **`index.html`** — the wall, the dock and the font drawer.
- **`plaza.js`** — the shop catalogue, both palette sets, the theme system, the split-tree layout engine, seam dragging, and the per-cell type fitter.
- **`js/sg85-fonts.js`** — the Sài Gòn 1985 type system: the ten faces, which sign line each one suits, and a type recipe per trade. Exposes the same surface as the UTM module, which is how the wall swaps eras without knowing anything about either.
- **`plaza.css`** — the sign chrome (vinyl texture, footer strip, hard shadows) and the app chrome.
- **`js/utm-fonts.js`** — the UTM font system: 37 signage-relevant faces from the UTM pack, each mapped to its Western origin, the sign lines it suits, and a metric-tuned open substitute. Plus cap-height measurement, genuine-UTM pickup, and the drop-in loader.
- **`docs/utm-font-system.md`** — how that system works and the full face-by-face mapping table.
- **`docs/typography-sizing-research.md`** — research on the actual fonts used by Vietnamese sign shops, legally-safe substitutes with confirmed Vietnamese glyph support, and text-sizing ratios measured off real reference photos.

## Using the wall

| | |
|---|---|
| **Drag any seam** | Resize two neighbouring signs. Double-click a seam to split it evenly. |
| **Click any line of text** | Edit it in place; the sign re-fits as you type. |
| **Hover a sign** | Four tools appear: 🎲 new business, ⬍ / ⬌ split this sign in two, ✕ take it down. |
| **🎲 XÁO PHỐ** | Re-deal every shop on the wall. |
| **＋ THÊM BẢNG** | Split the largest sign to hang one more. |
| **▦ BỐ CỤC MỚI** | Generate a fresh mosaic. |
| **⏳ 1985 / 2010** | Switch era. Layout, shops and edits all survive. |
| **🖼 XUẤT PNG / ✎ XUẤT SVG** | Export the selected sign, or the whole wall when nothing is selected. |
| **🔤 FONT** | Open the type drawer for the selected sign. |
| **👁 ẨN** | Hide the chrome for a clean screenshot. |

Keyboard: `R` reshuffle, `A` add, `N` new layout, `T` era, `F` fonts, `H` hide chrome, `Esc` deselect, `Ctrl+Z` / `Ctrl+Y` undo and redo.

The dock is grouped by what each button touches: what is on the wall, how it is
arranged, undoing it, taking it away, and the app itself.

**Export** writes from primitives rather than screenshotting the page. PNG paints
onto a canvas with the faces already loaded; SVG writes real `<rect>` and
`<text>` and embeds the faces it used as base64, so the file opens correctly on
a machine that has never had UTM installed — and stays editable as vectors. Both
export the selected sign alone, or the whole wall when nothing is selected. The
vinyl texture overlay is deliberately left out of both; it is a screen effect,
not something you want baked into a file you are going to print or edit.

## How the board works

**Layout is a split tree.** A node is either a sign or a container of children
stacked in a row or a column, and each child's `size` is used directly as
`flex-grow`. Children therefore always consume exactly the space their container
has — the wall is full *by construction*, at any viewport and at every moment
during a drag. Dragging a seam redistributes the combined `flex-grow` of just
the two signs it separates, so the rest of the wall cannot shift. A window
resize changes no `size` at all; the board simply re-proportions.

**Type is fitted per cell, not per page.** Cells range from a business card to
half the screen, so nothing can be sized in `rem`. Each sign is laid out at a
probe cap-height, measured, then scaled by the single ratio that makes the block
fit its box — cap-height sizing is linear, so one pass is exact. Reads and
writes are batched across all signs, so a drag costs two layout flushes for the
whole wall rather than two per sign.

**Small signs say less.** Rather than shrinking four lines into illegibility, a
cell drops to its hero line and its supporting line as it gets smaller, hides
the footer strip, and finally goes to bare painted board — the way a real sign
reads from across the street. Nothing is ever turned on its side: a sign you
have to tilt your head for is a failed sign, so the mosaic generator only
accepts a split when both halves stay inside a 0.62–2.3 aspect band, and a cell
that still ends up too narrow to letter goes to bare painted board rather than
type too small to read.

## What the painted boards actually do

The 1985 theme is built from rules read off photographs of surviving boards —
Tiệm Sắt Vĩnh Tường, Tuyết Phấn in Hội An, Tiệm Cà Phê Năm Liệu, Mỹ Tiên
Photocopy, Tổng Đại Lý Vé Số, Kim Hưng, Lư Đồng, Nhà May Quỳnh Tiên, Rửa Xe,
Barber Shop Xuân Hương. Four rules carry almost all of the look.

**Every line is justified to the board.** A painter had one measure — the plank
— and made each line span it. Tuyết Phấn's two service lines are 25 and 38
characters and end flush with each other, so the longer one is simply painted
smaller. This is the single strongest signal, and it is why these boards look
built rather than typeset.

**So tracking runs backwards from print convention.** Size is chosen first, per
line, from the character count; tracking only closes the gap that is left. The
big name ends up tight enough to touch (Vĩnh Tường, Lư Đồng, Tổng Đại Lý), the
short service line ends up wide open — the opposite of the "tighten as it gets
bigger" rule. The app clamps that spread at 0.16 em: past it a line stops
reading as a word, so it sits short and centred instead, exactly as the small
lines on Rửa Xe and Xuân Hương do.

**Scripts are never tracked.** Năm Liệu, Quỳnh Tiên and Xuân Hương are joined
brush letters — opening them would break the strokes. They reach the measure by
being drawn *bigger*, so the app scales script lines to fill instead of
tracking them.

**Hierarchy is a ratio, not a nudge.** The hero runs 2–3× its neighbours, never
1.1×, and it takes all the decoration while everything else stays flat: a hard
slab stepped down-right in a *contrasting* colour — pink under red on Vĩnh
Tường, mint under red on Rửa Xe, bottle green under red on Mỹ Tiên, pale blue
under rust on Tuyết Phấn — with a keyline round the letter. Never a blur; this
is paint, not light. In the app the hero's ceiling is the only one released:
supporting lines take the smaller of their own fill size and their recipe share
of the hero, which is what keeps a short tagline from swelling to match a short
name.

Leading follows from the same logic — the stack is tight, and slack goes into
the leading only up to about a fifth of the hero's size before the block simply
centres in its board.

The palette is sampled straight from those photographs: sky blue and bottle
green from Vĩnh Tường, aged cream and rust from Tuyết Phấn, cobalt from Năm
Liệu, the orange band from Tổng Đại Lý, mint and oxide red from Rửa Xe. Bright
pigment colours that have had a few years of sun on them, rather than either
neon or mud.

## What the printed standees do instead

The modern theme is read off a second set of photographs — the A-frame standees
outside nail shops, phone repairs and cơm tấm counters: Lan Anh Móng Nail, Đồ Si
Trẻ Em Thủy, Cơm Tấm Sườn Que, Ngọc Sang, Khánh Hoạ, Ka Long, Bãi Giữ Xe and the
LED light-boxes. They share the painted boards' justification and almost nothing
else, which is what makes the era switch worth having.

**Colour rotates per line.** A painted board keeps a disciplined two or three
inks; a printed standee gives every line its own and cycles a hot set down the
board — Khánh Hoạ runs red, blue, green, orange; the LED boxes run white, green,
yellow, red. Each sign starts at a different point in the cycle, so no two
neighbours repeat a run.

**Hierarchy is flat.** Cơm Tấm Sườn Que paints all four words at one size. Where
1985 runs the hero at 2–3× its neighbours, these run 1.0 / 0.93 / 0.70 — which
is exactly what the UTM system's measured ratios already said, so the two eras
diverge from their own recipes rather than from a switch.

**Everything is outlined.** On vinyl a keyline costs nothing, so shops put one
on every line, often doubled — Ngọc Sang is a red fill inside a blue keyline
inside a white one. That is also what makes the clashing colours legible, so the
app derives each keyline from its own ink rather than fixing it per palette: a
pale ink takes a dark edge, a dark ink a light one, and it reads on any board it
lands on. Joined scripts get a hairline instead — a keyline sized for block caps
is thicker than the thin part of a brush letter and swallows it whole — and are
held to a higher contrast bar against the board to make up for it.

**The shop name can sit in a solid banner** across the top (Ka Long's navy block,
Quán Nhậu's red one), and there is always a contact band at the foot.

Palettes are the hot pairs these shops actually buy: red on yellow, gold on red,
gold on cobalt, white on signal green, and black boards with bulb colours. There
is deliberately **no purple** in the modern set — nobody prints a purple standee.
An era need not stock every colour: when a trade asks for a family this era does
not carry, it falls back to the other families that trade already declared
before touching the rest of the rack, so the sign keeps its character. (1985
keeps its grape-and-gold, which is a different century's taste.)

Every board also carries at least one dark ink and one light one, because the
keyline can rescue a clashing pair but nothing rescues a thin script painted in
a colour its board already is.

## Running it

No build step. Serve the folder with anything static:

```bash
python -m http.server 8123
```

(`python3` on macOS/Linux. Serve rather than opening the file directly — the
optional `fonts/manifest.json` loader needs `fetch`, and it degrades quietly
over `file://`.)

## Typography

### Sài Gòn 1985 — real faces

The 1985 theme is set in **10 Font Sài Gòn Xưa** by **Thái Hiếu**
(fontzin.com · fb.com/thaihieufz), each face traced off a surviving shopfront:
CHỈ SƠN, HIỀN KHÁNH (three weights), HỒNG KÝ (two), PHÁT TÀI, CỬA HÀNG 99 and
the *Sàigòn 1985* brush logotype, which the app uses for its own wordmark. The
designer released them free for any use including commercial, resale forbidden.

All ten carry the complete 134-character Vietnamese repertoire as real accented
glyphs — checked against the font tables, not assumed — so no line can lose a
dấu. Faces are assigned by measured width: the average cap advance ranges from
0.30 em (Cửa Hàng, the address lines) to 0.85 em (Phát Tài, the shout), and
every recipe pairs one wide face for the name with a narrow one for the detail.

The ten files live in `fonts/saigon1985/` and are committed, so a fresh clone
letters this era with no setup and the drawer reports `10/10`.

### Phố 2010 — the UTM system

Today's theme is set in the **UTM pack** — the ~500-face collection every Vietnamese
sign shop actually uses. It is also legally unshippable: the faces are
unauthorized Vietnamese-diacritic grafts onto commercial typefaces. So the app
models the system without shipping the files:

- **37 signage-relevant UTM faces** are catalogued across nine groups (nén, sans đậm, hình học, chân dày, có chân, chữ khắc, viết tay, thư pháp, chữ vuông), each declaring which sign lines it suits.
- **Genuine UTM files are used when present.** `@font-face` rules are built from `local()` only, so a machine with the real fonts installed gets the real fonts. Nothing is downloaded and nothing is redistributed.
- **Otherwise a tuned open substitute stands in** — weight, variable width axis, tracking and cap height all pushed toward the UTM face. All 24 substitutes were checked against the full 134-character Vietnamese repertoire; every stack ends in Be Vietnam Pro so per-glyph fallback can never drop a diacritic.
- **The pack is in `fonts/`**, loaded through `fonts/manifest.json`, so the drawer reports 32 of 37 faces running genuine UTM. You can still drop further files onto the font drawer at runtime; those stay in that browser only.
- **Text is sized by cap height, not font size** — measured live off whichever font actually resolved. That is how sign painters work, and it means swapping a face never moves the layout, so the ratios measured off the reference photos (1.00 / 0.93 / 0.70 / 0.58 for the Mười Em hotel sign) render literally.

See **`docs/utm-font-system.md`** for the full mapping.

## Design system, in short

- All-caps, extremely bold display type. One line (usually the business name) sometimes gets a script/cursive treatment instead of block caps — this varies by shop, not a fixed rule.
- Each line of information gets its own saturated color rather than relying on size alone for hierarchy: category, name, tagline, and price/contact each read differently.
- Hard-edged drop shadows and colored outlines only — no soft blur, no gradients (except karaoke signage, where a rainbow/chrome gradient name is authentically part of the vernacular, not an AI tell).
- There's no single "biggest = business name" rule. What gets the largest text depends on what's actually selling that business — service type for a barbershop, price for a budget motel, brand name for a beer garden. Each category declares its own `hero` line and cap-height ratios.
- Shops are dealt from a shuffled deck and palettes never repeat their colour family back-to-back, so a wall reads like a street rather than a swatch library.
- Nothing is set at an angle. Signs hang square and lines sit upright: no board rotation, and no synthetic oblique, which skews an upright letterform rather than italicising it. A face is slanted only if it was drawn that way.
- Faces are ranked by how often Vietnamese sign shops actually reach for them, and dealt 6:3:1 by rank, so a wall is carried by the everyday faces rather than the specimen book. Text faces — Georgia, Nyala, Times — are barred from display lines entirely; they are book faces and fall apart at sign size.

## Roadmap

- ~~Extend each category preset with a `heroField`~~ — done.
- ~~Source and embed the recommended open-source fonts~~ — done: 24 substitutes loaded from Google Fonts, all Vietnamese-complete.
- ~~Chaos/randomize engine~~ — done: one shop in five gets a palette from outside its own convention.
- ~~A Sài Gòn 1985 version~~ — done: second theme, second type system, second palette set.
- Asymmetric board layouts: the left info block beside a giant name (Vĩnh Tường), the roundel-and-panel (Năm Liệu), the address-left / phone-right row (Tổng Đại Lý, Kim Hưng). The type engine is ready for them; only the sign template is centred today.
- A third era: the French-colonial enamel plates of the 1930s.
- Remember the wall between visits (layout + edits in `localStorage`), with a reset.
- Export the wall as a PNG, and a single sign at print size.
- Street-photo compositor: place a finished sign into a real street background (pole, leaves, motorbike blur).
- Bilingual mode with the legally-mandated ¾-size rule for foreign-language text.

## License

Two font sets ship here, and they do not stand on the same footing.

**Sài Gòn 1985** (`fonts/saigon1985/`) is Thái Hiếu's *10 Font Sài Gòn Xưa*,
released free for any use including commercial, resale forbidden. Keep the
attribution; do not sell it on.

**The UTM pack** (`fonts/*.ttf`) is included at the repository owner's
decision. Be clear about what it is: the UTM faces are unauthorized
Vietnamese-diacritic grafts onto commercial typefaces — the filenames name the
originals outright — and no licence accompanies them. They are not the owner's
to relicense, and this repo makes no claim to any right in them. Anyone
redistributing or building on them does so at their own risk; a rights holder
may ask for their removal. The type system still runs on `local()` pickup and
tuned open substitutes, so the app works with the pack deleted. See
`docs/utm-font-system.md` and `docs/typography-sizing-research.md`.
