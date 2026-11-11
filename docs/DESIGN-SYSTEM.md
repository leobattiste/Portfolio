# Design system

The whole design lives in `src/styles.css`. There is no CSS framework and no component library. Every page is rendered to static HTML at build time and hydrated with React for the interactions.

## Tokens

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--paper` | `#fafafb` | `#131417` | Page background |
| `--ink` | `#17181c` | `#ecedef` | Text, focus rings |
| `--graphite` | `#62656e` | `#9a9da6` | Secondary text, labels |
| `--mist` | `#e4e5e9` | `#2a2c32` | Hairlines |
| `--wash` | `#f0f1f4` | `#1d1e23` | Hover fills, inputs |
| `--marigold` | `#ffc233` | `#ffc233` | The highlighter: keyboard position, saved state, selection |

Marigold is the only accent. It marks where the reader is or what they kept, and is never decoration.

## Type

One family, Schibsted Grotesk Variable, served with the site.

- Statement: `clamp(1.5rem, 1.05rem + 1.9vw, 2.125rem)`, weight 500, tracking -0.022em. Each page opens with one; the first paragraph is the `h1` in ink, the second continues in graphite.
- Body: 1rem / 1.55. Long-form prose: 1.0625rem / 1.6, 38rem measure.
- Labels and metadata: 0.9375rem in graphite, sentence case. No capitals, no letter-spacing.

## Layout

Every block is a `.row`: an 11rem rail on the left for the label, and a content column beside it. The header, each section, the Toolbox categories and the footer all sit on the same two columns. Below 48rem the rail stacks above the content. Use `<Section label="…">` and `<Intro>` from `src/components/Layout.tsx` rather than new wrappers.

## Interaction

- **Page transitions.** `@view-transition { navigation: auto }` cross-fades between pages. A project cover carries the same `view-transition-name` on the home page, Work and its case study, so it moves into place.
- **Theme.** The toggle opens the new theme as a circle from the button. The choice is stored under `leo-appearance`; first visits follow the system setting.
- **Peeks.** Links inside the home statement show a small preview on hover or keyboard focus.
- **Cover chip.** A label follows the pointer over a project cover.
- **Toolbox.** `/` focuses the filter, arrow keys or J and K move through the list, S saves, Enter opens. The focused row is filled with marigold. Filters are kept in the URL.

All motion answers an action. `prefers-reduced-motion` turns transitions off.

## Checks

`pnpm run check` builds the site and runs content, route and DOM interaction tests. The DOM suite hydrates the prerendered Toolbox and exercises filtering, saving, keyboard navigation and the theme. It does not replace looking at the pages in a browser.
