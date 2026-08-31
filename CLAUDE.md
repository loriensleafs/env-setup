# envsetup — agent guide

Loaded automatically by Claude Code (`CLAUDE.md`) and other agents (`AGENTS.md`, a symlink to
this file). Keep it short and high-signal.

`envsetup` — a one-command interactive **macOS** environment-setup CLI (Bun + TypeScript).
Bootstraps a fresh Mac (apps, runtimes, fonts, repos, macOS settings, app configs) and keeps
it in shape with `doctor`/`sync`.

## Session start / session end (do this every time)

1. **Start:** read [docs/OVERVIEW.md](docs/OVERVIEW.md) (project map, "Status", "Next up"), then
   the **last section** of [docs/LEDGER.md](docs/LEDGER.md) — what changed since the last release
   and which files; `git show <sha>` for detail. That is how a new session rehydrates; do not
   re-derive history from the code.
2. **Decisions:** [docs/PLAN.md](docs/PLAN.md) is the source of truth for every design decision and
   its rationale — read the relevant part before non-trivial work.
3. **End (part of every PR, before merge):** `bun run ledger`, fill in the `Why` line of the new
   entries (template in LEDGER.md), and update OVERVIEW "Status" / "Next up" if the picture
   changed. Docs discipline is not optional — the next session depends on it.

Other docs: Config model + verified compatibility research:
[docs/CONFIG-COMPAT-PLAN.md](docs/CONFIG-COMPAT-PLAN.md). Research foundation:
[docs/RESEARCH-clack-citty-bun.md](docs/RESEARCH-clack-citty-bun.md). Contribution & release
workflow: [CONTRIBUTING.md](CONTRIBUTING.md).

## Hard rules (do not violate)

- **Pure Bun. No Node.** Use `bun`/`bunx`, `Bun.*` APIs, and `node:` builtins (Bun implements
  them). Never add a dependency on the `node`/`npm`/`npx` runtime, and never introduce Python
  for anything we ship. Shell is glue only (`install.sh`, Automator wrappers exec `bun`).
- **`@clack/*` is vendored** (`vendor/*.tgz`, pinned in `package.json`). Do NOT replace with
  the npm versions — npm's releases lack the `completeOnTab` tab-completion the UI relies on.
- **Secrets never touch tracked files.** License keys / API keys live ONLY in the age-encrypted
  `secrets.json.age` (+ the user's password manager). Never put a key — even a partial/truncated
  one — in source, docs, tests, or a commit message.
- **Tests:** `<name>.test.ts` in a `__tests__/` dir beside the file under test (`bun:test`).
- **Before finishing code:** `bun run check` (Biome + tsc + markdownlint) must pass; `bun run
  fix` auto-fixes. Lefthook enforces this at commit/push, but don't rely on it.

## Architecture (the essentials)

- **Items** (`src/items/**`): each installable/configurable thing implements the `Item`
  interface (`src/items/item.ts`) — `detect` / `install` / `configure` / `verify`, plus `deps`,
  `ceremonies`, `configSchema` (Zod), and an optional `zsh()` contribution. Create items with
  `defineItem`. The registry is assembled in `src/items/all.ts`.
- **Reset-on-drift** (the config model): `detect()` must be drift-aware — compare the ACTUAL
  current values to the effective config, and return `{ installed: false, differs: true }` when
  config is present but mismatched (vs plain `installed: false` for never-configured). Drifted
  items re-enter the bootstrap list as "installed — settings differ (select to reset)", default
  UNCHECKED — selection is the user's consent to re-apply; we never silently overwrite. No
  conflict checking, by decision (docs/CONFIG-COMPAT-PLAN.md).
- **`zsh()` contributions** are co-located per item and assembled into the managed `~/.zshrc`
  block by `src/items/defs/shell-block.ts` (env → FPATH → compinit → init → aliases). Add shell
  needs to the item, not to a central block.
- **Manifest** (`src/manifest/`): Zod-versioned, migrated automatically on load via
  `migrations.ts` (see its header for the "how to add a migration" recipe). **Journal** (JSONL)
  drives resumable runs. **Orchestrator** runs items in toposorted dependency order.
- **Ceremonies** are deliberate attended steps (sign-ins, permission dialogs) surfaced in the
  connect phase — they are by design, not stubs.

## Commands

```bash
bun run dev [subcommand]   # run the CLI from source (bare = interactive bootstrap)
bun run check              # Biome + tsc + markdownlint (CI/pre-push gate)
bun run fix                # auto-fix Biome + markdown
bun run test               # bun:test suite
bun run compile            # standalone binary → dist/envsetup
bun run changelog          # regenerate CHANGELOG.md (git-cliff)
bun run ledger             # append docs/LEDGER.md entries for new commits (then fill in Why)
```

## Safety when running it

`envsetup` mutates the real macOS system. Bare `envsetup` (bootstrap) and `sync` **install
software and change settings** — never run them to "test." `doctor` is read-only (diffs the
machine against its manifest). To drive/smoke the CLI safely, use the run skill:
`.claude/skills/run-envsetup/` (`bun .claude/skills/run-envsetup/smoke.mjs`).
