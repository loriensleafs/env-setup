# Research: clack + citty + Bun CLI foundation

> **Analysis** · 2026-08-26 · status: current (foundation research; the stack it recommends shipped). Moved from `docs/RESEARCH-ANA-001-clack-citty-bun.md` on 2026-08-30. See [README](README.md) for how analysis docs are kept.

_Compiled 2026-08-26 for envsetup. Method: full source read of cloned repos (bombshell-dev/clack
@ prompts 1.7.0 / core 1.4.3, unjs/citty @ 0.2.2), web research, and empirical spikes run on
this machine under Bun 1.4.0 (runtime AND `bun build --compile` binary)._

## 1. SPIKE RESULTS (empirical, this machine, Bun 1.4.0)

| Test | bun runtime | compiled binary (64MB) |
| --- | --- | --- |
| 18 sequential text prompts | PASS | PASS |
| multiselect | PASS | PASS |
| **custom @clack/core prompt (horizontal radio)** | PASS | PASS |
| spinner + progress bar | PASS | PASS |
| citty subcommands + auto help | PASS | PASS |
| citty arg parsing (enum/bool/alias/defaults + enum rejection) | PASS | (compiled routing PASS) |

Spike code: scratchpad/clack-spike/{spike.ts,cli.ts,cli2.ts} — port into repo when created.
(2026-08-26 follow-up per Peter: citty runtime coverage gap closed — subcommands, --version,
--help, enum/boolean/alias/default parsing and invalid-enum rejection all verified under
`bun cli.ts` directly, not only compiled.)

- The custom HorizontalRadio (~25 lines extending `Prompt` from @clack/core) proves the
  custom-prompt path: constructor takes `render()` returning the frame string; `this.on('cursor',
  key => ...)` handles left/right; `value` set on cursor move; `.prompt()` returns value/CANCEL.
- Historical bun+clack issues (#3099, #7033, #10844 crash-after-17-prompts, #24615 stdin EPERM
  in 1.3.2) are ALL closed upstream and empirically not reproducible on 1.4.0.
- **Gotcha found: width-0 terminals.** clack wraps frames to `stdout.columns`; a PTY reporting
  COLS=0 (some CI/automation environments — default `expect` PTY does this under bun) renders
  one char per line. Real terminals fine. Defensive: clamp columns (e.g. `process.stdout.columns
  || 80`) is NOT possible from outside clack — instead ensure envsetup detects non-interactive/
  degenerate terminals and falls back to accessible mode (see §3 settings.accessible).
- Testing harness note: drive interactive tests with `expect` + `set stty_init "rows 40 columns
  120"`, match on UNIQUE per-prompt markers (generic markers false-match residual frames).

## 2. @clack/prompts 1.7.0 — full component catalog (from source; README covers most)

Prompts: `text` (placeholder/initialValue/validate), `password` (mask), `confirm`, `date`
(min/max, segment navigation), `select` (options w/ label/hint/disabled), `selectKey`
(single-key choice), `multiselect` (initialValues/required/maxItems), `groupMultiselect`
(Record<group, options[]>, selectableGroups flag), `autocomplete` + `autocompleteMultiselect`
(searchable large lists — RELEVANT for e.g. font or repo pickers), `path` (file/dir picker w/
directory:true — Group 6 locations prompt), `multiline` (showSubmit).
Non-prompt UI: `spinner` (indicator:'dots'|'timer', onCancel, custom frames/delay),
`progress` (max, advance(n,msg)) — long installs, `taskLog` (streams subprocess output, clears
on success — PERFECT for brew installs), `tasks([{title,task,enabled}])` (sequential spinner
tasks; `enabled:false` skips — selection-aware execution), `log.*` (info/success/step/warn/
error/message w/ custom symbol), `stream.*` (log from async iterables), `note`, `box`
(alignment/width opts), `intro`/`outro`, `cancel`, `group()` (named results, prior answers
available via `({results}) =>`, onCancel), `isCancel()` guard.

## 3. @clack/core 1.4.3 — the custom-prompt platform

- `Prompt<TValue>` base: constructor(opts, trackValue); `render()` returns full frame (diffed
  line-by-line for redraw); events: 'cursor' (semantic up/down/left/right/space/enter actions),
  'key', 'value', 'userInput', 'confirm', 'finalize', 'submit', 'cancel'; state machine
  initial→active→error→submit/cancel; `validate` runs on Enter, sets state 'error'.
- Exposed subclasses if we want to extend instead of build: SelectPrompt, MultiSelectPrompt,
  GroupMultiSelectPrompt (read its source — options flattened w/ group headers, toggleValue
  handles group-toggle; our unified prompt can follow this exact pattern), TextPrompt, etc.
- **`validate` accepts Standard Schema** (`runValidation`) — a Zod 4 schema can be passed
  DIRECTLY as `validate:` on any prompt. Zod 4 implements Standard Schema. Big win.
- `settings`/`updateSettings`: global key aliases (vim hjkl + Escape-cancel built in; can add
  more, additive only), custom cancel/error messages, `withGuide`.
