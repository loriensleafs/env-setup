# Contributing to envsetup

envsetup is a pure-Bun macOS environment-setup CLI. This doc is the workflow: set up, make a
change, record it, ship it, cut a release. What to read first is in [CLAUDE.md](CLAUDE.md)
"Rehydrating" (the same order applies to humans): [docs/OVERVIEW.md](docs/OVERVIEW.md) → the
newest session in [docs/sessions/](docs/sessions/README.md) → [CONTEXT.md](CONTEXT.md) (use its
words) → the ADRs, plan and analyses for the area → [the PRD](docs/plan/PRD-001-envsetup.md).

## Ground rules

- **Pure Bun. No Node.** `bun`/`bunx`, `Bun.*` APIs, `node:` builtins. Never the `node`/`npm`/
  `npx` runtime; never ship Python. (ADR-001)
- **`@clack/*` is vendored** (`vendor/*.tgz`, pinned in `package.json`) for `completeOnTab`; swap
  steps and the release signal to watch are in `vendor/README.md`. (ADR-003)
- **Secrets never touch tracked files.** Only the age-encrypted `secrets.json.age` is tracked;
  a new secret enters with `envsetup secrets set`. Never a key — even partial — in source, docs,
  tests or a commit. (ADR-008)
- **Tests** are `<name>.test.ts` in a `__tests__/` directory beside the file under test. (ADR-004)
- **Docs are never deferred**: the change that makes a doc stale updates it in the same step.
  (ADR-017)

## Setup

```bash
export PATH="$HOME/.bun/bin:$PATH"   # every shell; `bun` is not on PATH by default
bun install                          # also installs the git hooks (prepare → lefthook install)
bun run check                        # Biome + tsc + markdownlint — passes on a clean checkout
bun test                             # bun:test suite
```

## Making a change

1. **Rehydrate, then start the session log.** `/rehydrate` reads the docs system in order and
   runs `bun run session -- --new <slug>` (creates `docs/sessions/SES-<next>-<slug>.md`); set its
   title and `Goal`. Keep its Narrative as things
   happen (requests, decisions, dead ends, what was verified and how).

2. **Branch off `main`** — never commit directly to `main`.

   ```bash
   git checkout main && git pull
   git checkout -b feat/<short-name>      # or fix/…, docs/…, build/…, chore/…
   ```

3. **Write the change.** Use the glossary's words ([CONTEXT.md](CONTEXT.md)). New installable or
   configurable things are **items** (`defineItem` in `src/items/**`): `detect`/`install`/
   `configure`/`verify`, `deps` (with the tool's transitive prerequisites, researched from official
   docs — ADR-011), a Zod `configSchema` for user-tunable settings, and a co-located `zsh()` for any
   shell line. Register in `src/items/all.ts`. `detect()` is **drift-aware**: return
   `{ installed: false, differs: true }` for Drifted (present, config differs from the effective
   config) vs plain `installed: false` for Missing (ADR-010). Every prompt passes
   `input: promptInput()` (ADR-014). The directory's `CLAUDE.md` and `.claude/rules/` carry that
   area's conventions — read them before editing there. A decision with alternatives gets an ADR;
   a new item or default updates the PRD's catalog; a new term goes into `CONTEXT.md` first.

4. **Drive it, don't guess.** Directories with a real driver have a `/run-…` skill
   (`<dir>/.claude/skills/run-*/`); the root `/run-envsetup` walks the real bootstrap TUI under
   `expect` up to the confirm and covers the read-only surfaces. Run the driver for what you
   changed and extend it when you add a surface — bare `envsetup`/`sync` mutate the machine and are
   never a test. Interactive changes are verified under a PTY with a strong oracle (submit → the
   next prompt appears).

5. **Keep it green.**

   ```bash
   bun run fix        # auto-fix Biome + markdown
   bun run check      # must pass (Biome + tsc + markdownlint)
   bun test           # must pass
   ```

6. **Commit with Conventional Commits** — the changelog is generated from them:

   | Prefix | Use for | Changelog group |
   | --- | --- | --- |
   | `feat:` | new capability | Features |
   | `fix:` | bug fix | Bug Fixes |
   | `docs:` | docs only (`docs(session): …` for session-log commits — the tool skips those) | Documentation |
   | `build:` / `ci:` | tooling, deps, CI | Build & CI |
   | `refactor:` / `perf:` / `test:` / `chore:` | everything else | Refactor / Performance / Testing / Miscellaneous |

   The **pre-commit** hook auto-fixes staged files (Biome + markdownlint) and runs `tsc`, blocking
   only on un-auto-fixable lint or type errors. The **pre-push** hook runs the full check + tests.

7. **Record it — after every commit, not at the end.** `bun run session` appends an entry
   skeleton (`Summary` / `Why` and one line per touched file, every kind of file); fill every
   placeholder (template in [docs/sessions/README.md](docs/sessions/README.md)); `bun run session
   -- --check`; update `docs/OVERVIEW.md` "Status" / "Next up" and any ADR / PRD / plan / analysis
   / `CONTEXT.md` / nested `CLAUDE.md` the change made stale, citing the sha; commit as
   `docs(session): …`. At the end of the conversation, `/wrap-up` checks nothing was deferred.

8. **Open a PR** (`gh pr create`). CI (`.github/workflows/ci.yml`) runs the same checks plus a
   gitleaks secret scan. `gh pr checks <n> --watch` may say "no checks reported" for ~20 s after
   creation — wait rather than reading it as green. **Merge with a merge commit**
   (`gh pr merge --merge`), never squash: session entries cite commit shas.

## Cutting a release

Releases are macOS binaries built and attached by `.github/workflows/release.yml`, which triggers
on a pushed `v*` tag. SemVer (pre-1.0: bump the minor for meaningful feature work). `install.sh` is
served from `main` and deploys on merge; the binary it downloads is `releases/latest`.

After the release's changes are merged to `main`:

```bash
git checkout main && git pull

# 1. Bump the version in BOTH places (use the next version — check `git tag` first)
#    - package.json  "version"
#    - src/index.ts  meta.version

# 2. Regenerate the changelog for the new version
bun run changelog -- --tag v0.2.0     # git-cliff renders the unreleased commits under [0.2.0]

# 3. Commit the release prep
git add package.json src/index.ts CHANGELOG.md
git commit -m "chore(release): v0.2.0"
git push

# 4. Tag and push the tag — this triggers the release build
git tag v0.2.0
git push origin v0.2.0

# 5. Verify: the release run compiled + attached BOTH binaries (uploads have flaked once — re-run the job)
gh run watch "$(gh run list --workflow=release.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
gh release view v0.2.0 --json assets -q '[.assets[].name] | join(", ")'

# 6. Record it: the release marker lands in the session log
bun run session && bun run session -- --check
```

`release.yml` compiles `dist/envsetup-darwin-arm64` and `-x64` (`bun build --compile`, Bun
embedded — no Node), ad-hoc codesigns them, and attaches them to the GitHub release (ADR-002).
