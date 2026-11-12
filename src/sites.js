// Blocks sites. It first tries to write the hosts file itself. Without
// admin rights it hands the list to the elevated helper, which it starts
// once, with a clear reason. If the person says no, it does not ask again
// until they start a new session.
import { writeSites, hostsHasBlock } from './hosts-file.js';
import { linkFiles, writeJsonFile, helperAlive, waitDone } from './helper-link.js';
import { launchHelper, REASON } from './elevate.js';

const DENIED = ['EPERM', 'EACCES', 'EROFS'];
const PROMPT_WAIT = 60000;
const HELPER_WAIT = 6000;
const QUICK_WAIT = 1500;

export function createSiteBlocker({ dataDir, host, dry = false }) {
  let seq = Date.now();
  let declined = false;
  let launchedAt = 0;

  async function viaHelper(sites, prompt) {
    const mine = ++seq;
    writeJsonFile(linkFiles(dataDir).want, { seq: mine, sites });
    const running = helperAlive(dataDir);
    // One admin prompt at a time: a prompt already on screen is waited for.
    if (!running && Date.now() - launchedAt > PROMPT_WAIT) {
      if (!prompt || declined) return false;
      launchedAt = Date.now();
      host.emit('notice', { kind: 'admin', text: REASON });
      launchHelper(dataDir);
    }
    const ok = await waitDone(dataDir, mine, !prompt ? QUICK_WAIT : running ? HELPER_WAIT : PROMPT_WAIT);
    if (!ok && prompt && !helperAlive(dataDir)) declined = true;
    return ok;
  }

  // Gives true when the hosts file now matches the list.
  async function apply(sites, { prompt = true } = {}) {
    if (dry) return true;
    if (!sites.length && !hostsHasBlock()) return true;
    try {
      writeSites(sites);
      return true;
    } catch (err) {
      if (!DENIED.includes(err.code)) {
        host.log('error', `hosts file: ${err.message}`);
        return false;
      }
    }
    return viaHelper(sites, prompt);
  }

  return {
    apply,
    // Lifts every block. At shutdown there is no time to ask, so prompt is off.
    clear: (opts) => apply([], opts),
    // A new session may ask for admin rights again.
    allowAsk: () => { declined = false; }
  };
}
