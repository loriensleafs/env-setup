# Who owns rehydration — analysis and recommended design

> **Analysis** · 2026-08-31 · status: decided (see § Decisions; sequencing: build in acmelabs-15/sessions, move last) · ADR-024 · session SES-001 (acmelabs-15/sessions, PLAN-001) ·
> informs a superseding ADR for the placement clauses of ADR-019, ADR-022 and ADR-023, and the
> next iteration of the `sessions` plugin and the `~/.claude` plan skills.

## Question

Peter, after a fresh conversation typed `/sessions:session continue PLAN-001`: "I'm starting to
think more and more session skills should be really strictly just about the session, maybe a bit
about how it connects to plan. In regards to kicking off a plan as a new plan or continuing a plan,
the plan should be responsible for rehydrating the context, including how to identify the correct
session and how to go through it as part of that rehydration." He named three candidate homes —
`using-agent-skills` (the router), `context-engineering` (getting context), a plan skill or
command — and asked for a comprehensive evaluation of every installed skill and both authors'
lifecycle material before choosing the most robust design, not the fastest.

**Rehydration** here means: a conversation starts from nothing but the repo and must reach the
state where it can do the next piece of work correctly — knowing what is being built (PRD), how
(plan), where the work stands (the part and task), what the last conversation did and left
unverified (the session), and what the next task needs (its ADRs, ANAs, files).

## What was read

Every file, to the last line: the 46 skills under `~/.claude/skills` (24 Addy, 20 Matt, 2 local)
with their supporting files; the 8 commands under `~/.claude/commands`; the 9 references and 4
personas; `skills.addy.ie` lifecycle, loops, skills catalog and the three tutorials
(new-app, existing-app, loop-engineering); Matt's `aihero.dev/skills` index and every docs page
in `~/Dev/reference/matt-pocock-skills/docs/`; the plugin's `SKILL.md`, both `CONTEXT.md` files
and `CONTEXT-MAP.md`; PLAN-001, SES-001; ADR-019, ADR-022, ADR-023; `~/CLAUDE.md`;
`project-docs-conventions.md`; env-setup's root `CLAUDE.md`.

## Findings

### F1. "Start of a session" has four homes today, and none of them agree on what it means

| Home | What it says | What it actually does |
| --- | --- | --- |
| `using-agent-skills` | "Use when starting a session or when you need to discover which skill applies" | Routes by SDLC phase (Define → Ship). No concept of a plan part or a session log. |
| `context-engineering` | "Starting a new coding session" is its first trigger | A Lineage-A reference: the context hierarchy (rules file → spec → source → errors → history), packing strategies, confusion management. It names *what to load*, never *in which order for this docs system*. |
| `project-docs-conventions.md` | "Root `CLAUDE.md` gets a rehydrate section: the order to read things in at session start, and what to extract from each" | env-setup's root `CLAUDE.md` has that section; it describes the walk and delegates it to `/session start`. |
| `sessions` plugin `start`/`continue` | The whole walk: OVERVIEW → plan → PRD → open sessions → CONTEXT.md → ADRs → join/open → brief | The only executable procedure; measured by disclosure evals 1 and 2. |

Peter's instinct is confirmed by the files: the session skill did not take rehydration from a
place that owned it. It filled a gap three other documents gesture at.
[`~/.claude/skills/using-agent-skills/SKILL.md`](~/.claude/skills/using-agent-skills/SKILL.md) ·
[`context-engineering/SKILL.md`](~/.claude/skills/context-engineering/SKILL.md) ·
[`project-docs-conventions.md`](~/.claude/references/project-docs-conventions.md) ·
[env-setup `CLAUDE.md` § Rehydrating](../../CLAUDE.md)

### F2. The two lifecycles agree on one thing that decides this: the state file is the spine, and reading it is the first step of every run

