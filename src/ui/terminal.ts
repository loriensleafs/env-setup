import { openSync } from "node:fs";
import tty from "node:tty";

/**
 * The input stream every interactive prompt must use.
 *
 * Under `curl … | sh`, stdin is the exhausted script pipe. Two non-fixes,
 * both empirically dead under Bun (2026-08-27): a shell-level `</dev/tty`
 * redirect (input never arrives), and replacing `process.stdin` via
 * defineProperty (clack's readline still ends up on the original pipe —
 * prompts freeze and spin). What DOES work is opening /dev/tty ourselves and
 * passing the stream EXPLICITLY as each prompt's `input` — so every prompt
 * call site threads `input: promptInput()`.
 */
let stream: tty.ReadStream | undefined;
let attempted = false;

export function promptInput(): NodeJS.ReadStream {
  if (process.stdin.isTTY) return process.stdin;
  if (!attempted) {
    attempted = true;
    try {
      stream = new tty.ReadStream(openSync("/dev/tty", "r+"));
      stream.pause();
    } catch {
      // truly headless — callers gate on interactiveCapable()
    }
  }
  return (stream ?? process.stdin) as NodeJS.ReadStream;
}

/** True when prompts can actually read a keyboard. */
export function interactiveCapable(): boolean {
  return promptInput().isTTY === true;
}

/** Release the self-opened terminal so the event loop can drain at exit. */
export function closePromptInput(): void {
  stream?.destroy();
  stream = undefined;
}
