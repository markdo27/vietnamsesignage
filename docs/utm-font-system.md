# The UTM font system, adapted for the web app

The UTM pack ("Unicode Thiên Minh", ~500 Vietnamese-ized faces) is the toolkit
Vietnamese sign shops actually load into CorelDRAW — and it is also, legally, a
pile of unauthorized Vietnamese-diacritic grafts onto commercial Western
typefaces. See `typography-sizing-research.md` for how that was established.

So the app models the **system** without shipping the **files**. Four layers,
in the order the browser resolves them:

| # | Layer | What it does |
|---|---|---|
| 1 | **Catalog** | 37 signage-relevant UTM faces, each with its Western origin, the sign lines it suits, and a metric-tuned open substitute. `js/utm-fonts.js` |
| 2 | **Genuine pickup** | `@font-face` rules built from `local()` **only**. If this machine already has real UTM fonts installed, they are used automatically. Nothing is downloaded; nothing is redistributed. |
| 3 | **Drop-in** | You can load your own UTM files — drag-drop onto the type panel, the file picker, or a `fonts/manifest.json`. They live in that browser's IndexedDB and never leave the machine. |
| 4 | **Substitute** | Otherwise a tuned open face stands in, with weight, width axis, tracking and cap height pushed toward the UTM face. |

Every stack ends in **Be Vietnam Pro**. CSS falls back *per glyph*, so even if a
substitute is missing a character the diacritic still renders in a face that has
it. (Audited: all 37 substitutes cover the full 134-character Vietnamese
repertoire. Eight lack only the đồng sign `₫`, which the safety net supplies —
verified in-browser.)

## Sizing: cap height, not font size

Sign painters set type by the **height of a capital letter**, not by point size.
So does the app. At render time it measures the live font on a canvas and
solves for the size that hits the target cap height:

```
fontSize = targetCapHeight / normalisedRatio(font)
```

All-caps lines normalise on cap height. Mixed-case lines — every script and
brush face — normalise on **x-height** instead, because that is what the eye
reads as size; matching a swashed script on its capital `H` renders it far too
small. The measurement is clamped so an unusual glyph outline can never produce
an absurd size.

Two consequences worth having:

- **Swapping a face does not move the layout.** Anton, Allura and Alfa Slab One
  at the same nominal scale occupy the same optical height.
- **The measured ratios from the reference photos become directly usable.** The
  research found 1.00 / 0.93 / 0.70 / 0.58 for the Mười Em hotel sign; the app
  renders those numbers literally, and they hold no matter which face is on
  which line.

Lines that would overrun the board shrink to fit, tracking scaling with them.
Business names are allowed to wrap instead — stacked multi-line names are
authentic (see the Cơm Tấm reference).

## Type recipes

`hero` is the line that renders at scale 1.00. There is **no universal
"name is biggest" rule** — what dominates is whatever is actually selling that
shop, so each category declares its own anchor. `order` restacks the lines where
a shop puts its name somewhere other than under the category line: a barbershop's
script name is a small flourish *above* the dominant `HỚT TÓC NAM`.

