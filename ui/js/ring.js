// The ring: one SVG circle whose stroke-dashoffset drops each second.
// The CSS gives it a 1s linear transition, so it moves smoothly.
SG.ring = (function () {
  const el = document.getElementById('ring');
  const C = 2 * Math.PI * 90;
  let phase = null;
  let holdUntil = 0;
  el.style.strokeDasharray = String(C);
  el.style.strokeDashoffset = String(C);

  // A jump with no animation, for a new phase.
  function set(offset, instant) {
    if (instant) el.classList.add('instant');
    el.style.strokeDashoffset = String(offset);
    if (instant) {
      el.getBoundingClientRect();
      el.classList.remove('instant');
    }
  }

  function draw(state) {
    // Let the green "done" ring show for a moment before the break starts.
    if (Date.now() < holdUntil) return;
    const changed = state.phase !== phase;
    phase = state.phase;
    el.dataset.phase = state.phase;
    const share = state.total ? state.left / state.total : 1;
    set(C * Math.min(Math.max(share, 0), 1), changed);
  }

  // Session done: fill the ring with green over 600ms (CSS).
  function celebrate() {
    el.dataset.phase = 'done';
    phase = 'done';
    set(0, false);
    holdUntil = Date.now() + 1500;
  }

  return { draw, celebrate };
})();
