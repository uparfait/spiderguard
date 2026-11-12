// SG: the page's link to the SpiderGuard process, through the "abc" object
// abc gives every app page. Pages load from file://, so these are plain scripts.
window.SG = (function () {
  const abc = typeof window.abc === 'object' && window.abc ? window.abc : null;

  // Electron wraps errors as "Error invoking remote method ...: Error: text".
  const clean = (err) => String((err && err.message) || err)
    .replace(/^Error invoking remote method '[^']+': /, '').replace(/^Error: /, '');

  const call = (method, params) => (abc
    ? abc.call(method, params).catch((err) => { throw new Error(clean(err)); })
    : Promise.reject(new Error('Open SpiderGuard from abc.')));

  // Notices from the process: "state", "blocked", "blocking", "notice".
  const on = (method, fn) => (abc ? abc.on(method, fn) : () => {});

  let hide = null;
  function say(text, kind) {
    const el = document.getElementById('notice');
    el.textContent = text instanceof Error ? text.message : String(text);
    el.dataset.kind = kind || '';
    clearTimeout(hide);
    hide = setTimeout(() => { el.textContent = ''; }, 6000);
  }

  // abc sets --abc-mode to "light" or "dark"; our tokens follow it.
  function theme() {
    const mode = getComputedStyle(document.documentElement).getPropertyValue('--abc-mode').trim();
    if (mode === 'dark' || mode === 'light') document.documentElement.dataset.theme = mode;
  }
  on('theme.changed', theme);
  window.addEventListener('DOMContentLoaded', () => setTimeout(theme, 50));
  setTimeout(theme, 500);

  return { call, on, say };
})();