| Loại tiệm | Hero | Loại hình | Tên | Slogan | Chân bảng | Tỉ lệ cao chữ hoa |
|---|---|---|---|---|---|---|
| `khach-san` | cat | Bebas | HelvetIns | Swiss 721 Black Condensed | Helvetica Bold | 1.00 / 0.93 / 0.70 / 0.58 |
| `nha-tro` | cat | Bebas | Helvetica Bold | Swiss 721 Black Condensed | Swiss 721 Black Condensed | 1.00 / 0.90 / 0.60 / 0.66 |
| `quan-com` | cat | Bebas | Bebas | BebasKai | Ericsson | 1.00 / 1.00 / 0.50 / 0.40 |
| `banh-mi` | name | Bebas | Cooper Black | BebasKai | Swiss 721 Black Condensed | 0.80 / 1.00 / 0.50 / 0.42 |
| `ca-phe` | name | Bebas | Cabaret | Centur | BebasKai | 0.72 / 1.00 / 0.50 / 0.42 |
| `hot-toc` | cat | HelvetIns | Silk Script | BebasKai | Swiss 721 Black Condensed | 1.00 / 0.46 / 0.42 / 0.36 |
| `nail-spa` | name | Centur | Silk Script | Caviar | Centur | 0.60 / 1.00 / 0.44 / 0.38 |
| `sua-xe` | name | Bebas | Bitsumishi | Swiss 721 Black Condensed | Helvetica Bold | 0.70 / 1.00 / 0.46 / 0.40 |
| `sua-dt` | name | Swiss 721 Black Condensed | Neo Sans | Facebook | Facebook | 0.85 / 1.00 / 0.46 / 0.40 |
| `giat-ui` | name | Bebas | Avo | Centur | BebasKai | 0.80 / 1.00 / 0.50 / 0.42 |
| `cam-do` | name | Banque | Colossalis | Swiss 721 Black Condensed | Copperplate | 0.62 / 1.00 / 0.44 / 0.30 |
| `bia-tuoi` | name | Bebas | HelvetIns | Swiss 721 Black Condensed | Ericsson | 0.62 / 1.00 / 0.44 / 0.25 |
| `thuoc-tay` | name | Trajan | AmericanSans | Centur | BebasKai | 0.80 / 1.00 / 0.46 / 0.40 |
| `karaoke` | name | Bebas | Neo Sans | BebasKai | Swiss 721 Black Condensed | 0.66 / 1.00 / 0.46 / 0.40 |

## Face catalog

"Grafted onto" is the Western typeface the UTM face carries Vietnamese
diacritics for. "Stands in as" is the open, Vietnamese-complete substitute used
when the genuine file is not present; the tuning column is what gets applied to
push it toward the UTM face.

### Nén – chữ khối hẹp — *Condensed display*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Bebas** | Bebas Neue | Anton | +15/1000 em, caps | loại hình, tên, slogan |
| **UTM BebasKai** | Bebas Neue (bản nhẹ) | Oswald | w600, +30/1000 em, caps | loại hình, slogan, chân bảng |
| **UTM Impact** | Impact | Anton | -5/1000 em, scaleX 0.97, caps | tên, loại hình |
| **UTM HelvetIns** | Helvetica Inserat | Archivo | w900, wdth 62, -12/1000 em, caps | tên, loại hình |
| **UTM Swiss 721 Black Condensed** | Swiss 721 BT | Archivo | w900, wdth 75, caps | loại hình, tên, slogan |
| **UTM Ericsson** | Ericsson Capital | Saira Condensed | w700, +20/1000 em, caps | slogan, chân bảng, loại hình |

### Sans đậm — *Heavy grotesque*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Helvetica Bold** | Helvetica | Archivo | w800, wdth 100, -10/1000 em | tên, loại hình, chân bảng |
| **UTM AmericanSans** | Franklin Gothic họ | Chivo | w900, +5/1000 em, caps | loại hình, tên |
| **UTM Facebook** | Klavika | Chivo | w700, +10/1000 em | tên, slogan |
| **UTM Dax** | Dax | Be Vietnam Pro | w700, +10/1000 em | slogan, chân bảng |

### Sans hình học — *Geometric sans*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Avo** | ITC Avant Garde Gothic | Be Vietnam Pro | w900, +20/1000 em, caps | tên, loại hình |
| **UTM Centur** | Century Gothic | Be Vietnam Pro | w700, +45/1000 em | slogan, chân bảng, tên |
| **UTM Caviar** | Caviar Dreams | Be Vietnam Pro | +90/1000 em, caps | slogan, chân bảng |
| **UTM Kabel** | Kabel | Kanit | w600, +30/1000 em, caps | loại hình, tên |

### Chân dày — *Slab / fat face*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Colossalis** | Colossalis | Alfa Slab One | +5/1000 em, caps | tên, loại hình |
| **UTM Cooper Black** | Cooper Black | Bevan | +5/1000 em | tên |

