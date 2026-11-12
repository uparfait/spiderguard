# Testing and publishing

## Unit and protocol tests

```bash
npm test
```

This runs `node --test`. Nothing to install: only Node built-ins (Node 20+).
Tests use a fake clock and fake process lists, so they run in a few seconds
and never touch the real hosts file or apps.

| File | Checks |
|---|---|
| `test/timer.test.js` | Resume after a restart, a session that ended while closed, long break after 4, 2 hour limit, strict cannot stop, bad saved data |
| `test/rules.test.js` | Subdomains, cleaning names, protected apps never match, groups, saved list |
| `test/hosts.test.js` | Block added once, removed completely, line endings kept, only plain domains |
| `test/helper.test.js` | Link files, heartbeat, waiting for "done", helper exits when SpiderGuard is gone |
| `test/apps.test.js` | `tasklist` and `ps` output, gentle minimizes, strict closes, protected left alone |
| `test/stats.test.js` | History lines, minutes, sessions and streak |
| `test/main.test.js` | Starts `main.js` like abc: `initialize`, `ping`, `shutdown`, sessions, restart, rules, stats |

`test/fake-host.js` plays abc: it answers `host.storage.*` and other host
calls, and sets `SPIDERGUARD_DRY_RUN=1`.

## The abc checks

```bash
abc test
```

abc checks Node is installed, runs `npm ci`, runs `npm test`, then starts
the app and sends `initialize`, `ping` and `shutdown`. All four must pass.

## Publish

```bash
git push
git tag v1.0.0 && git push --tags
abc login
abc publish
```

For a new version, raise `version` in `abc.json` and `package.json`, push,
tag `v<version>`, then `abc publish`.

## Trying it by hand

Run it from abc (`abc start spiderguard`), start a 1 minute session with
`youtube.com` in the rules, and accept the admin prompt. The site should
stop loading. When the minute ends, the block is gone and a break starts.
