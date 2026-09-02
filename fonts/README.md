# fonts/

Two font sets live here, one per theme. **Nothing in this folder is committed** —
`.gitignore` excludes every font file.

## `saigon1985/` — the SÀI GÒN 1985 theme

Ten faces traced off surviving Saigon shopfronts by **Thái Hiếu**
(fontzin.com · fb.com/thaihieufz), from the pack *10 Font Sài Gòn Xưa*:

```
CHI SON 1.ttf   CHI SON 2.ttf      HIEN KHANH 1.ttf  HIEN KHANH 2.ttf
HIEN KHANH 3.ttf  HONG KY 1.ttf    HONG KY 2.ttf     PHAT TAI.ttf
SAIGON1985.ttf    SG85-CUA HANG.ttf
```

The designer's terms: **free for any use including commercial, resale
forbidden.** They are kept out of git out of respect for that — this repo is not
a distribution channel for someone else's type. Drop the ten `.ttf` files into
`fonts/saigon1985/` and the 1985 theme picks them up automatically; the font
drawer reports `10/10 mặt chữ Sài Gòn 1985 đã nạp`. Without them the theme falls
back to the nearest open faces and says so.

Every one of the ten covers the full 134-character Vietnamese repertoire with
real accented glyphs — verified, not assumed — so nothing loses a dấu.

## UTM files — the PHỐ HÔM NAY theme

The UTM pack is a set of unauthorized Vietnamese-diacritic grafts onto
commercial typefaces and must not be redistributed. See
`../docs/utm-font-system.md`. Drop them straight in this folder.

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
