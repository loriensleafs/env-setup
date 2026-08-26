#!/usr/bin/env bun
/**
 * ~/.claude/hooks/notify.ts
 *
 * Claude Code Notification hook -> clickable macOS notification that jumps
 * back to the Ghostty window/tab that is waiting on you.
 *
 * Focus strategy: Claude Code hands us the session's `cwd` in the hook payload.
 * Ghostty 1.3+ exposes `working directory` on every terminal via AppleScript,
 * so we match on that rather than parsing window titles. Falls back to System
 * Events window raising, then to plain app activation.
 *
 * Install:
 *   mkdir -p ~/.claude/hooks
 *   cp notify.ts ~/.claude/hooks/notify.ts
 *   chmod +x ~/.claude/hooks/notify.ts
 *   brew install terminal-notifier
 *
 * Permissions (granted on first run):
 *   System Settings > Notifications      > terminal-notifier > Allow
 *   System Settings > Privacy & Security > Accessibility     > terminal-notifier
 *   System Settings > Privacy & Security > Automation        > allow Ghostty control
 */

const SELF = `${process.env.HOME}/.claude/hooks/notify.ts`;

/** Claude Code's Notification hook payload (only the fields we use). */
type HookPayload = {
  message?: string;
  cwd?: string;
};

/** Run an AppleScript by piping it to osascript on stdin (no -e quoting games). */
async function osascript(script: string): Promise<void> {
  try {
    const proc = Bun.spawn(["/usr/bin/osascript"], {
      stdin: new TextEncoder().encode(script),
      stdout: "ignore",
      stderr: "ignore",
    });
    await proc.exited;
  } catch {
    // osascript missing, or Automation/Accessibility permission refused.
    // A notification hook must never fail loudly - degrade silently.
  }
}

/** Escape a string for embedding inside an AppleScript string literal. */
const asLiteral = (s: string): string =>
  s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

/** Escape a string for embedding inside a single-quoted POSIX shell word. */
const shQuote = (s: string): string => `'${s.replace(/'/g, `'\\''`)}'`;

// ---------------------------------------------------------------------------
// --focus <cwd> <project>  : invoked when you CLICK the notification.
// ---------------------------------------------------------------------------
async function focus(targetCwd: string, project: string): Promise<void> {
  await osascript(`
tell application "Ghostty" to activate
delay 0.15

-- Preferred: Ghostty's native AppleScript, matched on working directory.
try
  tell application "Ghostty"
    set hits to (every terminal whose working directory is "${asLiteral(targetCwd)}")
    if (count of hits) is 0 then
      set hits to (every terminal whose working directory contains "${asLiteral(targetCwd)}")
    end if
    if (count of hits) is 0 then
      set hits to (every terminal whose name contains "${asLiteral(project)}")
    end if
    if (count of hits) > 0 then
      set t to item 1 of hits
      -- Official Ghostty command: focuses the terminal AND raises its window.
      focus t
      return
    end if
  end tell
end try

-- Fallback: raise whichever Ghostty window has the project in its title.
try
  tell application "System Events"
    tell process "Ghostty"
      set frontmost to true
      repeat with w in windows
        if name of w contains "${asLiteral(project)}" then
          perform action "AXRaise" of w
          return
        end if
      end repeat
    end tell
  end tell
end try
-- Last resort: Ghostty is at least focused from the activate above.
`);
}

// ---------------------------------------------------------------------------
// Normal invocation: Claude Code pipes the hook payload in on stdin.
// ---------------------------------------------------------------------------
async function notify(kind: "attention" | "done" = "attention"): Promise<void> {
  let payload: HookPayload = {};
  try {
    const raw = await Bun.stdin.text();
    if (raw.trim()) payload = JSON.parse(raw) as HookPayload;
  } catch {
    // Malformed or absent payload: fall through to defaults.
  }

  const cwd = payload.cwd?.trim() || process.cwd();
  const project = cwd.split("/").filter(Boolean).pop() ?? cwd;

  // Different sound per event so you can tell them apart without looking:
  // Ping = "needs you", Glass = "finished".
  const done = kind === "done";
  const message =
    payload.message?.trim() ||
    (done ? "Finished — waiting for your next prompt" : "Claude needs your attention");
  const title = `Claude Code ${done ? "✓" : "—"} ${project}`;
  const sound = done ? "Glass" : "Ping";

  const notifier = Bun.which("terminal-notifier");

  if (notifier) {
    const onClick = `${shQuote(process.execPath)} ${shQuote(SELF)} --focus ${shQuote(cwd)} ${shQuote(project)}`;
    try {
      const proc = Bun.spawn(
        [
          notifier,
          "-title", title,
          "-message", message,
          "-sound", sound,
          "-group", `claude-${cwd}`,
          "-execute", onClick,
        ],
        { stdout: "ignore", stderr: "ignore" },
      );
      await proc.exited;
      return;
    } catch {
      // Fall through to the osascript banner below.
    }
  }

  // No click-to-focus without terminal-notifier, but you still get a banner.
  await osascript(
    `display notification "${asLiteral(message)}" with title "${asLiteral(title)}" sound name "${sound}"`,
  );
}

// ---------------------------------------------------------------------------
const [flag, argCwd, argProject] = Bun.argv.slice(2);

try {
  if (flag === "--focus") {
    await focus(argCwd ?? "", argProject ?? "");
  } else if (flag === "--stop") {
    await notify("done");
  } else {
    await notify();
  }
} catch {
  // Never surface a hook failure into the Claude Code session.
}
process.exit(0);