- **Accessible mode**: per-prompt `accessible: true`, global setting, or ACCESSIBLE env var →
  static screen-reader-friendly rendering. Also our escape hatch for degenerate terminals.
- `signal: AbortSignal` supported on every prompt (programmatic cancellation — timeout guards).
- UNIFIED SELECTION PROMPT (the Stage A centerpiece): extend Prompt like GroupMultiSelectPrompt
  does — flat options array w/ section headers, cursor skips headers, space toggles, and inside
  render() recompute each optional item's visibility/disabled state from current `value` +
  dependency graph. Fully reactive live filtering CONFIRMED FEASIBLE (spike proved the
  architecture; the radio was the minimal proof).

## 4. Community best practices (web research)

Sources: pkgpulse Ink-vs-clack-vs-Enquirer 2026, jamesperkins.dev, blacksrc.com, several
Claude-skill clack references.

- clack is "the modern default" for prompt-driven CLIs; Ink (React) only for full-screen TUIs —
  our flow is prompt-driven ⇒ clack correct.
- ALWAYS `isCancel()` after every prompt (Ctrl+C returns a symbol, not an exception).
- Stop spinners before ANY other console output (interleaving corrupts frames).
- Wizard state machines + back-navigation are DIY patterns on top of clack (no built-in back).
- Non-interactive/agent-mode branch: detect `!process.stdout.isTTY` → flags/defaults instead of
  prompts (also needed for resume/CI). Standardized exit codes; graceful SIGINT.

## 5. citty 0.2.2 — evaluation

From source + README + pkgpulse 2026 CLI-framework comparisons:

- Zero-dep, built on `util.parseArgs` (Bun implements natively — verified by compiled spike).
- `defineCommand({meta, args, subCommands, setup/cleanup, plugins})`, `runMain` w/ auto
  --help/--version, lazy async subcommands (bun compile statically bundles them — fine),
  arg types: positional/string/boolean(w/ --no- negation)/enum, aliases, defaults, camelCase
  access, `meta.hidden`, `meta.alias`. Actively maintained (last commit Aug 2026).
- Community: Commander dominates by inertia; citty is the TS-first lightweight pick, standard
  in the unjs orbit. For envsetup (root bootstrap + doctor + sync + few flags) citty's surface
  is exactly right; Commander adds nothing we need; oclif is heavyweight overkill.
