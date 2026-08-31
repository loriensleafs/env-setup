---
name: run-src-ceremonies
description: Run, invoke and smoke-test src/ceremonies — the ceremonies (the connect phase) and their handler table — without executing any ceremony. Use when asked to run, test or drive the ceremonies/connect module.
---

`src/ceremonies/` holds the connect phase: `connect-phase.ts` (`pendingCeremonies` — which
ceremonies a manifest still needs, deduped by id; `runConnectPhase`) and `handlers.ts` (one
handler per ceremony id: license pastes, sign-ins, permission grants, the Chrome web-app
install). Drive it with `src/ceremonies/.claude/skills/run-src-ceremonies/driver.ts`: it lists
the handler table, verifies every ceremony id declared by the real registry has a handler, and
runs `pendingCeremonies` over fixture manifests. Handlers are looked up, **never run** — they
open apps and prompt the user.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/ceremonies/.claude/skills/run-src-ceremonies/driver.ts
```

Expected:

```text
src/ceremonies driver

  handlers (14): typora-license, cleanshot-verify, superwhisper-signin, superwhisper-permissions, chrome-default-browser, chrome-signin, claude-login, cursor-models, raycast-onboarding, chrome-pwas-install, better-display-license, better-display-settings, accessibility-grant, github-device-flow
  ✓ handlerFor(known id) resolves
  ✓ handlerFor(unknown) → undefined
  ✓ fallbackHandler builds a manual-step handler
  ✓ every declared ceremony id has a handler (14 declared) — all covered
  ✓ nothing selected → no pending ceremonies
  ✓ selecting chrome-pwas → its install ceremony is pending — chrome-pwas-install

PASS
```

`pendingCeremonies` calls each wanted item's `detect()` (read-only) to decide whether the
app made it — that is why the driver runs against the real registry.

## Test

No `__tests__` directory here (2026-08-30); the driver above is the coverage.

## Gotchas

- The connect phase runs automatically at the end of bootstrap; `bun src/index.ts connect` re-runs
  skipped ceremonies — attended, mutates apps. Never run it to test.
