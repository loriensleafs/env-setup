---
name: run-src-items-chrome-assets
description: Typecheck and verify src/items/chrome/assets — the Accessibility Swift driver that installs Chrome web apps. Use when asked to build, typecheck, smoke or test install-web-app.swift. Never runs it.
---

`src/items/chrome/assets/install-web-app.swift` drives Chrome's ⋮ → Cast, Save and Share →
Install… flow through the Accessibility API and **installs a web app when run**. The only safe
thing to do with it outside a real bootstrap is typecheck it and confirm the copy embedded in
`chrome-pwas.ts` (`INSTALL_SWIFT`, what the binary actually ships) is byte-identical. That is
what `.claude/skills/run-src-items-chrome-assets/driver.ts` does.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/items/chrome/assets/.claude/skills/run-src-items-chrome-assets/driver.ts
```

```text
swiftc -typecheck install-web-app.swift ✓
byte-identical to the INSTALL_SWIFT constant embedded in chrome-pwas.ts ✓
```

Equivalent by hand:

```bash
xcrun swiftc -typecheck src/items/chrome/assets/install-web-app.swift; echo "exit=$?"   # exit=0
```

## Run (human path) — mutates Chrome

Only the `chrome-pwas-install` ceremony runs it (`swift <file> <url> <name>` per app, after
Chrome sign-in, needs an Accessibility grant). Do not run it to test.

## Test

No tests in this directory; the item's tests are `bun test src/items/chrome/__tests__` (4 pass).

## Gotchas

- Needs the Xcode Command Line Tools (`xcrun swiftc`). Typecheck takes ~2 s.
- The embedded constant is the source of truth at runtime (it survives `bun build --compile`);
  edit both or the driver fails.
