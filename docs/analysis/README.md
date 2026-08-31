# Analysis — research and investigations

Everything we *found out*, as opposed to what we *decided* ([../decisions/](../decisions/README.md))
or *require* ([../plan/PRD-001-envsetup.md](../plan/PRD-001-envsetup.md)). One file per topic. A finding lives here when it
was established against primary sources (official docs, source code, specs, first-party APIs) or
empirically (a spike, a capture from a real machine, a reproduced failure) — never from a
secondary write-up or an assumption. Unverified beliefs are labelled unverified.

## Index

| Doc | Question it answers | Status |
| --- | --- | --- |
| [ANA-001-clack-citty-bun.md](ANA-001-clack-citty-bun.md) | Is clack + citty + Zod on Bun (runtime and compiled) the right foundation? Spike-validated. | current |
| [ANA-008-terminal-input-under-curl-sh.md](ANA-008-terminal-input-under-curl-sh.md) | Why prompts die under `curl \| sh`, and the only input path Bun can actually read. | current |
| [ANA-007-config-compatibility.md](ANA-007-config-compatibility.md) | Which shipped defaults conflict with each other or with the OS (doc-verified), and which claims were refuted. | current (conflict *checking* is out of scope by decision) |
| [ANA-002-install-methods.md](ANA-002-install-methods.md) | Best install method per runtime/tool on a fresh Mac, from official docs. | current |
| [ANA-003-app-config-mechanics.md](ANA-003-app-config-mechanics.md) | How each app's settings and licenses can be applied programmatically (captured from real machines). | current; re-capture on upgrades |
| [ANA-004-chrome-web-apps.md](ANA-004-chrome-web-apps.md) | How Chrome web apps (PWAs) can be installed and named without an enterprise policy. | current |
| [ANA-005-macos-permissions-tcc.md](ANA-005-macos-permissions-tcc.md) | Can TCC permissions (Accessibility, Screen Recording, Mic) be pre-granted? No — and what the ceiling is. | current |
| [ANA-006-finder-favorites-sharedfilelist.md](ANA-006-finder-favorites-sharedfilelist.md) | Setting Finder sidebar favorites on macOS 26 after `mysides`/`sfltool` died. | current |

## Rules

- **Primary sources or empirical evidence, cited per claim.** Follow every claim to the source that
  owns it (docs page, source file, issue, a command you ran and its output). A claim without a
  source is marked _unverified_.
- **Record refutations.** When a plausible belief turns out false, keep it under "Refuted" so it
  does not come back. When something cannot be verified, say so under "Unverifiable".
- **Never silently edit a finding.** Corrections are dated additions; if the picture changes, add a
  status line at the top (`superseded by …`) and cite the session entry (sha).
- **Link consequences.** A finding that forced a decision links to its ADR; one that changed a
  requirement links to the PRD section; one that needs work links to the plan.
- **Produced by** the `research` skill (background agent against primary sources — tell it to save
  here) or by hand for empirical spikes and machine captures. Keep the file name a stable
  kebab-case topic, not a date.

## Template

```markdown
# <Topic> — analysis

> **Analysis** · YYYY-MM-DD · status: current | superseded by <link> · session entry `<sha>`

## Question

What we needed to know and why (link the ADR / PRD section / plan that depends on it).

## Sources

- <primary source, with URL or path> — what it establishes
- <command run> — output summary

## Findings

Numbered, each with its source. Mark _unverified_ where a claim has none.

## Refuted

Plausible beliefs shown false, and by what.

## Unverifiable

What could not be established, and what would establish it.

## Implications

What this changed: decision (ADR link), requirement (PRD link), work (plan link), or nothing.
```
