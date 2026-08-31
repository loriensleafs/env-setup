---
name: run-envsetup
description: Build, run, and drive the envsetup CLI. Use when asked to start, run, build, test, smoke-test, screenshot, or walk the interactive bootstrap TUI of envsetup, or to run its doctor/diff against the machine. envsetup is a macOS setup CLI that INSTALLS software — the drivers exercise only the read-only surfaces, including the whole Stage A TUI up to (never past) the confirm.
---

Two drivers, both in this directory, both read-only:

- **`bootstrap-walk.exp`** — drives the REAL interactive bootstrap under a PTY (`expect`,
  ships with macOS) through scan → name → GitHub user → Dev dir → picker → config screens →
  summary, and answers **No** at "Proceed?". `src/commands/bootstrap.ts` writes the manifest
  only after that confirm, so nothing on the machine changes.
- **`smoke.mjs`** — the non-interactive surfaces: every `--help` and the read-only `doctor`.

**envsetup mutates the real macOS system: bare `envsetup` past the confirm, `sync`,
`connect`, `auth`, and the passphrase-gated `secrets` actions install software and change
settings. Never run those to "test".** Every source directory also has its own `/run-…`
skill (`src/**/.claude/skills/`) with a direct-invocation driver for its module.

All paths below are relative to the repo root.

## Prerequisites

- **macOS** (item detection is macOS-specific; the `--help` surfaces run anywhere Bun runs).
- **Bun** on PATH — every shell needs it:

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun --version
```

- `/usr/bin/expect` (present on macOS). `tmux` and GNU `timeout` are **not** installed here.

## Setup

```bash
bun install                     # also installs git hooks via prepare → lefthook install
```

## Run (agent path) — walk the real TUI

```bash
expect .claude/skills/run-envsetup/bootstrap-walk.exp /tmp/envsetup-bootstrap-walk.txt
```

Expected tail (≈4 s on this machine):

```text
[walk] OK — reached Proceed? after 4 prompts, answered No, nothing written
```

The raw ANSI transcript is the "screenshot". Strip it to read the frames:

```bash
python3 -c "
import re;t=open('/tmp/envsetup-bootstrap-walk.txt',encoding='utf-8',errors='replace').read()
t=re.sub(r'\x1b\[[0-9;?]*[A-Za-z]','',t);print('\n'.join(l for l in t.replace('\r','\n').split('\n') if l.strip()))"
```

What the stripped transcript shows, in order: the scan task log collapsing to `◆ Ready in
Ns`; `Your name (git commits)` / `GitHub username` / `Dev directory` prefilled from the prior
manifest and accepted; the picker (`What should this machine get?`) with missing items checked
and drifted ones shown as `applied — settings differ` unchecked; any config screens for
selected items with a schema; the `plan` note (`N items will be installed · M already
installed`); `Proceed? (nothing has touched the system yet)` → `No` → `nothing was changed`.

How the driver stays safe — keep these if you extend it:

| Rule | Why |
| --- | --- |
| `Resume it?` is always answered `n` | resuming an unfinished run **installs** |
| `Proceed?` is matched first and answered `n` (never Enter) | clack's confirm defaults to **Yes** |
| Enter goes to a prompt only when its message is new, then the driver waits for that prompt's `◇` submitted line | a duplicate Enter would leak into the next prompt |
| the stock path prompt sometimes eats the first Enter → one retry after a 60 s timeout | observed with the vendored clack |

Assert nothing was written (mtimes unchanged before/after):

```bash
ls -la ~/.config/envsetup/manifest.json ~/.local/state/envsetup/journal.jsonl
```

## Run (agent path) — non-interactive surfaces

```bash
bun .claude/skills/run-envsetup/smoke.mjs
```

Expected tail:

```text
read-only machine diff:
  ✓ doctor runs and reports a diff
  ✓ doctor outro shape (satisfied · missing · drifted · untracked · shell-gap)

PASS — 8 passed, 0 failed
```

The safe commands it runs (all exit 0):

```bash
bun run dev --help              # root: lists auth|connect|doctor|sync|secrets
bun run dev doctor --help
bun run dev secrets --help      # init · list · show · reveal · copy · set · unlock
bun run dev doctor              # READ-ONLY: diffs this machine vs its manifest (clack TUI)
```

## Build (standalone binary) and the install shim

```bash
bun run compile                 # → dist/envsetup (65 MB, Bun embedded; 0.1 s here)
./dist/envsetup --help          # exit 0
sh install.sh --help            # downloads the latest release binary to $TMPDIR/envsetup, execs it with --help
```

## Repo tooling

```bash
bun run session -- --check      # session log complete? (docs/sessions/, see /run-scripts)
bun docs/.claude/skills/run-docs/link-check.ts   # every relative link in docs/ resolves
```

## Run (human path) — interactive, MUTATES THE MACHINE past the confirm

```bash
bun run dev                     # bootstrap; answering Yes at Proceed? installs everything selected
```

Also mutating/attended, never for drivers: `sync`, `connect`, `auth`, `secrets` (except `--help`).

## Test

```bash
bun test                        # 111 pass, 0 fail (31 files)
bun run check                   # Biome + tsc + markdownlint — the CI / pre-push gate
```

## Gotchas

- **expect must be told the stream is UTF-8** (`encoding system utf-8` + `fconfigure
  $spawn_id -encoding utf-8`) or the `◆`/`◇` prompt symbols never match — the first two
  attempts timed out at the very first prompt for this reason.
- **The prompt symbol is colour-wrapped** (`ESC[36m◆ESC[39m  message`): match `◆[^ ]* +…` and
  strip ANSI from the captured message before comparing.
- **`◆ Ready in Ns` is not a prompt** — the collapsed scan task log uses the same symbol; the
  driver skips it.
- **`Proceed?` defaults to Yes.** Typing `n` selects No immediately (clack's confirm listens
  for `y`/`n`); the driver never sends a bare Enter there.
- **No config screens appear** when nothing selected has a schema (as on this converged machine:
  only two missing items were checked). Select a schema item in the picker to exercise them.
- **`secrets list/show/reveal` block on a passphrase prompt**; only `secrets --help` is safe.
- **No `timeout`, no `tmux` on this Mac.** `expect` with `set timeout` is the wrapper.
- **Compiled binaries idle at ~160 % CPU at any clack prompt** (bun-run: 0 %) — known
  bun-compile quirk, not a hang.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `command not found: bun` / exit 127 | `export PATH="$HOME/.bun/bin:$PATH"` |
| `[walk] TIMEOUT waiting for a prompt (last: )` | the symbol regex didn't match — check the UTF-8 lines at the top of the driver are intact |
| `[walk] EOF before Proceed?` | bootstrap exited early — read the transcript; `bun run dev` prints the reason (e.g. no TTY) |
| `doctor` shows "no manifest yet — raw detection" | a machine that never ran bootstrap; still exits 0 |
| a hung `bun src/index.ts` after Ctrl-C | `pkill -f "src/index.ts"` |
