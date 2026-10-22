# Final visual audit

**Current visual design score:7.0/10.** This is a reviewer benchmark, not a user-research metric. Strong1985 art direction (about8.4/10) and distinct, authentic2010 lettering earn the score. Offscreen tools at tablet widths, tiny icon-only mobile controls, editing panels that hide the artwork,and occasional unreadable supporting type prevent professional-product polish. No implementation changes were made; repeated review did not improve the site itself.

## Ranked changes

1. **Make the dock fit every supported width.** At768px, its right edge is1239px; critical editing/export controls are offscreen. KeepCreate/Shuffle,Edit,andExport visible; group secondary actions underMore. Allow measured wrapping or responsive overflow above620px. Keep expressive square buttons,local type,and ink colors.
2. **Keep the chosen sign visible while editing.** At390px the font drawer covers340px (87.2%) of the viewport. Use a mobile sheet with pinned selected-sign preview,and keep live visual feedback during font/spacing changes. On desktop,ensure the active sign can be brought clear of the panel.
3. **Protect the canvas from control occlusion.** In18 sampled walls, the dock covers more than15% of47/210 signs,with35% worst-case mobile coverage. Reserve appropriate canvas space while controls are shown,or offer an obvious Focus view that preserves the wall composition. Hiding the dock should not require identifying an unlabeled eye icon.
4. **Reveal the playful interactions gently.** Show one small,dismissible contextual hint for tap-to-edit text and draggable dividers. Group labels can establish“Create,Edit,Export”without a welcome modal or tutorial gate. Provide clear scope feedback for“shuffle this sign”versus“shuffle street.”
5. **Support a trail of good variations.** AddSave variant/Favorite orDuplicate to let users keep good work while exploring. Preserve instant random generation and existing per-sign dice. Treat known text-loss/undo/export defects as reliability work before adding new decorative features.

## Do not remove the character

Keep the saturated2010 inks,line-by-line colors,keylines,and honest street-sign hierarchy. Do not replace them with neutral cards,gradients,or generic white design-tool styling. Thehot-toc recipe deliberately makesHỚT TÓC NAM the hero and the name a smaller supporting line; do not force every shop name into the same hierarchy. Improve minimum readable supporting type without erasing these recipes.

## Acceptance criteria for a future9/10 review

- Test320,390,621,768,1024,1280,and1440px widths:all primary controls are visible and every secondary action has a clear reachable path. Mobile primary targets are at least44px with concise visible labels.
- Editing fonts/spacing keeps a legible selected-sign preview visible; closing/reopening the panel preserves context.
- Default editor controls do not obscure essential hero/contact content;Focus is discoverable and works on touch.
- Repeat18-wall sampling with fonts fully loaded:important text is legible,no unintended text clipping,and no broken compositions at supported sizes. Verify long custom names and extreme allowed adjustments separately.
- PNG/SVG output matches the visible design under ordinary edits and long-text/spacing stress cases; export scope is obvious.
- A brief first-use review can discover editing,resize,shuffle,andexport without reading documentation. Continuing creation can keep a good variant and undo destructive changes predictably.

9/10 is a future acceptance target,not an earned score for recommendations that have not been implemented or tested.

Evidence:round2.json,round2-desktop-contact.png,round2-mobile-contact.png,r3-tablet-overflow.png,r3-mobile-small-supporting.png,and first-round screenshots in this directory.
