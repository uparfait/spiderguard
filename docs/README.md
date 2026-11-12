# SpiderGuard docs

SpiderGuard blocks distracting sites and apps during focus sessions, with a
calm ring timer. It is an abc app in Node.js: abc starts `main.js`, talks to
it with JSON-RPC over stdin and stdout, and shows `ui/index.html` in a tab, a
small window, or nowhere when it runs in the background.

One file per feature:

| File | Feature |
|---|---|
| [manifest.md](manifest.md) | The `abc.json` fields and why each value was chosen |
| [protocol.md](protocol.md) | Messages abc sends, our own methods, notices, host calls |
| [timer.md](timer.md) | The session timer: no drift, breaks, restart, hard limit |
| [rules.md](rules.md) | Rules: sites, apps, groups, matching |
| [sites.md](sites.md) | Site blocking through the hosts file and the admin helper |
| [apps.md](apps.md) | App blocking: scan, gentle and strict, protected apps |
| [history.md](history.md) | History file and the daily view numbers |
| [ui.md](ui.md) | The page: colors, ring, motion, theme, views |
| [testing.md](testing.md) | Tests, `abc test`, and publishing |

## Where the code is

| Path | What it does |
|---|---|
| `main.js` | Starts the protocol loop |
| `src/rpc.js`, `src/host.js` | JSON-RPC lines, calls to abc |
| `src/app.js`, `src/methods.js` | Boot after `initialize`, every method |
| `src/timer.js`, `src/session.js`, `src/effects.js` | Timer, running session, phase side effects |
| `src/rules.js`, `src/groups.js`, `src/protected.js`, `src/rules-store.js` | Rules |
| `src/hosts.js`, `src/hosts-file.js`, `src/sites.js` | Hosts file block |
| `src/elevate.js`, `src/hosts-helper.js`, `src/helper-link.js` | Admin helper |
| `src/apps.js`, `src/app-actions.js`, `src/guard.js` | App blocking |
| `src/history.js`, `src/stats.js` | History and stats |
| `ui/` | The page: `index.html`, `css/`, `js/` |
| `test/` | Tests (`npm test`) |

Every file is 60 lines or less, so each one can be read in one go.
