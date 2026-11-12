// The timer view: draws the "state" notice and starts or ends sessions.
(function () {
  const $ = (id) => document.getElementById(id);
  const NAMES = { idle: 'Ready', focus: 'Focus', short: 'Short break', long: 'Long break' };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  let last = null;

  function render(st) {
    const prev = last;
    last = st;
    // A phase that ran out (not one ended by hand) gets the chime and green ring.
    if (prev && prev.phase !== 'idle' && prev.phase !== st.phase && prev.left <= 2) {
      if (prev.phase === 'focus') SG.ring.celebrate();
      SG.chime();
    }
    const focus = st.phase === 'focus';
    $('clock').textContent = fmt(st.phase === 'idle' ? Number($('minutes').value) * 60 : st.left);
    $('phase').textContent = NAMES[st.phase] + (focus && st.strict ? ' · strict' : '');
    SG.ring.draw(st);
    $('setup').hidden = focus;
    $('running').hidden = !focus;
    $('hold').hidden = st.strict;
    $('strict-note').hidden = !st.strict;
    $('start').textContent = st.phase === 'idle' ? 'Start' : 'Skip break';
    const done = st.phase === 'long' ? 4 : st.round % 4;
    $('rounds').innerHTML = [0, 1, 2, 3].map((i) => `<span class="${i < done ? 'on' : ''}"></span>`).join('');
    $('rounds').setAttribute('aria-label', `${done} of 4 sessions this cycle`);
    document.title = st.phase === 'idle' ? 'SpiderGuard' : `${fmt(st.left)} · SpiderGuard`;
  }

  SG.on('state', render);
  SG.on('blocked', (b) => SG.say(`${b.app} is blocked until the session ends.`, 'alert'));
  SG.on('notice', (n) => SG.say(n.text));
  SG.on('blocking', (b) => {
    if (b.count && !b.sites) SG.say('Sites are not blocked: admin rights were not given.', 'alert');
  });

  $('start').addEventListener('click', () => {
    const params = { minutes: Number($('minutes').value), strict: $('strict').checked };
    SG.call('session.start', params).then(render, SG.say);
  });
  $('minutes').addEventListener('change', () => last && render(last));
  SG.hold($('hold'), 10000, () => SG.call('session.stop').then(render, SG.say));

  SG.call('session.status').then(render, SG.say);
})();
