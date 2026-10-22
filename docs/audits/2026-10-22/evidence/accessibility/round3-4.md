# Rounds 3–4 — peer challenge and responsive product plan

## Round 3: challenge findings against peer evidence

Cross-reviewed `../visual/final-visual-audit.md`, `../workflow/final.md`, and the corrected `../qa/round3b.json` evidence alongside this review's browser measurements and screenshots. No application changes were made, so deeper review does not count as a design improvement.

- **Preserve the identity.** Visual review's strong assessment of the era-specific typography, hard painted shadows, Vietnamese accents, and gapless mosaic matches the screenshots. The noisy 2010 aesthetic is intentional; reducing all colors and shrinking personality would address the wrong problem.
- **Confirmed functional priority: responsive toolbar.** This is more than visual density. Real action clicks fail at768/1024 because control geometry is outside the viewport. At621px the application changes from a fitting compact layout to a1225px strip. Aesthetic opinions cannot cancel this failure.
- **Correct the count:** the visible toolbar has **12** actions. Peek is a separate control shown only when the toolbar is hidden; do not call it13 simultaneous dock actions.
- **Mobile drawer: feedback rather than modality.** Its340/390px width is an observed issue because live typography changes are hard to judge, corroborated by visual and workflow screenshots. It is a nonmodal editor and does not inherently need a focus trap. Improving selected-sign context ranks above imposing modal behavior.
- **Recovery deserves higher priority than extra novelty.** Workflow's layout action discards custom text (recoverable by Undo) and QA's adjustment Undo results make reversible exploration less trustworthy. On touch devices there is also no direct visible deselect action to choose whole-wall export. Combined with tiny icon-only controls, these weaken the repeated-create loop despite functioning exports and local persistence.
- **Do not overclaim accessibility.** Explicit labels, keyboard seams and the native About dialog are verified strengths. Focus and tab-navigation polish is useful, but this is not a formal WCAG audit. Actual browser zoom200% and physical iOS/Android keyboard behavior were **not tested**; CSS font-size changes are not treated as browser zoom evidence.

## Round 4: concrete professional-yet-fun responsive model

### 1. Keep the canvas, reduce command density

Use three or four clearly labelled primary commands plus a labelled **More / Công cụ** entry. Good candidates are shuffle, era, add, and export, adjusted to fit the smallest width without compressing touch targets. Secondary typography tools, relayout, About, and hide can live in an accessible menu. Keep Undo/Redo persistently reachable or expose a clear immediate Undo action after changes; do not bury recovery behind several levels.

A44×44px hit area is the product target for comfortable touch, not a claim about the exact minimum of every accessibility standard. At320px, allow two compact rows or fewer primaries rather than squeezing five labels into illegibility. Keep emoji/playful icons alongside labels if desired; replace ambiguity rather than personality.

Show current era explicitly: **Sài Gòn1985 / Phố2010**. A bare hourglass is insufficient touch feedback. Export should open a compact choice of **Selected sign / Whole wall** and **PNG / SVG**, making scope visible without requiring Escape or reload.

### 2. Make desktop/tablet layout content-aware

Constrain toolbar width to viewport minus safe margins. Switch to compact controls or a wrapped group/menu before intrinsic contents exceed that width; do not rely only on the current620px breakpoint. Reserve the measured toolbar area while editing so it cannot hide sign footers. Retain a clear artwork-only mode for the full-bleed wall.

Avoid a tall two-row strip consuming a landscape phone: compact mode should depend on available width and height. Do not shrink label text below readability to preserve a single row.

### 3. Give adjustment a visible result

On phone, use a bottom sheet with a visible selected-sign preview above it, or a focused single-sign view with the compact controls below. At least the entire sign being adjusted should remain available to judge, not a50px edge of the wall. Make return-to-wall and close obvious; retain selection and live edits through transitions. Desktop can retain the nonmodal side inspector if the selected sign is kept in view.

Use readable12–14px labels/help and comfortable controls. Support vertical scrolling in the sheet. With software keyboard open, the edited line and its caret must remain visible; validate this on an actual mobile browser during implementation.

### 4. Make editing and recovery effortless

Show one dismissible first-use hint: tap words to edit; drag dividers to resize. Offer contextual help rather than a blocking tutorial. Put keyboard shortcuts in helpful labels or a compact guide. Ensure successful edit/autosave feedback is subtle.

Fix adjustment history and content-preserving relayout before adding saved variants. Once recovery is dependable, lightweight keep/lock/duplicate/favorite features can make repeated generation more rewarding. Do not add a large generic dashboard that displaces the street-sign wall.

## Acceptance criteria for an implementation task

| Viewport | Required observable result |
| --- | --- |
|320×568|Every primary command and More reachable; comfortable44px touch hit areas; no clipped labels; no hidden secondary actions; selected sign visibly previewed during adjustment.|
|390×844|Same; export scope/format explicitly selectable by touch; drawer or sheet leaves useful artwork feedback; Undo easy to reach.|
|620 and621 widths|No discontinuous jump to an offscreen toolbar; all controls remain reachable.|
|768×1024|Fonts, adjustments, PNG/SVG, About, hide reachable by actual pointer/touch interaction; no horizontal scrolling required.|
|844×390 landscape|Compact controls do not cover most artwork; sheet scrolls; no functions offscreen.|
|1024×768|Toolbar stays inside safe margins; no partially clipped adjustment or missing About/hide.|
|1280 and1440 desktop|Full or compact toolbar remains balanced; controls do not touch viewport edge; selected artwork is not hidden behind inspector.|
|Keyboard at all widths|Visible focus, editable text named; seams respond to appropriate arrow keys and announce values; panel close returns focus sensibly; tabs follow their advertised pattern; native About retains its correct behavior.|
|200% zoom and real mobile keyboard|To be tested in implementation; no claim of current pass. Interface reflows without losing controls; focused text remains visible.|
|Creation loop|Edit→tune→Undo→Redo→rearrange preserves intended content; switch era retains custom text; export selected sign and wall both work; reload retains current creation.|

### Risks to manage

- Increasing toolbar height can steal canvas area; measure it and refit without randomly replacing content.
- A preview must mirror the actual selected sign, not introduce a second unsynchronized editing state.
- Moving actions into More can reduce discoverability; preserve clear primary labels, era state, and recovery.
- A bottom sheet alone is insufficient if it covers the selected sign; acceptance is visible output, not simply a different panel position.
- Large tooltips or onboarding overlays can interrupt play; keep guidance dismissible and contextual.
- Do not replace authentic loud2010 palettes with generic muted UI colors in the artwork.

## Scores after rounds 3–4

No implementation occurred, so scores remain unchanged: responsive/touch **4.5/10**, keyboard/accessibility foundations **6.5/10**. From this specialist's broader product perspective: design **6.5/10** (strong artwork, weak adaptive editor), functions **6.0/10** across tested screen sizes (many core capabilities pass, but command reachability and recovery hinder routine use). These are expert judgments with stated scope, not an arithmetic claim that the site improved through additional rounds.
