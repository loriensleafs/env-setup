# How the reference skills keep CONTEXT.md current — analysis

> **Analysis** · 2026-08-30 · status: current · session SES-006 · informs `CONTEXT.md` upkeep and the
> `/session entry` step that routes new terms to it.

## Question

Peter, after four session-log terms (gate, join/leave/close, handoff) turned up in the docs with no
glossary entry and "ledger" had crept back: "Why didn't those things get automatically added to
CONTEXT.md? How does that work?" and "do a complete and comprehensive analysis of
`~/Dev/reference/matt-pocock-skills` to check how it handles updating CONTEXT.md — is it part of the
install stack, or are there other parts that hook into this?"

## Sources

`/Users/peterkloss/Dev/reference/matt-pocock-skills` at `6654f6b` (2026-08-30), read in full where
cited; a mechanical grep over the whole tree for `CONTEXT.md`, `CONTEXT-MAP`, `domain-modeling`,
`glossary`; and an Explore agent's file-by-file pass over every skill, `.agents/`, `docs/`,
`scripts/`, `.github/`, `.changeset/` and `.claude-plugin/`. Line numbers are that commit's.

## Findings

### A. No automation exists

1. The repo has **no `.claude/` directory** at all — no `settings.json`, no hooks. `package.json`
   has three scripts (`changeset`, `version`, `check-plugin-version`); `scripts/` holds
   `link-skills.sh`, `list-skills.sh`, `sync-plugin-version.mjs`; the only workflow is
   `.github/workflows/release.yml` (changesets). None reads, writes or checks `CONTEXT.md`.
2. Every `agents/` directory (30+, including `domain-modeling/agents/`) holds a three-line
   `openai.yaml` of harness metadata (`display_name`, `short_description`) — not a subagent.
3. The two `misc` skills that install git hooks into a *user's* repo (`setup-pre-commit`,
   `git-guardrails-claude-code`) do not mention `CONTEXT.md`.

### B. The install stack does hook in — as a reading rule, and deliberately not as scaffolding

1. `setup-matt-pocock-skills` writes `docs/agents/domain.md` into the target repo and appends a
   `### Domain docs` line to the repo's `CLAUDE.md`/`AGENTS.md` `## Agent skills` block
   (`skills/engineering/setup-matt-pocock-skills/SKILL.md` L59–61, L86–100, L110). The emitted
   CLAUDE.md line names neither `CONTEXT.md` nor `domain-modeling`; it points at `domain.md`.
2. The `domain.md` template (`setup-matt-pocock-skills/domain.md`) is a **consumer** rule: "Before
   exploring, read these — `CONTEXT.md` … `docs/adr/`" (L5–9); "use the term as defined in
   `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids" (L43); "If the concept you
   need isn't in the glossary yet, that's a signal: … note it for `/domain-modeling`" (L45). And
   it is explicitly anti-scaffolding (L11): "If any of these files don't exist, **proceed
   silently**. Don't flag their absence; don't suggest creating them upfront. The
   `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`)
   creates them lazily when terms or decisions actually get resolved."
3. The layout it assumes is `CONTEXT.md` + `docs/adr/` (L14–18); envsetup keeps ADRs in
   `docs/decisions/` (ADR-017).

### C. The write discipline lives in one skill, reached by delegation

1. `domain-modeling/SKILL.md` is the only owner of the write: "When a term is resolved, update
   `CONTEXT.md` right there. Don't batch these up" (L60–62); "create one when the first term is
   resolved" (L40); "call it out immediately" on a conflicting term (L46); "a glossary and nothing
   else" (L64). Its description triggers on "discussing codebase terminology, writing or editing a
   CONTEXT.md, or recording or editing an ADR" (L3; `.changeset/domain-modeling-trigger-context-adr.md`).
2. Skills that carry the write instruction in their own text: `improve-codebase-architecture`
   (L66–69: "call the Skill tool with 'domain-modeling' to keep the domain model current as you go
   … Add the term to `CONTEXT.md` … Update `CONTEXT.md` right there") and `triage` (L76:
   "sharpening domain terms and updating `CONTEXT.md`/ADRs inline as decisions land").
3. Skills that delegate without naming the file: `grill-with-docs` (its whole body is L7, "Call
   the Skill tool twice, for 'grilling' and 'domain-modeling'"; frontmatter L3 "also creates docs
   (ADR's and glossary) as we go") and `wayfinder` (L79, L111, L124, the same two-call line).
4. Read-only consumers: `tdd` (L10), `diagnosing-bugs` (L10), `wait-what` (L7),
    `codebase-design/DESIGN-IT-TWICE.md` (L30), `to-spec` (L13) and `to-tickets` (L21, "use the
    project's domain glossary vocabulary"). `research` and `teach` do not touch it;
    `docs/engineering/research.md` L17 routes glossary work to `grill-with-docs`.
5. `.agents/invocation.md` L24–26 is the repo's own authoring rule: "Merely *reading*
    `CONTEXT.md` for vocabulary is a one-line prose pointer, not the `domain-modeling` skill. Only
    the active build/sharpen discipline … is `domain-modeling`."

### D. The reference's own record of how well the discipline works

 1. `docs/engineering/domain-modeling.md` L9: "automatic invocation is the weakest part of the
    skill: when `grill-with-docs` or `wayfinder` say to load it, models frequently load `grilling`
    and skip this one. If a grilling session runs and `CONTEXT.md` is untouched at the end, that
    is what happened; invoke it by name." L44: "models treat 'write to `CONTEXT.md`' as permission
    to persist every answer … This is the most-reported problem with the skill." L55: the fix is a
    typed prompt (`/grill-with-docs make my CONTEXT.md more concise…`). L78/L82, the success
    tests: "`CONTEXT.md` changes **during** the conversation, not in a burst at the end" and "gets
    shorter as often as it gets longer".
 2. The repo's own `CONTEXT.md` has five commits in four months: one genuine term resolution
    (`7d694b7`, "Decision ticket", recorded so the `avoid: ticket` rule stopped contradicting
    `wayfinder`), one rename sweep (`386d4ff`), one creation (`179a14e`), two cosmetic. Its shape
    adds two sections `CONTEXT-FORMAT.md` does not list: `## Relationships` and
    `## Flagged ambiguities` (resolved word conflicts — "backlog … no longer used as a domain term").
 3. `CONTEXT-FORMAT.md` L27–30: "Only include terms specific to this project's context. General
    programming concepts don't belong even if the project uses them extensively."

