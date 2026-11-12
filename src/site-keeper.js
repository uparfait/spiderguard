// Keeps the site block in place during focus. If another program, an
// antivirus clean-up or a hand edit takes the block out of the hosts file,
// it is put back within 15 seconds. It never opens an admin prompt itself.
import { hostsHasBlock } from './hosts-file.js';

export function createSiteKeeper({ sites, every = 15000, hasBlock = hostsHasBlock }) {
  let timer = null;
  let wanted = [];
  let busy = false;

  async function check() {
    if (busy || !wanted.length || hasBlock()) return;
    busy = true;
    try {
      await sites.apply(wanted, { prompt: false });
    } finally {
      busy = false;
    }
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    wanted = [];
  }

  function start(list) {
    stop();
    wanted = list;
    if (wanted.length) timer = setInterval(check, every);
  }

  return { start, stop, check };
}
