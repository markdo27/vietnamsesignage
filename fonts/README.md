# fonts/

Drop your own UTM font files here, or load them straight into the app.

**Nothing in this folder is committed.** `.gitignore` excludes every font file —
the UTM pack is a set of unauthorized Vietnamese-diacritic grafts onto
commercial typefaces and must not be redistributed. See
`../docs/utm-font-system.md`.

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
