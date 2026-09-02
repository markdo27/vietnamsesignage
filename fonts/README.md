# fonts/

Two font sets live here, one per theme. Both are committed, but on very
different footing — read the second section before you reuse anything.

## `saigon1985/` — the SÀI GÒN 1985 theme

Ten faces traced off surviving Saigon shopfronts by **Thái Hiếu**
(fontzin.com · fb.com/thaihieufz), from the pack *10 Font Sài Gòn Xưa*:

```
CHI SON 1.ttf   CHI SON 2.ttf      HIEN KHANH 1.ttf  HIEN KHANH 2.ttf
HIEN KHANH 3.ttf  HONG KY 1.ttf    HONG KY 2.ttf     PHAT TAI.ttf
SAIGON1985.ttf    SG85-CUA HANG.ttf
```

The designer's terms: **free for any use including commercial, resale
forbidden.** On those terms the ten files are committed here, so a fresh clone
letters the 1985 era with no setup — the font drawer reports `10/10 mặt chữ Sài
Gòn 1985 đã nạp`. Keep the attribution above with them, and do not sell them on.
If they are ever removed the theme falls back to the nearest open faces and says
so in the drawer.

Every one of the ten covers the full 134-character Vietnamese repertoire with
real accented glyphs — verified, not assumed — so nothing loses a dấu.

## UTM files — the PHỐ 2010 theme

The 196 `UTM *.ttf` files in this folder are the full pack, committed at the
repository owner's decision, and `manifest.json` lists the 33 of them the
catalogue maps to so the app loads only what it needs.

Understand what they are before reusing them: UTM faces are unauthorized
Vietnamese-diacritic grafts onto commercial typefaces — `UTM LinotypeZapfino`,
`UTM ClassizismAntiqua`, `UTM Duepuntozero` name their originals outright — and
no licence came with the pack. Nobody here can grant you rights to them. See
`../docs/utm-font-system.md`. Delete the folder's `.ttf` files and the app falls
back to the tuned open substitutes, which is what it was built to do.

## Two ways to load them

**1. In the browser (easiest).** Open the app → `🔤 Hệ font UTM` → drag the
`.ttf` / `.otf` files onto the drop zone. They are stored in that browser's
IndexedDB and persist across reloads. Nothing is uploaded anywhere.

**2. From this folder.** Put the files here and add a `manifest.json`:

```json
{ "files": ["UTM Bebas.ttf", "UTM HelvetIns.ttf", "UTM ThuPhap Thien An.ttf"] }
```

The app fetches the manifest on load and registers each file. If the manifest is
absent it is silently skipped — the app runs on substitutes.

## Filename matching

Files are matched back onto the catalog by name, ignoring case, spaces and
punctuation. All of these resolve to the same face:

```
UTM Bebas.ttf    UTMBebas.otf    utm-bebas.ttf    UTM Bebas KT.ttf
```

A file that matches nothing is still loaded and usable under its own filename —
it just does not replace a catalog face. Run the app and check the type panel:
it reports how many of the 37 faces are genuine.
