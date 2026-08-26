# Vendored @clack packages — temporary

These tarballs are **built from clack's `main` branch** (bombshell-dev/clack,
snapshot 2026-08-15), NOT the published npm releases.

## Why they're here

The published npm `@clack/prompts@1.7.0` / `@clack/core@1.4.3` **lack the
`completeOnTab` feature** — Tab-to-complete in the `path()` prompt. That feature
exists only on clack's `main` branch (unreleased). We rely on it for the Dev
directory path prompt in bootstrap. The published 1.7.0 even renders a
"Tab: complete" footer hint but the behavior is a no-op without core's
`completeOnTab`.

`package.json` installs @clack/core from the local tarball and pins it with an
`overrides` entry so bun can't nest the published core under prompts (which
breaks the type surface — `CANCEL_SYMBOL` etc.).

## Convert to npm when clack releases it

Watch for a published release that includes `completeOnTab` in `@clack/core`
(i.e. `@clack/core` > 1.4.3, or a `@clack/prompts` release whose bundled core
has it — verify with:
`npm view @clack/core@latest` then grep the tarball for `completeOnTab`).

When it ships:
1. `bun remove @clack/core @clack/prompts`
2. Edit `package.json`: delete the `overrides` block; add
   `"@clack/prompts": "^<new>"` and `"@clack/core": "^<new>"` under dependencies.
3. `bun add @clack/prompts@latest @clack/core@latest`
4. `rm -rf vendor` and delete this note.
5. `bun test` + run the bootstrap path prompt to confirm Tab still completes.

No runtime/env impact from vendoring: the tarballs install like any dependency
during `bun install` (including in the release GitHub Action).
