---
description: "Alias for `/session close` — the session's Goal is done: write its Outcome, run `bun run session close`, update the plan it served, post the closing note. Typed only; never invoked by Claude on its own."
disable-model-invocation: true
---

Invoke the project skill `session` in `close` mode now — exactly what typing `/session close`
does: call the Skill tool with `skill: session`, `args: close`. Ignore any text typed after the
command. The skill carries the whole procedure and its completion criterion; run it rather than
reproducing its steps here.
