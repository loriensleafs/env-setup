# envsetup — agent guide

Loaded on every turn by Claude Code (`CLAUDE.md`); `AGENTS.md` is a symlink kept for other agents
(Claude Code itself does not read it). Short and high-signal by design — depth lives behind the
pointers below.

`envsetup` — a one-command interactive **macOS** environment-setup CLI (Bun + TypeScript). Bare
`envsetup` bootstraps a fresh Mac (apps, runtimes, fonts, repos, macOS settings, app configs),
runs the attended ceremonies, and **converges** on re-run; `doctor` is the read-only diff; `sync`
applies the manifest without the picker. Owner: Peter Kloss (github `loriensleafs`).

## Rehydrating — at session start, run `/session start` (alias `/session-start`)

The `/session` skill — the `session` plugin from the ACMElabs marketplace (ADR-023), not a file in
this repo — is the one home of the session ritual: `start [PLAN-NNN]` reads the docs system in
the right order — OVERVIEW (Status, Next up, Key facts) → the plan and the PRD it serves → every
**open** `SES-NNN` serving it in full → [CONTEXT.md](CONTEXT.md) → the tree checked against the
log → the ADRs / ANAs the plan cites and the nested `CLAUDE.md` — then joins the open session the
plan part names, opens one for it and marks the part in progress, or states that nothing will
change, and ends in a brief (ADR-022). A session is a stream of work
toward one Goal, open until closed, and may span many conversations (ADR-020); a conversation
needs one before its first commit, not before its first answer. **Every file it names is read in
full, to the end, with no sampling**; a truncated read is continued with `offset`, never
summarized. Do **not** rebuild history from the code or `git log`; the docs system exists so you
never have to. Every doc is `<TYPE>-<NNN>-<kebab-title>.md` in its directory; each directory's
`README.md` holds its rules, index and template; `docs/archive/` is history only.

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
- Talk plain: a line of context, then Simplified Technical English in `CONTEXT.md`'s words
  (`/wait-what` re-pitches what did not land).

## Recording — after every commit `/session entry`; leaving `/session end`; Goal done `/session close`

`entry` appends and fills the commit's entry and updates everything the change made stale in the
same step (OVERVIEW, ADR, PRD, plan, analysis, `CONTEXT.md`, a directory's `CLAUDE.md`), then
commits it as `docs(session): …`. The session log holds value only (ADR-021): a fix-up gets no entry
(its parent's `Also:` line vouches for it) and a commit with nothing to record carries the trailer
`Session-entry: none`; `end` checks the log, Status and the tree and leaves the
session open with a handoff; `close` writes the Outcome, runs `session close`, and
marks the plan part `done (session SES-NNN, sha)`. The procedure lives in the skill, the template in
`docs/sessions/README.md`; `/session-start`, `/session-entry`, `/session-end` and
`/session-close` are typed-only aliases. Never put it off; the next conversation's `start`
depends on it.

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
```

The session tool (`list`, `new`, `append`, `current`, `check`, `close`) is the `session`
plugin's, run by the `/session` skill as `bun "${CLAUDE_PLUGIN_ROOT}/skills/session/scripts/session.ts" …`; by hand,
`bun ~/Dev/ACMElabs/session/skills/session/scripts/session.ts <command>` (ADR-023).

## Safety when running it

`envsetup` mutates the real macOS system: bare `envsetup` past the confirm, `sync`, `connect`,
`auth`, and the passphrase-gated `secrets` actions install software and change settings — never
run them to "test". `doctor` is read-only. Drive it through the run skills instead:
`/run-envsetup` (`expect .claude/skills/run-envsetup/bootstrap-walk.exp` walks the real TUI up
to "Proceed?" and answers No; `bun .claude/skills/run-envsetup/smoke.mjs` covers the read-only
surfaces) and one per directory with a real driver (`<dir>/.claude/skills/run-*/driver.ts`, direct
invocation of that module's safe functions). Extend the driver when you add a surface.

Contribution and release workflow: [CONTRIBUTING.md](CONTRIBUTING.md).
