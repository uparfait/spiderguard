# The page

Code: `ui/index.html`, `ui/css/`, `ui/js/`.

abc loads the page from a `file://` link, sandboxed, with a small `abc`
object. ES modules do not load from `file://`, so the scripts are plain
scripts that share one `SG` object (`ui/js/bridge.js`).

## Views

| View | What it shows |
|---|---|
| Timer | The ring, minutes left, phase, 4 round dots. Idle: length, Strict, Start. Focus: "Hold 10s to end early", or a note for strict |
| Rules | Group toggles, an input for a site or app, chips to remove rules |
| Today | Three tiles and the last 7 days. See [history.md](history.md) |

## Colors

| Token | Light | Dark | Use |
|---|---|---|---|
| `--fg-bg` | `#FBF7F2` | `#1E1410` | Page background |
| `--fg-surface` | `#FFFFFF` | `#2A1D17` | Cards, inputs, tabs |
| `--fg-text` | `#2B1A12` | `#F3E9E1` | Main text |
| `--fg-muted` | `#7A6457` | `#B8A497` | Labels and hints |
| `--fg-focus` | `#5E3023` | `#C98A6B` | Focus ring and main button |
| `--fg-break` | `#228B22` | `#5CC45C` | Break ring, round dots, "done" |
| `--fg-line` | `#E8DCD2` | `#3A2A22` | Borders, empty ring |
| `--fg-alert` | `#B3261E` | `#F2B8B5` | Only blocked app notices |

When abc gives `--abc-accent`, it takes the place of `--fg-focus`, and
`--abc-accent-text` is the button text. abc sets `--abc-mode`; the page
copies it to `data-theme` and follows `theme.changed`. Outside abc, it
follows the computer's dark setting. Text keeps 4.5:1 contrast.

The timer never turns red. Flat colors and lines, no shadows, square
corners, 8px spacing steps, system font.

## Ring and motion

- One SVG circle. Its `stroke-dashoffset` drops each second, with a 1s
  linear transition.
- Digits use `tabular-nums`: 64px in a tab, 28px under 420px wide.
- When focus runs out, the ring fills with green over 600ms and one soft
  chime plays (Web Audio, `ui/js/chime.js`). A stop by hand has no chime.
- With `prefers-reduced-motion`, there are no transitions: the ring only
  changes color.
- "End early" needs a 10 second hold (mouse, touch, Space or Enter).