Addy's loop-engineering guide lists six loop primitives — automations, worktrees, skills,
connectors, subagents, **state** ("Remember what is done across runs: Markdown, a Linear
board") — and its tutorial step 5 is "Give the loop a memory: a state file where each run
records what it changed and what is left, so tomorrow's run resumes instead of repeating
itself." Matt's `ask-matt` names the same moment from the other side: a new conversation is a
**phase boundary**, and "continue is the only move that keeps the session as a primary source";
everything else (compact, clear, handoff) turns it into a secondary source.

Read against this design: the **session log is the State primitive**; the **plan is the map**
(Matt's word) the runs move across; **rehydration is the "gather context" step** at the top of
every run. That framing gives each artefact one job, which is the property the current layout
lacks.
[skills.addy.ie/loops](https://skills.addy.ie/loops/) ·
[skills.addy.ie/tutorials/loop-engineering](https://skills.addy.ie/tutorials/loop-engineering/) ·
[`ask-matt/SKILL.md` § Phase boundaries](~/Dev/reference/matt-pocock-skills/skills/engineering/ask-matt/SKILL.md)

### F3. Both authors reject an orchestrator that owns the sequence; both endorse a thin entry point the human types

Addy's `orchestration-patterns.md` endorses pattern 4 — "sequential pipeline as user-driven slash
commands … the user IS the orchestrator" — and rejects anti-pattern A (a router persona: "pure
routing layer with no domain value") and anti-pattern C (an agent that runs `/spec` → `/plan` →
`/build` on the user's behalf: "loses the human checkpoints"). Its remedy for routing is
"document intent → command mapping in `AGENTS.md`". Matt's `SKILL-MECHANICS.md`: a user-invoked
skill orchestrates; model-invoked skills hold the reusable discipline; a router skill "can only
hint, never fire". Addy's `/plan`, `/build`, `/spec` are 16–72-line wrappers that invoke a skill
with a brief.

So the entry point Peter types should be a **command** (`/plan PLAN-NNN`), the procedure should
live in the **skill** the command invokes, and the router should carry **one line** of intent
mapping — not a procedure.
[`orchestration-patterns.md`](~/.claude/references/orchestration-patterns.md) ·
[`writing-for-agents/SKILL-MECHANICS.md`](~/.claude/skills/writing-for-agents/SKILL-MECHANICS.md)

### F4. The plan already owns "where the work stands"; the session already owns "what happened"

ADR-022: "progress is read from the session entries, never tracked twice"; the plan's part status
line "names the session serving it"; `/build` step 8 and `planning-and-task-breakdown` tick tasks
citing the entry sha. `/build` auto mode: "execute in dependency order; if not explicit, in the
order the plan lists them" — the plan's file order *is* the sequence. The session file's
`Open at end` is defined (by the plugin's own reference) as "what the next conversation picks up
first and what is unverified."

Rehydration therefore already has its two halves written, in two files that point at each other.
What is missing is the procedure that walks PRD → plan → part → session → `Open at end` and then
turns to the next task — and that procedure is about the *plan's* state. Reading the session is a
step inside it.
[ADR-022](../decisions/ADR-022-rehydrate-by-plan.md) ·
[`commands/build.md`](~/.claude/commands/build.md) ·
[`references/session-log.md`](~/Dev/ACMElabs/sessions/skills/session/references/session-log.md)

### F5. Cross-skill hops are the most-reported failure in Matt's set — but the hop this design needs is one the aliases already prove

`grill-with-docs` docs: "a skill that names another skill does not reliably cause that skill to
load … the most reported problem with this skill." `ask-matt` docs: "Thirteen of the plugin's
twenty-two skills carry `disable-model-invocation`, which means the harness leaves them out of
the skill list … the agent reads that list as exhaustive and reports them missing."

Two mitigations exist in this design. (a) Reading the session file is plain file I/O; the plan
skill needs no other skill to *read*. The only hop is `join`/`open` (writes to the session log),
which happens once per conversation, before the first commit. (b) That hop is the exact shape
the five `sessions:session-*` aliases use (`call the Skill tool with skill: sessions:session`),
probed working on 2026-08-31 against the installed plugin. (c) Peter, 2026-08-31: the skills under
`~/.claude/skills` are ours, so `disable-model-invocation` can be removed from any skill the plan
procedure must reach. Matt's failure mode is a property of *his* user-invoked set, not of ours.
[grill-with-docs docs](~/Dev/reference/matt-pocock-skills/docs/engineering/grill-with-docs.md) ·
PLAN-001 Part 1 Task 3 (`7bd6782`)

### F6. The measurement does not have to be lost

Four disclosure iterations (35 → 36 → 37 → 35 of 54) measure exactly the walk (eval 1) and the
join (eval 2). plugin-kit's `measure-disclosure.ts` takes `--skill-path`; it measures whatever
skill directory it is pointed at against `evals.json` and a fixture. If the walk moves to
`planning-and-task-breakdown`, eval 1 moves with it and is measured there; eval 2 (append to the
open session on `entry`) stays with the plugin. The earlier objection — "moving it loses the
apparatus" — was wrong; it moves the apparatus.
[`evals/README.md`](~/Dev/ACMElabs/sessions/skills/session/evals/README.md)

### F7. The plugin's description is the other thing the move buys

The `sessions:session` description is at 1,011 of 1,024 characters, and the untested hypothesis
for its 2/10 (Haiku) and 5/10 (Sonnet) trigger rate is a clause naming the tool situations in
the user's words (PLAN-001 Part 4 Task 6). The `start`/`continue` half of the description is
~430 characters. Moving those modes out frees the room that hypothesis needs.

### F8. Matt's `handoff` is not this

Peter asked where `handoff` fits, if anywhere. Matt's docs: "what it buys is portability, not
compression … you need a file only when the work has to travel: to a new harness, a new
directory, a colleague, or a side task you want to fork off." The session `end` writes the
durable, in-repo handoff the *next conversation in this repo* reads. They are different objects.
Nothing in this design needs `handoff`; import it when a real cross-harness or
prototype-directory case appears, and note the split in `choosing-a-skill` when you do.
[handoff docs](~/Dev/reference/matt-pocock-skills/docs/productivity/handoff.md)

## Refuted

- **"context-engineering should own the walk."** It is a Lineage-A reference: `choosing-a-skill`
  classes those as "reference you consult, not workflows you execute", and its own body is a
  hierarchy plus packing patterns. A procedure inside it would sit in a file the router says not
  to run, and Addy's skill would grow a session-log dependency it does not have upstream.
- **"The root `CLAUDE.md` alone should own it."** `project-docs-conventions` is right that the
  *per-repo order* belongs there (env-setup's section is that). The *procedure* — how to find the
  in-progress part, which session to read, what "read the work just done" means — is the same in
  every repo and belongs in one skill; per-repo copies drift (env-setup's already says
  `/session start`, stale twice over).
- **"A new model-invoked `rehydrating` skill."** `SKILL-MECHANICS` makes a model-invoked skill the
  home for reference *two skills need*. Only one consumer needs this walk. Run `codebase-design`'s
  deletion test: delete the separate skill and its complexity reappears in exactly one caller —
  it was a pass-through. Its one genuine benefit, firing on "catch me up" alone, is bought more
  cheaply by putting those words in `planning-and-task-breakdown`'s description.
- **"Moving the walk loses the disclosure measurement."** F6.

## Unverifiable

- Whether the model reliably follows a `/plan PLAN-NNN` → `sessions:session join` hop at the top
  of a conversation. The alias probe shows the mechanism resolves; only a disclosure run on the
  new layout shows the rate.
- Whether `planning-and-task-breakdown`'s description can carry the new triggers and keep its
  present routing on Haiku. Measured by `measure-triggering.ts` after the edit, not before.

## Decisions (Peter, 2026-08-31, via AskUserQuestion)

1. **Home.** The session skill moves into `~/.claude/skills`. Whether that directory becomes a git
   repo is deferred ("ignoring this for now"). Consequence recorded below (§ Sequencing).
2. **No join, open or leave.** A session has a **status**. A conversation that stops does nothing:
   the session stays `in progress`. The skill has three acts:
   - **create** (`start` / `init`): a new session, from a description;
   - **log** (Peter: "instead of record, log"): an entry for a commit into a session `in progress`;
   - **close** (`close` / `end`): the only act that must be named explicitly, with a required
     `SES-NNN`; with none given, the skill lists the sessions `in progress` through the
     `ask-user-question` skill and asks which; with none `in progress`, it says so.
3. **Mode inference from arguments.** `SES-NNN` plus log-arguments, session `in progress` →
   log. A description and no session id → create, asking for what it cannot fill from the
   description, filling the rest itself. The `/plan` command handles its arguments the same way.
4. **Standardise status** across sessions, plans and parts, so the artefacts read alike.
5. **The evals are tossed and redone** once the skills work together, when trigger statements can
   be written against real usage rather than the current layout.

### Consequences the decisions carry

- **The handoff (`Open at end`) goes.** With no leave act, nothing is written when a conversation
  stops. Rehydration still has both halves: *where* from the plan (the first unticked task of the
  first part `in progress`) and *what happened / what is unverified* from the session's entries,
  whose `Notes` line already requires "verified how; unverified what; follow-ups". The Narrative
  is updated at each entry, not at the end. `Outcome` stays, written at close. The glossary term
  **Handoff** is retired or redefined as "the plan plus the last entries".
- **Status vocabulary.** Proposed, to be confirmed at the glossary edit: a **session** is
  `in progress | done`; a **plan part** is `planned | in progress (session SES-NNN) | done
  (session SES-NNN, sha)`; a **plan** is `planned | in progress | done`. Sessions drop
  `open/closed`; the tool's `list`, `check` and `close` print the new words. Tickets keep the
  triage roles and ADRs keep `Accepted | Superseded` — different artefacts, different vocabulary,
  as `project-docs-conventions` already says.
- **The name `SES-NNN` stays**: every doc type here is a three-letter prefix (`PLAN`, `ADR`,
  `ANA`, `PRD`); `SES` fits the pattern and every existing file and citation uses it.
- **Which session a conversation records into** is no longer a mode: `/plan PLAN-NNN` ends
  knowing the part `in progress` and the `SES-NNN` its status line names, and passes that id to
  every `log`; unplanned work names its session on `start`. Two sessions `in progress` no
  longer need a "join" — the id is explicit.
- **F5 is weaker than written**: with `disable-model-invocation` ours to remove, the cross-skill
  hop is a plain Skill-tool call to a model-invocable skill.

## Recommended design (revised)

**One sentence:** the plan owns rehydration; the session owns the record with three acts and a
status; the router owns one line; the reference owns one pointer; the per-repo order stays in the
root `CLAUDE.md`; every artefact's status uses one vocabulary.

### Ownership

| Concern | Single source of truth | Home |
| --- | --- | --- |
| Which door to enter ("work on PLAN-NNN", "catch me up") | one routing line | `using-agent-skills`, plus a row in `choosing-a-skill` |
| Rehydration: new-vs-continue, where the plan stands, which session, the entries, what comes next, the brief | one section | `planning-and-task-breakdown` § *Continuing a plan*, via `/plan [PLAN-NNN]` with argument inference |
| The per-repo read order | one section | the repo's root `CLAUDE.md` § Rehydrating |
| The record: start · log · close; the gate; the tool | the skill | `~/.claude/skills/session` |
| "Starting a new session" as a context concern | one pointer | `context-engineering` |
| Status words for session, plan, part | one glossary section | the session-log glossary `session init` writes into `CONTEXT.md`, mirrored by `project-docs-conventions` |

### The rehydration procedure (`/plan [PLAN-NNN]`)

1. **Arguments.** `PLAN-NNN` and its file exists → continue. `PLAN-NNN` and no file, or a
   description and no id → create a plan (today's `/plan`). Nothing → the injected
   `session list --brief` names the sessions `in progress` and their parts; one → take it;
   several → ask with `ask-user-question`.
2. **Order.** The root `CLAUDE.md` § Rehydrating, else the default order here. Every file named
   is read to its last line.
3. **Where it stands.** PRD Plans table → the plan → the first part `in progress`, else the first
   `planned` → the first unticked task (file order is execution order; `/build` reads it so).
4. **What happened.** The part's status line names `SES-NNN`. Read that session: Narrative, then
   the entries newest-first, then every file the last entries reference. The unverified items are
   the entries' `Notes`.
5. **What comes next.** Everything the next task names: ADRs, ANAs, files, the directory's
   `CLAUDE.md`.
6. **The session for this conversation.** The part `in progress` → its `SES-NNN` is the id every
   record uses. The part `planned` → `session create` with a description drawn from the part; the
   part's status line becomes `in progress (session SES-NNN)`. A question opens nothing.
7. **The brief** — the template, the entire reply.
8. **Route** — the next task → `/build`; a decision → `/grill-with-docs`; a question → answer.

### The session skill (`~/.claude/skills/session`)

| Act | Named | Inferred when | Does |
| --- | --- | --- | --- |
| **create** | `start` / `init` | a description and no `SES-NNN` | `session new`, Goal from the description, Plan line if a part is named; asks only for what the description lacks |
| **log** | `log` | `SES-NNN` given, session `in progress`, a commit landed | append the skeleton, fill it, tick the plan, update the Narrative, gate, `docs(session)` commit |
| **close** | `close` / `end` — always explicit | never | `SES-NNN` required; none → `ask-user-question` over the sessions `in progress`; none in progress → say so. Outcome written, status `done`, plan part `done (session SES-NNN, sha)` |

The tool (`session.ts`) keeps `init`, `list`, `new`, `append`, `current`, `check`, `close`; its
status words change with the glossary. The gate is unchanged in what it counts.

**Commands.** Three personal commands, one per act, each exposing only that act's arguments and
inferring from them exactly as the skill does; `/session` alone exposes the full argument
landscape and infers the act. Each command is a thin entry point that calls the skill with the
act and its arguments — the shape `orchestration-patterns` pattern 2 endorses and today's aliases
already use.

### What changes in each home

| File | Change |
| --- | --- |
| `~/.claude/skills/planning-and-task-breakdown/SKILL.md` | § *Continuing a plan* (steps 1–8); description gains the continue triggers; argument inference |
| `~/.claude/commands/plan.md` | `/plan [PLAN-NNN \| description]`; the file's existence and the argument shape decide the mode |
| `~/.claude/skills/using-agent-skills/SKILL.md` | one routing row |
| `~/.claude/skills/context-engineering/SKILL.md` | one pointer |
| `~/.claude/skills/choosing-a-skill/SKILL.md` | routing row; the session skill described as the record |
| `~/.claude/references/project-docs-conventions.md` | the `docs/sessions/` paragraph; the status vocabularies (session added); `/plan PLAN-NNN` is the way in |
| `~/.claude/skills/session/` (new home) | acts start · log · close; status `in progress \| done`; `Open at end` removed from the template and the gate; description rewritten; the tool's words; `references/session-log.md`; the glossary section |
| `~/.claude/commands/session-*.md` | **three commands, one per act** (Peter, 2026-08-31): each takes only its act's arguments and infers the same way the skill does — a scoped argument API over the same procedure. `/session` takes the whole landscape and infers the act; `/session-start` takes a description; `/session-log` takes `SES-NNN` and the commit; `/session-close` takes `SES-NNN`, else asks. Same pattern for `/plan` and any per-mode plan commands |
| env-setup root `CLAUDE.md` § Rehydrating; `~/CLAUDE.md` §1 | `/plan PLAN-NNN` is the entry; `/session` for the record |
| env-setup `docs/decisions/ADR-024` | supersedes the placement and mode clauses of ADR-019, ADR-020 (leave/close), ADR-022 and ADR-023; the grain (ADR-021) stands |
| The plugin repo `acmelabs-15/sessions` | source of the move; archived or kept as history once the skill lives in `~/.claude/skills` |
| Duplicated shapes | one home each: the ADR template (`documentation-and-adrs` vs `domain-modeling/ADR-FORMAT.md`), the spec template (`spec-driven-development` vs `to-spec`), the ticket shape (`to-tickets` vs `issue-tracker.md`) |

### Sequencing — decided: build here, move last

Peter, 2026-08-31: **build in `acmelabs-15/sessions`, move last.** The work lands there with
entries and the gate; the copy into `~/.claude/skills` is the final step, when the git-repo
question is answered. The alternative considered:

- **Move first, build there.** Copy the skill into `~/.claude/skills/session` now and do the
  rest in place. Cost: untracked until the directory is a repo; no session log for the work; the
  evals live nowhere versioned.

## Consequences

- ADR-024 in `docs/decisions/` (written 2026-08-31, uncommitted with this note).
- PLAN-002 in `acmelabs-15/sessions` carries the work; PLAN-001 Part 4's remaining measurement
  tasks are superseded by PLAN-002's eval redo, Part 5 (plugin-kit) stays open.
- The session-log glossary and `project-docs-conventions` gain the status vocabulary.
- env-setup root `CLAUDE.md` § Rehydrating and `~/CLAUDE.md` §1 updated.
