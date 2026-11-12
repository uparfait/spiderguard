// Holds back blocked apps during a focus session: every 2 seconds it reads
// the running programs and minimizes (gentle) or closes (strict) matches.
import { findBlocked } from './apps.js';
import { listApps } from './scan.js';
import { minimizeApps, closeApps } from './app-actions.js';
import { showApp } from './app-names.js';

const DEFAULT_ACTIONS = { minimize: minimizeApps, close: closeApps };
// The name people know: the description or bundle ("Character Map"), not
// "charmap". On Linux the second name is a command, so the short name is used.
const label = (p) => showApp(process.platform !== 'linux' && p.alt ? p.alt : p.name);

export function createAppGuard({ host, list = listApps, actions = DEFAULT_ACTIONS, every = 2000 }) {
  let timer = null;
  let busy = false;
  let apps = [];
  let strict = false;
  const told = new Set();

  async function scan() {
    if (busy) return;
    busy = true;
    try {
      const found = findBlocked(await list(), apps);
      if (!found.length) return;
      const pids = found.map((p) => p.pid);
      if (strict) actions.close(pids);
      else actions.minimize(pids);
      for (const app of new Set(found.map(label))) {
        host.emit('blocked', { app, strict });
        if (told.has(app)) continue;
        told.add(app);
        host.notify('App held back', `${app} was ${strict ? 'closed' : 'minimized'}. It is blocked until the session ends.`);
      }
    } finally {
      busy = false;
    }
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function start(opts) {
    stop();
    apps = opts.apps;
    strict = Boolean(opts.strict);
    told.clear();
    if (!apps.length) return;
    timer = setInterval(scan, every);
    scan();
  }

  return { start, stop, scan };
}
