# Audit fixes and validation

The five priority issues from [the original report](REPORT.md) have been addressed while preserving both eras' lettering, palettes, shadows, and full-wall composition.

| Issue | Result |
| --- | --- |
| Unreachable and crowded controls | Creation, era, layout, history, editing, and export actions stay directly on the toolbar with targets of at least 44px. Rows wrap on smaller screens. Fonts and other secondary actions are in a scrollable tools panel. Canvas space is reserved above the dock. |
| Adjustment Undo | A range gesture captures its prior state before mutation. One Undo restores the adjustment without removing the previous text edit; Redo restores it. No-op range input preserves history. Merely focusing a text line no longer creates an Undo entry. |
| PNG/SVG text bleed | Export scenes retain per-sign boundaries and footer-strip boundaries. Both renderers clip text, outlines, and shadows. |
| Relayout replaces content | Relayout rearranges the existing sign records, retaining every sign's text, fonts, colors, settings, and count, including after narrowing the viewport. |
| Inspector hides the artwork; implicit scope | The desktop inspector reserves its own space. Phone editing shows the selected sign as a live preview above the controls. Export explicitly offers selected sign or whole wall, then PNG or SVG. |

Additional refinements include readable inspector labels, visible editable-text focus, arrow-key tab navigation, Escape closure, touch deselection, contextual editing hints, and visible focus return from the About dialog. The optional future sign-locking feature was not part of these essential fixes.

## Validation

`npm ci --ignore-scripts` completed using the committed lockfile. The browser regression suite passed **11 tests**, with no failed, skipped, or cancelled tests. Run `npm test` with Node.js 20+ and Chromium; setup is documented in [README](../../../README.md#browser-regression-checks).

The suite covers:

- Both eras at widths 320, 390, 620, 621, 768, 844 landscape, 1024, 1280, and 1440px. Primary target size, reachability of secondary controls, dock separation from the canvas, and About closure/focus are checked.
- All five adjustment sliders, independent preceding text edits, Undo/Redo sequencing, unchanged input, and a continuous pointer drag.
- Exact sign-record preservation through relayout after a narrow resize, Undo/Redo, and reload.
- A readable mobile live preview, inspector tab navigation, Escape closure, and restoration of the stored mosaic.
- Actual PNG/SVG downloads, explicit scope, valid SVG clip paths, and a pixel comparison that confirms long adjusted text changes no pixels outside its own sign in either format or era.

Independent reviewers also checked the updated app in Chromium. Their responsive matrix passed **18 viewport/era scenarios**, plus emulated touch workflows at 320 and 390px. Functional review verified multiple keyboard steps, pointer history, kerning, preserved selection, selected/wall output, and standalone SVG rendering with embedded fonts. The About focus issue found in review was fixed and narrowly retested at both phone widths.

Following toolbar feedback, the era switch, Add, Relayout, Undo, and Redo were brought back outside Công cụ. The automated viewport matrix now covers **20 era/viewport combinations**, including a narrow landscape viewport. Earlier screenshots below show the initial four-action toolbar.

Screenshots: [phone editor](fix-evidence/390-sg85-drawer.png), [phone controls](fix-evidence/390-sg85-wall.png), [tablet controls](fix-evidence/768-sg85-wall.png), [desktop editor](fix-evidence/1440-sg85-drawer.png). Machine-readable review evidence: [viewport matrix](fix-evidence/responsive-results.json), [About recheck](fix-evidence/about-recheck.json), [function results](fix-evidence/qa-results.json), [pointer/keyboard gestures](fix-evidence/gestures.json).

## Remaining verification limits

Tests use the committed fonts and do not depend on Google Fonts. The current cloud runtime still blocks those external requests, so intended external fallback fonts and their cross-device SVG portability remain outside this validation. Safari, Firefox, physical touch hardware, screen readers, browser zoom, and a real mobile virtual keyboard have not been validated. The historical audit scores have not been replaced with an untested 9/10 claim.