### E. envsetup's position against all that

 1. Neither `docs/agents/` nor an `## Agent skills` block exists here; `setup-matt-pocock-skills`
    and `ask-matt` are not installed under `~/.claude/skills` (the other reference skills are, as
    copied directories, not a plugin). The setup hook never ran in this repo.
 2. What envsetup has instead: CLAUDE.md "Rehydrating" makes `CONTEXT.md` the third read of every
    conversation; `/session entry` step 3 routes "a new or sharpened term → `CONTEXT.md`
    (`domain-modeling` if installed)". That is the same discipline as the reference's, with the
    same leak: today's four undefined terms and the returning "ledger" (`2dd1455`).

## Refuted / corrected

- "Terms get added to CONTEXT.md automatically somewhere in the stack" — nothing in the reference,
  its setup, its hooks or its CI does so; every write is an instruction to a model.

## Unverifiable

- How often the reference's discipline actually fires in other users' repos; only its own
  five-commit history and its docs' admission (finding D1) are on record.

## Implications for envsetup

1. The reference gives no mechanism to copy. The honest fix for "nobody noticed" is a check the
   reference does not have — and the only judgment-free one is enforcing `CONTEXT.md`'s own
   `_Avoid_` lists over the agent-facing prose (what caught "ledger"). A frequency-based
   "undefined term" detector runs against finding D3 and should stay advisory at most.
2. Adopt the two sections the reference's own file grew: `## Relationships` and
   `## Flagged ambiguities` (the second is where "ledger → session log" belongs).
3. A `docs/agents/domain.md` equivalent is already covered by CLAUDE.md "Rehydrating" and
   CONTEXT.md's own preamble; running the setup skill would also assume `docs/adr/` (finding B3).
4. Keep the reference's success test as this repo's: `CONTEXT.md` changes during the conversation
   that changes the model, and gets shorter as often as longer.

## Acted on — 2026-08-30

Peter chose to change the installed skills rather than only the project: under `~/.claude/skills`
(copies of the reference, not symlinks), the hardcoded `docs/adr/` in `domain-modeling`
(`SKILL.md`, `ADR-FORMAT.md`), `improve-codebase-architecture` and `documentation-and-adrs` now
says "where the project keeps its ADRs"; the reference's `domain.md` consumer rule ("read
`CONTEXT.md` before exploring; never an avoided synonym; a missing concept is a gap for
`/domain-modeling`") was added to 16 skills that explore code or name domain concepts; a closing
"Keeping the domain model current" section routes `documentation-and-adrs`,
`spec-driven-development`, `to-spec`, `interview-me` and `idea-refine` to `domain-modeling`, and
`grill-me` points at `grill-with-docs`. Every touched skill passes plugin-kit's validator; the
list lives in `~/.claude/skills/LOCAL-CHANGES.md` so a re-sync from the reference does not undo
it silently. The four implications above stay open for envsetup itself.
