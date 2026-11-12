// The session timer. Pure: every function takes "now", nothing reads a clock.
// Time left is always endsAt - now, so ticks never add up and never drift.
export const MINUTE = 60000;
export const FOCUS = 25;
export const SHORT = 5;
export const LONG = 15;
export const ROUNDS = 4;
export const HARD_LIMIT = 120;
const PHASES = ['idle', 'focus', 'short', 'long'];

export const idle = (round = 0) => ({ phase: 'idle', endsAt: null, startedAt: null, round, strict: false });

// Starts a focus session. Minutes stay between 1 and the 2 hour hard limit.
export function startFocus(state, { minutes = FOCUS, strict = false } = {}, now) {
  const m = Math.min(Math.max(Math.round(Number(minutes) || FOCUS), 1), HARD_LIMIT);
  return { phase: 'focus', endsAt: now + m * MINUTE, startedAt: now, round: state.round, strict: Boolean(strict) };
}

export const left = (state, now) => (state.endsAt ? Math.max(0, state.endsAt - now) : 0);

// What comes after a phase: a break after focus (long after every 4th), idle after a break.
export function advance(state, at) {
  if (state.phase !== 'focus') return idle(state.round);
  const round = state.round + 1;
  const kind = round % ROUNDS === 0 ? 'long' : 'short';
  const length = (kind === 'long' ? LONG : SHORT) * MINUTE;
  return { phase: kind, endsAt: at + length, startedAt: at, round, strict: false };
}

// Moves past every phase that is over. Each next phase starts at the
// exact end of the one before, so a restart lands where it should.
export function settle(state, now) {
  const ended = [];
  let s = state;
  while (s.phase !== 'idle' && s.endsAt <= now) {
    ended.push(s);
    s = advance(s, s.endsAt);
  }
  return { state: s, ended };
}

// Ends a phase early. Strict focus has no way out.
export function stop(state) {
  if (state.phase === 'focus' && state.strict) throw new Error('Strict sessions cannot end early.');
  return idle(state.round);
}

// Picks up a saved state after a restart or crash. Bad data gives idle.
export function resume(saved, now) {
  const ok = saved && PHASES.includes(saved.phase) && Number.isInteger(saved.round) && saved.round >= 0;
  if (!ok || saved.phase === 'idle') return { state: idle(ok ? saved.round : 0), ended: [] };
  const valid = Number.isFinite(saved.endsAt) && Number.isFinite(saved.startedAt)
    && saved.endsAt > saved.startedAt && saved.endsAt - saved.startedAt <= HARD_LIMIT * MINUTE;
  if (!valid) return { state: idle(saved.round), ended: [] };
  return settle({ ...saved, strict: Boolean(saved.strict) }, now);
}
