# Phố Bảng Hiệu: five-round design and function audit

22 October 2026 · `markdo27/vietnamsesignage` · commit `b31d8de92029229325998ff07e49472a46c8e117`

**The site has a memorable visual identity and a capable creation engine. It needs more dependable controls and recovery to feel professional during extended use. Preserve the Vietnamese street-sign character; concentrate the next changes on making experimentation safe and easy.**

Four specialist agents reviewed visual design, creative workflow, responsive accessibility, and functional reliability. Five rounds covered independent inspection, task and variation testing, peer challenges and retests, critique of proposed improvements, and final score calibration. This is an audit of one unchanged build. Recommendations have not been implemented, and repeated review does not represent an improvement in the website itself.

| Benchmark | Final score | Reason |
| --- | ---: | --- |
| Design overall | **7/10** | Distinctive typography, palettes, and composition; control layout and editing context reduce polish. |
| Functions overall | **6.5/10** | Strong normal workflows, with confirmed undo and export defects plus unreachable controls at some widths. |
| Creative workflow / repeat use | **6.5/10** | Instant variety is enjoyable; preserving good work, understanding actions, and judging adjustments take effort. |
| Responsive / touch usability | **4.5/10** | Several tablet controls are offscreen; phone targets are crowded and the inspector hides the artwork. |
| Accessibility foundations | **6.5/10** | Useful labels, keyboard resizing, status announcements, and dialog behavior; focus visibility and control usability need refinement. |

Scores are reviewer judgments against a product-quality benchmark, not measured user satisfaction or formal accessibility certification. On this scale, 5 means usable with substantial friction, 7 means strong but with material weaknesses, and 9 means consistently polished and dependable across the tested workflows. The design and function scores are consolidated judgments, not averages of unlike specialist categories.

## Five rounds

| Round | Work performed | Result |
| --- | --- | --- |
| 1 — Independent baseline | Each specialist inspected the actual Chromium app. Both eras, desktop and phone views, direct editing, controls, and export were explored. | Strong cultural character and successful normal workflows. Initial visual score 7.2; initial function score 8 before deeper checks. |
| 2 — Creation and variation | Exercised edit, theme, fonts, add/remove, shuffle, relayout, undo/redo, reload, and downloaded files. Visual reviewer sampled 18 generated walls containing 210 signs. | Found dense phone controls, canvas occlusion, relayout replacing edits, and export bleed with long adjusted text. |
| 3 — Peer challenge and retest | Cross-checked tablet reachability, typography assumptions, font readiness, and adjustment history with independent browser evidence. | Confirmed the toolbar and history defects. Withdrew the implication that a small supporting shop name was necessarily a hierarchy error. |
| 4 — Improvement critique | Reviewed responsive toolbar, inspector preview, safe relayout, output clipping, and recovery proposals against the professional-yet-fun goal. | Prioritized reliable iteration and visible feedback; retained bold palettes and era-specific lettering. Optional locking follows essential fixes. |
| 5 — Final calibration | Reconciled specialist findings, checked evidence quality, separated observed defects from suggestions, and froze scores for the unchanged build. | Final design 7/10 and functions 6.5/10. No claim of an implemented improvement or post-fix validation. |

## Fix these first

### 1. Make every toolbar action reachable — P1

At 768px and 1024px viewport widths, the dock extends beyond the visible page. In a measured 768px view, its right edge was approximately 1239px. Several controls, including SVG export and editing tools, were offscreen. Real clicks on the hidden Hide control failed. Page overflow is hidden, so users cannot scroll sideways to recover these actions. The exact clipping threshold varies with theme, available font metrics, and flex sizing; the tested failures are concrete.

At 390px, all **12** actions compress into one row of approximately 22–29px-wide buttons. At 320px, some buttons are only about 17–19px wide. Accessible names exist, but touch users see small icons without visible labels.

**Recommendation:** keep three or four labeled primary actions, such as Shuffle, Edit, and Export, with remaining actions in a clearly labeled More menu. Make desktop/tablet layout respond to its actual available width. Use a 44×44px product target for primary touch controls; this is a recommended comfort target, not a blanket statement about formal compliance.

**Acceptance:** every action is reachable without horizontal page scrolling at 320, 390, 620, 621, 768, 844 landscape, 1024, 1280, and 1440px. Verify pointer, keyboard, and touch-emulated operation, both eras, and history buttons in enabled states.

