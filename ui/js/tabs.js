// Switches between the timer, rules and daily views. Rules and stats load
// fresh each time they open.
(function () {
  const tabs = document.querySelectorAll('.tabs [data-view]');
  const loaders = { rules: SG.rulesView.load, stats: SG.statsView.load };

  function show(name) {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === name)));
    document.querySelectorAll('main .view').forEach((v) => { v.hidden = v.id !== `view-${name}`; });
    if (loaders[name]) loaders[name]();
  }

  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
})();
