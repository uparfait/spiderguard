// The rules view: group toggles, then single sites or apps as chips.
SG.rulesView = (function () {
  const root = document.getElementById('view-rules');
  let rules = [];
  let groups = [];
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const isGroup = (r) => groups.some((g) => g.toLowerCase() === r.toLowerCase());

  function render() {
    const own = rules.filter((r) => !isGroup(r));
    root.innerHTML = `<div class="panel">
      <div><h2>Groups</h2><div class="groups">${groups.map((g) => `<button class="quiet" data-group="${esc(g)}"
        aria-pressed="${rules.some((r) => r.toLowerCase() === g.toLowerCase())}">${esc(g)}</button>`).join('')}</div></div>
      <div><h2>Sites and apps</h2>
        <form class="add"><input type="text" id="rule-input" aria-label="Site or app" placeholder="reddit.com or Steam">
        <button class="primary" type="submit">Add</button></form></div>
      <ul class="chips">${own.map((r) => `<li><span>${esc(r)}</span>
        <button data-remove="${esc(r)}" aria-label="Remove ${esc(r)}">×</button></li>`).join('')}</ul>
      <p class="hint">A site also covers its subdomains. Apps can be named as you know them, like Microsoft Teams.
        Explorer, Finder, terminals and abc are never blocked.</p>
    </div>`;
  }

  function save(next) {
    SG.call('rules.set', { rules: next }).then((r) => { rules = r.rules; render(); }, SG.say);
  }

  const isOn = (g) => rules.some((r) => r.toLowerCase() === g);
  root.addEventListener('click', (e) => {
    const group = e.target.closest('[data-group]');
    const remove = e.target.closest('[data-remove]');
    if (group) {
      const g = group.dataset.group.toLowerCase();
      save(isOn(g) ? rules.filter((r) => r.toLowerCase() !== g) : [...rules, group.dataset.group]);
    }
    if (remove) save(rules.filter((r) => r !== remove.dataset.remove));
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('rule-input').value.trim();
    if (text) save([...rules, text]);
  });

  function load() {
    SG.call('rules.get').then((r) => { rules = r.rules; groups = r.groups; render(); }, SG.say);
  }
  return { load };
})();
