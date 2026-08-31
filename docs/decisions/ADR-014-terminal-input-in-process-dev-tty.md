# ADR-014: Prompt input comes from `/dev/tty` opened in-process and passed explicitly to every prompt

## Status

Accepted

## Date

2026-08-27 (v0.1.3; [analysis](../analysis/ANA-008-terminal-input-under-curl-sh.md))

## Context

Under `curl … | sh` stdin is the exhausted pipe. Bun reads nothing from a shell-redirected
`/dev/tty` and nothing from a defineProperty-replaced `process.stdin`; a false-positive test shipped
a broken release in between. Separately, 0-width PTYs made clack's erase-lines loop OOM.

## Decision

`src/ui/terminal.ts`: `promptInput()` returns `process.stdin` when it is a TTY, else lazily opens
`new tty.ReadStream(openSync("/dev/tty", "r+"))` (paused). **Every** prompt — clack built-ins,
`p.group` members, and our `@clack/core` custom prompts — receives `input: promptInput()`;
`interactiveCapable()` gates interactive commands; `closePromptInput()` destroys the stream after
`runMain` so the process can exit. `install.sh` does a plain `exec` (no redirect). `src/index.ts`
pins `columns`/`rows` from `stty size </dev/tty` (else 80×24) when a TTY reports 0 width.

## Alternatives considered

### `exec … </dev/tty` in `install.sh` (v0.1.1) · replace `process.stdin` (v0.1.2)

- Both empirically dead; see the analysis.

### Tell users to download and run the binary

- Rejected: breaks the one-command promise and quarantines the binary (ADR-002).

## Consequences

- Any new prompt or custom prompt **must** thread `input` (CONTRIBUTING).
- Interactive verification uses a strong oracle (submit → next prompt appears).
