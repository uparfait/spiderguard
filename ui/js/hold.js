// "Hold to end early": the action runs only after the button is held for
// the whole time, by mouse, touch, Space or Enter. Letting go cancels it.
SG.hold = function hold(button, ms, action) {
  let timer = null;

  function cancel() {
    clearTimeout(timer);
    timer = null;
    button.classList.remove('holding');
  }

  function begin() {
    if (timer) return;
    button.classList.add('holding');
    timer = setTimeout(() => {
      cancel();
      action();
    }, ms);
  }

  const isKey = (e) => e.key === ' ' || e.key === 'Enter';
  button.addEventListener('pointerdown', begin);
  for (const name of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) button.addEventListener(name, cancel);
  button.addEventListener('keydown', (e) => {
    if (!isKey(e)) return;
    e.preventDefault();
    if (!e.repeat) begin();
  });
  button.addEventListener('keyup', (e) => { if (isKey(e)) cancel(); });
  button.addEventListener('click', (e) => e.preventDefault());
};
