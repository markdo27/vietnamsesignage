# Responsive and accessibility audit — rounds 1–2

Browser: real headless Chromium at 1440×900, 768×1024, 390×844, 320×568, 844×390, then threshold checks at 620,621,1024,1280,1366 widths. Actual user interaction assertions; no source changes.

## Scores (provisional, unchanged site)

- Responsive/touch usability: **4.5/10**. Attractive wall adapts sensibly, but toolbar functions disappear at tablet/narrow-desktop widths. Phone controls technically render yet are too narrow for comfortable repeated creation.
- Keyboard/accessibility foundations: **6.5/10**. Explicit names for sign textboxes and controls, accessible keyboard seams and live status, reduced-motion CSS, and well-behaved native About dialog are meaningful strengths. Tiny editor typography, missing edit focus outline, panel navigation friction remain.

These are expert heuristic assessments, not an external certification or user-study score.

## Confirmed priority findings

1. **P1: toolbar functions offscreen at intermediate widths**. CSS `plaza.css:216`, `.dock-actions` at 238 and phone-only breakpoint at 632. At 768px viewport, dock is 1225.375px wide and ends x=1239.375; SVG, fonts, adjust, about, hide fully outside screen, PNG partly clipped. At 1024, adjust partly clipped, about/hide fully offscreen. Actual hide-button clicks time out at 768/1024, work at1280. Page forbids overflow, so user cannot scroll to them. At621 regression starts immediately after620 phone breakpoint. Acceptance: every action physically reachable at320,390,620,621,768,844,1024,1280,1440; no horizontal overflow or clipped controls. A content-aware compact toolbar or explicit overflow menu is preferable to relying on squeeze.
2. **P1/P2: phone toolbar sacrifices touch targets and discoverability**. At390 all12 buttons remain one row, 22.4–29.3px widths and40px tall. At320 some history controls16.6px, many18.9px, max22.3px. 23px per-sign tools and26px close controls add precision demands. Icon-only theme/export controls have screenreader labels but no visible meaning on touch. Acceptance: comfortably spaced ~44px touch hit areas; short labels or an accessible More menu; undo always easy to reach.
3. **P2: editing panel hides the output on phones**. Drawer340px at390px viewport (87.2% width); at320 uses281.6px (88%). Changes cannot be judged live on most of the wall. Screenshot390-drawer.png. Acceptance: bottom sheet/compact panel with sign preview or focused single-sign editing; do not obscure selected output during adjustments.
4. **P2: inspector text is unusually small**. Computed labels8.8px, body9.28–9.6px, selects9.92px; source305/315. Acceptance: readable labels/input text in12–14px+ range without clipping, better contrast for hint text, support zoom/reflow.
5. **P2/P3: keyboard editing polish**. Opening nonmodal drawer via Enter leaves focus on trigger; Tab passes adjust/about/hide before drawer close. Escape deselects board rather than closes drawer. Tab controls have role=tab but ArrowRight does nothing. First editable line receives focus with `outline:none 0px` because `.line` sets outline0; caret alone provides editing cue. Acceptance: focus useful panel control on open, return to trigger on close, Escape closes it when focus is within, arrow-key tab pattern; clear textbox focus cue. A modal focus trap is NOT required for this nonmodal drawer.

## Verified strengths

- At1440 all toolbar controls visible, desktop wall makes strong use of space.
- Phone board count drops to4–5; composition remains edge-to-edge without page overflow.
- Gutter has role=separator, orientation and current percentage; keyboard step tested58→63 (+5points), updates value.
- Editable category/name/footer text has descriptive accessible names and single-line textbox semantics.
- About uses native named dialog: focus moves to close button, Escape closes it, focus returns to About.
- Reduced-motion media query removes transitions; status toasts use role=status aria-live=polite.

## Artifacts

`measurements.json`, `keyboard.json`, `round2.json`, `768-wall.png`, `390-drawer.png`, are retained in this directory. Additional temporary screenshots are not included.
