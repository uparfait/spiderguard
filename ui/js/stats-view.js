// The daily view: three stat tiles and the last 7 days as bars.
// Numbers are computed by the process from history.json when it opens.
SG.statsView = (function () {
  const root = document.getElementById('view-stats');
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = (key) => DAYS[new Date(`${key}T12:00:00`).getDay()];

  function tile(value, label) {
    return `<div class="tile"><b>${value}</b><span>${label}</span></div>`;
  }

  function bars(week) {
    const top = Math.max(25, ...week.map((d) => d.minutes));
    return week.map((d) => {
      const text = `${dayName(d.day)}: ${d.minutes} focus minutes`;
      return `<div class="bar" tabindex="0" aria-label="${text}"><i style="height:${(d.minutes / top) * 100}%"></i>
        <span class="tip">${text}</span></div>`;
    }).join('');
  }

  function render(s) {
    root.innerHTML = `<div class="panel">
      <div class="tiles">
        ${tile(s.minutesToday, 'focus min today')}
        ${tile(s.sessionsToday, 'sessions today')}
        ${tile(s.streak, s.streak === 1 ? 'day streak' : 'days streak')}
      </div>
      <div><h2>Focus minutes, last 7 days</h2>
        <div class="week" role="list">${bars(s.week)}</div>
        <div class="days" aria-hidden="true">${s.week.map((d) => `<span>${dayName(d.day)[0]}</span>`).join('')}</div>
      </div>
      <p class="hint">${s.totalSessions} sessions done in all. Your history stays on this computer.</p>
    </div>`;
    root.querySelectorAll('.bar').forEach((b) => b.setAttribute('role', 'listitem'));
  }

  const load = () => SG.call('stats.get').then(render, SG.say);
  return { load };
})();
