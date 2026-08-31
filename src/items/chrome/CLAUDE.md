# src/items/chrome — Chrome config and web apps (ADR-015, ANA-004)

Blast radius: `chromeConfig.configure()` quits Chrome via AppleScript, edits `Local State` and
`Preferences`, reopens it; `chromePwas` is a Ceremony (outcome `deferred`). Drive with
`bun src/items/chrome/.claude/skills/run-src-items-chrome/driver.ts` — `detect()` only, plus a
typecheck of the Swift helper.

- Web-app naming is a **filename-only** rename of the `.app`; an `Info.plist` or
  `InfoPlist.strings` edit triggers Chrome's self-repair and reverts it.
- Web apps are applied after the Chrome sign-in Ceremony; `detect()` matches the
  `CrAppModeShortcutURL` host and the rename re-applies after Chrome regenerates a bundle.
- `assets/install-web-app.swift` ships as the TS constant `INSTALL_SWIFT` (survives
  `bun build --compile`): edit both, or the driver's byte-equality check fails. Running it installs
  a real app — the driver stops at `xcrun swiftc -typecheck`. Its AX techniques (spatial ⋮
  detection, delta submenu scraping, window-rooted BFS) need a live Chrome to re-verify.
- Pinned actions and extension pins in `Preferences` were empirically not HMAC-protected
  (2026-08-26) — re-verify on Chrome upgrades. For the captured defaults: PRD-001 "Chrome".
