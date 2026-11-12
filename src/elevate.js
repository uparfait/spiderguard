// Starts the hosts helper with admin rights, through the normal OS prompt:
// UAC on Windows, the admin password box on macOS, polkit on Linux.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HELPER = fileURLToPath(new URL('./hosts-helper.js', import.meta.url));
export const REASON = 'SpiderGuard needs admin rights once to block sites in the hosts file.';

const psQuote = (s) => `'${String(s).replace(/'/g, "''")}'`;
const shQuote = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

// Start-Process joins arguments with spaces, so each one keeps its own quotes.
function windows(args) {
  const list = args.map((a) => psQuote(`"${a}"`)).join(',');
  const script = `Start-Process -FilePath ${psQuote(process.execPath)} -ArgumentList ${list} -Verb RunAs -WindowStyle Hidden`;
  return ['powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script]];
}

function mac(args) {
  const line = `${[process.execPath, ...args].map(shQuote).join(' ')} >/dev/null 2>&1 &`;
  const apple = `do shell script ${JSON.stringify(line)} with administrator privileges with prompt ${JSON.stringify(REASON)}`;
  return ['osascript', ['-e', apple]];
}

const linux = (args) => ['pkexec', [process.execPath, ...args]];

// The helper stops by itself when this process ends.
export function launchHelper(dataDir) {
  const args = [HELPER, dataDir, String(process.pid)];
  const pick = { win32: windows, darwin: mac }[process.platform] || linux;
  const [cmd, cmdArgs] = pick(args);
  const child = spawn(cmd, cmdArgs, { stdio: 'ignore', windowsHide: true, detached: process.platform !== 'win32' });
  child.on('error', (err) => console.error(`[spiderguard] admin prompt failed: ${err.message}`));
  child.unref();
}
