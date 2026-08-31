# src/items/finder — sidebar favorites via LSSharedFileList (ANA-006)

`configure()` rewrites the Finder sidebar and even `detect()` compiles the helper into
`~/.config/envsetup`. Drive with `bun src/items/finder/.claude/skills/run-src-items-finder/driver.ts`
— the pure helpers plus a typecheck of the Swift file and of the embedded constant, nothing run.

- Compile with `swiftc` and run the binary; the `swift <file>` interpreter segfaults even on
  correct code.
- The insert position parameter is an `OpaquePointer?` sentinel (`kLSSharedFileListItemLast =
  0x2`), never a `CFTypeRef` — that mis-typing was the crash once mis-called "API dead".
- `assets/set-favorites.swift` is currently **stale** against the embedded `SET_FAVORITES_SWIFT`
  (the constant has the `--list` mode; runtime ships the constant) — edit the constant and re-sync
  the file (OVERVIEW Next-up 5).
