---
name: run-src-ui
description: Run, drive and smoke-test src/ui — the custom clack prompts (group multiselect with requires-cascade, horizontal radio, schema-driven config screens) and terminal input handling. Use when asked to run, test, screenshot or drive the UI or the UI demo.
---

`src/ui/`: `group-multi-select.ts` (picker + pure cascade logic), `radio-group.ts`,
`config-screens.ts` (Zod schema → prompts), `terminal.ts` (`promptInput()` — the `/dev/tty`
input every prompt must receive), `demo.ts` (interactive demo of the picker + radio). Two
drivers, both in `src/ui/.claude/skills/run-src-ui/`: `driver.ts` exercises the **pure**
logic; `demo-walk.exp` drives the **real interactive demo** under a PTY (`expect`; tmux is not
installed) and records a transcript — the closest thing to a screenshot for a TUI.

All paths are relative to the repo root; every shell needs `export PATH="$HOME/.bun/bin:$PATH"`.

## Run (agent path) — pure logic

```bash
bun src/ui/.claude/skills/run-src-ui/driver.ts
```

Expected:

```text
  ✓ flatten lists every option
  ✓ initialSelection: default-selected except initialSelected:false
  ✓ nothing disabled while deps are selected
  ✓ unselecting brew cascades: ghostty AND ghostty-config disabled — reasons: ghostty→needs Homebrew; ghostty-config→needs Ghostty
  ✓ selectionResult drops disabled items — (empty)
  ✓ cycle wraps both ways
  ✓ humanize('pushToTalk') → 'Push to talk' — Push to talk

PASS
```

## Run (agent path) — the interactive demo under a PTY

```bash
expect src/ui/.claude/skills/run-src-ui/demo-walk.exp /tmp/envsetup-ui-demo-walk.txt
# … [demo] OK — picker submitted, radio moved left + submitted, outro reached   (exit 0)
python3 -c "import re;t=open('/tmp/envsetup-ui-demo-walk.txt',encoding='utf-8',errors='replace').read();print(re.sub(r'\x1b\[[0-9;?]*[A-Za-z]','',t)[-900:])"
```

The stripped tail shows the submitted picker (`◇  What should this machine get?` + the
selection), `●  selected: …`, the radio moving to `(●) medium`, `●  effort: medium`, and
`└  demo complete`. Keys the demo accepts: `↑/↓` move, `Space` toggle, `Enter` confirm; radio
`←/→` then `Enter`. Edit `demo-walk.exp` to send other keys (`send "\033\[B"` = Down,
`send " "` = Space).

## Test

```bash
bun test src/ui/__tests__          # 11 pass, 0 fail (config-screens, group-multi-select, radio-group)
```

## Gotchas

- **Match prompts with `◆[^\r\n]*<message>`**, not `◆ +<message>`: the vendored clack emits
  colour codes between the symbol and the text, so a plain-space pattern never matches (the
  first version of the walk timed out on "picker never appeared").
- Every prompt must be given `input: promptInput()` (see `terminal.ts`) or it will hang under
  `curl | sh`; the demo relies on stdin being a TTY, which `expect` provides.
- The transcript is raw ANSI; strip it before reading (one-liner above).
