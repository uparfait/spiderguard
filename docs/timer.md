# The timer

Code: `src/timer.js` (pure), `src/session.js` (running state),
`src/effects.js` (what a phase change does). Tests: `test/timer.test.js`.

## No drift

A session saves its end time: `endsAt = now + minutes`. Each tick computes
`left = endsAt - now`. Ticks are never added up, so a slow or sleeping
computer never makes the timer wrong. `timer.js` never reads a clock: every
function takes `now`, so tests pass plain numbers and run in milliseconds.

## Phases

| Phase | Length | Then |
|---|---|---|
| `focus` | 25 minutes by default, 1 to 120 | a break |
| `short` | 5 minutes | `idle` |
| `long` | 15 minutes, after every 4th focus | `idle` |
| `idle` | | waits for Start |

Breaks come by themselves. Blocks are on only in `focus`, so they lift
during breaks. `round` counts finished focus sessions. Starting during a
break skips the rest of the break.

## Saved on every change

The state `{ phase, endsAt, startedAt, round, strict }` is saved with
`host.storage.set("session", ...)` on every change. At start, `resume()`
reads it back:

- still running: carry on, same end time;
- ended while closed: move on from the exact end time, so a break that
  started while abc was closed has the right time left;
- broken or longer than 2 hours: start at `idle`.

## Way out

- Gentle sessions end early with a 10 second hold on "End early" (the page).
- Strict sessions have no way out: `session.stop` gives an error.
- Every session has a hard limit of 2 hours, so nobody is locked out.

## Each second

`session.tick()` runs every second. It sends the `state` notice, updates the
tray badge when the minutes change, and moves to the next phase when time is
up. When a phase ends: a notice (`host.notify`), the history line, and the
blocks go on or off.
