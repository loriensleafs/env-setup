# src — the CLI (ADR-005 flow, ADR-007 architecture)

Entry `index.ts` routes to `commands/`; every subsystem here is driven, never run for real — its
`<dir>/.claude/skills/run-*/driver.ts` invokes the safe functions, and
`bun src/.claude/skills/run-src/driver.ts` covers the entry itself (`--help`, `--version`,
read-only `doctor`).

## Entry (`index.ts`)

- The columns/rows pin stays ahead of anything that renders: a PTY reporting 0 columns sends
  clack's erase-lines to infinity (~16 GB OOM) — ANA-008.
- `closePromptInput()` stays after `runMain`: a command that opened `/dev/tty` otherwise hangs at
  exit.
- citty runs the root `run()` even when a subcommand matched — the `rawArgs` guard routes bare
  `envsetup` vs a subcommand; keep it when adding subcommands.

## Subsystems without their own CLAUDE.md (file headers carry the rest)

- `auth/` — the client id is public by design (ADR-009). Real `auth` opens a browser flow and
  writes the Keychain: exercise the flow through the driver's mocked `fetch`. envsetup's token is
  validated with `GET /user`; `gh auth status` reports a different token.
- `ceremonies/` — a new Ceremony adds a handler to `HANDLERS` **and** declares the id on every
  item that needs it (the driver asserts every declared id has a handler). TCC grants cannot be
  pre-granted (ANA-005): a handler deep-links the exact pane and verifies.
- `journal/` — append-only JSONL; the reader drops a torn last line. `failedSteps` feed the
  picker's "failed last run — retry", so event shapes are bootstrap behaviour. Tests and drivers
  append only under a temp dir.
- `manifest/` — a future-version manifest is refused (`ManifestVersionError`), never migrated
  down. An item already Applied but not Picked is still recorded as Wanted (`selected: true`; the
  manifest defines the machine, ADR-006). `identity.email` starts as `EMAIL_PENDING`; `git-email`
  writes it back.
- `secrets/` — the decrypted cache `~/.config/envsetup/secrets.json` is the working store by
  design (ADR-008). A new secret enters with `envsetup secrets set`; `SECRET_KEYS` is code. Drivers
  use `ENVSETUP_SECRETS_FILE` with fake values.
- `exec/` — `Runner` is injected through `ItemContext.run`; pass a mock in tests. `cwd: "/tmp"`
  resolves to `/private/tmp` on macOS.
- `paths/` — XDG dirs by choice (the dev-CLI norm, not `env-paths`); tests override `XDG_*`.
- `commands/`, `items/`, `orchestrator/`, `ui/` — each has its own CLAUDE.md.
