# Blocking apps

Code: `src/apps.js` (scan), `src/app-actions.js` (minimize, close),
`src/guard.js` (loop), `src/protected.js`. Tests: `test/apps.test.js`.

## The scan

During focus, every 2 seconds SpiderGuard reads the running programs:

| System | Command |
|---|---|
| Windows | `tasklist /fo csv /nh` |
| macOS, Linux | `ps -A -o pid=,comm=` |

Each program name is matched against the app rules (see [rules.md](rules.md)).
A scan never overlaps the one before. The scan stops when focus ends.

## Gentle and strict

| Mode | What happens | Notice |
|---|---|---|
| Gentle (default) | The app window is minimized | `host.notify` once per app per session, and a `blocked` notice to the page every time |
| Strict | The app is closed | Same |

Minimizing:

- Windows: one PowerShell stays open for the session and calls
  `ShowWindowAsync(..., 6)` on the main window of each process id. It is
  not started again on every scan.
- macOS: `System Events` hides the process.
- Linux: `xdotool windowminimize`, when xdotool is installed.

Closing uses the normal process kill for that process id.

## Never blocked

These are never matched, even when a rule names them:

- the desktop shell: `explorer`, `Finder`, `Dock`, GNOME Shell, Plasma;
- system processes: `svchost`, `csrss`, `winlogon`, `lsass`, `dwm`,
  `launchd`, `kernel_task`, `systemd` and others;
- terminals: `cmd`, `powershell`, `pwsh`, Windows Terminal, `Terminal`,
  iTerm2, `bash`, `zsh`, `konsole`, `alacritty`, `kitty` and others;
- abc itself (`abc`, `electron`) and SpiderGuard (`node`, its own process
  and its parent).

The full list is in `src/protected.js`.
