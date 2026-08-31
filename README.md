# envsetup

One-command interactive Mac environment setup. Bootstraps a fresh machine — apps, runtimes,
fonts, repos, macOS settings, and app customizations — from a single curl command, then keeps
it in shape with `envsetup doctor` and `envsetup sync`.

```sh
curl -fsSL https://raw.githubusercontent.com/loriensleafs/env-setup/main/install.sh | sh
```

## Commands

| Command | Does |
| --- | --- |
| `envsetup` | The one command: scan the machine, pick what to install, install it, then walk through the attended steps. **Run it again anytime** — it re-detects the machine, pre-checks anything that failed last run, and only asks about what's missing. |
| `envsetup doctor` | Diff this machine against its manifest (read-only) |
| `envsetup sync` | Non-interactive: apply the saved manifest as-is (no picker) |
| `envsetup auth` | Sign in to GitHub (device flow) |
| `envsetup connect` | Re-run the attended finishing steps if any were skipped |
| `envsetup secrets` | Manage the age-encrypted secret store (`init`/`list`/`show`/`reveal`/`copy`/`set`/`unlock`) |

## How it works

Pure Bun (no Node), [@clack](https://github.com/bombshell-dev/clack) prompts UI, citty
commands. Every installable/configurable thing is an **item** (`detect`/`install`/`configure`/
`verify`) recorded in a **Zod-versioned manifest**, so the machine's setup is declarative and
`doctor`/`sync` keep it in sync. Secrets are **age-encrypted**. Ships as a single
`bun build --compile` binary (Bun embedded).

**Your settings are respected.** Something already installed with settings that differ from
envsetup's defaults is never silently overwritten — it shows in the picker as
*"installed — settings differ (select to reset)"*, unchecked. Selecting it is the opt-in to
reset; leave it unchecked and your configuration is untouched. `doctor` reports such drift
as `≠` rather than "missing".

**Working on it (humans and agents): start at [docs/OVERVIEW.md](docs/OVERVIEW.md)** (map,
status, next up), then the newest file in [docs/sessions/](docs/sessions/README.md) (what was done, session
by session, with a note per touched file). Design + all decisions: [docs/archive/ARC-001-living-plan.md](docs/archive/ARC-001-living-plan.md) · research:
[docs/analysis/ANA-001-clack-citty-bun.md](docs/analysis/ANA-001-clack-citty-bun.md) · agent conventions:
[CLAUDE.md](CLAUDE.md) (also `AGENTS.md`).

## Development

Pure-Bun toolchain (no Node runtime). `bun install` also wires the git hooks (via `lefthook`).

| Command | Does |
| --- | --- |
| `bun run dev` | Run the CLI from source |
| `bun run check` | Biome (format + lint) · `tsc` typecheck · markdownlint |
| `bun run fix` | Auto-fix everything (Biome `--write` + markdownlint `--fix`) |
| `bun run test` | Bun test suite |
| `bun run changelog` | Regenerate `CHANGELOG.md` from conventional commits (git-cliff) |
| `bun run compile` | Build the standalone binary |

- **Biome** (`biome.json`) formats/lints JS/TS/JSON; **markdownlint-cli2**
  (`.markdownlint-cli2.jsonc`) handles Markdown.
- **Git hooks** (`lefthook.yml`): pre-commit auto-fixes staged files and typechecks; pre-push
  runs the full check + tests. CI (`.github/workflows/ci.yml`) mirrors this and scans for secrets.
- A Claude Code `FileChanged` hook (installed into `~/.claude` by the CLI, not committed here)
  auto-formats edited files with each project's own Biome/markdownlint config.

Full contribution workflow and how to cut a release: **[CONTRIBUTING.md](CONTRIBUTING.md)**.
