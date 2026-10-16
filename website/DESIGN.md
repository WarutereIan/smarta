# Smarta site design record

Mode: **Persuade** (landing page). Visitor: a landlord or property manager, usually on a phone, in daylight. That scene sets a light working ground; dark is used only where money moves.

## System

- **Colour.** Limewash ground (`--paper`), reservoir ink (`--ink`), one accent: water aqua, in two lightnesses (`--aqua` on light grounds, `--aqua-on-night` on dark). Colour commits at page scale through two full-bleed fields: the aqua "turn" band and the night fields (top-up story, calculator result, close). Brass and wheel-red belong to the meter drawing only; red doubles as the alarm colour.
- **Type.** Two families. Archivo: wide for display, condensed with tabular figures (`.num`) for every reading, token and amount. Public Sans: prose, labels and controls. No monospace.
- **Radius.** `--r-s` 6px for controls and tags, `--r-m` 12px for panels. Drawn objects (meter, phone, SMS bubbles) keep their real shapes.
- **Motion.** One load entrance (headline lines and meter). Scroll moments, each a different device: hero depth layers, the red line across the postpaid month, the word fill on the aqua band, the pinned top-up story (the only pinned act), a guided tour of the meter cutaway, the leak appearing on the network map. Easing `--ease-out`. Reduced motion drops travel and loops but keeps state changes.
- **Layout.** No two neighbouring sections share a layout family: timeline, full-bleed statement, pinned stage, type with overlapping messages, full-width drawing with a parts rail, map with charts, ledger table, split calculator, route line, single reading column, split close.

## Digital edition

`digital.html` swaps the brass dial for the box-bodied digital meter (flip lid, LCD dial, brass couplings, seal) and the in-house keypad unit. The keypad is live: visitors can type the SMS token, see it accepted once, and see it rejected as used the second time. Hardware colours are the objects' own and stay fixed in both themes. Everything else is shared with `index.html`.

## Refused on purpose

These patterns came out of the impeccable and scroll-craft audits. Don't reintroduce them without a reason from the brief:

- Eyebrow labels above headings; small tracked uppercase labels as decoration
- A third font family, especially IBM Plex, Space Grotesk or Inter as display
- A badge or spec row under the hero; a hero with more than headline, one line of copy and two actions
- Glass and blur as decoration; gradient text; gradient progress bars; decorative ripples
- Grids of identical icon + heading + text cards; three equal feature cards
- Div-built dashboards outside the top-up story
- The same fade-up entrance on every section
- Pill buttons; more than one label for the same action ("Book a site visit" everywhere)
- Invented statistics; every figure on the page is either the visitor's own input or labelled as an example
