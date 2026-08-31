# Terminal input under `curl … | sh` — analysis

> **Analysis** · 2026-08-27 · status: current · shipped in v0.1.3 (`6529cdc`); decision [ADR-014](../decisions/ADR-014-terminal-input-in-process-dev-tty.md)

## Question

The one-liner `curl -fsSL …/install.sh | sh` exited instantly at the first prompt (v0.1.0), then
froze with a dead Ctrl-C and 15.7 GB RSS after the first fix (v0.1.1). What can a Bun process
actually read interactive input from when its stdin is the pipe, and why did the process explode?

## Sources

- Empirical spikes on Peter's machine and under an `expect` PTY harness, 2026-08-27, with both
  `bun run` and the `bun build --compile` binary; three variants of shell redirection.
- clack `erase.lines` (vendored `@clack/prompts`) — the loop that consumed memory.
- `src/ui/terminal.ts` — the shipped implementation.

## Findings

1. Under `curl | sh`, the process's stdin is the **exhausted curl pipe**: the first clack prompt
   reads EOF and cancels; a stdout-only TTY guard does not catch it (observed v0.1.0).
2. `exec "$DEST" "$@" </dev/tty` (and `0<>/dev/tty`) in `install.sh` opens the terminal for the
   process, but **Bun delivers no input from a shell-redirected `/dev/tty`** — prompts render and
   never receive keystrokes; the same with `bun run` and the compiled binary (v0.1.1 spike).
3. Replacing `process.stdin` via `Object.defineProperty` with a `tty.ReadStream` opened on
   `/dev/tty` **also delivers nothing**: clack's readline still lands on the original pipe (v0.1.2).
4. **The only working path**: open `/dev/tty` in-process (`new tty.ReadStream(openSync("/dev/tty",
   "r+"))`, paused) and pass it explicitly as the `input` option of *every* prompt — clack's
   built-ins and our `@clack/core` custom prompts alike (`promptInput()` threaded everywhere).
   Verified with a strong oracle: three chained prompts, each submit producing the next prompt.
5. The 15.7 GB freeze was a second, independent bug: some PTYs report a TTY with **0 columns**;
   clack's erase-lines arithmetic then loops to infinity and the process dies with
   `RangeError: Out of memory` (reproduced). Guard: if `process.stdout.isTTY && !columns`, ask
   `stty size </dev/tty`, else pin 80×24 (`src/index.ts`).
6. The self-opened tty must be destroyed after `runMain` or the event loop never drains and the
   process hangs at exit (`closePromptInput()`).

## Refuted

- "Kernel echo of typed characters proves the prompt is receiving input" — false; echo is the
  terminal driver, not the process. This false positive shipped a broken v0.1.2 (Peter: "still not
  working… what's going on???"). Interactive tests need a **strong oracle**: submit → next prompt
  appears.

## Unverifiable

- Whether Bun will ever honour a shell-redirected `/dev/tty` on stdin (upstream behaviour, not
  tracked).

## Implications

- [ADR-014](../decisions/ADR-014-terminal-input-in-process-dev-tty.md): every prompt takes
  `input: promptInput()`; `install.sh` does a plain `exec`.
- Known, unrelated: compiled binaries idle at ~160 % CPU at any clack prompt (bun-run 0 %) —
  bun-compile quirk, unfixed, tracked in OVERVIEW "Next up".
