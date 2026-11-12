# You need the abc app

SpiderGuard runs only inside the abc app. It is not a program you open by
itself: abc starts it, shows its timer, and gives it the tray badge,
notices and saved settings. Without abc, SpiderGuard does nothing.

## 1. Install abc

Download abc from the **Download** page of the abc web site, then run the
installer for your computer:

| Computer | Installer |
|---|---|
| Windows | `abc-setup-windows-x64.exe` |
| macOS | `abc-macos-universal.dmg` |
| Linux | `abc-linux-x86_64.AppImage` or `abc-linux-x86_64.deb` |

SpiderGuard also needs Node.js 20 or newer. If it is missing, abc tells
you and shows the command to install it.

## 2. Install SpiderGuard in abc

Open abc, go to the **Marketplace**, search for **SpiderGuard**, and click
**Install**. Or, in a terminal:

```bash
abc install spiderguard
```

## 3. Start it

In abc, open SpiderGuard from your apps. It opens in a small window by
default. You can also show it in a tab, or send it to the background,
where the tray badge shows the minutes left.

```bash
abc start spiderguard
```

## The first session

Pick a length, click **Start**, and say yes to the admin prompt. SpiderGuard
needs admin rights once to block sites in the hosts file. If you say no,
apps are still held back, but sites are not blocked.
