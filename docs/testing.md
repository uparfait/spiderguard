# Tests

The tests use a fake clock and fake process lists, so they run in a few
seconds and never touch the real hosts file or apps. Only Node built-ins are
used.

| File | Checks |
|---|---|
| `test/timer.test.js` | Resume after a restart, a session that ended while closed, long break after 4, 2 hour limit, strict cannot stop, bad saved data |
| `test/rules.test.js` | Subdomains, cleaning names, protected apps never match, groups, saved list |
| `test/names.test.js` | Display names match real program names, many apps at once, site and app at once, every way of writing a site, IPs are not sites |
| `test/hosts.test.js` | Block added once, removed completely, line endings kept, only plain domains |
| `test/coverage.test.js` | Common subdomains, other domains of popular sites, exact subdomain rules, size of all groups, the keeper puts a removed block back |
| `test/helper.test.js` | Link files, heartbeat, helper answers a request, helper exits when SpiderGuard is gone |
| `test/apps.test.js` | `tasklist` and `ps` output, Linux names cut to 15 characters, gentle minimizes, strict closes, protected left alone |
| `test/stats.test.js` | History lines, minutes, sessions and streak |
| `test/main.test.js` | Starts `main.js` like abc: `initialize`, `ping`, `shutdown`, sessions, restart, rules, stats |

`test/fake-host.js` plays abc: it answers `host.storage.*` and other host
calls, and sets `SPIDERGUARD_DRY_RUN=1`.

## Trying it by hand

This needs the abc app (see [abc-app.md](abc-app.md)). Start SpiderGuard
in abc, start a 1 minute session with `youtube.com` in the rules, and
accept the admin prompt. The site should stop loading. When the minute
ends, the block is gone and a break starts.