- VERDICT: RECOMMEND citty. (Alternative considered: @bomb.sh/args — same-org flag parser,
  <1kB, but no subcommand routing/help gen; we'd hand-roll what citty gives free.)

## 6. Pure-Bun analysis (Peter's mandate: no Node at all)

Two meanings, both satisfied — with one honest nuance:

- No Node.js RUNTIME: guaranteed. Compiled binary embeds Bun; nothing invokes node.
- Bun-native APIs in OUR code: use Bun.file/Bun.write, Bun.spawn, Bun Shell ($`cmd`),
  bun:sqlite if needed, Bun.env. No node:fs/child_process in code we write.
- NUANCE: clack + citty INTERNALLY import node:*builtins (readline, process, util.parseArgs).
  Under Bun these resolve to Bun's own native implementations — no Node involved — this is how
  every npm package runs on Bun and is unavoidable for any third-party dep. Spike proves they
  work compiled. If literal zero-node:*-even-in-deps were required, clack itself would be
  disqualified — assuming that's not the intent.
- Bun CLI best practices (oneuptime guide, Case-for-Bun 2026): bun is strongest exactly at
  CLIs/standalone executables; `bun tsc --noEmit` in CI (bun strips types, doesn't check);
  bunfig.toml minimal; single package.json, src/ layout, `bun test` for tests.

## 7. Zod 4 for config evolvability (Peter's ask)

- Zod 4 stable; implements Standard Schema ⇒ plugs DIRECTLY into clack `validate` (§3).
- Pattern for envsetup: every item's config = a Zod schema (types + clamps/ranges + defaults
  via .default() + .catch() for salvage); manifest = z.object versioned with a `manifestVersion`
  discriminator; on load: parse → on failure attempt older-version schemas → migrate forward
  (small pure functions oldN→N+1). This is the standard community pattern for evolving config
  files; keeps "configs change over time" cheap: add a field with .default(), bump version,
  write one migration.
- Zod 4 syntax note for AI-assisted editing: z.email() etc. top-level, not z.string().email().

## 8. Implications for envsetup architecture

- UI stack: @clack/prompts + @clack/core (custom unified selection prompt + horizontal radio) —
  validated end-to-end compiled.
- Command routing: citty (bootstrap default command; doctor/sync subcommands; --resume flag).
- Validation/config: Zod 4 schemas per item; schemas double as clack validators; versioned
  manifest w/ migrations.
- Long ops: taskLog for brew/subprocess streaming; progress for CLT/downloads; tasks() with
  enabled flags driven by manifest selection.
- Non-TTY/accessible fallback path required (CI, resume-after-crash edge, screen readers).
- Testing: expect-driven PTY harness (pattern established in spike).

## 9. Secrets management (researched 2026-08-26, second pass at Peter's insistence — verdict CHANGED)

Community consensus (GitGuardian, withblue.ink, git-secret HN discussions, chezmoi docs):

- Plaintext secrets in git — EVEN PRIVATE REPOS — is explicitly discouraged: secrets persist in
  history forever, repos sprawl via clones/forks/backups, and third-party services granted repo
  access can read them. My earlier option-A lean contradicted this; corrected.
- The documented best-practice pattern for EXACTLY our use case (bootstrap tool, new machines,
  no password-manager CLI) is chezmoi's age flow: age-ENCRYPTED secrets committed to the repo;
  on a new machine the user enters ONE passphrase, the decrypted key is cached locally
  (~/.config/...) so later runs (doctor/sync) never re-prompt.
- Mapping to envsetup: secrets.json.age committed (public repo OK); Stage A asks one passphrase
  (stored in his Google PM); decrypt in-memory; API key lands in macOS Keychain via `security`;
  license keys applied to apps; decrypted age key cached for doctor/sync parity with chezmoi.
- age primitives: implement via age-encryption npm pkg (research at build: bun compat) or
  scrypt+AES via Bun's crypto if a dep is undesirable — decision at build time.

## 10. Zod config evolvability (validating §7 with community patterns)

- verzod (AndrewBastin/verzod): a small library doing EXACTLY the §7 pattern — entities with
  multiple Zod-schema versions + is-latest check + migrate-to-latest. Candidate dep, or
  hand-roll the same discriminated-union + migration-function pattern (community-documented:
  zod issue #3604, studyraid schema-versioning guide, Bytecraft schema-evolution writeup).
- Confirms: manifest carries a version discriminator; each item's config schema versioned;
  migrations are pure functions oldN→N+1 chained to latest; .default() for additive fields.

## 11. Architecture packages (researched 2026-08-26, Peter's push)

- **age implementation: `age-encryption` (npm) — typage, the OFFICIAL TypeScript age
  implementation by Filippo Sottile (age's own author)**. Explicitly compatible with Bun
  (ES2023, noble-crypto based, Web Crypto). Settles §9's build question — no hand-rolled crypto.
- **XDG paths: `env-paths` (sindresorhus)** — community-standard package for config/state/cache
  paths; lirantal/nodejs-cli-apps-best-practices (the canonical CLI best-practice list)
  explicitly prescribes XDG Base Directory compliance + persisted user settings + non-interactive
  fallbacks (flags/env when no TTY — matches §4).
- Manifest storage/migrations: considered sindresorhus `conf` (persistence + built-in
  migrations) — REJECTED with reason: it validates via ajv/JSON-Schema, which would split us
  into two schema systems; we already get validation + migrations from Zod 4 + the
  verzod-style versioned-schema pattern (§10). One schema system, Zod, everywhere.
- Journal: append-only JSONL needs no package (standard pattern; Bun.file append).
- Dependency ordering: plain topological sort — `toposort` npm pkg or ~30 inline lines;
  decide at build (bias: inline, zero-dep).

## 12. Mechanics design-risk research (2026-08-26)

- Chrome Preferences are HMAC-PROTECTED (protection.macs + super_mac, machine-seeded) — naive
  JSON edits to tracked prefs get reset by Chrome. Legit routes: enterprise managed-preferences
  policies on macOS: `ExtensionSettings` with toolbar_pin:"force_pinned" (pins the Claude
  extension), and flags live in Local State (NOT MAC-protected — safe to write
  browser.enabled_labs_experiments directly). toolbar.pinned_actions protection status unknown
  → EMPIRICAL TEST at build (edit on Chrome Beta profile, restart, observe). Fallbacks if
  protected: managed policy equivalent or documented one-time manual arrangement.
- PWA scripted install: NO CLI flag exists. Supported mechanism = `WebAppInstallForceList`
  managed policy (URL list, supports custom_name — matches "Mail"/"Notes" renaming need,
  possibly obviating bundle renames). Verify at build that force-installed PWAs create
  ~/Applications app bundles Dock-addressable by dockutil.
- Apple Shortcuts: `shortcuts` CLI (built-in) can RUN and SIGN shortcuts (plist XML →
  .shortcut), but IMPORT is GUI-only (double-click → "Add Shortcut" dialog; one click per
  shortcut). Fully-silent alternative: Automator .workflow bundles dropped into
  ~/Library/Services — appear in the SAME right-click Quick Actions menu, zero clicks.
  Decision Peter: 3 add-clicks in Shortcuts app vs silent Automator Services.
- Deferred to build time (pure mechanics, no design risk): dockutil usage, default-browser
  helper, statusline bash→bun conversion, Typora/CleanShot/superwhisper license activation
  mechanisms, podman machine init flags, Raycast deeplinks, fnm/uv/bun PATH lines.
