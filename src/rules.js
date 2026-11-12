// Rules: a rule is a site ("youtube.com"), an app ("spotify") or a group
// ("Social"). Names are compared in lowercase, with "www." taken off.
import { GROUPS } from './groups.js';
import { isProtected } from './protected.js';

const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const MAX_RULES = 300;

// "https://www.YouTube.com/watch?v=1" -> "youtube.com"
export const cleanSite = (text) => String(text).trim().toLowerCase()
  .replace(/^[a-z][a-z0-9+.-]*:\/\//, '').split(/[/?#:]/)[0]
  .replace(/^www\./, '').replace(/\.$/, '');

// "C:\\Apps\\Spotify.exe" or "/Applications/Spotify.app" -> "spotify"
export const cleanApp = (text) => String(text).trim().toLowerCase()
  .split(/[\\/]/).filter(Boolean).pop()?.replace(/\.(exe|app)$/, '') || '';

export const isSite = (text) => !/\.(exe|app)$/i.test(String(text).trim()) && DOMAIN.test(cleanSite(text));

// A site rule also covers every subdomain: youtube.com covers m.youtube.com.
export function siteMatches(host, rule) {
  const h = cleanSite(host);
  const r = cleanSite(rule);
  return Boolean(r) && (h === r || h.endsWith(`.${r}`));
}

// Protected apps never match, whatever the rules say.
export function appMatches(name, apps) {
  const n = cleanApp(name);
  return Boolean(n) && !isProtected(n) && apps.includes(n);
}

// Turns the rule list into the sites and apps to block.
export function expand(rules) {
  const sites = new Set();
  const apps = new Set();
  for (const raw of rules || []) {
    const text = String(raw).trim();
    const group = GROUPS[text.toLowerCase()];
    if (group) {
      group.sites.forEach((s) => sites.add(s));
      group.apps.forEach((a) => apps.add(a));
    } else if (isSite(text)) sites.add(cleanSite(text));
    else if (cleanApp(text) && !isProtected(cleanApp(text))) apps.add(cleanApp(text));
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