Evidence: [tablet screenshot](evidence/visual/r3-tablet-overflow.png), [browser measurements](evidence/accessibility/measurements.json). Source: [dock styles](../../../plaza.css#L216), [phone breakpoint](../../../plaza.css#L632).

### 2. Make one adjustment gesture equal one Undo — P1

For tracking, fine kerning, word spacing, line height, and gap, a real keyboard increment changes the artwork. The first Undo leaves that adjustment unchanged. In the clean history retest, a second Undo also removes the preceding text edit; Redo bundles the edit and adjustment together.

The adjustment checkpoint is recorded after the input handler has already changed the model. This undermines safe experimentation, particularly when users are tuning a favorite sign.

**Recommendation:** capture the prior state at gesture start and coalesce a continuous gesture into one history entry. Preserve a separate preceding text edit. A no-op interaction should not consume an Undo step.

**Acceptance:** test each slider with pointer and keyboard. After editing a name and adjusting one value, Undo once restores only the old adjustment; Undo twice restores the prior text; Redo repeats those steps independently.

Evidence: [clean history retest](evidence/qa/round3b.json). The earlier exploratory history measurements were excluded from the final evidence set because reselecting text polluted the test history. Source: [adjustment checkpoint](../../../plaza.js#L1786), [range event wiring](../../../plaza.js#L2213).

### 3. Keep PNG and SVG output inside each sign — P1

Normal PNG and SVG downloads succeeded. A supported customization exposes a fidelity defect: a long Vietnamese name with name tracking set to +20 remains clipped inside its sign in the editor, but the wall exports draw the overflowing letters over neighboring signs. Both PNG and SVG are affected.

The tested name was `Cửa Hàng Nguyễn Thị Ánh Tuyết & <Sài Gòn> Ốc`. The first sign was about 346px wide while the adjusted text run was about 1166px wide. Punctuation and Vietnamese text survived SVG parsing and reload; missing per-sign clipping is the confirmed defect.

**Recommendation:** retain each sign's clipping bounds in the export scene and apply equivalent clipping to fills, outlines, and shadows in both renderers.

**Acceptance:** compare editor and exported output for long text, large tracking, both eras, wall and single-sign scope. No drawing may cross a sign boundary unless the editor intentionally displays it there. Include neighboring signs with contrasting backgrounds so bleed is visible.

Evidence: [editor before export](evidence/qa/stress-screen.png), [actual PNG](evidence/qa/stress-wall.png), [actual SVG](evidence/qa/stress-wall.svg). Source: [scene construction](../../../plaza.js#L1928), [canvas renderer](../../../plaza.js#L1994), [SVG renderer](../../../plaza.js#L2102).

### 4. Clarify what “new layout” changes — P1 workflow issue

“BỐ CỤC MỚI” creates a new tree with newly generated shops. A custom shop name disappears, and Undo restores it. This is a mismatch between the apparent promise of rearranging a layout and the actual behavior, rather than evidence of storage corruption. Global Shuffle also replaces custom content, which is more consistent with its label.

**Recommendation:** make relayout rearrange existing signs while preserving their text and adjustments. If replacing the entire street is intentional, give that action an explicit name and make its effect clear before users commit valuable work. Preserve immediate recovery.

**Acceptance:** edit a name, font, and spacing; relayout; verify the existing sign records survive. If a separate New Street action is added, verify its wording, recovery, and persistence behavior. Reload currently preserves the current wall but resets undo history, so recovery should not rely solely on an Undo instruction after reload.

Source: [newLayout](../../../plaza.js#L1562). Evidence: [workflow audit](evidence/workflow/final.md).

### 5. Keep the edited sign visible and make export scope explicit — P2

The phone inspector is 340px wide at a 390px viewport, covering **87.2%** of the viewport. In one selected-sign sample, it covered 76.3% of that sign; a right-column selection can be fully obscured. Users can change typography without seeing the result. Inspector labels are approximately 8.8px, with much supporting text around 9–10px.

Export scope is implicit: a selected sign exports alone; otherwise the whole wall exports. Keyboard Escape clears selection. Tapping a seam did not clear it, and reviewers found no explicit touch control for deselection or choosing scope.

**Recommendation:** use a phone sheet or focused editing view that keeps a useful selected-sign preview visible. Offer a clear Export choice for Selected Sign versus Whole Wall, then PNG versus SVG. Increase inspector text size and keep active era and selection evident.

**Acceptance:** while editing at 390px, users can see a readable live preview, reach all controls, and export either scope without a keyboard. Verify the mobile virtual keyboard and real-device behavior in implementation testing; these were not tested here.

Evidence: [mobile inspector](evidence/visual/mobile-drawer.png), [selected-sign occlusion](evidence/workflow/05-mobile-edit-preview.png). Source: [drawer styles](../../../plaza.css#L285), [export scope](../../../plaza.js#L1865).

## Preserve the fun while raising the quality

The full-bleed wall, Vietnamese copy, saturated sign colors, hard shadows, era switch, and locally committed typefaces distinguish this product. The 2010 theme's flatter hierarchy and rotating colors are deliberate references to printed street signage. They should not be treated as defects merely because they are louder than conventional product UI.

The next design pass should make the controls calmer and more legible while allowing the artwork to remain bold. Add a brief contextual hint for direct text editing and seam dragging. Keep the existing per-sign dice action for fast variation. After the reliability fixes, an optional **Keep this sign** control could let global Shuffle change only unlocked signs. Lock state should survive reload, Undo should cover it, and manually editing or deleting a locked sign should remain possible. This is a proposed feature, not something currently implemented or tested.

The repeated visual sample found no sign-name DOM bounds overflow greater than the reviewer's 3px tolerance across 210 signs. This is a limited bounds check, not proof that all glyphs or future edits fit. Some supporting names were very small. A focused retest confirmed the small name belonged to a deliberately category-led recipe with a readable main heading. Treat minimum supporting-text legibility as a refinement, not a reason to flatten every sign's hierarchy.

The dock also covers bottom sign content. In the reviewer's sample, 47 of 210 signs had more than 15% of their area under it, with a worst observed overlap of about 35%. Reserve editing space, reposition the controls, or offer a clear view mode so contact strips and selected content remain available.

## Verified capabilities and limits

**Passed in actual Chromium:** direct editing; normal text undo/redo; theme switching with edited text retained; add/remove with recovery; Shuffle with Undo restoration; reload persistence; keyboard seam resizing; normal wall and single-sign PNG/SVG downloads in both eras. Wall PNGs measured 2400×1667 in the tested desktop case. SVG text parsed, font data was embedded for available mapped files, and Vietnamese text and XML-sensitive punctuation survived parsing. No application JavaScript exceptions were recorded in the exercised scenarios.

**Accessibility strengths observed:** named controls and editable lines, separator keyboard resizing with ARIA value updates, live status announcements, reduced-motion support, and the native About dialog transferring focus, closing with Escape, and returning focus. Refinements include visible focus on editable text, more predictable panel navigation, and tab keyboard behavior. The inspector is nonmodal, so a focus trap is not assumed necessary.

**Environment limit:** Google Fonts requests were blocked by the current runtime's network proxy. The app still rendered using committed/local/system fonts and reported 10/10 historical faces and 32/37 genuine modern faces. Some modern fallback rendering and SVG portability remain unverified with the intended external fonts loaded. An early pre-initialization missing-font list was discarded; it is not a valid readiness result.

**Not tested:** Safari, Firefox, real touch hardware, screen-reader operation, actual browser zoom, mobile virtual keyboard, production deployment, and fresh-task restoration after environment publication. The viewport checks are browser-based tests, not a participant usability study. There is no repository test suite or build step to report as passing.

## Cloud setup outcome

The existing checkout supports static development with Python 3.12.14. No application package installation, backend, credentials, or build step is required. The server was started from `/workspace/vietnamsesignage` with `python3 -m http.server 8123 --bind 127.0.0.1`. Internal HTTP requests returned 200 for the entry page, CSS, all three JavaScript files, the font manifest, and a representative historical font. All 33 files referenced by the modern font manifest exist. JavaScript syntax checks passed, and a read-only Git operation succeeded using existing platform authentication.

Saved configuration was read back successfully: **`start_skill`** contains working-directory, startup, readiness, and repository-protection instructions; custom network destinations **`fonts.googleapis.com`** and **`fonts.gstatic.com`** were added to the draft. No install script was needed. These are saved draft settings; saving did not apply the network changes to this running instance or publish a snapshot. Review and save them in environment settings, then publish the environment when desired. Running processes must be restarted in future tasks using the saved instructions.

Application source, tests, dependency declarations, and lockfiles were left unchanged. This report and its evidence are saved as repository documentation under `docs/audits/2026-10-22`. The environment is usable for development; the application defects above remain work for a coding task.

Specialist reports: [visual](evidence/visual/final-visual-audit.md), [workflow](evidence/workflow/final.md), [responsive](evidence/accessibility/round3-4.md), [functional QA](evidence/qa/final.md).
