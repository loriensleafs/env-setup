---
name: run-src-items-typora
description: Run, drive, smoke and test src/items/typora — the typora-config item (Vercel theme, autosave off, license ceremony). Use when asked to invoke typora-config detect() or inspect the item. No tests here.
---

`src/items/typora/typora-config.ts` installs the Vercel theme (nested zip → `vercel.css` +
`vercel/` into Typora's theme dir), sets defaults, and surfaces the license paste as a ceremony.
Drive it with `src/items/typora/.claude/skills/run-src-items-typora/driver.ts` — prints the item shape and runs
`detect()` (reads the theme dir + `defaults` domain; read-only). `configure()` downloads the theme
and writes defaults; never called here.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path)

```bash
bun src/items/typora/.claude/skills/run-src-items-typora/driver.ts
```

```text
typora-config: kind=config-only deps=typora,font-geist,font-inter ceremonies=typora-license
detect → installed=true
OK
```

## Direct invocation

```bash
bun -e 'import {typoraConfig} from "./src/items/typora/typora-config.ts"; import {run} from "./src/exec/run.ts"; console.log(await typoraConfig.detect({manifest:{items:{}},log:()=>{},run}))'
```

## Test

No `__tests__` directory here (2026-08-30); `bun test src/items/typora` finds no test files. The
driver above is the coverage.

## Gotchas

- The theme release zip is nested (found live in v0.1.4): `configure()` extracts to
  `/tmp/envsetup-typora-theme` and `find`s `vercel.css`; a flat-extract assumption fails verify.
