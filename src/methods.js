// Every method abc (or the page, through abc.call) can ask SpiderGuard.
import { readHistory } from './history.js';
import { computeStats } from './stats.js';

export function createMethods(app) {
  const use = () => app.ready();
  return {
    // abc protocol.
    initialize: (params) => {
      app.boot(params);
      return { capabilities: { ui: true } };
    },
    ping: () => 'pong',
    shutdown: async () => {
      await app.shutdown();
      setTimeout(() => process.exit(0), 50);
      return null;
    },

    // Sessions: { minutes, strict } to start. Strict sessions cannot stop.
    'session.start': async (p) => {
      const { session, sites } = await use();
      sites.allowAsk();
      return session.start({ minutes: p.minutes, strict: p.strict });
    },
    'session.stop': async () => (await use()).session.stop(),
    'session.status': async () => (await use()).session.view(),

    // Rules: a list of sites, app names and groups.
    'rules.get': async () => (await use()).rules.get(),
    'rules.set': async (p) => {
      const { rules, session, effects } = await use();
      const result = await rules.set(p.rules);
      effects.refresh(session.state());
      return result;
    },

    // The daily view, computed from history.json when asked.
    'stats.get': async () => computeStats(readHistory((await use()).dataDir), Date.now())
  };
}
