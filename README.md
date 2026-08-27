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
| `envsetup` | Interactive bootstrap — scan the machine, pick what to install, set it all up |
| `envsetup doctor` | Diff this machine against its manifest (read-only) |
| `envsetup sync` | Install/configure anything the manifest is missing |
| `envsetup auth` | Sign in to GitHub (device flow) |
| `envsetup connect` | Attended finishing steps (sign-ins, permissions, licenses) |
| `envsetup secrets` | Manage the age-encrypted secret store (`init`/`list`/`show`/`reveal`/`copy`/`set`/`unlock`) |

## How it works

Pure Bun (no Node), [@clack](https://github.com/bombshell-dev/clack) prompts UI, citty
commands. Every installable/configurable thing is an **item** (`detect`/`install`/`configure`/
`verify`) recorded in a **Zod-versioned manifest**, so the machine's setup is declarative and
`doctor`/`sync` keep it in sync. Secrets are **age-encrypted**. Ships as a single
`bun build --compile` binary (Bun embedded).

Design + all decisions: **[docs/PLAN.md](docs/PLAN.md)** ·
research: [docs/RESEARCH-clack-citty-bun.md](docs/RESEARCH-clack-citty-bun.md) ·
conventions for agents: [CLAUDE.md](CLAUDE.md).

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
