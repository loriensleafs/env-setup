# Tier sweep — the `/session` skill on Haiku 4.5, Sonnet 5, Opus 5

The outcome half of the cross-tier test ANA-009 (implication 10) left undone. Same three evals,
prompts and expectations as `../iteration-2`, `with_skill` arm only, one run per eval per tier on
fresh clones of `main` @ `3e84241`, graded by the same grader procedure. Fable 5 is
`../iteration-2/*/with_skill` (same skill text, not re-run). The trigger half — the same
description measured on all four tiers — is `../trigger/tiers/`.

| Tier | start-brief | record-commit | end-close | Total | Tokens (mean) | Time (mean) |
|---|---|---|---|---|---|---|
| haiku-4.5 | 4/7 | 5/7 | 5/6 | 14/20 (70%) | 76,323 | 163 s |
| sonnet-5 | 7/7 | 7/7 | 6/6 | 20/20 (100%) | 117,839 | 291 s |
| opus-5 | 7/7 | 7/7 | 5/6 | 19/20 (95%) | 105,786 | 250 s |
| fable-5 (iteration-2) | 6/7 | 7/7 | 6/6 | 19/20 (95%) | 104,083 | 190 s |

Per tier: `<tier>/benchmark.{json,md}` (aggregate-results over that tier's runs; the "Config B"
column is empty by design — there is no baseline arm here), `<tier>/<eval>/with_skill/{outputs/,
grading.json, timing.json}`. `notes.json` is the analyst pass across tiers.
