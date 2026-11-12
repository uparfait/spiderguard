# History and the daily view

Code: `src/history.js`, `src/stats.js`, `ui/js/stats-view.js`.
Tests: `test/stats.test.js`.

## history.json

The history is `history.json` in the data folder (`dataDir`, also
`ABC_DATA_DIR`). It has one JSON line per finished session:

```text
{"start":1762950000000,"minutes":25,"kind":"focus"}
{"start":1762953600000,"minutes":7.3,"kind":"early"}
```

| Field | Meaning |
|---|---|
| `start` | When the session started (ms since 1970) |
| `minutes` | Focus minutes, one decimal |
| `kind` | `focus`: ran to the end. `early`: ended by hand |

A line is added when focus ends by itself, or when a gentle session is
ended early. Breaks are not written. A broken line (a crash mid-write) is
skipped. Nothing leaves the computer.

## The numbers

`stats.get` reads the file and computes, in local time:

| Number | How |
|---|---|
| Focus minutes today | All minutes from `focus` and `early` lines today |
| Sessions today | `focus` lines today |
| Streak | Days in a row with at least one `focus` line, counting back from today. If today has none yet, it counts from yesterday, so the streak holds until the day ends |
| Last 7 days | Focus minutes for each day |

## The view

Three tiles (minutes, sessions, streak) and seven bars for the last 7 days.
Bars use one color (the focus color), sit on a baseline with a 2px gap, and
show the day and minutes on hover or keyboard focus. Each bar has a text
label for screen readers. The numbers load fresh each time the view opens.
