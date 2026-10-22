# Creative workflow audit: final review

Five review rounds covered first-use creation, adversarial recovery, peer challenge at intermediate widths, proposed interactions, and calibrated final scoring. Browser evidence is from clean Chromium contexts at390×844,768×900,1024×900,1280×900,1440×1000. No source files changed.

**UX/engagement: 6.5/10. Core functions: 7/10. Whole-product visual design from this workflow perspective: 7/10.** The sign wall itself has greater personality than the editor controls have polish. Strong happy paths justify a score above merely usable: editable live signs, two persuasive eras, instant generation, local current-state persistence, basic undo/redo, add/delete, and selected-sign SVG all worked. The confirmed slider undo defect and controls inaccessible at768/1024 prevent an8. These are inspection benchmarks, not participant-study measurements.

## Evidence and priorities

1. **P1 — responsive controls are inaccessible.** At768px dock extends to x1239; PNG/SVG/fonts/tuning/about/hide are offscreen. At1024px tuning/about/hide are offscreen. Body overflow hidden prevents scrolling to them. At390px all12 actions compress to icon-only22.4–29.3px-wide buttons,40px tall. Preserve the playful wall, but give4–5 main controls readable labels and >=44px targets; move secondary controls into More. Check390/768/1024 and200% zoom. Files:06-width-768.png,06-width-1024.png,03-mobile.png. Source:plaza.css215–264,632–641.
2. **P1 — first Undo after a tracking change is a no-op.** Select sign, open CHỈNH CHỮ, focus Tracking and ArrowRight0→1, close, Undo, reopen: value still1. Mutation occurs in onAdjustInput before onAdjustChange checkpoints. Source:plaza.js1724,1786,2216. QA independently confirmed.
3. **P1 — reliable export is a core promise.** In my journey the selected-sign SVG downloaded and embedded fonts; parent QA independently found long-name + tracking20 text bleeds into adjacent signs in PNG/SVG. Treat layout and clipping parity as core reliability rather than optional polish. Do not claim all exports are faithful merely because downloads succeed.
4. **P1/P2 — “BỐ CỤC MỚI” replaces user content.** Custom name disappears across all signs after relayout; Undo recovers it. Shuffle also replaces it, but theme roundtrip preserves it. Source:plaza.js1562–68. This is existing behavior mismatched to the layout label, not corruption. Reload preserves the current wall but drops all Undo history.
5. **P2 — scope and preview are hidden.** Export acts on selected sign whenever selected, otherwise wall; labels do not show which. Seam taps do not deselect. Escape works on desktop but no direct touch deselect is provided. Font inspector covers340/390px on phones; in one measured left-column example it covered76.3% of the selected sign. Files:05-mobile-edit-preview.png.

## Round4 interaction proposals and critique

### Layout preserves sign content

A layout-only action should build a new split-tree topology using the existing leaf/sign records and the existing count. Keep each sign's text, chosen faces, palette, recipe tweaks, and manual adjustments; only sizes/positions change. Keep content identity so Undo restores the exact earlier topology and artwork. A separate clearly named New street may regenerate shops and count. Do not silently use viewport targetCount during a relayout that promises preservation.

Acceptance: edit two signs with custom accented text, change their faces and tracking, request new layout; all artwork and count remain, arrangement changes, one Undo restores the exact old arrangement. Refresh then confirms persistence. Do not insert a confirmation dialog into every playful shuffle; clear wording and dependable recovery are lighter.

### Explicit export scope

Use an export sheet with two visible options: “Bảng đang chọn — [shop name]” and “Cả tường — [N] bảng,” plusPNG/SVG. Disable selected-sign option when none is selected. Show the actual chosen scope before download and in success feedback. A dedicated scope choice removes the need for mobile users to discover deselection. Remembering last format is fine, but the current scope must always be visible.

Acceptance: tap any sign and export whole wall without reloading or losing edits; export selected sign and verify only its content is included. At390px both options remain discoverable. Export long names, diacritics, scripts, high tracking and hard shadows in both eras; neighboring boards receive no leaked text and font/layout match the live sign. A smaller valid output is preferable to a download with wrong composition.

### One gesture → one Undo

Capture the pregesture state before the first mutation. Coalesce range input events until pointer release/change (or the end of a keyboard gesture), then commit one history operation. A no-change focus must not add history. Do the same for tracking, kerning, word spacing, line spacing and gaps. Avoid recording the already-mutated state in change handlers.

Acceptance: drag0→10→20 in one gesture; first Undo restores0 and Redo20. Two separate gestures0→10 and10→20 require two Undo steps. Changing a font selector and adjusting tracking have independent, meaningful steps. Reload may legitimately clear history, but disclose that limitation through visible saved/current-state feedback.

### Optional agency feature: keep this sign

After recovery and output reliability, add “Giữ bảng này”/Lock this sign. Define it precisely: global content shuffle skips that sign's text, faces, palette and adjustments. Layout can move its position; manual editing or an explicit direct delete remains possible. Show a small lock badge, persist it in local state, include it in Undo/Redo. This creates controlled surprise while preserving favorite artwork. A full favorites/project library can wait.

Acceptance: lock one edited sign, shuffle five times; it remains identical while other signs change. Unlock and shuffle allows it to vary. Refresh retains lock; Undo restores both lock state and artwork. Explain if the era switch deliberately changes a locked sign's visual style; otherwise lock promises become ambiguous.

## Keep the existing character

Keep saturated palettes, handpainted-inspired Vietnamese faces, density, hard shadows and per-sign variation. The dock and inspector need stronger usability; the signs should not become muted generic cards. The fastest pleasure loop is choose a promising sign → tweak it → keep it → explore the rest → export something dependable.

## Validation limits

Chromium only; no claim of Safari/iOS keyboard or assistive-technology compatibility. Random walls mean screenshots demonstrate examples rather than exhaustive compositions. Repeated reviews did not change application code or improve scores. Detailed probe logs and scripts reside beside this report.
