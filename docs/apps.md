# Blocking apps

Code: `src/scan.js`, `src/apps.js`, `src/guard.js` (loop), `src/app-actions.js`,
`src/win-shell.js`, `src/win-native.js`, `src/app-names.js`, `src/protected.js`.
Tests: `test/apps.test.js`, `test/names.test.js`.

## The scan

During focus, every 2 seconds SpiderGuard reads every running program, with
two names each, so a rule can use either:

| System | How | Names |
|---|---|---|
| Windows | The session PowerShell: `Get-Process` (`tasklist` if it fails) | Program name and its description: `charmap` / "Character Map" |
| macOS | `ps -A -o pid=,comm=` | Program path and app bundle: "Google Chrome" |
| Linux | `ps -A -o pid=,comm=,args=` | Short name and full command (the short one is cut to 15 characters) |

Each name is matched against the app rules, including known display names
(see [rules.md](rules.md)). A protected program is never held back, even if
its description matches. Every matching process is held back, so an app
made of many processes (Chrome, Discord, Teams) is held back as a whole. A
scan never overlaps the one before, and the scan stops when focus ends.

## Gentle and strict

| Mode | What happens | Notice |
|---|---|---|
| Gentle (default) | Every window of the app is minimized | `host.notify` once per app per session, and a `blocked` notice to the page |
| Strict | The app is closed | Same |

Minimizing on Windows (`src/win-native.js`): the same session PowerShell
walks every top-level window, so an app with several windows
has all of them minimized. Store apps (WhatsApp, Netflix, Calculator) draw
inside an `ApplicationFrameWindow` owned by another process; those frames
are found by their inner window. Hidden, minimized and cloaked windows are
skipped. On macOS, `System Events` hides the app; on Linux, `xdotool`
minimizes it when installed.

Closing: on Windows, one `taskkill /F` call ends every matched process.
Child programs that are not blocked themselves (like a terminal opened from
an editor) are left alone. On macOS and Linux each process gets `SIGTERM`.
An app that comes back is held back again on the next scan.

## Never blocked

These are never matched, even when a rule names them:

- the desktop shell: `explorer`, `Finder`, `Dock`, the Store app frame
  host, GNOME Shell, Plasma;
- system processes: `svchost`, `csrss`, `winlogon`, `lsass`, `dwm`, the
  admin prompt, Windows Defender, `launchd`, `systemd` and others;
- terminals: `cmd`, `powershell`, `pwsh`, Windows Terminal, `Terminal`,
  iTerm2, `bash`, `zsh`, `konsole`, `alacritty`, `kitty` and others;
- abc itself (`abc`, `electron`) and SpiderGuard (`node`, its own process
  and its parent).

The full list is in `src/protected.js`.
