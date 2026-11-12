// Builds SpiderGuard after "initialize": slow work starts only after the
// answer is sent, so abc gets it well inside its 5 seconds.
import { join } from 'node:path';
import { host } from './host.js';
import { createRuleStore } from './rules-store.js';
import { createSiteBlocker } from './sites.js';
import { createAppGuard } from './guard.js';
import { stopActions } from './app-actions.js';
import { createEffects } from './effects.js';
import { createSession } from './session.js';

export function createApp() {
  let parts = null;
  let ticker = null;
  let started;
  const ready = new Promise((resolve) => { started = resolve; });

  async function boot(params) {
    const dataDir = params.dataDir || process.env.ABC_DATA_DIR || join(process.cwd(), '.data');
    // Tests set this so no real hosts file or app is touched.
    const dry = process.env.SPIDERGUARD_DRY_RUN === '1';
    const rules = createRuleStore(host);
    const sites = createSiteBlocker({ dataDir, host, dry });
    const guard = createAppGuard({ host, ...(dry ? { list: async () => [] } : {}) });
    const effects = createEffects({ host, sites, guard, rules, dataDir });
    const session = createSession({ host, effects });
    parts = { dataDir, rules, sites, effects, session };
    await rules.load();
    const now = await session.load();
    // A block left by a crash is lifted at startup, unless a session resumed.
    if (now.phase !== 'focus') sites.clear();
    ticker = setInterval(session.tick, 1000);
    started(parts);
  }

  // Lifts every block before abc gets its answer. No admin prompt here.
  async function shutdown() {
    clearInterval(ticker);
    stopActions();
    if (!parts) return;
    parts.effects.setBadge({ phase: 'idle' }, 0);
    await parts.effects.unblock(false);
  }

  return {
    boot: (params) => setImmediate(() => boot(params).catch((err) => console.error(`[spiderguard] ${err.stack}`))),
    ready: () => ready,
    shutdown
  };
}
