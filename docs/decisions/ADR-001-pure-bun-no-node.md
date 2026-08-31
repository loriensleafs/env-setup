# ADR-001: Pure Bun — no Node runtime, no Python shipped, shell only as glue

## Status

Accepted

## Date

2026-08-26 (Peter's script-language rule; re-verified 2026-08-26 in the purity audit)

## Context

Peter is bun-first for all his TypeScript work. Everything envsetup ships — the CLI, Claude Code
hooks, the statusline, Automator payloads, helpers — runs on the target machine, so every extra
runtime is one more thing to install and keep current. The original statusline was bash + jq.

## Decision

Every script this project writes or installs is **pure Bun**: `bun`/`bunx`, `Bun.*` APIs, and
`node:` builtins (Bun implements them natively). No dependency on the `node`/`npm`/`npx` runtime;
no Python for anything shipped. Shell is glue only: the Automator `.workflow` wrapper execs
`bun <script>`, and `install.sh` is POSIX sh because it runs before Bun exists — it does nothing
but fetch and exec the compiled binary. Dev tooling follows the same rule (ADR-016).

## Alternatives considered

### Node for community-standard tooling (Husky, prettier via npm)

- Pros: largest ecosystem. Cons: a second runtime on every machine; Peter's stated preference.
- Rejected: Bun runs the same tools; lefthook/Biome are native binaries.

### Keep bash/jq scripts where they already existed

- Rejected: the statusline port to Bun dropped the jq dependency and is byte-identical in output.

## Consequences

- `#!/usr/bin/env bun` shebangs; `bun build --compile` binary embeds Bun so the target needs
  nothing to run envsetup itself; Bun is installed *by* envsetup as a regular item (hooks need it).
- Assets must be embedded with `with { type: "file" }` (no `import.meta.dir` in compiled binaries).
- Node.js is still *installed* (via fnm, ADR-011) for community tooling that hardcodes it — that is
  a target-machine item, not a dependency of envsetup.
