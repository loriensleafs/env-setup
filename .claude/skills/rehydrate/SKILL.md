---
name: rehydrate
description: Rehydrate envsetup project context at the start of a conversation — read the docs system in order, verify the tree matches the session log, start this conversation's session file, and brief the user. Use at session start, when resuming or picking up envsetup work, before taking a "Next up" item, or when asked what the state of the project is.
---

Run this once at the start of a conversation in this repo, before any other work. The docs system
(ADR-017) exists so that a fresh conversation never rebuilds history from the code or `git log`;
this skill is how it is read. Paths are relative to the repo root; shells need
`export PATH="$HOME/.bun/bin:$PATH"`.

**No sampling.** Every file a step names is read **in full, to its last line, without exception** —
no skimming, no "the first N lines were enough", no summarizing from a partial read. When the Read
tool truncates a long file, continue with `offset` until the end before moving on. "Skim the map"
in step 1 means the whole of OVERVIEW is read; the three named sections are the ones to hold in
mind. A file you did not finish is a file you did not read.

## Steps

1. **Orient** — read [docs/OVERVIEW.md](../../../docs/OVERVIEW.md): skim the map; read **Status**,
   **Next up** and **Key empirical facts** in full.
2. **What happened last** — [docs/sessions/README.md](../../../docs/sessions/README.md) index, then
   the **newest `SES-NNN` in full**: Goal / Outcome / Open at end, the Narrative, the Changes. Then
   earlier sessions back to the last `> **Released vX.Y.Z**` marker. Note what is on `main` but
   unreleased, what is parked (branches named in Status), what was tried and abandoned, what was
   verified and how.
3. **The words** — [CONTEXT.md](../../../CONTEXT.md). Use its terms from here on.
4. **Trust but verify** — the tree must match the log:

   ```bash
   git status --short            # clean, on main, after `git pull`
   git log --oneline -5           # the newest SES entries cite these shas
   bun run session -- --check     # → session: complete
   ```

   A dirty tree, a branch you did not expect, or `session: NOT ready` is a finding for the brief,
   not something to fix silently.
5. **The area you will touch** — for the Next-up item you are taking (or the user's request): its
   `PLAN-NNN` in `docs/plan/` if one exists; the `ADR-NNN`s in `docs/decisions/` for every area
   involved (settled — a change needs a superseding ADR); the `ANA-NNN`s in `docs/analysis/` for
   facts you would otherwise re-research; `grep -rn <file-or-keyword> docs/sessions/` for prior
   changes; the directory's own `CLAUDE.md` loads when you read files there.
6. **Start this conversation's session file** — unless one was already created in this
   conversation:

   ```bash
   bun run session -- --new <slug>   # slug = the work you are about to do, kebab-case
   ```

   Set its title and `Goal` immediately. From here on, "Recording" in CLAUDE.md applies after
   every commit.

## Done when

You have posted a brief of at most ~12 lines to the user containing: released version; what is on
`main` but unreleased; what is parked and where; open questions or unverified items from the newest
session; the Next-up item you propose to take (or the user's request restated in CONTEXT.md's
words) and the first step — **and** the session file for this conversation exists with its Goal
set — **and** every file named in steps 1–3 and 5 was read to its end (state it in the brief:
"read in full: …"). If the user asked a question rather than for work, answer it from what you read, and still
start the session file before making any change.

## Companion

At the end of a conversation, `/wrap-up` checks that everything this skill relies on next time has
been written.
