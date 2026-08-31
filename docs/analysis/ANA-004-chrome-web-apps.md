# Chrome web apps (PWAs) without an enterprise policy — analysis

> **Analysis** · 2026-08-26 · status: current · decision [ADR-015](../decisions/ADR-015-chrome-web-apps-ax-automation.md)

## Question

Can envsetup install Gmail / Calendar / Drive / Keep as Chrome apps and put them in the Dock with
custom labels (Mail, Calendar, Drive, Notes) — without `WebAppInstallForceList` (which brands the
browser "managed by your organization")?

## Sources

Empirical investigation on Peter's machine (Peter installed Gmail manually to enable it); the
`~/Applications/Chrome Apps.localized/*.app` bundles; a forged-bundle experiment; Chrome's
web-app self-repair behaviour observed live; AX tree spelunking (part of it cracked in a Gemini
session); Chromium `WebAppInstallForceList` policy docs (retained as the zero-click alternative).

## Findings

1. Bundles are thin `app_mode_loader` shells keyed by `CrAppModeShortcutID`; the **bundle filename
   controls the Dock label** (verified live, including launching from a renamed bundle).
2. **Full synthesis is ruled out**: a forged bundle with the computed app id (crx-style
   SHA256(start_url) → a–p) launches no window — profile-side registration in undocumented LevelDB
   is required; not writing that blind.
3. Editing `Info.plist` / `InfoPlist.strings` trips Chrome's web-app **self-repair** (regenerates
   the bundle, reverts the name, visible relaunch flicker). Renaming only the `.app` filename is
   left alone and drives the Dock label — uniform for real PWAs and shortcut apps.
4. Install can be **driven through Accessibility**: `src/items/chrome/assets/install-web-app.swift`
   drives ⋮ → Cast, Save and Share → Install… Techniques that made it reliable: spatial ⋮-button
   detection (rightmost button in the Reload button's toolbar row — beats description matching);
   delta submenu scraping (snapshot menu items before/after opening the Cast submenu — sidesteps
   the 293-AXMenu bookmark-tree ambiguity); skip `AXWebArea` and the menu bar for speed; dialog
   buttons searched from `mainWindow` with unlimited-depth BFS; two-step wizard (Next → Install).
   Verified live on Drive, Calendar, Gmail.
5. The Swift source is embedded as a TS constant (survives `bun build --compile`); the ceremony
   writes it to `~/.config/envsetup` and runs `swift … <url> <name>` per app. One-time
   Accessibility grant for the runner is the only manual step.
6. Chrome may regenerate a bundle after updates → `detect()` checks `CrAppModeShortcutURL` host
   and the rename pass re-applies (ghostty-icon pattern). PWAs must be installed after Chrome
   sign-in.

## Refuted

- "Chrome apps can be created by writing the bundle" — see 2.
- "Dock label can be set via Info.plist" — see 3.

## Unverifiable

- Stability of the AX tree across Chrome releases (the spatial/delta techniques reduce, not
  remove, this risk).

## Implications

- [ADR-015](../decisions/ADR-015-chrome-web-apps-ax-automation.md): ceremony + rename, no policy.
- Dock composition depends on the PWAs existing → `dock` item skips absent apps and re-adds on
  re-run.
