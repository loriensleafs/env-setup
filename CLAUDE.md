# envsetup — agent guide

Loaded on every turn by Claude Code (`CLAUDE.md`); `AGENTS.md` is a symlink kept for other agents
(Claude Code itself does not read it). Short and high-signal by design — depth lives behind the
pointers below.

`envsetup` — a one-command interactive **macOS** environment-setup CLI (Bun + TypeScript). Bare
`envsetup` bootstraps a fresh Mac (apps, runtimes, fonts, repos, macOS settings, app configs),
runs the attended ceremonies, and **converges** on re-run; `doctor` is the read-only diff; `sync`
applies the manifest without the picker. Owner: Peter Kloss (github `loriensleafs`).

## Rehydrating — read in this order at session start, then work

Do **not** rebuild history from the code or `git log`; the docs system exists so you never have to.
Every doc is `<TYPE>-<NNN>-<kebab-title>.md` in its directory; each directory's `README.md` holds
its rules, index and template.

1. [docs/OVERVIEW.md](docs/OVERVIEW.md) — the map. Read **"Status"**, **"Next up"** and **"Key
   empirical facts"** in full: where the project is, what is next, what not to relearn.
2. [docs/sessions/](docs/sessions/README.md) — the newest `SES-NNN` **in full** (Goal / Outcome /
   Open at end, Narrative, Changes), then earlier ones back to the last `> **Released vX.Y.Z**`
   marker: what is on `main` but unreleased, what is parked, what was tried and abandoned, what was
   verified and how.
3. [CONTEXT.md](CONTEXT.md) — the glossary. Its words are the words for code labels, prompts,
   commit messages and docs (Applied / Satisfied / Missing / Drifted / Untracked; Picked vs Wanted;
   Ceremony; Converge). A missing, fuzzy or contested term is settled with the `domain-modeling`
   skill and written there before code uses it.
4. For the area you will touch: its `PLAN-NNN` in [docs/plan/](docs/plan/README.md) if the work has
   one; every relevant `ADR-NNN` in [docs/decisions/](docs/decisions/README.md) (decisions are
   settled — a change needs a superseding ADR, never a re-litigation); the `ANA-NNN` in
   [docs/analysis/](docs/analysis/README.md) for facts you would otherwise re-research;
   `grep -rn <file-or-keyword> docs/sessions/` for prior changes; `git show <sha>` only when the
   exact diff matters. The directory's own `CLAUDE.md` loads when you read files there and carries
   that area's conventions and gotchas (`src/`, `src/{commands,items,orchestrator,ui}/`,
   `src/items/{chrome,claude-code,defs,finder}/`, `docs/` + subdirectories, `.github/`, `scripts/`);
   `.claude/rules/` adds file-type rules for run-skill drivers and `__tests__` (ADR-018).
5. [docs/plan/PRD-001-envsetup.md](docs/plan/PRD-001-envsetup.md) whenever the work touches
   behaviour: the promise, UX requirements, the item catalog with its chosen defaults, boundaries.
   `docs/archive/` is history only — never cite it as current.

## Working with Peter

- One question at a time, through `AskUserQuestion`, with the research and a recommendation
  **inside** the question (the dialog covers earlier text). Options researched from official
  docs first; "best way, not easiest"; pushback welcome; transitive prerequisites installed
  automatically.
- Verify or say unverified. Interactive checks need a strong oracle (submit → the next prompt
  appears). An unfounded "zero incompatibilities" claim burned trust once; a failed attempt is not
  proof that an approach is impossible — research first.
- Peter approves outward-facing steps (push, PR, merge, release): ask once, then proceed with
  small separate commands — large compound shell commands are denied by the permission prompt.
  Merge PRs with **merge commits** (session entries cite shas).
- Proceed on reversible work without asking; finish the whole task; report faithfully.

## Recording — continuously, as you go

- **Session start:** `bun run session -- --new <slug>` creates `SES-<next>-<slug>.md` and makes
  it current; set its title and `Goal` right away.
- **After every commit** (not at the end of the PR, never "later"): `bun run session` appends an
  entry skeleton per new commit — `Summary` / `Why` placeholders and one line per touched file,
  **every** file, whatever kind, with its +/− counts. Fill every placeholder (a short phrase per
  file), add `Notes` when a future reader must know something, `bun run session -- --check`,
  commit as `docs(session): …`.
- **In the same step as the change that makes them stale**, citing the session entry's sha:
  OVERVIEW "Status" / "Next up"; a new or changed decision → a new `ADR-NNN`
  (`documentation-and-adrs`; `grill-with-docs` to interrogate a design first); a changed
  requirement or default → `PRD-001`; work bigger than a small fix → its `PLAN-NNN`
  (`planning-and-task-breakdown`); a fact established against primary sources or empirically →
  `ANA-NNN` (`research`, told to save there); a new or sharpened term → `CONTEXT.md`
  (`domain-modeling`); a directory-specific convention → that directory's `CLAUDE.md`. Update each
  directory's README index.
