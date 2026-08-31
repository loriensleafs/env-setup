---
paths:
  - "**/.claude/skills/**"
---

# Run-skill drivers and SKILL.md files

A driver invokes only what cannot change this machine: `detect()`, pure functions, mocked runners,
temp dirs and fixtures under the scratchpad — `install()`/`configure()`/`verify()`, the real
manifest or journal paths, the network and real prompt runs stay out. Drivers run under `bun` and
are Biome-checked but not typechecked (`tsconfig.json` includes only `src`), so run the driver
after editing it. Every code block in a SKILL.md is a command that was run and worked; when the
output changes, the block changes with it.
