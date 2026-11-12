# abc.json

```json
{
  "name": "spiderguard",
  "displayName": "SpiderGuard",
  "version": "1.0.0",
  "type": "app",
  "language": "node",
  "entry": "main.js",
  "modes": ["tab", "window", "background"],
  "defaultMode": "window",
  "ui": { "path": "ui/index.html", "size": [320, 380] },
  "permissions": ["notifications"],
  "restart": "on-failure"
}
```

| Field | Value | Why |
|---|---|---|
| `language` / `entry` | `node`, `main.js` | abc runs `node main.js` from the app folder |
| `modes` | tab, window, background | The timer fits a tab or a small window. In the background the tray badge shows the minutes left |
| `defaultMode` | `window` | A small always-there timer |
| `ui.size` | 320 x 380 | The mini window. The page switches to 28px digits below 420px wide |
| `permissions` | `notifications` | Needed for `host.notify` (phase ends, held back apps). abc refuses `host.notify` without it |
| `restart` | `on-failure` | Restart after a crash. abc accepts only `never` or `on-failure`, so this is the value for "restart on crash" |

## Admin rights

The hosts file needs admin rights. SpiderGuard does **not** ask for the
`elevated` permission, because that would run the whole app as admin.
Instead it starts one small helper with admin rights, through the normal OS
prompt, only when a site must be blocked. See [sites.md](sites.md).

## How abc runs it

- abc runs `node main.js` with the app folder as working folder. On Windows
  it goes through a shell, and abc stops it with `taskkill /T`.
- Only basic values pass in the environment (`PATH`, `SystemRoot`, `HOME`,
  `TEMP` and a few more), plus `ABC_APP_NAME`, `ABC_DATA_DIR` and `ABC_MODE`.
- The data folder is `~/.abc/data/spiderguard`. SpiderGuard keeps
  `history.json` and the helper link files there. abc keeps
  `storage.json` there for `host.storage`.
- No libraries: only Node built-ins, so `npm ci` installs nothing.

## A new version

Raise `version` in `abc.json` and `package.json`, push, tag `v<version>`,
then run `abc publish`.
