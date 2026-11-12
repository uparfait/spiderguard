// The calls SpiderGuard makes to abc. A failed call is logged to stderr
// and never stops the app: a missing badge must not break a session.
import { request, notify } from './rpc.js';

const quiet = (promise) => promise.catch((err) => {
  console.error(`[spiderguard] ${err.message}`);
  return null;
});

export const host = {
  log: (level, message) => quiet(request('host.log', { level, message })),
  // Needs the "notifications" permission in abc.json.
  notify: (title, body) => quiet(request('host.notify', { title, body })),
  badge: (text) => quiet(request('host.setBadge', { text })),
  get: (key) => quiet(request('host.storage.get', { key })),
  set: (key, value) => quiet(request('host.storage.set', { key, value })),
  // A notice for the page, read there with abc.on(method, fn).
  emit: (method, params) => notify(method, params)
};
