# SpiderGuard

Block distracting sites and apps during work sessions, with a calm ring
timer. An abc app in Node.js.

- One click starts a session (25 minutes by default). Chosen sites stop
  loading and chosen apps are held back until the session ends.
- A calm ring timer shows in a tab or a small window. In the background,
  the tray badge shows the minutes left.
- Breaks come by themselves: 5 minutes, or 15 after every 4 sessions.
  Blocks lift during breaks.
- Gentle mode minimizes blocked apps. Strict mode closes them and has no
  way out, but no session is longer than 2 hours.
- A daily view shows focus minutes, sessions done and the current streak.
  Nothing leaves the computer.

Blocking sites changes the system hosts file, so SpiderGuard asks once for
admin rights, through the normal OS prompt, and always removes its block
when a session ends or the app stops.

## Use

```bash
abc install spiderguard
abc start spiderguard
```

## Build

```bash
npm test     # unit and protocol tests
abc test     # every publish check
abc publish
```

Read [abc_doc.md](abc_doc.md) for the abc basics, and [docs/](docs/README.md)
for each feature.
