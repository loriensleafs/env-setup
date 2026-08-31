# src/ui — prompts, with stock-clack fidelity (ADR-003)

A custom prompt extends the `@clack/core` prompt it resembles and reuses clack's exported symbols
and footers; labels render white only when focused. Consult `~/Dev/clack/examples/docs` before any
UI work.

- Every prompt takes `input: promptInput()` from `terminal.ts`; a custom prompt accepts and forwards
  an `input` option (ADR-014) — under `curl | sh` nothing else receives keystrokes.
- Frames are state-aware: only the active prompt draws `└`, so fields flow inside one `p.group`
  (v0.1.9 fixed re-boxed answered fields).
- `config-screens.ts` derives prompts from `z.toJSONSchema` — boolean → radio, bounded number →
  validated text, enum ≤ 4 → radio, string → text — so a schema field grows the screen with no UI
  code. PLAN-001 changes this file next.
- Verify under a PTY with a strong oracle — submit → the next prompt appears (kernel echo lies,
  ANA-008): `expect src/ui/.claude/skills/run-src-ui/demo-walk.exp`; match `◆[^\r\n]*<message>`
  because the symbol is colour-wrapped.
- The 0-width-PTY guard lives in `src/index.ts`, not here.
