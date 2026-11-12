// The running session: holds the timer state, saves it with
// host.storage.set on every change, and sends a "state" notice each second.
import * as timer from './timer.js';

export function createSession({ host, effects, clock = Date.now }) {
  let state = timer.idle();

  // What the page draws: seconds left and the phase length, for the ring.
  function view() {
    const total = state.endsAt ? Math.round((state.endsAt - state.startedAt) / 1000) : 0;
    const left = Math.ceil(timer.left(state, clock()) / 1000);
    return { phase: state.phase, left, total, round: state.round, strict: state.strict, endsAt: state.endsAt };
  }

  function set(next, ended = []) {
    const before = state;
    state = next;
    host.set('session', state);
    effects.changed(before, state, ended, clock());
    effects.setBadge(state, timer.left(state, clock()));
    host.emit('state', view());
    return view();
  }

  return {
    view,
    state: () => state,
    // Picks up after a restart or crash, from the saved end time.
    async load() {
      const { state: next, ended } = timer.resume(await host.get('session'), clock());
      return set(next, ended);
    },
    start(opts = {}) {
      if (state.phase === 'focus') throw new Error('A focus session is already running.');
      return set(timer.startFocus(state, opts, clock()));
    },
    stop: () => set(timer.stop(state)),
    tick() {
      const { state: next, ended } = timer.settle(state, clock());
      if (ended.length) return set(next, ended);
      if (state.phase === 'idle') return undefined;
      effects.setBadge(state, timer.left(state, clock()));
      host.emit('state', view());
      return undefined;
    }
  };
}
