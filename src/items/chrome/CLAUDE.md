# src/items/chrome — Chrome config and web apps (ADR-015, ANA-004)

Blast radius: `chromeConfig.configure()` quits Chrome via AppleScript, edits `Local State` and
`Preferences`, reopens it; `chromePwas` is ceremony-only (outcome `deferred`). The driver calls
`detect()` only.

- Web-app naming is a **filename-only** rename of the `.app`; an `Info.plist` or
  `InfoPlist.strings` edit triggers Chrome's self-repair and reverts it.
- Web apps install after Chrome sign-in; `detect()` matches the `CrAppModeShortcutURL` host and the
  rename re-applies after Chrome regenerates a bundle.
- `assets/install-web-app.swift` ships as the TS constant `INSTALL_SWIFT` (survives
  `bun build --compile`): edit both, or the driver's byte-equality check fails. Running it installs
  a real app — the driver only typechecks it (`xcrun swiftc -typecheck`). Its AX techniques (spatial
  ⋮ detection, delta submenu scraping, window-rooted BFS) need a live Chrome to re-verify.
- Pinned actions and extension pins in `Preferences` were empirically not HMAC-protected
  (2026-08-26) — re-verify on Chrome upgrades. Captured defaults: PRD-001 "Chrome".
