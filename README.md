# SpiderGuard

Block distracting sites and apps during work sessions, with a calm ring
timer. An abc app in Node.js.

- One click starts a session (25 minutes by default). Chosen sites stop
  loading and chosen apps are held back until the session ends.
- A calm ring timer shows in a tab or a small window. In the background,
  the tray badge shows the minutes left.
- Breaks come by themselves: 5 minutes, or 15 after every 4 sessions.
  Blocks lift during breaks.
- Gentle mode minimizes blocked apps. Strict mode closes them and has no
  way out, but no session is longer than 2 hours.
- A daily view shows focus minutes, sessions done and the current streak.
  Nothing leaves the computer.

Blocking sites changes the system hosts file, so SpiderGuard asks once for
admin rights, through the normal OS prompt, and always removes its block
when a session ends or the app stops.

## You must have the abc app

SpiderGuard runs only inside the abc app. It does not open on its own.

1. Download abc from the **Download** page of the abc web site and install it.
2. Open abc, go to the **Marketplace**, search for **SpiderGuard**, and
   click **Install**.
3. Open SpiderGuard from your apps in abc, and start a session.

Step by step, with the installer for each computer:
[docs/abc-app.md](docs/abc-app.md). Each feature is explained in
[docs/](docs/README.md).
