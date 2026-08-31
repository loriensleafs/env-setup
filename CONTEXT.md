# envsetup

The language of a tool that makes a Mac match a declared setup and keeps it matching. One context;
the terms below are the canonical words for code, prompts, docs and conversation. Terms still being
sharpened are listed under "Open" at the end and are not yet canonical.

## The machine and what it should have

**Machine**:
The Mac envsetup runs on and mutates — the one the manifest describes.
_Avoid_: target, host, system (when meaning the whole computer)

**Item**:
One installable or configurable thing envsetup knows how to detect, install, configure and verify
(an app, a runtime, a font, a repo clone, a macOS setting, an app's configuration).
_Avoid_: package, component, tool (as the generic word), task

**Kind**:
The category an item belongs to, which decides how it is installed and which section it appears
in (`brew-formula`, `brew-cask`, `font`, `repo`, `system`, `config-only`, …).

**Section**:
The heading an item is shown under in the picker: Required, Apps, CLI tools, Fonts, Repos,
System & config.
_Avoid_: group (the picker's internal name), category

**Required item**:
An item whose failure aborts the run because everything else depends on it (Xcode CLT, Homebrew,
bun, …). Not locked in the picker — everything shown is toggleable.
_Avoid_: spine, core, locked

**Dependency**:
An item that must be applied before another in the same run; also what disables the dependent in
the picker when it is unchecked (the requires-cascade).
_Avoid_: requirement, prerequisite (for items; "prerequisite" is what a *tool* needs on a fresh
machine and is researched into dependencies)

**Manifest**:
The declaration of what this machine should have — identity, locations, and per item whether it
is wanted and with which config. Written only after the confirm; read by `doctor` and `sync`.
_Avoid_: state file, config file, profile

**Journal**:
The append-only record of what each run did to each item; the source of resume and of "failed
last run".
_Avoid_: log (as the noun for this file), history

**Dev directory**:
The directory repos are cloned into (`~/Dev` by default); the one location the user chooses.
_Avoid_: workspace, projects dir

**Reference clone**:
A read-only clone of someone else's repo under `{Dev directory}/reference/`, named with the
owner prefix.

**Marketplace**:
The generated Claude Code plugin marketplace listing the ACMElabs repos actually cloned.

## Running

**Bootstrap**:
The bare `envsetup` command: scan, decide, confirm, build, connect, finish. The product.
_Avoid_: setup run, install (for the whole flow), onboarding

**Scan**:
The read-only detection of every item before any prompt; step zero of bootstrap.
_Avoid_: probe, discovery

**Detect**:
An item's read-only check of the machine, returning installed / version / satisfies / differs.
_Avoid_: check, probe, status

**Picker**:
The one grouped selection screen where the user chooses items.
_Avoid_: selection screen, multiselect, menu

**Picked**:
Checked in the picker for this run; only picked items are installed or configured by it.
_Avoid_: selected, chosen, enabled

**Wanted**:
Recorded in the manifest as something this machine should have — because it was picked, or
because it was already present when the manifest was written. Unchecking an already-present
item in the picker does not make it unwanted.
_Avoid_: selected (the on-disk field name), enabled, managed, tracked

**Config screen**:
The per-item prompts, derived from the item's schema, that let the user vary its config before
the confirm.
_Avoid_: settings screen, customization screen, wizard

**Confirm**:
The "Proceed?" prompt after the summary; nothing touches the machine before it.
_Avoid_: summary (that is the note above it), approval

**Run**:
One execution of the build over a manifest, with one run id; resumable if it did not finish.

**Step**:
One item's execution within one run. Outcomes: succeeded, failed, skipped (installed / dependency
/ completed), deferred.
_Avoid_: task, job, action

**Ceremony**:
An attended step an item needs a human for — a browser sign-in, a permission grant, a license
paste, an in-app install — run automatically after the build, deduplicated by id. Shown to the user
as an "attended step".
_Avoid_: manual step, hook, post-install (as nouns for this)

**Connect phase**:
The part of bootstrap that runs the pending ceremonies, after the build.
_Avoid_: stage C, connect command (that only re-runs skipped ceremonies)

**Finishing pass**:
The second build that runs after the connect phase to apply what the ceremonies unblocked.
_Avoid_: retry, second run

**Converge**:
What re-running bootstrap does: re-detect, pre-check what failed last run, ask only about what is
missing, change nothing that already matches.
_Avoid_: sync (the non-interactive command), repair, reconcile

**Doctor**:
The read-only comparison of the machine against its manifest.
_Avoid_: diff, status, check

## Item states (relative to the manifest)

**Applied**:
An item whose effect is on the machine: an app installed at the wanted version, or a
configuration set to the effective config. The one word for both; the code's `installed` flag
means this.
_Avoid_: installed (for configuration), configured (as the generic word), done, set up

**Present**:
The raw fact that something exists on the machine, whatever its version or configuration.
_Avoid_: installed (when version/config are not known to match), found, detected

**Satisfied**:
Wanted by the manifest, present at the right version, and its configuration matches the
effective config. Not shown in the picker; `doctor` counts it.
_Avoid_: in sync, installed (as the state name), OK, current

**Missing**:
Wanted by the manifest but absent — never installed, or never configured by envsetup.
_Avoid_: not installed, absent, pending

**Drifted**:
Wanted and present, but its configuration differs from the effective config — the user's or an
app update's change. Shown as `≠` and, in the picker, unchecked with the hint "settings differ";
reset only by the user's selection.
_Avoid_: differs (the code flag), customized, changed, out of date, dirty

**Untracked**:
Present on the machine but not wanted by the manifest.
_Avoid_: extra, unmanaged, unknown

## Configuration

**Defaults**:
The values envsetup chooses for an item's configuration (captured from Peter's machine or decided
in the PRD).
_Avoid_: our settings, template values