### Có chân — *Serif*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Alexander** | display serif | Yeseva One | +5/1000 em | tên |
| **UTM Banque** | serif ngân hàng | Playfair Display | w900, +10/1000 em, caps | tên, loại hình |
| **UTM Georgia** | Georgia | Bitter | w700, +5/1000 em | slogan, chân bảng, tên |
| **UTM Nyala** | Nyala | Bitter | w600, +10/1000 em | slogan, tên |
| **UTM Times** | Times New Roman | EB Garamond | w700, +5/1000 em | chân bảng, slogan |

### Chữ khắc – trang trọng — *Inscribed caps*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Trajan** | Trajan Pro | EB Garamond | w600, +90/1000 em, caps | loại hình, tên |
| **UTM Charlemagne** | Charlemagne | EB Garamond | w700, +100/1000 em, caps | loại hình, tên |
| **UTM Copperplate** | Copperplate Gothic | Chivo | w700, +140/1000 em, caps | loại hình, chân bảng |
| **UTM Penumbra** | Penumbra | EB Garamond | w500, +110/1000 em, caps | loại hình, slogan |

### Chữ viết tay — *Script*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Edwardian** | Edwardian Script | Italianno | +10/1000 em | tên |
| **UTM Wedding** | script đám cưới | Great Vibes | +5/1000 em | tên |
| **UTM Silk Script** | script mảnh | Allura | +5/1000 em | tên |
| **UTM Fleur** | script hoa văn | Mea Culpa | +10/1000 em | tên |
| **UTM Aurora** | script cổ điển | Pinyon Script | +10/1000 em | tên |
| **UTM Flamenco** | brush script | Alex Brush | +10/1000 em | tên, slogan |
| **UTM Sharnay** | script hiện đại | Dancing Script | w700, +5/1000 em | tên, slogan |
| **UTM Cabaret** | script retro | Lobster | +5/1000 em | tên |

### Thư pháp — *Vietnamese brush*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM ThuPhap Thien An** | thư pháp Việt | Charmonman | w700, +5/1000 em | tên |
| **UTM ThuPhap Nhu Nguyet** | thư pháp Việt | Ephesis | +10/1000 em | tên, slogan |

### Chữ vuông – kỹ thuật — *Techno / squared*

| UTM face | Grafted onto | Stands in as | Tuning | Lines |
|---|---|---|---|---|
| **UTM Neo Sans** | Neo Sans | Tektur | w600, +20/1000 em, caps | tên, loại hình |
| **UTM Bitsumishi** | Bitsumishi | Tektur | w700, +10/1000 em, 8° oblique, caps | tên, loại hình |

## Using your own UTM files

If you own or have licensed the real fonts, drop them in — the app matches a
filename like `UTMBebas.ttf` or `UTM Bebas KT.otf` back onto its catalog entry
and switches that face from substitute to genuine everywhere it is used.

- **Drag and drop** `.ttf` / `.otf` onto the type panel's drop zone, or use the
  file picker. Stored in that browser's IndexedDB only.
- **Or** put the files in `fonts/` alongside a `fonts/manifest.json`:
  ```json
  { "files": ["UTM Bebas.ttf", "UTM HelvetIns.ttf"] }
  ```
  The pack is committed in `fonts/` with a `manifest.json` covering the 33
  catalogued faces it contains; see the licence note in the root README for what
  that does and does not grant you.

The type panel reports live how many of the 37 faces resolved to genuine UTM
files, and shows per line whether it is running the real face or a substitute.

## What is deliberately not done

**The UTM files are not bundled with this repo and should not be.** They are
unauthorized derivatives of commercial typefaces (Bebas Neue, Impact, Helvetica,
Cooper Black, Trajan…), and several distribution sites state personal use only.
Shipping them on a public web platform would be redistributing someone else's
commercial font. The `local()` + drop-in design exists precisely so the app can
speak the whole UTM vocabulary without ever becoming a font distributor.
