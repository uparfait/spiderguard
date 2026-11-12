# Talking to abc

One JSON-RPC 2.0 message per line. abc writes to stdin, SpiderGuard writes
to stdout. Logs go to stderr only (`src/rpc.js`).

## abc messages

| Message | Answer | Notes |
|---|---|---|
| `initialize` | `{ "capabilities": { "ui": true } }` | Answered at once. Loading starts after the answer (`src/app.js`) |
| `ping` | `"pong"` | |
| `shutdown` | `null`, then exit | All blocks are lifted **before** the answer |
| stdin closes | exit | abc is gone: blocks are lifted, then exit |

`initialized` and `mode.changed` notices from abc need no answer.

## Our methods

The page calls these with `abc.call(method, params)`.

| Method | Params | Result |
|---|---|---|
| `session.start` | `{ minutes, strict }` | the state (below). Minutes 1 to 120 |
| `session.stop` | | the state. Error for a strict session |
| `session.status` | | the state |
| `rules.get` | | `{ rules, groups, sites, apps }` |
| `rules.set` | `{ rules: [text] }` | same as `rules.get`. Applies at once during focus |
| `stats.get` | | `{ minutesToday, sessionsToday, streak, totalSessions, week }` |

The state: `{ phase, left, total, round, strict, endsAt }`. `phase` is
`idle`, `focus`, `short` or `long`. `left` and `total` are seconds.

## Notices to the page

Read with `abc.on(name, fn)`.

| Notice | Params | When |
|---|---|---|
| `state` | the state | Every second while a phase runs, and on every change |
| `blocked` | `{ app, strict }` | An app was minimized or closed |
| `blocking` | `{ sites, count, apps }` | Blocks were applied. `sites: false` means no admin rights |
| `notice` | `{ kind, text }` | Before the admin prompt, with the reason |

## Calls to abc

| Call | Use |
|---|---|
| `host.storage.get` / `set` | Key `session`: `{ phase, endsAt, startedAt, round, strict }` on every change. Key `rules`: the rule list |
| `host.setBadge` | Minutes left, sent when the number changes (once a minute). `""` clears it |
| `host.notify` | A phase ended, or an app was held back (once per app per session) |
| `host.log` | Errors writing the hosts file |

A failed host call is logged to stderr and never stops the app.
