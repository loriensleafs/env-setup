# envsetup — agent guide

Loaded automatically by Claude Code (`CLAUDE.md`) and other agents (`AGENTS.md`, a symlink to
this file). Keep it short and high-signal.

`envsetup` — a one-command interactive **macOS** environment-setup CLI (Bun + TypeScript).
Bootstraps a fresh Mac (apps, runtimes, fonts, repos, macOS settings, app configs) and keeps
it in shape with `doctor`/`sync`.

## Rehydrating — how to digest the docs at session start

Read in this order, extract what each is for, then stop reading and work. Do **not** rebuild
history from the code or from `git log` yourself — the docs system exists so you never have to.
Every doc is `<TYPE>-<NNN>-<kebab-title>.md` in its directory, each directory's README holds its
rules and template.

1. [docs/OVERVIEW.md](docs/OVERVIEW.md): skim the map; read **"Status"**, **"Next up"** and
   **"Key empirical facts"** in full. Output: where the project is, what is next, what not to
   relearn.
2. [docs/sessions/](docs/sessions/README.md): the index, then the **newest `SES-NNN` in full**
   (Goal / Outcome / Open at end, Narrative, Changes), then earlier sessions back to the last
   `> **Released vX.Y.Z**` marker. Per entry: `Summary` = what changed, `Why` = the motive, the
   per-file lines = where and what in each file, `Notes` = gotchas. Output: what is on `main` but
   unreleased, what is parked, what was tried and abandoned, what was verified and how.
3. For the "Next up" item you take: its `PLAN-NNN` in [docs/plan/](docs/plan/README.md) if one
   exists; the `ADR-NNN` in [docs/decisions/](docs/decisions/README.md) for every area you will
   touch (decisions are settled — do not re-litigate; a change needs a superseding ADR); the
   `ANA-NNN` in [docs/analysis/](docs/analysis/README.md) for facts you would otherwise re-research;
   `grep -rn <file-or-keyword> docs/sessions/` for prior changes; `git show <sha>` only when the
   exact diff matters.
4. [CONTEXT.md](CONTEXT.md) is the glossary: use its words in code labels, prompts, commit
   messages and docs (item states Applied / Satisfied / Missing / Drifted / Untracked; Picked vs
   Wanted; Ceremony; Converge). A term that is missing, fuzzy or contested is settled with the
   `domain-modeling` skill and written there before the code uses it.
5. [docs/plan/PRD-001-envsetup.md](docs/plan/PRD-001-envsetup.md) for what envsetup must do (the
   promise, UX requirements, item catalog with chosen defaults, boundaries) whenever the work
   touches behaviour. `docs/archive/` is history only — never cite it as current.

## Recording — continuously, as you go

- **Session start:** `bun run session -- --new <slug>` — creates `SES-<next>-<slug>.md` and makes it
  current; set its title and `Goal` right away.
- **After every commit** (not at the end of the PR, never "later"): `bun run session` appends an
  entry skeleton per new commit — `Summary` / `Why` placeholders and one line per touched file,
  **every** file, whatever kind (source, tests, docs, config, CI, scripts, assets), with its +/−
  counts. Fill in every placeholder (a short phrase per file of what changed in it), add `Notes`
  when a future reader must know something, run `bun run session -- --check`, commit as
  `docs(session): …`.
- **In the same step as the change that makes them stale**, citing the session entry (sha):
  OVERVIEW "Status" / "Next up"; a new or changed decision → a new `ADR-NNN`
  (`documentation-and-adrs` skill; `grill-with-docs` to interrogate a design first); a changed
  requirement or default → `PRD-001`; a feature bigger than a small fix → its `PLAN-NNN`
  (`planning-and-task-breakdown`); a fact established against primary sources or empirically →
  `ANA-NNN` (`research` skill, told to save there). Update each directory's README index.
- **Narrative as it happens:** requests, decisions, dead ends, false leads, verifications go into
  the session's Narrative when they happen; `Outcome` / `Open at end` before the session ends.

Never put any of this off; the next session depends on it. A filled session entry (full template
in [docs/sessions/README.md](docs/sessions/README.md)):

```markdown
### YYYY-MM-DD · type(scope): subject · sha

- Summary: one or two lines — what this change does as a whole
- Why: one line — the problem or request that caused it (name who asked if it was Peter)
- Files:
  - `src/thing.ts` (+12/−3) — what changed in this file
  - `docs/OVERVIEW.md` (+4/−1) — what changed in this file
  - `.github/workflows/ci.yml` (+2/−0) — what changed in this file
- Notes: optional — gotchas, follow-ups, what was verified and how
```

Nested `CLAUDE.md` files load when you work under their directory and carry only that area's
conventions and gotchas: `src/` (+ `commands/`, `items/`, `orchestrator/`, `ui/`, `items/{chrome,
claude-code,defs,finder}/`), `docs/` (+ each subdirectory), `.github/`, `scripts/`; `.claude/rules/`
adds file-type rules for run-skill drivers and `__tests__` (ADR-018). Contribution & release
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
- **Docs are kept current continuously — never deferred.** OVERVIEW "Status"/"Next up", the
  ADRs, the PRD, the plans, the analyses and the session log are updated *as part of the change
  that makes them stale* (same commit or the very next `docs(session)` commit), not "later", not
  "at the end of the PR", not "in the next session". Where a doc refers to work, cite the session
  entry (sha).
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
  items re-enter the bootstrap list as "applied — settings differ (select to reset)", default
  UNCHECKED — selection is the user's consent to re-apply; we never silently overwrite. No
  conflict checking, by decision (docs/decisions/ADR-010-reset-on-drift-config-model.md).
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
bun run session -- --new <slug>  # start today's session file (session start)
bun run session            # append entry skeletons for new commits into the current session
bun run session -- --check # fail if entries are missing or placeholders unfilled
```

## Safety when running it

`envsetup` mutates the real macOS system. Bare `envsetup` (bootstrap) and `sync` **install
software and change settings** — never run them to "test." `doctor` is read-only (diffs the
machine against its manifest). To drive/smoke the CLI safely, use the run skills: the root one
(`/run-envsetup`: `expect .claude/skills/run-envsetup/bootstrap-walk.exp` walks the real TUI up to
"Proceed?" and answers No; `bun .claude/skills/run-envsetup/smoke.mjs` covers the read-only
surfaces) and one per directory (`<dir>/.claude/skills/run-*/driver.ts` — direct invocation of that
module's safe functions). Never bypass them to "test" with a real run.