- **Narrative as it happens:** requests, decisions, dead ends, false leads, verifications go into
  the session's Narrative when they happen; `Outcome` / `Open at end` before the session ends.

A filled session entry (full template in [docs/sessions/README.md](docs/sessions/README.md)):

```markdown
### YYYY-MM-DD · type(scope): subject · sha

- Summary: one or two lines — what this change does as a whole
- Why: one line — the problem or request that caused it (name who asked if it was Peter)
- Files:
  - `src/thing.ts` (+12/−3) — what changed in this file
  - `docs/OVERVIEW.md` (+4/−1) — what changed in this file
- Notes: optional — gotchas, follow-ups, what was verified and how
```

## Hard rules (do not violate)

- **Pure Bun. No Node.** `bun`/`bunx`, `Bun.*` APIs, `node:` builtins (Bun implements them).
  Never a dependency on the `node`/`npm`/`npx` runtime; never Python for anything shipped. Shell is
  glue only (`install.sh`; Automator wrappers exec `bun`). (ADR-001)
- **`@clack/*` is vendored** (`vendor/*.tgz`, pinned + `overrides` in `package.json`) for
  `completeOnTab`; never swap to npm until upstream ships it (`vendor/README.md`). (ADR-003)
- **Secrets never touch tracked files.** License and API keys live only in the age-encrypted
  `secrets.json.age` (+ Peter's password manager). Never a key — even partial — in source, docs,
  tests, or a commit message. (ADR-008)
- **Tests:** `<name>.test.ts` in a `__tests__/` directory beside the file under test (`bun:test`).
  (ADR-004)
- **Docs are kept current continuously — never deferred** ("Recording" above). (ADR-017)
- **Before finishing code:** `bun run check` (Biome + tsc + markdownlint) and `bun test` pass;
  `bun run fix` auto-fixes. Lefthook enforces this at commit/push; don't rely on it. (ADR-016)

## Architecture (the essentials — the nested CLAUDE.md files carry the rest)

- **Item** (`src/items/item.ts`, `defineItem`): `detect` / `install` / `configure` / `verify`,
  `deps`, `ceremonies`, Zod `configSchema` + `defaultConfig`, optional `zsh()`. Registry in
  `src/items/all.ts`; toposorted execution. (ADR-007)
- **Reset-on-drift**: `detect()` compares the actual values to the effective config and returns
  `{ installed: false, differs: true }` for Drifted (present, config differs) vs plain
  `installed: false` for Missing. A drifted item re-enters the picker as "applied — settings
  differ (select to reset)", **unchecked** — picking it is the consent; no conflict checking.
  (ADR-010)
- **Flow** (ADR-005): scan → identity → picker (requires-cascade, ADR-006) → config screens →
  confirm (**nothing touches the machine before it**) → build → connect phase (ceremonies run
  automatically) → finishing pass. Re-running converges. Manifest = what the machine should have;
  journal = what each run did (ADR-007).
- **Terminal**: every prompt passes `input: promptInput()` — under `curl | sh` nothing else
  receives keystrokes (ADR-014).
- **Shell config**: per-item `zsh()` contributions assembled into one managed `~/.zshrc` block
  (ADR-012). **Assets** ship embedded (`with { type: "file" }`); the Claude Code format hook is
  installed by the CLI, not committed here (ADR-013).

## Commands

```bash
bun run dev [subcommand]         # run the CLI from source (bare = interactive bootstrap — mutates the machine)
bun run check                    # Biome + tsc + markdownlint (CI / pre-push gate)
bun run fix                      # auto-fix Biome + markdown
bun run test                     # bun:test suite
bun run compile                  # standalone binary → dist/envsetup
bun run changelog                # regenerate CHANGELOG.md (git-cliff)
bun run session -- --new <slug>  # start a session file (session start)
bun run session                  # append entry skeletons for new commits into the current session
bun run session -- --check       # fail if entries are missing or placeholders unfilled
```

## Safety when running it

`envsetup` mutates the real macOS system: bare `envsetup` past the confirm, `sync`, `connect`,
`auth`, and the passphrase-gated `secrets` actions install software and change settings — never
run them to "test". `doctor` is read-only. Drive it through the run skills instead:
`/run-envsetup` (`expect .claude/skills/run-envsetup/bootstrap-walk.exp` walks the real TUI up
to "Proceed?" and answers No; `bun .claude/skills/run-envsetup/smoke.mjs` covers the read-only
surfaces) and one per directory with a real driver (`<dir>/.claude/skills/run-*/driver.ts`, direct
invocation of that module's safe functions). Extend the driver when you add a surface.

Contribution and release workflow: [CONTRIBUTING.md](CONTRIBUTING.md).
