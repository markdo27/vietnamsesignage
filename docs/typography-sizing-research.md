# Typography & Sizing Research — Vietnamese Street Signage

Two questions: what fonts are these signs actually set in, and how is each line of text sized relative to the others. Findings below come from two sources: (1) researching the Vietnamese sign-printing industry itself, and (2) directly measuring pixel proportions on your six reference photos.

---

## 1. What fonts are actually used

**The UTM pack is the answer, by a wide margin.** Across essentially every Vietnamese sign-shop blog and forum thread on the topic, "font UTM" (Unicode Thiên Minh) comes up as the default toolkit. It's a free, community-shared collection of ~500 Vietnamese-ized typefaces, and it's what small print shops actually load into CorelDRAW. The specific faces that match your six references:

- **UTM Bebas** — a Vietnamese-ized Bebas Neue. This is almost certainly what's behind the bold condensed all-caps category lines ("KHÁCH SẠN," "BIA TƯƠI," "CƠM TẤM").
- **UTM Impact** and **UTM Helvetins** — Vietnamese-ized Impact and Helvetica. Heavier, less condensed — good candidates for the thicker block letters (BIVA, HỚT TÓC NAM).
- **UTM Swiss721 BlackCondensed** — extra-dense condensed, another plausible match for the tightest headline text.
- **UTM ThuPhap, UTM Wedding, UTM Silk Script, UTM Fleur** — the script/calligraphic side of the pack, which is what a genuinely cursive name-plate (like "Salon Hải") is probably set in.

**Important correction from actually measuring your images:** I assumed in the prototype that every business-name line uses a script font. That's wrong. "Salon Hải" is real cursive script — but "MƯỜI EM" (the blue name on the hotel sign) is a **bold italic sans**, not script at all. Which treatment a shop uses for its own name looks like a per-shop choice, not a fixed rule — so the template system should treat "name font: script vs. block-italic" as a variable per category/mood, which the generator already does, rather than assuming script is default.

**These are not the same fonts as the "heritage" Vietnamese type revival movement.** Typefaces like *Classique Saigon*, *Cotdien*, and *L'Hanoienne* (all by designer Manh Nguyen, inspired by the Lưu Chữ / Lost Type Vietnam archive project) are a related but distinct thing — hand-painted-sign nostalgia fonts, more curated and "designed." Your six references are the newer, cheaper, mass-printed vinyl-banner vernacular, set in whatever bold font came bundled with the shop's software. Worth knowing both exist, but don't reach for Classique Saigon if you want the Mười Em/BIVA look — it'll read as too polished.

### The licensing problem

This is the part that matters most for "I will upload the font to the platform." **UTM fonts are unauthorized Vietnamese-glyph grafts onto existing commercial Western typefaces** — UTM Helvetins is Helvetica with Vietnamese diacritics added, UTM Impact is Impact, UTM Bebas is Bebas Neue. Several of the download sites hosting them explicitly say they're for personal use only, and commercial use requires buying a license from the original rights holder. That makes them unsafe to bundle and redistribute on a public web platform — you'd be shipping an unauthorized derivative of someone else's commercial font.

**Practical substitutes, checked for actual Vietnamese glyph support:**

| Role | Font | License | Notes |
|---|---|---|---|
| Bold condensed category/headline text | **Anton** (Google Fonts) | SIL OFL — free, commercial use fine | Explicitly ships full Vietnamese coverage. Closest legal match to the UTM Bebas look. **Note:** its default line-height is very loose (~1.5), so set `line-height: 0.9–1.1` explicitly or it won't sit tight like the reference signs. |
| Softer bold sans alternative | **Be Vietnam Pro**, weight 900 | SIL OFL | Purpose-built for Vietnamese by a Vietnamese studio; refined diacritic placement. Already used in the prototype. |
| Script / name-plate style | **Yeseva One** (Google Fonts) | SIL OFL | Lists a Vietnamese subset on Google Fonts. Test it against your actual business-name strings before shipping — subset *presence* doesn't always mean every accent renders cleanly (this trips up other fonts too, e.g. reported issues with Merriweather's Vietnamese accents rendering too small in some contexts). |
| Avoid for this project | **Bebas Neue** (the original, non-Vietnamese-ized) | — | Does **not** currently have Vietnamese support on Google Fonts — there's an open request for it. This is exactly why UTM Bebas exists as an unauthorized workaround; don't build on the un-Vietnamese-ized original. |

If you want something with zero licensing ambiguity and a truly original identity, the other real option is what Manh Nguyen did: draw your own display face inspired by the vernacular (letterforms, not a specific existing font) rather than sourcing one. More work, but it'd make the platform's typography genuinely yours instead of "which open-source lookalike did we pick."

---

## 2. Sizing — measured directly from your reference images

Rather than guess, I cropped the sign board out of four of your images and measured the actual pixel height of each text line as a percentage of the board height.

