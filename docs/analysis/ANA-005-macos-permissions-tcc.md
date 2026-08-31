# macOS permissions (TCC) — analysis

> **Analysis** · 2026-08-26 · status: current

## Question

Can envsetup pre-grant the permissions its items need — Accessibility (superwhisper, Ghostty
global keybinds, the Chrome web-app AX runner, Finder automation), Screen Recording (CleanShot),
Microphone (superwhisper, Zoom), Full Disk Access — so the user never sees a first-run dialog?

## Sources

Apple TCC behaviour on personal (non-MDM) Macs; `tccutil` man page; MDM PPPC profile
documentation (which permissions a profile can grant); community reports; the deep-link URL
scheme for System Settings privacy panes.

## Findings

1. TCC is SIP-protected: on a personal Mac there is **no programmatic grant**. `tccutil` only
   *resets*. Even MDM PPPC profiles cannot auto-grant Screen Recording, Microphone or Camera
   (they can pre-approve Accessibility/FDA for managed devices only).
2. Best achievable — what the connect phase does: batch the grants into **one guided pass**,
   deep-linking the exact System Settings pane per grant (superwhisper mic + accessibility,
   CleanShot screen recording, an Accessibility grant for envsetup's own Chrome/Finder automation)
   instead of scattered first-run surprises, and verify each with the tool where possible.
3. `terminal-notifier` needs a first-run Notification permission (a TCC prompt that cannot be
   pre-granted); the Claude notify hook falls back to a plain `osascript` banner until then.
4. Ghostty global keybinds need an Accessibility grant that can go stale after app updates
   (ghostty #7183).

## Refuted

- "A privileged helper or `sudo` can write the TCC database" — SIP-protected; not viable and not
  attempted.

## Unverifiable

- Nothing further; the constraint is documented platform behaviour.

## Implications

- Ceremonies are **by design, not stubs** (CLAUDE.md). Attended steps cluster at the end of the
  dependency graph — the three-stage workflow
  ([ADR-005](../decisions/ADR-005-three-stage-workflow.md)).
