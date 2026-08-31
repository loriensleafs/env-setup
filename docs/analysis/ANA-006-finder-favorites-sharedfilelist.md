# Finder sidebar favorites on macOS 26 — analysis

> **Analysis** · 2026-08-26 · status: current

## Question

`mysides` is Apple-disabled (Oct 2025, brew formula disabled), `sfltool add-item` is gone on
macOS 26, and our first Swift `LSSharedFileList` helper segfaulted. Is setting Finder favorites
still possible?

## Sources

7onnie/mysides (maintained mysides-swift) source; `LSSharedFileListInsertItemURL` signature;
`sharedfilelistd` behaviour; empirical runs on Peter's machine (verified live: decided order, no
crash).

## Findings

1. The API works. The crash was **our binding**: `LSSharedFileListInsertItemURL`'s position
   parameter is a **sentinel integer** (`kLSSharedFileListItemLast = 0x2`), not a CF object;
   passing it as `CFTypeRef` makes Swift call `swift_unknownObjectRetain(0x2)` → segfault.
2. Fix: `dlopen`/`dlsym` CoreServices, type the insert function's position parameter as
   `OpaquePointer?`, append each item with the Last sentinel (order preserved).
3. State lives in `sharedfilelistd` (XPC) → no Full Disk Access needed. Format is `.sfl4`.
4. The helper must be **compiled** (`swiftc`) and run; the `swift <file>` interpreter segfaults
   even when the code is correct. Hence `finder-favorites` depends on `xcode-clt`.
5. The decided order: Applications · Home · Desktop · Documents · Downloads · Dev · .claude.
   `detect()` lists current items via `LSSharedFileListItemCopyResolvedURL` (`--list` mode).

## Refuted

- "LSSharedFileList is dead on macOS 26" — declared prematurely after one failed attempt; Peter
  pushed for real research. Lesson (OVERVIEW hard rules): never declare an approach impossible
  from one failure — research first.

## Unverifiable

- How long the deprecated-but-working API survives.

## Implications

- Item `finder-favorites` with embedded Swift source; deprecated API accepted knowingly.
