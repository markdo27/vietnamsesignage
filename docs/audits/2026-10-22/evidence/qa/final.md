# Functional audit — final evidence

Repository: `/workspace/vietnamsesignage`, main checkout. Browser: system Chromium driven by Playwright, fresh isolated contexts, desktop1440×1000. Application source was unchanged during the audit. Curated evidence is included beside this report; temporary browser scripts are excluded.

## Five-round review record

1. **Baseline execution:** both eras render; SG85 reports10/10 genuine faces, modern32/37. Actual edit→reload→theme-switch preserves Vietnamese text. Add/remove, undo/redo, shuffle undo and new layout run without page exceptions. Downloaded wall and selected-sign PNG+SVG, parsed SVG and inspected raster output. Provisional happy-path functional score8/10.
2. **Stress output:** long Vietnamese sign name with `& < >`, adjusted tracking+20. Text/adjustment persisted; XML escaping passed. Found exported overflow across neighboring signs despite clipping in the editor. New layout discards edits; Undo restores them.
3. **Peer challenge:** independently reproduced slider-history defect across all five range controls with real keyboard ArrowRight gestures. First Undo leaves value unchanged; second Undo also removes the preceding text edit; Redo bundles both back together. Checked saved state without additional editing/focus checkpoints.
4. **Remedy review:** defined behavior and acceptance below. No source edits made.
5. **Score calibration:** final functionality **6.5/10**. Baseline capability is strong, but adjustment history and export fidelity undermine trust during creative work. Cross-audit evidence of inaccessible offscreen toolbar controls at768px adds practical task-completion friction.6.5 is an evidence revision, not a product regression across rounds.

## Confirmed defects and acceptance criteria

### High priority: exported text crosses into other signs

**Reproduction:** at1440×1000, fill the first sign name with `Cửa Hàng Nguyễn Thị Ánh Tuyết & <Sài Gòn> Ốc`; choose name-only tracking+20; close drawer, press Escape to deselect, export whole wall as PNG and SVG. First sign width346.25px; rendered name width1166.125px extending x−388.94→777.19. Editor clips text at first board. Export draws it over adjacent boards.

**Evidence:** `stress-screen.png`, `stress-wall.png`, `stress-wall.svg`, `round2.json`. This is independent of external font access.

**Source:** `plaza.js:1928` builds a flat scene, `plaza.js:1984` collects runs without their board clipping boundaries, `plaza.js:1994` paints canvas, `plaza.js:2102` writes SVG. CSS board overflow clipping is not represented in the export scene.

**Required behavior:** every exported board retains the same clipping boundary as the on-screen board; a sign's fill, outline, extrusion and shadow cannot appear outside its board in wall exports. Selected-sign exports retain the same visible contents and bounds.

**Acceptance:** for both eras, export long Vietnamese text with default and+20 tracking in a narrow board; compare clean editor image to PNG and standalone SVG at equivalent scale. No text/strokes/shadows may appear in adjacent signs. Confirm all signs and intended in-board text remain, XML parses including literal `& < >`, and downloaded dimensions remain correct. Include single-sign and whole-wall targets. Do not “fix” by disabling adjustments or hiding exported text.

### High priority: adjustment Undo is not one gesture

**Reproduction:** edit a name, commit with Enter; open adjustments; select all lines; focus tracking and press ArrowRight0→1; close drawer; click Undo. Value remains1. Second Undo changes1→0 AND removes the earlier name edit. Same result for fine kerning, word spacing, gap; line height1→1.05 behaves identically. Source `plaza.js:1786` checkpoints at change after `onAdjustInput` has already mutated state; handlers at`plaza.js:2213` attach input/change.

**Evidence:** `round3b.json` is the uncontaminated reproduction. `round3.json` included reselection/focus and is superseded; do not use it.

**Required behavior:** each completed adjustment gesture produces one meaningful undo entry containing the state before that gesture. Redo restores just that gesture. Previous text edits remain intact. Dragging through multiple intermediate range values must not flood history. Kerning select should obey the same rule.

**Acceptance:** check pointer drag and keyboard adjustment for each range; after a committed name edit and an adjustment, first Undo restores only adjustment and retains name, first Redo reapplies only adjustment. Repeated gestures step backward separately. No-op gestures do not consume history. Verify targeted line/all lines, reset and apply-to-all actions. Confirm text edit undo/redo remains independent.

## Verified successful checks

-15 signs initially in baseline run; all visible app assets loaded locally.
-Edit `Bảng Hiệu Thử Nghiệm` survived reload and era switch.
-Add15→16; Undo→15; Redo→16. Remove→15; Undo→16.
-Shuffle changes wall; Undo restores exact wall text. Relayout produces a new15-sign composition.
-Wall PNG in both eras2400×1667; selected PNG1212×756. PNGs contain substantial non-flat sign imagery. One partially transparent raster edge row comes from fractional scaling, not missing body content; not elevated as material defect.
-Vintage SVG655KB,141text nodes,9embedded families. Modern SVG956KB,80text nodes,13embedded families. Selected SVG211KB,7text nodes,4embedded families. Actual dimensions and parseability checked.
-No JavaScript page errors during baseline exercise. Browser request failures were Google Fonts proxy/network requests, not local asset or script failures.

## Limits

`fonts.googleapis.com` requests failed through the current runtime proxy (`ERR_TUNNEL_CONNECTION_FAILED`), so five modern substitute faces do not have verified intended fallback rendering. This is an environment limitation. Committed faces render normally. Exported modern SVG contains15first-family names but13embeds; UTM BebasKai and UTM Helvetica Bold rely on unembedded fallbacks. Exact cross-machine substitute portability is unverified. No assertion of exhaustive browser, print-production or touch-device reliability is made.

This folder contains baseline and stress screenshots, downloaded images, and JSON outcomes. A pre-initialization `modernMissing` observation was removed from the published `round2.json`; use the baseline 32/37 font report. Temporary reproduction scripts are not included.
