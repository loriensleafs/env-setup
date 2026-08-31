# Archive — retired documents, read-only

Documents that were the source of truth once and were replaced by the docs system
([ADR-017](../decisions/ADR-017-docs-system.md)). Kept verbatim for history: every decision,
requirement and finding they contain has been carried into `decisions/`, `plan/`, `analysis/` or
`sessions/`.

## Index

| Doc | Was | Replaced by |
| --- | --- | --- |
| [ARC-001-living-plan.md](ARC-001-living-plan.md) | The single "living plan" (2026-08-25 → 2026-08-30): decisions, build log, UI iteration history, research notes, status | `decisions/` (ADR-001…017), `plan/PRD-001-envsetup.md`, `analysis/`, `sessions/SES-001…003` |

`CONFIG-COMPAT-PLAN.md` (2026-08-27) was absorbed entirely — model → ADR-010, research appendix →
`analysis/ANA-007-config-compatibility.md` — and is not archived.

## Rules

- **Never edit** an archived document (a banner at its top says so); only its relative links were
  repointed when it moved.
- **Never cite it as current.** Something here that the live docs lack moves to the right live
  directory with a session citation, and the archived copy stays as it is.
- Retiring a document: move it here as `ARC-NNN-<kebab>.md` with a retired banner, add the index
  row saying where its content went.