| Sign | Category | Name | 3rd line(s) | Footer / fine print |
|---|---|---|---|---|
| **Mười Em** (khách sạn) | 100% (baseline) | 93% | tagline 70% | 58% |
| **Thanh Thủy** (nhà nghỉ, giá theo giờ) | 100% | 90% | price lines 100% (same size as category) | tagline ~60% |
| **Cơm Tấm Sườn Que** | product name spans 4 stacked lines, **all identical size** (100%) | — merged with category — | tagline 50% | phone number 40% |
| **BIVA** (bia tươi) | 62% | 100% (largest element on the board) | tagline 44% | fine-print footer 25% |

### The non-obvious finding: there's no single hierarchy rule

I expected "business name is always biggest." That's only sometimes true. What actually gets the largest text depends on what's doing the selling for that specific business:

- **Barbershop (Salon Hải):** the *service* dominates — "HỚT TÓC NAM" is set much bigger than "Salon Hải," which sits above it as a small decorative script flourish. Nobody's loyal to a specific barbershop brand walking down the street; they're looking for "haircut."
- **Beer garden (BIVA):** the *brand name* dominates — biggest element on the whole board, nearly 1.6× the category line above it.
- **Budget motel (Thanh Thủy):** the *price* competes for equal billing with the category — makes sense, since hourly rate is the actual hook for this category of business.
- **Hotel (Mười Em):** category and name sit at near-parity, both clearly bigger than the tagline/footer.
- **Food stall (Cơm Tấm):** category and dish name are fused into one thing — there's no separate "brand" at all, just the product, repeated at one consistent size across all four lines.

**For the template system:** this argues against hard-coding "name is always the hero." Each category preset should declare which field is the visual anchor (100% scale) — category for hớt tóc, name for bia tươi/karaoke, price for nhà trọ/khách sạn-giờ, a merged category+name block for food stalls. The generator's current `mood` system already varies color/font per category; extending it with a `heroField` property (which line renders at the largest scale) would capture this pattern accurately instead of applying one hierarchy to everything.

A rough consistent floor across all four signs: whatever is smallest on the board (fine print, phone number, footnote-style disclaimers) lands around **25–40% of the anchor line's size**, and taglines/service lists land around **50–70%**. That's a reasonable default ratio to hard-code even before a category-specific override is picked.

---

## 3. Physical format and canvas proportions

Two separate things govern real-world sign dimensions in Vietnam, and they explain why your references are shaped the way they are.

**Storefront signage is legally regulated.** Under the Advertising Law (Luật Quảng cáo 2012, Điều 34): a horizontal shop sign (biển hiệu ngang) can be at most 2m tall, with length capped at the building's own frontage width; a vertical sign (biển hiệu dọc) can be at most 1m wide and 4m tall. There's also a real bilingual-text rule: if a sign shows both Vietnamese and a foreign language, the foreign-language text must be **no more than 3/4 the size of the Vietnamese text**, and must sit below it. That's a genuine regulation, not a style choice — and it could be a fun authenticity toggle if the generator ever supports bilingual signs.

**The standee/panel format (what four of your six references actually are) is unregulated and just follows commercial print sizing.** These aren't permanent storefront signs — they're printed vinyl (bạt hiflex) mounted on cheap A-frame or H-frame metal stands, the kind sold by the hundreds by print shops. Standard commercial sizes: **60×160cm, 80×120cm, 80×180cm, 80×200cm, 120×200cm** — nearly all portrait, roughly 1:2 to 1:2.7 aspect ratio. That's a solid default canvas ratio for the app's export sizes, and it explains why the board in your photos reads as a tall, narrow rectangle rather than a landscape banner.

**A fun, authentic detail if you want it:** sign shops and superstitious owners sometimes size panels to land on "lucky" measurements per *thước Lỗ Ban* (a feng-shui carpenter's ruler used in Vietnamese construction and signage). Could make a genuinely funny/authentic Easter-egg toggle — "phong thủy size" — when exporting a finished sign.

---

## What this means for the build

1. **Font files to actually source and embed:** Anton (headline/category), Be Vietnam Pro 900 (alternate bold sans), Yeseva One (script name-plates) — all OFL-licensed, all with Vietnamese coverage, all safe to bundle. Test Vietnamese diacritic rendering on real strings before committing to Yeseva One specifically.
2. **Don't bundle UTM fonts** — the ones a real print shop would use are exactly the ones you can't legally redistribute.
3. **Extend the category data model** with a `heroField` (which line is the visual anchor at 100% scale) instead of assuming name-is-always-biggest — this one change would make the templates noticeably more accurate to how these signs actually work.
4. **Default canvas ratio:** portrait, roughly 1:2 to 1:2.7, matching real standee sizes (60×160, 80×180, 80×200cm) rather than a generic square or landscape frame.
