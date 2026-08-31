# src/items/finder — sidebar favorites via LSSharedFileList (ANA-006)

- `assets/set-favorites.swift` is currently **stale** against the embedded `SET_FAVORITES_SWIFT`
  (the constant has the `--list` mode; runtime ships the constant) — edit the constant and re-sync
  the file (OVERVIEW Next-up 5). The driver typechecks both.
- Compile with `swiftc` and run the binary; the `swift <file>` interpreter segfaults even on
  correct code.
- The insert position parameter is an `OpaquePointer?` sentinel (`kLSSharedFileListItemLast =
  0x2`), never a `CFTypeRef` — that mis-typing was the crash once mis-called "API dead".
- `configure()` rewrites the sidebar and `detect()` compiles the helper into `~/.config/envsetup`;
  the driver (`bun src/items/finder/.claude/skills/run-src-items-finder/driver.ts`) runs the pure
  helpers and the typecheck only.
