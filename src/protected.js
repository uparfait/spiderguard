// Apps that can never be blocked: the desktop shell, system processes,
// terminals and abc itself. Names are lowercase, with no ".exe" or ".app".
const SHELL = ['explorer', 'finder', 'dock', 'systemuiserver', 'loginwindow', 'windowserver',
  'startmenuexperiencehost', 'shellexperiencehost', 'searchhost', 'gnome-shell', 'plasmashell'];

const SYSTEM = ['system', 'idle', 'registry', 'smss', 'csrss', 'wininit', 'winlogon', 'services',
  'lsass', 'svchost', 'dwm', 'fontdrvhost', 'sihost', 'taskhostw', 'ctfmon', 'runtimebroker',
  'conhost', 'taskmgr', 'launchd', 'kernel_task', 'systemd', 'init', 'xorg', 'xwayland',
  'kwin_x11', 'kwin_wayland', 'activity monitor', 'mdworker', 'coreaudiod'];

const TERMINALS = ['cmd', 'powershell', 'pwsh', 'windowsterminal', 'wt', 'openconsole', 'terminal',
  'iterm2', 'bash', 'zsh', 'sh', 'fish', 'gnome-terminal', 'gnome-terminal-server', 'konsole',
  'xterm', 'alacritty', 'kitty', 'wezterm', 'wezterm-gui'];

// abc runs on Electron, and SpiderGuard runs on Node.
const ABC = ['abc', 'electron', 'node', 'spiderguard'];

const PROTECTED = new Set([...SHELL, ...SYSTEM, ...TERMINALS, ...ABC]);

export const isProtected = (name) => PROTECTED.has(String(name).toLowerCase());
