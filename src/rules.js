// Rules: a rule is a site ("youtube.com"), an app ("Spotify") or a group
// ("Social"). Site names: site-names.js. App names: app-names.js.
import { GROUPS } from './groups.js';
import { isProtected } from './protected.js';
import { normApp, appNamesFor, hasAlias } from './app-names.js';
import { cleanSite, isSite, siteMatches } from './site-names.js';

export { cleanSite, isSite, siteMatches };
export const cleanApp = normApp;

const MAX_RULES = 300;

// Protected apps never match, whatever the rules say.
export function appMatches(name, apps) {
  const n = normApp(name);
  return Boolean(n) && !isProtected(n) && apps.includes(n);
}

// Turns the rule list into the sites and the program names to block.
export function expand(rules) {
  const sites = new Set();
  const apps = new Set();
  const addApp = (text) => appNamesFor(text).filter((n) => !isProtected(n)).forEach((n) => apps.add(n));
  for (const raw of rules || []) {
    const text = String(raw).trim();
    const group = Object.hasOwn(GROUPS, text.toLowerCase()) ? GROUPS[text.toLowerCase()] : null;
    if (group) {
      group.sites.forEach((s) => sites.add(s));
      group.apps.forEach(addApp);
      continue;
    }
    const site = isSite(text);
    if (site) sites.add(cleanSite(text));
    // "Battle.net" is both a site and an app, so it blocks both.
    if (!site || hasAlias(text)) addApp(text);
  }
  return { sites: [...sites], apps: [...apps] };
}

// Keeps a saved rule list tidy: text only, trimmed, no repeats.
export function cleanRules(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.map((r) => String(r).trim().slice(0, 200)).filter((r) => {
    const key = r.toLowerCase();
    return r && !seen.has(key) && seen.add(key);
  }).slice(0, MAX_RULES);
}
