# Contributing to envsetup

envsetup is a pure-Bun macOS environment-setup CLI. This doc covers how to set up, make a
change, and cut a release. Start with [docs/OVERVIEW.md](docs/OVERVIEW.md) (map, status, next up) and
[docs/sessions/](docs/sessions/README.md) (what was done, session by session, with files). The always-loaded agent brief is
[CLAUDE.md](CLAUDE.md); decisions are ADRs in [docs/decisions/](docs/decisions/README.md); requirements
in [docs/plan/PRD-001-envsetup.md](docs/plan/PRD-001-envsetup.md).

## Ground rules

- **Pure Bun. No Node.** Use `bun`/`bunx`, `Bun.*` APIs, and `node:` builtins (Bun implements
  them natively). Never depend on the `node`/`npm`/`npx` runtime, and never ship Python.
- **`@clack/*` is vendored** (`vendor/*.tgz`, pinned in `package.json`). Do not swap in the npm
  releases — they lack the `completeOnTab` tab-completion the UI relies on.
- **Secrets never touch tracked files.** Keys live only in the age-encrypted `secrets.json.age`
  (+ a password manager). Never put a key — even partial — in source, docs, tests, or a commit.
- **Tests** are `<name>.test.ts` in a `__tests__/` dir beside the file under test (`bun:test`).

## Setup

```bash
bun install        # also installs the git hooks via the `prepare` → `lefthook install` script
bun run check      # Biome + tsc + markdownlint — should pass on a clean checkout
bun test           # bun:test suite
```

If `bun` isn't found, add it to PATH: `export PATH="$HOME/.bun/bin:$PATH"`.

## Making a change

1. **Branch off `main`** — never commit directly to `main`.

   ```bash
   git checkout main && git pull
   git checkout -b feat/<short-name>      # or fix/…, docs/…, build/…, chore/…
   ```

2. **Write the change.** New installable/configurable things are **items** (`defineItem` in
   `src/items/**`): implement `detect`/`install`/`configure`/`verify`, declare `deps`, add a
   Zod `configSchema` for user-tunable settings, and — if the tool needs a shell line — a
   co-located `zsh()` contribution (assembled by `src/items/defs/shell-block.ts`). Register it
   in `src/items/all.ts`. Make `detect()` **drift-aware**: compare the actual current values to
   the effective config, and return `{ installed: false, differs: true }` when config is
   *present but mismatched* (vs plain `installed: false` for never-configured). `differs` is
   what makes a drifted item show as an opt-in reset in bootstrap and as `≠` in `doctor` —
   see [ADR-010](docs/decisions/ADR-010-reset-on-drift-config-model.md) for the model. Every
   prompt passes `input: promptInput()` ([ADR-014](docs/decisions/ADR-014-terminal-input-in-process-dev-tty.md)).
   A new decision with alternatives gets an ADR; a new default or item updates the PRD's catalog.

3. **Drive it, don't guess.** Every directory has a `/run-…` skill (`<dir>/.claude/skills/run-*/`)
   with a driver that exercises its module safely; the root `/run-envsetup` walks the real bootstrap
   TUI under `expect` up to the confirm. Run the driver for the directory you changed (and extend it
   when you add a surface) — bare `envsetup`/`sync` mutate the machine and are never a test.

4. **Keep it green.**

   ```bash
   bun run fix        # auto-fix Biome + markdown
   bun run check      # must pass (Biome + tsc + markdownlint)
   bun test           # must pass
   ```

5. **Commit with Conventional Commits** — the changelog is generated from them, so the type
   prefix matters:

   | Prefix | Use for | Changelog group |
   | --- | --- | --- |
   | `feat:` | new capability | Features |
   | `fix:` | bug fix | Bug Fixes |
   | `docs:` | docs only | Documentation |
   | `build:` / `ci:` | tooling, deps, CI | Build & CI |
   | `refactor:` / `perf:` / `test:` / `chore:` | everything else | Refactor / Performance / Testing / Miscellaneous |

   The **pre-commit** hook auto-fixes staged files (Biome + markdownlint) and runs `tsc`,
   blocking only on un-auto-fixable lint or type errors. The **pre-push** hook runs the full
   check + tests.

6. **Record it — continuously, not after.** At session start `bun run session -- --new <slug>`
   creates the session file. After every commit `bun run session` appends an entry skeleton to it
   (`Summary` / `Why` placeholders and one line per touched file — every file: code, docs, config,
   CI, scripts). Fill in every placeholder (template in [docs/sessions/README.md](docs/sessions/README.md)),
   write the Narrative as things happen, run `bun run session -- --check`, and update
   `docs/OVERVIEW.md` "Status" / "Next up" if the picture changed. Commit as `docs(session): …`
   (the script skips those commits). After a release tag, run `bun run session` once more so the
   release marker lands.

7. **Open a PR** (`gh pr create`). CI (`.github/workflows/ci.yml`) runs the same checks plus a
   gitleaks secret scan. Merge once green.

## Cutting a release

Releases are macOS binaries built and attached by `.github/workflows/release.yml`, which
triggers on a pushed `v*` tag. SemVer (pre-1.0: bump the minor for meaningful feature work).

After the release's changes are merged to `main`:

```bash
git checkout main && git pull

# 1. Bump the version in BOTH places (use the next version — check `git tag` first)
#    - package.json  "version"
#    - src/index.ts  meta.version
#    (edit them to e.g. 0.2.0)

# 2. Regenerate the changelog for the new version
bun run changelog -- --tag v0.2.0     # git-cliff renders the unreleased commits under [0.2.0]

# 3. Commit the release prep
git add package.json src/index.ts CHANGELOG.md
git commit -m "chore(release): v0.2.0"
git push

# 4. Tag and push the tag — this triggers the release build
git tag v0.2.0
git push origin v0.2.0

# 5. Verify: the release run compiled + attached both binaries
gh run watch "$(gh run list --workflow=release.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
gh release view v0.2.0 --json assets -q '[.assets[].name] | join(", ")'   # expect both darwin binaries
```

`release.yml` then compiles `dist/envsetup-darwin-arm64` and `-x64` (`bun build --compile`,
Bun embedded — no Node), ad-hoc codesigns them, and attaches them to the GitHub release.
`install.sh` downloads and execs those binaries.
