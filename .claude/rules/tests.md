---
paths:
  - "**/__tests__/**"
---

# Tests (`bun:test`, sibling `__tests__/`, `<name>.test.ts`)

Filesystem-touching modules test against a temp dir through the same override the code honours
(`XDG_CONFIG_HOME` / `XDG_STATE_HOME` for manifest, journal and paths; `ENVSETUP_SECRETS_FILE` for
secrets); items receive a mock `Runner` through `ItemContext.run`. `bun test <path>` filters by
path substring (`bun test src/items` runs every items subdirectory too). Run the changed file with
`bun test <file>`; the gate is `bun test` + `bun run check`.