**Config**:
The values the user chose for an item on the config screen, stored in the manifest; absent config
means the defaults apply.
_Avoid_: settings (as the stored noun), options, preferences

**Effective config**:
What `detect()` compares against: the manifest config if present, else the defaults.

**Reset**:
Re-applying the effective config to an item whose values drifted; only ever by the user's explicit
selection.
_Avoid_: overwrite, re-apply (in prompts), fix

**Shell block**:
The single managed region of `~/.zshrc` assembled from every item's shell contribution.
_Avoid_: dotfiles (the item's name), rc lines

## The session log (the docs system)

**Session**:
A bounded stream of work toward one Goal, recorded in one `docs/sessions/SES-NNN` file; **open**
from the moment it is opened until it is **closed** with its Outcome written. It may span any
number of conversations and may serve a plan (its `Plan:` line).
_Avoid_: conversation (for this), sitting, chat, the newest file (as the definition of current)

**Conversation**:
One agent context or one human sitting. A participant in a session: it joins the open session
whose Goal is its work, or opens one, before its first commit; a conversation that changes nothing
needs none.
_Avoid_: session (for this)

**Open** / **Closed** (session status):
Open — work toward the Goal may still land; the tool appends entries and gates it. Closed — the
Goal is done or abandoned, the Outcome says which; nothing is appended to it again.
_Avoid_: current (as the status word), active, done (for the status), finished

**Entry**:
One commit's block in a session file — Summary, Why, one line per touched file, Notes — written by
`/session entry` right after the commit.
_Avoid_: log entry, note, update, record (as the noun)

**Record** (verb):
To write the entry and update everything the commit made stale, in the same step; the practice
the docs system depends on.
_Avoid_: update, log, document (as the verb for this)

## Secrets

**Secret store**:
The age-encrypted `secrets.json.age` committed to the repo, unlocked by one passphrase.
_Avoid_: vault, keychain (that is macOS's, where the API key ends up)

**License**:
A per-app activation key held in the secret store; applied by writing it (scriptable apps) or by a
paste ceremony (online-validated apps).
_Avoid_: key (alone), serial

## Open (not yet canonical — being sharpened)

- None at the moment. Terms asserted here without a decision conversation (Ceremony, Connect
  phase, Finishing pass, Converge, Section, Kind, Reference clone) are open to challenge.
