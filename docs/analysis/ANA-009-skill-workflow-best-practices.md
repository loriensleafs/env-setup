# Anthropic's skill best practices for workflows, conditionals and arguments — analysis

> **Analysis** · 2026-08-30 · status: current · session SES-004 · informs the `/session` skill
> (`.claude/skills/session/`) and any future workflow skill in this repo.

## Question

Peter: "what Anthropic considers to be skills best practices, specifically around creating
workflows — conditional workflows and arguments." Concretely: how a skill receives arguments, how
a body should branch, which frontmatter a multi-step workflow that runs commands and commits
should carry, and whether one `/session start | record | end` skill is the shape Anthropic
recommends.

## Sources

Anthropic-owned pages only, fetched as Markdown on 2026-08-30 and quoted verbatim:

- Claude Code docs, "Extend Claude with skills" — <https://code.claude.com/docs/en/skills.md>
  (frontmatter reference, string substitutions, "Pass arguments to skills", "Inject dynamic
  context", "Run skills in a subagent", "Control who invokes a skill", troubleshooting).
- Claude platform docs, "Skill authoring best practices" —
  <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md>
  (degrees of freedom, workflows, conditional workflow pattern, validation loops,
  plan-validate-execute, evaluation-driven development, checklist).
- Agent Skills open standard, "Best practices" — <https://agentskills.io/skill-creation/best-practices.md>
  and the specification — <https://agentskills.io/specification.md>.
- A first research pass (claude-code-guide agent) also cited third-party write-ups
  (agentpatterns.ai, personal blogs) — those are **not** used here; every claim below was
  re-verified against the pages above. Where that pass reported a fact as "not found", the direct
  fetch found it in the Claude Code skills page (its verifier had only seen a preview).

## Findings (numbered per subsection: A = Arguments, C = Conditional workflows, I = Invocation, D = Dynamic context, W = When, P = Authoring)

### Arguments

1. `$ARGUMENTS` "All arguments passed when invoking the skill. When no placeholder receives an
   argument, Claude Code appends them as `ARGUMENTS: <value>`." Indexed forms `$ARGUMENTS[N]`
   and the shorthand `$N`; named arguments via the `arguments` frontmatter list — "with
   `arguments: [issue, branch]` the placeholder `$issue` expands to the first argument". Indexed
   placeholders use shell-style quoting; an unmatched indexed placeholder "stays in the content
   unchanged", an unmatched named one "expands to an empty string". (skills.md, "Available string
   substitutions", "Pass arguments to skills")
2. **Both parties pass arguments**: "Both you and Claude can pass arguments when invoking a
   skill." (skills.md) — so a model-invoked skill can still receive a mode argument.
3. `argument-hint`: "Hint shown during autocomplete to indicate expected arguments. Example:
   `[issue-number]` or `[filename] [format]`." It is a Claude Code extension: claude.ai uploads,
   the Skills API and `package_skill.py` accept only `name, description, license, compatibility,
   metadata, allowed-tools` and reject it ("Unexpected key(s) in SKILL.md frontmatter:
   argument-hint"). (skills.md, "Using skill frontmatter outside Claude Code")
4. Stacking: "Typing `/write-tests /fix-issue 123` loads both skills and passes the trailing text
   `123` as `$ARGUMENTS` to each of them" (v2.1.199+). (skills.md)

### Conditional workflows

1. Anthropic documents the branch-in-one-skill shape explicitly — the **"Conditional workflow
   pattern"**: "Guide Claude through decision points", with the example `1. Determine the
   modification type: **Creating new content?** → Follow "Creation workflow" below · **Editing
   existing content?** → Follow "Editing workflow" below`, then one numbered workflow per branch.
   The tip that follows: "If workflows become large or complicated with many steps, consider
   pushing them into separate files and tell Claude to read the appropriate file based on the task
   at hand." (platform best-practices)
2. **Workflows**: "Break complex operations into clear, sequential steps. For particularly complex
   workflows, provide a checklist that Claude can copy into its response and check off as it
   progresses." (platform best-practices) The open standard says the same: "An explicit checklist
   helps the agent track progress and avoid skipping steps, especially when steps have
   dependencies or validation gates." (agentskills.io)
3. **Validation loops**: "do the work, run a validator (a script, a reference checklist, or a
   self-check), fix any issues, and repeat until validation passes." (agentskills.io; the platform
   page's "Implement feedback loops" shows the same with a style guide as the validator.)
4. **Plan-validate-execute** for destructive or batch work: "having Claude first create a plan in
   a structured format, then validate that plan with a script before executing it … analyze →
   create plan file → validate plan → execute → verify." (platform best-practices)
5. **Degrees of freedom**: "Match the level of specificity to the task's fragility and
   variability" — high freedom (text instructions) where "multiple approaches are valid, decisions
   depend on context"; low freedom (exact commands, scripts) where a sequence must hold.
   (platform best-practices)
6. **Size and disclosure**: "Keep SKILL.md body under 500 lines for optimal performance" and,
    in the standard, "under 500 lines and 5,000 tokens — just the core instructions the agent
    needs on every run"; reference files are reached by telling the agent *when* to load them —
    "'Read `references/api-errors.md` if the API returns non-200' is more useful than generic 'see
    references.'" (agentskills.io, platform best-practices)
7. **Gotchas stay in the body**: "Keep gotchas in `SKILL.md` where the agent reads them before
    encountering the situation … for non-obvious issues, the agent may not recognize the trigger."
    (agentskills.io)
8. **Scope**: "you want it to encapsulate a coherent unit of work that composes well with other
    skills. Skills scoped too narrowly force multiple skills to load for a single task … Skills
    scoped too broadly become hard to activate precisely." (agentskills.io) No Anthropic page
    states a rule for "branch on an argument vs. separate skills"; the conditional pattern (C1) is
    the documented shape for related branches inside one coherent unit.

### Invocation and side effects

1. **Task content vs reference content**: "Task content gives Claude step-by-step instructions
    for a specific action, like deployments, commits, or code generation. These are often actions
    you want to invoke directly with `/skill-name` rather than letting Claude decide when to run
    them. Add `disable-model-invocation: true` to prevent Claude from triggering it
    automatically." And: "Use this for workflows with side effects or that you want to control
    timing, like `/commit`, `/deploy`, or `/send-slack-message`. You don't want Claude deciding to
    deploy because your code looks ready." (skills.md)
2. `user-invocable: false`: "Only Claude can invoke the skill. Use this for background knowledge
    that isn't actionable as a command." (skills.md)
3. `allowed-tools`: "Tools Claude can use without asking permission during the turn that invokes
    this skill. The grant clears when you send your next message." Pair `${CLAUDE_SKILL_DIR}` in
    both the rule and the body "so a skill can run a bundled script without a permission prompt".
    (skills.md) The plugin-kit frontmatter reference adds a measured caveat: a skill declaring
    `allowed-tools` never loads under `claude -p` unless the caller passes `--allowedTools Skill`.
4. `context: fork` runs the skill as a background subagent (`agent:` picks the type,
    `background: false` waits); "only makes sense for skills with explicit instructions" — a
    reference-only body "returns without meaningful output"; Explore/Plan agents skip CLAUDE.md;
    background edits are outside `/rewind` checkpoints. (skills.md)

### Dynamic context

1. `` !`command` `` "runs shell commands before the skill content is sent to Claude. The command
    output replaces the placeholder, so Claude receives actual data, not the command itself." A
    failed command "aborts the entire skill invocation … Claude never sees the skill content";
    "append `|| true` to any other command you expect to exit non-zero." Injected commands "never
    prompt for permission" — an unmatched ask/deny rule aborts, so pre-approve with
    `allowed-tools`. Commands run in the session shell's cwd; use `${CLAUDE_SKILL_DIR}` /
    `${CLAUDE_PROJECT_DIR}` in paths. Not run for skills synced from claude.ai. (skills.md)
2. `${CLAUDE_SKILL_DIR}`: "The directory containing the skill's `SKILL.md` file"; substituted in
    the body and in `allowed-tools` Bash rules. (skills.md)

### When a skill, when CLAUDE.md, when to measure

1. "Create a skill when you keep pasting the same instructions, checklist, or multi-step
    procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a
    fact. Unlike CLAUDE.md content, a skill's body loads only when it's used." (skills.md)
2. **Evaluation-driven development**: "Create evaluations BEFORE writing extensive
    documentation … Run Claude on representative tasks without a Skill … Build three scenarios
    that test these gaps … Establish baseline … Write minimal instructions … Iterate." (platform
    best-practices) Claude Code's page adds: "Seeing a skill trigger tells you Claude found it,
    not that it did what you intended. To know a skill is working, measure two things separately."
3. Listing budget: with many skills "Claude Code shortens descriptions to fit the listing's
    character budget, which can strip the keywords Claude needs" — `/doctor` reports the cost;
    `skillListingBudgetFraction` raises it. (skills.md)

### Authoring (the platform page, read end to end — P)

1. **Concise is key**: "Default assumption: Claude is already very smart. Only add context Claude
   doesn't already have. Challenge each piece of information: 'Does Claude really need this
   explanation?' … 'Does this paragraph justify its token cost?'"
2. **Three degrees of freedom**, not two: high (text instructions; "multiple approaches are
   valid"), medium ("pseudocode or scripts with parameters"; "a preferred pattern exists"), low
   ("specific scripts, few or no parameters"; "a specific sequence must be followed" — "Do not
   modify the command or add additional flags"). The analogy: a narrow bridge with cliffs gets
   exact instructions; an open field gets general direction.
3. **Test with all models you plan to use**: Haiku "Does the Skill provide enough guidance?",
   Sonnet "Is the Skill clear and efficient?", Opus "Does the Skill avoid over-explaining?"
4. **Naming**: "Consider using gerund form (verb + -ing) for Skill names" (`processing-pdfs`);
   "Acceptable alternatives: noun phrases (`pdf-processing`), action-oriented (`process-pdfs`)";
   avoid vague (`helper`, `utils`), overly generic (`documents`, `data`), reserved words, and
   "inconsistent patterns within your skill collection".
5. **Descriptions**: "Always write in third person" (injected into the system prompt); "include
   both what the Skill does and when to use it"; "specific and include key terms". The page's own
   examples end with "Use when … or when the user mentions PDFs, forms, or document extraction".
6. **References one level deep**: "Claude may partially read files when they're referenced from
   other referenced files … might use commands like `head -100` to preview content rather than
   reading entire files"; reference files over 100 lines open with a table of contents "even when
   previewing with partial reads".
7. **No time-sensitive information** ("If you're doing this before August 2025…"); put legacy
   behaviour in an "Old patterns" `<details>` block instead.
8. **Consistent terminology**: "Choose one term and use it throughout the Skill" — the same rule
   `CONTEXT.md` applies to the repo.
9. **Template pattern**: give the output format as a literal template, "strict" ("ALWAYS use this
   exact template structure") or "flexible" ("a sensible default … use your best judgment").
   **Examples pattern**: input/output pairs "convey the desired style and level of detail to
   Claude more clearly than descriptions alone".
10. **Avoid offering too many options**: "Provide a default (with escape hatch)" — "Use
    pdfplumber … For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
11. **Scripts**: "Solve, don't defer" (handle error conditions in the script rather than leaving
    them to Claude); no "voodoo constants" (every value justified in a comment); "Prefer scripts for
    deterministic operations"; make execution intent explicit ("Run `x.py`" vs "See `x.py`");
    validators verbose — "Field 'signature_date' not found. Available fields: …".
12. **Observe how Claude navigates Skills**: unexpected exploration paths, missed connections,
    overreliance on one section, ignored content — "Iterate based on these observations rather
    than assumptions."
13. **Develop iteratively with Claude**: Claude A authors and refines, Claude B uses it on real
    tasks, observations flow back — the loop `skill-creator` automates.
14. **Checklist for effective Skills** (before sharing): description specific with key terms and
    both what/when; body under 500 lines; details in separate files; no time-sensitive info;
    consistent terminology; concrete examples; references one level deep; workflows with clear
    steps; scripts solve rather than defer, explicit error handling, no voodoo constants; validation
    for critical operations; at least three evaluations; tested with Haiku, Sonnet and Opus; real
    usage scenarios.

## Refuted / corrected

- "`$ARGUMENTS`, `argument-hint`, `disable-model-invocation`, `context: fork` are not documented
  by Anthropic" (first research pass's verifier) — all are in the Claude Code skills page; the
  verifier had read a preview.
- `paths:` is **not** a skill frontmatter field; it belongs to `.claude/rules/*.md` (memory page,
  ADR-018).
- "Anthropic recommends against if/else in the body" (first pass, third-party sourced) — the
  platform page documents the conditional pattern *in* the body and only suggests separate files
  when branches grow large.

## Unverifiable

- Whether Claude passes a mode argument when it invokes a skill on its own (finding 2 says it
  can; no page shows what argument it chooses when the user typed none) — the body's "infer the
  branch" fallback covers that case.

## Implications for `/session` (`.claude/skills/session/SKILL.md`)

Conforms: one coherent unit (the session lifecycle) using the documented conditional pattern
(findings C1, C8); gotchas in the body (C7); 139 lines (C6); each branch ends in a "Done when"
(the standard's validation-gate idea, 6–7); model-invoked because `start` must fire on its own
(W1). What the pages would change, applied in iteration 2 of the eval loop:

1. **Inject the state the branches decide on** (D1): `` !`bun run session -- --check || true` ``,
   `` !`git status --short` ``, `` !`git branch --show-current` `` at the top, so the skill arrives
   with the gate and tree already inlined instead of asking the model to run them.
2. **Named argument** (A1): `arguments: [mode]` and `$mode` instead of raw `$ARGUMENTS` — an
   unmatched named argument expands to empty, which is the "infer the branch" case.
3. **A copyable checklist per branch** (C2) rather than prose steps only.
4. **Side effects** (I1): `record` and `end` commit. The documented default for commit-like
   workflows is `disable-model-invocation: true`; a single skill cannot be user-only for two
   branches and model-invoked for the third. Decision recorded in ADR-019: keep model invocation
   for `start`, and make the commit steps of `record`/`end` conditional on the gate having
   passed — the gate is the guard the docs ask for.
5. Keep `allowed-tools` out (I3's headless caveat) unless a bundled script appears.
6. **Name** (P4): `session` is a noun, not a gerund (`managing-sessions`) or an action
   (`run-session`). The page allows noun phrases and warns only against vague or inconsistent
   names; the repo's other skills are action-named (`run-*`). Kept as `session` because the word is
   the leading word across the tool (`bun run session`), the directory (`docs/sessions/`) and the
   glossary — consistency inside this collection outranks gerund form. Decision recorded in
   ADR-019.
7. **Templates and an example** (P9): the brief and the closing note become literal templates in
   the skill (strict for the brief's line set, flexible for wording); one filled per-file line is
   shown as an Input/Output pair so "a phrase, not a placeholder" has a concrete bar (the graders
   flagged that any prose passes).
8. **Concise** (P1): cut the explanatory sentences the model already knows (why the order is
   deliberate, what a checklist is for) and keep the repo-specific facts.
9. **Scripts solve, don't defer** (P11): the "is the newest session file mine?" judgment and the
   "which files did this commit touch" lookup are deterministic — candidates for
   `scripts/session.ts` (`--current` printing the current file, its Goal and its placeholders with
   line numbers; `--check` already lists files) so the skill runs a tool instead of reasoning.
10. **Models** (P3): the evals ran on one tier; the page asks for Haiku, Sonnet and Opus — a
    later iteration, recorded as unverified until then.
