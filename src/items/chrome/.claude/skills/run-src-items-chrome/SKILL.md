---
name: run-src-items-chrome
description: Run, drive, smoke and test src/items/chrome — the Chrome config + Chrome web-apps (PWA) items. Use when asked to invoke, detect, smoke-test or test chrome-config / chrome-pwas without touching Chrome.
---

`src/items/chrome` holds two envsetup items: `chrome-config` (flags, pinned toolbar actions,
pinned extensions written into Chrome's Local State / Preferences) and `chrome-pwas` (installs
Gmail/Calendar/Drive/Keep as Chrome apps through an embedded Accessibility Swift driver). Drive
it with `.claude/skills/run-src-items-chrome/driver.ts`, which only reads: it lists the captured
defaults, checks the embedded Swift matches `assets/`, and runs both items' `detect()` — the same
thing `envsetup doctor` does. `configure()` quits/reopens Chrome and rewrites its prefs; the
driver never calls it.

All paths are relative to the repo root.

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install
```

## Run (agent path)

```bash
bun src/items/chrome/.claude/skills/run-src-items-chrome/driver.ts
```

Output on this machine:

```text
flags: 81 · pinned actions: 11 · pinned extensions: 1
pwas: Mail, Calendar, Drive, Notes → /Users/peterkloss/Applications/Chrome Apps.localized
INSTALL_SWIFT === assets/install-web-app.swift ✓
chrome-config.detect → installed=true
chrome-pwas.detect → installed=false
OK
```

`installed=false` for chrome-pwas means the four `.app` bundles are not (all) present — the
ceremony has not run on this machine. The driver exits non-zero if the embedded Swift drifts from
`src/items/chrome/assets/install-web-app.swift`.

## Direct invocation

```bash
bun -e 'import {chromeConfig} from "./src/items/chrome/chrome-config.ts"; import {run} from "./src/exec/run.ts"; console.log(await chromeConfig.detect({manifest:{},log:()=>{},run}))'
```

## Test

```bash
bun test src/items/chrome/__tests__      # 4 pass, 0 fail (2 files)
```

## Gotchas

- Never call `chromeConfig.configure()` from a driver: it AppleScript-quits Chrome, edits Local
  State/Preferences, and reopens it. `chromePwas` install is a ceremony (attended, AX-driven).
- Import paths from inside the skill dir are five levels up for `src/exec` (`../../../../../exec/run.ts`)
  and three for the item files (`../../../chrome-config.ts`).

`assets/install-web-app.swift` is covered here too: the driver byte-compares it with the embedded `INSTALL_SWIFT` and runs `xcrun swiftc -typecheck` on it — it is never executed (it installs a real Chrome app).
