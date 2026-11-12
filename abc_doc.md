# spiderguard: how to build this abc app

An abc app is a normal program. abc starts it, talks to it with small JSON
messages, and shows its page in a tab, its own window, or nowhere when it
runs in the background. This one is written in Node.js, with no libraries.

## The files

| File | What it is |
|---|---|
| `abc.json` | The manifest. See [docs/manifest.md](docs/manifest.md) |
| `main.js`, `src/` | The program. It answers abc messages |
| `ui/` | The page abc shows (`ui/index.html`) |
| `test/` | Tests. The app must pass them before it goes live |
| `docs/` | One file per feature. Start at [docs/README.md](docs/README.md) |

## How abc talks to the app

abc writes one JSON message per line to stdin and reads one per line from
stdout. Logs go to stderr only. Never print anything else to stdout.

| Message | Answer | When |
|---|---|---|
| `initialize` | `{ "capabilities": { "ui": true } }` | First. Within 5 seconds |
| `ping` | `"pong"` | abc checks the app is alive |
| `shutdown` | `null`, then exit | Within 3 seconds |

Also exit when stdin closes. The app can call abc too: `host.log`,
`host.notify` (needs `notifications`), `host.storage.get` / `set`,
`host.setBadge`, `host.openWindow`. The page gets an `abc` object:
`abc.call(method, params)` and `abc.on(notice, fn)`, and theme colors as
`var(--abc-accent)`, `var(--abc-text)`, `var(--abc-surface)`, `var(--abc-line)`.

SpiderGuard's own methods and notices: [docs/protocol.md](docs/protocol.md).

## Run and test

1. Install Node.js 20 or newer: `winget install OpenJS.NodeJS.LTS` (Windows),
   `brew install node` (macOS).
2. `npm install` (nothing to install, but it is the abc setup step).
3. `npm test`
4. `abc test`: checks the tool, installs, runs the tests, then starts the
   app and sends `initialize`, `ping` and `shutdown`. All four must pass.

## Publish

1. Push this folder to GitHub.
2. Tag the version: `git tag v1.1.0 && git push --tags`.
3. `abc login`, then `abc publish` (or `abc publish --private --token <t>`).

For a new version: raise `version` in `abc.json`, push, tag, `abc publish`.

## When something goes wrong

| Message | Fix |
|---|---|
| Tests failed | Read the output, fix, push again |
| No answer in 5 seconds | Answer `initialize` first, do slow work later |
| Version already exists | Raise the version |
