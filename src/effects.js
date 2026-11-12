// What a phase change does outside the timer: blocks on and off, the tray
// badge, a notice when a phase ends, and the history line.
import { addHistory } from './history.js';
import { MINUTE } from './timer.js';

const BREAK_TEXT = { short: 'Take a 5 minute break.', long: 'Four sessions done. Take a 15 minute break.' };

function noticeFor(last, next) {
  if (last.phase === 'focus') return ['Focus done', BREAK_TEXT[next.phase] || 'Nice work.'];
  return ['Break over', 'Ready when you are for the next session.'];
}

export function createEffects({ host, sites, keeper, guard, rules, dataDir }) {
  let badge = null;

  async function block(state) {
    const { sites: list, apps } = rules.targets();
    guard.start({ apps, strict: state.strict });
    const ok = await sites.apply(list);
    keeper.start(list);
    host.emit('blocking', { sites: ok, count: list.length, apps: apps.length });
  }

  async function unblock(prompt = true) {
    guard.stop();
    keeper.stop();
    await sites.clear({ prompt });
  }

  function setBadge(state, leftMs) {
    const text = state.phase === 'idle' ? '' : String(Math.ceil(leftMs / MINUTE));
    if (text === badge) return;
    badge = text;
    host.badge(text);
  }

  function changed(before, after, ended, now) {
    for (const e of ended) {
      if (e.phase === 'focus') addHistory(dataDir, { start: e.startedAt, minutes: (e.endsAt - e.startedAt) / MINUTE, kind: 'focus' });
    }
    if (ended.length) host.notify(...noticeFor(ended[ended.length - 1], after));
    const was = before.phase === 'focus';
    const is = after.phase === 'focus';
    // Ended early by hand: still counts as focus minutes, not as a done session.
    if (was && !is && !ended.length) addHistory(dataDir, { start: before.startedAt, minutes: (now - before.startedAt) / MINUTE, kind: 'early' });
    if (is && before.startedAt !== after.startedAt) block(after);
    else if (was && !is) unblock();
  }

  // New rules during focus apply at once.
  const refresh = (state) => (state.phase === 'focus' ? block(state) : undefined);

  return { changed, setBadge, unblock, refresh };
}
