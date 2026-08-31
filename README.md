# envsetup

One-command interactive Mac environment setup. Bootstraps a fresh machine — apps, runtimes,
fonts, repos, macOS settings, and app configuration — from a single curl command, runs the
attended sign-ins and permission grants at the end, and **converges when you run it again**.

```sh
curl -fsSL https://raw.githubusercontent.com/loriensleafs/env-setup/main/install.sh | sh
```

## Commands

| Command | Does |
| --- | --- |
| `envsetup` | The one command: scan the machine, pick what to install, configure, confirm (nothing touches the machine before it), build, then the attended ceremonies run automatically. **Run it again anytime** — it re-detects, pre-checks what failed last run, and only asks about what is missing. |
| `envsetup doctor` | Read-only: for every item the manifest wants, is it satisfied, missing, drifted (`≠`, settings differ) — or present but untracked? Plus per-item shell-config gaps. |
| `envsetup sync` | Apply the saved manifest as-is, without the picker |
| `envsetup connect` | Re-run attended ceremonies that were skipped (they run automatically at the end of `envsetup`) |
| `envsetup auth` | Sign in to GitHub (device flow) |
| `envsetup secrets` | Manage the age-encrypted secret store (`init` / `list` / `show` / `reveal` / `copy` / `set` / `unlock`) |

## How it works

Pure Bun (no Node), [@clack](https://github.com/bombshell-dev/clack) prompts, citty commands.
Every installable or configurable thing is an **item** (`detect` / `install` / `configure` /
`verify`) recorded in a **Zod-versioned manifest** — what this machine should have — so `doctor`
and `sync` can compare and re-apply. Runs are journaled and resumable. Secrets are
**age-encrypted** in the repo, unlocked by one passphrase. Ships as a single
`bun build --compile` binary (Bun embedded). The vocabulary is in [CONTEXT.md](CONTEXT.md).

**Your settings are respected.** Something already applied whose settings differ from envsetup's
defaults is *drifted*, never silently overwritten: it shows in the picker as
*"applied — settings differ (select to reset)"*, unchecked. Picking it is the opt-in to reset;
leave it unchecked and your configuration is untouched. `doctor` lists it as drifted, apart from
what is missing.

## Working on it

Humans and agents start the same way (agents: `/brain:plan PLAN-NNN` is the way in, walking the read order in CLAUDE.md § Rehydrating; `/brain:session log` after every commit, `/brain:session close` when the Goal is done; the session log holds value only — ADR-021): [docs/OVERVIEW.md](docs/OVERVIEW.md) (map, status, next up)
→ the sessions in progress in [docs/sessions/](docs/sessions/README.md) (what was done, with a note per
touched file) → [CONTEXT.md](CONTEXT.md) (the words) → [docs/decisions/](docs/decisions/README.md)
(ADRs, the current truth of every decision) · [docs/plan/PRD-001-envsetup.md](docs/plan/PRD-001-envsetup.md)
(requirements and the item catalog) · [docs/analysis/](docs/analysis/README.md) (research, cited).
The agent brief is [CLAUDE.md](CLAUDE.md) (`AGENTS.md` is a symlink to it); directories carry their
own `CLAUDE.md` where they have conventions of their own. The workflow — session log, branch,
drive, gate, commit, record, PR, release — is [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

Pure-Bun toolchain (no Node runtime). `bun install` also wires the git hooks (via `lefthook`).

| Command | Does |
| --- | --- |
| `bun run dev` | Run the CLI from source (bare = the real bootstrap — it mutates the machine) |
| `bun run check` | Biome (format + lint) · `tsc` typecheck · markdownlint |
| `bun run fix` | Auto-fix everything (Biome `--write` + markdownlint `--fix`) |
| `bun run test` | Bun test suite |
| `/brain:session start · log · close` | The `brain` plugin (ACMElabs marketplace): the record and the tool behind it (`list`, `new <slug>` starts, `append --session SES-NNN`, `current`, `check` gates, `close`) — ADR-022/024 |
| `bun run changelog` | Regenerate `CHANGELOG.md` from conventional commits (git-cliff) |
| `bun run compile` | Build the standalone binary |

- **Drive it safely** with the run skills: `expect .claude/skills/run-envsetup/bootstrap-walk.exp`
  walks the real bootstrap TUI up to "Proceed?" and answers No (nothing is written before that
  confirm); `bun .claude/skills/run-envsetup/smoke.mjs` covers the read-only surfaces; each source
  directory with a real driver has `<dir>/.claude/skills/run-*/driver.ts`.
- **Biome** (`biome.json`) formats/lints JS/TS/JSON; **markdownlint-cli2**
  (`.markdownlint-cli2.jsonc`) handles Markdown.
- **Git hooks** (`lefthook.yml`): pre-commit auto-fixes staged files and typechecks; pre-push runs
  the full check + tests. CI (`.github/workflows/ci.yml`) mirrors this and scans for secrets.
- A Claude Code `FileChanged` hook (installed into `~/.claude` by the CLI, not committed here)
  auto-formats edited files with each project's own Biome/markdownlint config.
