# Mac Setup CLI — Living Plan

> **Purpose of this doc**: comprehensive enough that a brand-new conversation can pick up
> exactly where we left off. Update constantly. Owner: Peter (github.com/loriensleafs) +
> Claude, collaborating. Peter drives decisions; Claude researches/builds after agreement.
> **This is a collaboration — do NOT unilaterally build ahead of agreed decisions.**
> **Collaboration protocol (Peter, 2026-08-26): ask questions ONE at a time via AskUserQuestion
> (no batched question lists). Be thorough, leave nothing out, make no assumptions. Challenge
> Peter where it makes sense. If you don't know a thing, RESEARCH it — always evaluate options
> and alternatives for the best way, not the first way.
> **Install principle (Peter, 2026-08-26): install everything the BEST way, not the easiest way.
> For EVERY tool: research official docs' recommended method + community best practice before
> choosing. Homebrew is fine when it IS the best way, never just because it's easy. Always
> present research findings to Peter WITH a recommendation; never assume.
> **AskUserQuestion UI constraint (Peter, 2026-08-26): he CANNOT see assistant text written
> before the tool fires — the question dialog covers it. ALL context/research findings must go
> INSIDE the question text itself: nicely formatted, concise bullets, NO jargon.**
> **Transitive-prereq principle (Peter, 2026-08-26): when researching the best way to install a
> thing, also identify everything ELSE that thing needs on a completely fresh machine
> (prerequisites, companions, shell hooks, runtimes) — those get researched and installed too.**

## Status (2026-08-26): Phases A + C COMPLETE. Phase B DONE — this repo (loriensleafs/env-setup,
PUBLIC) is now the project home; PLAN.md + research live in docs/. License keys scrubbed from
docs into .secrets.local.json (untracked) pending the age-encrypted store build.
Groups 1-6 initial decisions complete. Group 6 locations: ~/Dev default + {Dev}/reference/
confirmed, no other configurable locations.
PHASE ORDER DECIDED (Peter): **A → C → B** (app passes, then tech foundation, repo LAST).
Phase A COMPLETE (2026-08-26) — all 13 app passes done. Phase C (technical foundation) next.
PHASES:
 A. Per-app customization passes — research + defaults conversation for EACH of:
    Ghostty, Cursor, VS Code, superwhisper, Claude desktop, Raycast, CleanShot X, Zoom,
    Discord, Podman, Typora  (Claude Code + Chrome already specced)
 B. Create the env-setup GitHub repo + scaffold (needs VISIBILITY decision — Typora license
    key security depends on it)
 C. COMPLETE 2026-08-26 (see RESEARCH-clack-citty-bun.md §§1-12): stack adopted (clack +
    @clack/core custom prompts + citty + Zod 4 + age-encryption + env-paths); manifest/journal/
    item architecture approved; secrets = age-encrypted in repo; auth = own-app device flow
    right after summary confirm; release pipeline approved; mechanics researched (Chrome
    managed-policy routes, WebAppInstallForceList for PWAs, Automator Services for Quick
    Actions; toolbar.pinned_actions protection = empirical test at build).
    NEXT: Phase B — create the env-setup repo + scaffold.
 C. (was) IN PROGRESS. **clack/citty/bun spike DONE 2026-08-26 — see RESEARCH-clack-citty-bun.md**
    (all assumptions validated on Bun 1.4.0 runtime + compiled binary; custom core prompt
    proven; citty recommended pending Peter's confirm; Zod 4 + Standard Schema pattern for
    evolvable configs). Remaining C spikes below:
 C. Technical foundation research: clack v1.7 deep dive + custom unified prompt spike,
    manifest/journal schema, bun compile + GitHub Actions release pipeline, install.sh shim,
    GitHub device-flow OAuth app (auth-placement question), PWA install mechanics,
    default-browser mechanics, dockutil, Shortcuts deployment, statusline bun conversion.

## What this is
A Bun + TypeScript interactive TUI (clack) that sets up a brand-new Mac from one curl command.
Replaces ad-hoc setup. Lives in a GitHub repo under github.com/loriensleafs.

## Decisions made
- **Runtime/stack**: Bun package, TypeScript, `@clack/prompts` (+`@clack/core` for custom prompts).
- **Distribution: Option B** — `curl -fsSL <url>/install.sh | bash` shim that detects arch,
  downloads the bun-compiled binary from GitHub Releases, ad-hoc codesigns if needed, runs it.
  Rationale: true one-liner, no deps needed to kick off, curl does NOT apply quarantine
  (verified empirically 2026-08-25); browser downloads DO → docs must say use curl.
- **@bomb.sh/tab**: OUT of scope (Peter, 2026-08-26 — agreed it doesn't make sense; revisit only if subcommands multiply).
- **All multiselect options selected by default; all inputs have sensible defaults.**
- **Resumable**: a state/journal file records per-step status so a crashed run can be re-kicked
  (same curl command) and continue where it left off.
- **Error handling per step**: clack log status on failure + clear message + one of:
  retry prompt (innocuous) / offer-to-fix-then-retry (fixable by tool, needs approval) /
  tell-user-what-to-do-manually-then-retry.

## Workflow design — DECIDED 2026-08-26: three-stage model
**Design principle (Peter): NOTHING touches the system until the summary screen is explicitly
confirmed. No background preloading before confirm (CLT-preload idea REJECTED for this reason).
Full transparency about what will be done. Applies to future subcommands too (sync shows diff first).**

STAGE A — DECIDE (attended, ~5 min):
  Unified selection prompt (custom @clack/core prompt; live dependency filtering) over 6 groups:
    1. REQUIRED installs (xcode CLT, homebrew, bun, git identity, gh, ... TBD)
    2. OPTIONAL installs (ghostty, cursor, claude-code, chrome variants, superwhisper, ... TBD)
    3. GIT REPOS → cloned into Dev dir — SPECCED 2026-08-26, see "Group 3: repos" section
    4. FONTS — DECIDED 2026-08-26, see "Group 4: fonts" section
    5. SETTINGS/DEFAULTS — being specced; see "Group 5: macOS settings" section
    6. LOCATIONS path prompts (Dev dir default ~/Dev; list TBD)
  → then per-app customization screens for each selected customizable app (Claude Code flagship)
  → summary screen of everything that will happen → Enter confirms
  → ALL answers persisted to a MANIFEST file (decouples decide from execute; manifest later
    powers `envsetup doctor` (diff) and `envsetup sync` (re-apply); makes resume skip Stage A).
  All multiselects default-selected; all inputs have defaults; comprehensive validation w/ clamping.
  **DECIDED: Detect + lock.** Pre-flight detection pass probes the system before the selection
  screen. Item states: '✓ already installed' (locked, informational) / selected / unselected.
  Missing REQUIRED items are locked-ON (not uncheckable-off; no partial-run escape hatch for now).
  Cascade/dependency logic only governs OPTIONAL interdependencies. Detection code is shared
  with the future `envsetup doctor`.
  **VERSION-AWARE (Peter, 2026-08-26): manifest is VERSION-PINNED. Detection = 3 states:
  not installed → install per pin/policy; installed & satisfies spec → ✓ locked/skip;
  installed & WRONG version → never silently touch; interactive resolution in Stage A's
  attended window (upgrade / keep / change pin).**
  **REFINEMENT (Peter, 2026-08-26): the detection scan is STEP ZERO of Stage A — scan the whole
  machine for every candidate item + version BEFORE any prompts, note results. For an
  installed-but-wrong-version item: per-item clack CONFIRM (upgrade? yes/no) happens BEFORE that
  item's customization screens; answering "don't touch it" SHORT-CIRCUITS its config flow
  entirely (no point configuring what won't be touched). Scan results annotate the selection UI
  (e.g. "Chrome: installed 139 → will upgrade to 140").**

STAGE B — BUILD (unattended, ~20-40 min; walk away):
  Dependency-ordered engine over the manifest: macOS defaults (instant) → Xcode CLT → Homebrew
  → formulae (bun, gh) → casks → fonts → ghostty icon → dotfiles.
  Progress bars for long steps (CLT, brew), spinners for short. Journal every step.
  FAILURE POLICY (decided): auto-retry once → if non-critical, mark failed & continue with
  everything not dependent on it → full triage UI at stage end (retry / fix-with-approval /
  manual-instructions-then-retry). Critical failures (CLT, brew) stall + macOS notification.

**DECIDED 2026-08-26: GitHub device-flow auth happens IMMEDIATELY AFTER summary confirm**
(Option 1, chosen with full STE re-pitch). envsetup implements the device flow itself in bun
with its OWN registered GitHub app identity (one-time 5-min registration by Peter, guided,
at build time — GitHub's documented pattern for CLI tools; client_id ships in binary by
design). Consequence: SSH keygen/upload + repo clones + secrets fetch + Claude settings all
run UNATTENDED inside Build; Stage C = app sign-ins + OS permission dialogs only. Two attended
moments per setup: start and end.
**Build & release pipeline APPROVED**: GH Actions on tag → bun compile darwin-arm64 + x64 →
ad-hoc codesign → attach to GitHub Release; install.sh shim: curl → arch detect → download →
chmod +x → exec (curl skips quarantine, verified); binary self-installs to ~/.local/bin.

STAGE C — CONNECT (attended, ~10 min; macOS notification pings user back):
  gh auth login → clone repos → apply templated Claude settings (marketplace paths → {devDir}/...)
  → claude login → guided manual checklist (superwhisper mic/accessibility, Cursor sign-in),
  each tool-verified where possible, not just self-reported.
  Rationale: interactive/un-automatable steps cluster at the dependency graph's end anyway.
Rejected alternative: Peter's original interleaved Phase 3 (prompt→install per app) — replaced
  because all DECISIONS can be made upfront; only APPLICATION has ordering constraints
  (e.g. repos cloned before Claude settings apply — that's the engine's dependency problem).
Resume: re-run same curl → finds manifest+journal → "resume from step N / start over".

### Dependency logic
- Unselecting a required item removes dependent optional items; reselecting restores them.
- Clack constraint: prompts are forward-only, no back-nav, no cross-prompt reactivity.
  **DECIDED (Peter, 2026-08-26): build a custom unified prompt via @clack/core** to get true
  live dependency behavior — unselect a required item and dependents vanish from optional
  sections in real time, reselect and they return. This is the flagship custom prompt;
  the horizontal radio (2-4 options) is a second, smaller custom prompt.

### Custom prompt wanted
- Horizontal radio-button select for enum settings with ≤3-4 values (model, theme, etc.),
  built on @clack/core. >4 values → stock vertical select.

### Validation
- Comprehensive validation on all inputs. Numeric settings clamped to sane ranges
  (e.g. timeout 200000 → clamp). Paths validated/expandable. Enum-checked selects.

## Git/GitHub auth — DECIDED: Both (HTTPS via gh + SSH key)
**Automation principle (Peter): automate EVERYTHING automatable — user manual steps are limited
to true auth ceremonies (browser authorize click, OS permission dialogs). Nothing else.**
Flow (Stage C): gh auth login (browser device-code; request admin:public_key scope up front)
→ gh becomes git credential helper (HTTPS day-to-day) → ssh-keygen ed25519 non-interactive
→ ~/.ssh/config (AddKeysToAgent yes, UseKeychain yes) → `gh ssh-key add` uploads key via API
(no second approval needed thanks to scope).
**DECIDED: commit signing ON via SSH, TWO fresh per-machine keys** — id_ed25519 (auth; revoke
freely on machine loss) + id_ed25519_sign (signing; registered as signing key, LEFT on the
account forever — research 2026-08-26: GitHub docs claim verification records persist after key
removal, but user reports show deleting an SSH signing key flips historical commits to
Unverified → never delete signing keys). SSHSIG namespace gives domain separation, so reuse
wouldn't be dangerous — separation is for lifecycle hygiene. Keys generated at Stage C runtime,
NEVER stored in repo; only public halves uploaded (gh ssh-key add, machine-identifying titles).
gitconfig: gpg.format=ssh, commit.gpgsign=true, user.signingkey=~/.ssh/id_ed25519_sign.pub.
**DECIDED: hardcode Peter's identity as built-in defaults** (github loriensleafs, still
editable at prompts per defaults-everywhere rule).
**DECIDED: git user.email defaults to the GitHub NOREPLY address**
(<id>+loriensleafs@users.noreply.github.com — exact form fetched via gh API during Stage C,
avoids public email exposure in commit objects; attribution+signing unaffected).
user.name default: "Peter Kloss" (assumed, Peter hasn't corrected).

## Optional apps (Group 2) — decisions so far
- Browsers **DECIDED**: Chrome STABLE ONLY (beta/dev exist on current machine but NOT in manifest)
  + SET AS DEFAULT BROWSER. Note: macOS gates default-browser change behind a mandatory user
  confirmation dialog → automatable up to one click; Stage C ceremony bucket. Research the
  cleanest method when building (candidates: `defaultbrowser` CLI / NSWorkspace API).
- Known-wanted: Ghostty, Cursor, superwhisper, Claude Code (all with custom config steps TBD).
- **Chrome is a CUSTOMIZED install item (Peter, 2026-08-26).** Requirements:
  • chrome://flags experiments — a whole bunch enabled; bake current machine's set as defaults
    (stored in Local State JSON `browser.enabled_labs_experiments` — automatable pre-launch; NOT synced)
  • Sign-in to a specific Google user — Stage C ceremony (never automate credentials)
  • Bookmarks etc. — mostly arrive via Chrome Sync AFTER sign-in (verify coverage)
  • Toolbar: specific pinned extension icons in a SPECIFIC ORDER — pinning is LOCAL, not synced
    (Preferences `extensions.pinned_extensions`, order matters; research: Chrome tracked-prefs
    MAC protection may complicate direct edits; must apply after sync delivers extensions)
  • All shown as defaults user can change during the Chrome customization screen.
  INVENTORY DONE (2026-08-26, this machine — full snapshot to be exported into repo at build):
  • Flags: 81 enabled in stable (Local State browser.enabled_labs_experiments — captured; beta/dev have 0)
  • Account: pkloss@gmail.com (profile "Peter", Default profile, sync ON)
  • Extensions (10, identical across stable/beta/dev — arrive via sync): Claude, React DevTools,
    Apollo Client Devtools, Lighthouse, Postman Interceptor, 1Password, ColorPick Eyedropper,
    Color Picker for Chrome, Google Docs Offline, Chrome Web Store Payments
  • Pinned toolbar RESOLVED: Peter meant Chrome's NATIVE toolbar buttons (Preferences
    toolbar.pinned_actions), 11 in exact order: kActionShowChromeLabs, kActionTabSearch,
    kActionCopyUrl, kActionRouteMedia, kActionSidePanelShowBookmarks,
    kActionSidePanelShowHistoryCluster, kActionShowDownloads, kActionShowPaymentsBubbleOrPage,
    kActionNewIncognitoWindow, kActionTaskManager, kActionDevTools.
    Related prefs: tab_search.pinned_to_tabstrip=true, browser.pin_split_tab_button=false.
    Extension pins: keep just Claude (extensions.pinned_extensions).
  • Bookmarks: none needed — Peter confirmed they arrive via sign-in/sync.
  • 1Password extension exists in his synced extension set despite GPM decision — sync-managed,
    not our scope; noted only.
  NOTE: 1Password EXTENSION present in Chrome despite Google Password Manager decision — flagged.
- Dev tools **DECIDED 2026-08-26**: VS Code IN (fallback editor alongside Cursor); Postman OUT;
  containers → **PODMAN** (Peter's pick with full research context — OrbStack was recommended;
  he chose Podman's open-source/daemonless model accepting compose rough edges).
  Build-time research: brew podman + podman machine init sizing + Podman Desktop GUI yes/no +
  docker-CLI compat (alias/socket/podman-mac-helper).
- Everyday apps **DECIDED 2026-08-26**: Claude desktop app IN. Spotify/VLC/notes apps OUT.
- **Podman is a CUSTOMIZED item (Peter)**: define config defaults like the Claude Code step —
  machine CPU/RAM/disk sizing, GUI yes/no, docker-compat — surfaced as adjustable defaults.
- Peter re-emphasized: research BEST install method for every app here (Zoom, Discord, VS Code,
  Podman, Claude desktop) at build time, not just brew-by-default.
- **ALL Group 2 apps get a customization/defaults pass (Peter, 2026-08-26)** — same treatment
  Claude Code and Chrome got: research worthwhile config for EACH (Ghostty, Cursor, VS Code,
  superwhisper, Claude desktop, Raycast, CleanShot X, Zoom, Discord, Podman, Typora), present
  as adjustable defaults in that app's Stage A screen. Claude Code + Chrome already specced.
- **Typora ADDED** (markdown editor, customized item). License key provided by Peter:
  «typora license — in .secrets.local.json (untracked) until age store exists» — wants AUTOMATIC license application during setup.
  ⚠ SECURITY: key must NOT live in the repo if repo is/becomes public — secrets mechanism
  decision pending (options: private repo, local secrets file, keychain, env). Research how
  Typora activation works (file? defaults? online dialog?) at build time.
- CLI tools **DECIDED 2026-08-26** (a-la-carte from researched proposal): **jq, delta, lazygit,
  dust** — all via brew. Everything else offered was declined (ripgrep/fd/fzf/eza/bat/zoxide/
  yq/wget/btop/tldr/hyperfine; tmux/starship/httpie deliberately skipped in proposal).
- **Chrome PWAs ADDED (Peter)**: install Gmail, Google Drive, Google Calendar as Chrome web
  apps and put them in the DOCK. Research at build: headless/scripted PWA install mechanism
  (chrome flags / chrome://apps automation), lands in ~/Applications/Chrome Apps/, must
  sequence AFTER Chrome install + sign-in; then dockutil places them (ties into parked
  Dock-composition topic).
- **DECIDED: CleanShot X** (research: community-standard capture/annotate flow, hotkey-driven,
  ~$29 one-time; license-key entry = Stage C ceremony; replaces his Preview annotation habit).
- **DECIDED: Raycast** (tentative yes from Peter — Spotlight replacement, clipboard history,
  snippets, window mgmt, extensions; free core).
- **DECIDED: Google Password Manager** (built into Chrome, no install; arrives with Chrome
  sign-in; passkeys + optional e2e-encryption PIN. Research-confirmed no standalone macOS app).
- Comms **DECIDED 2026-08-26: Zoom + Discord in; Slack out** (Peter's multiselect also touched
  "none of these" — interpreted as Zoom+Discord yes since both were explicitly selected; flag
  for one-line confirmation).
- RESEARCH QUEUE: Raycast + CleanShot X best install method AND worthwhile config to bake in
  (Peter: "any configuration worth setting should be part of it") — full dive at build time.
  Both are brew casks at minimum; Raycast has settings export/sync; CleanShot needs license key.
- PARKED TOPIC (Peter): auto-compose the macOS Dock with chosen apps in a SPECIFIC ORDER once
  app list stabilizes (tool: dockutil — research when reached).

## Group 3: repos — DECIDED 2026-08-26 (Peter's explicit spec)
Clone from github.com/acmelabs-15 into `{devDir}/ACMElabs/`:
  skills, ask-user-question, plugin-kit, code-review, code-simplifier
Structure envsetup must produce:
  {devDir}/ACMElabs/
    .claude-plugin/marketplace.json   ← GENERATED by envsetup (marketplace name "ACMElabs",
                                        listing the cloned plugins as siblings)
    skills/  ask-user-question/  plugin-kit/  code-review/  code-simplifier/
Settings templating: extraKnownMarketplaces.ACMElabs.source.path →
  {devDir}/ACMElabs/.claude-plugin/marketplace.json (replaces hardcoded /Users/peter.kloss/...).
enabledPlugins expect ask-user-question@ACMElabs, code-review@ACMElabs, code-simplifier@ACMElabs,
  skills@ACMElabs (4 of 5 repos; plugin-kit cloned but not an enabled plugin).
Build-time research: exact marketplace.json schema (check plugin-kit repo / Claude Code docs).
Personal (loriensleafs) repos: NONE selected — Peter's spec listed only the 5 above, overriding
  the curated proposal (ai-agents/brain/pinky/etc all excluded). Reference clones (tanstack) =
  separate pending question. This ordering constraint feeds Stage C: clones must precede Claude
  settings apply (marketplace path must exist).

### Reference clones — DECIDED 2026-08-26
Into {devDir}/reference/ (dir name TBD-confirm), with OWNER-PREFIXED directory names to avoid
collisions (Peter's rule; his examples):
  basicmachines-co/basic-memory   → basic-memory
  addyosmani/agent-skills         → addy-osmani-agent-skills
  mattpocock/skills               → matt-pocock-skills
  rjmurillo/ai-agents             → rj-murillo-ai-agents
### Selection-aware settings generation (Peter, mid-turn 2026-08-26)
If a user UNCHECKS an ACMElabs repo at setup time, the generated Claude settings.json must
OMIT that plugin from enabledPlugins (and the generated marketplace.json omits it too).
Settings/marketplace generation is driven by the actual selection, not a static template.

## Phase A: per-app config passes
### Ghostty — DECIDED 2026-08-26
Setup-screen adjustable defaults (approved): font = JetBrains Mono Nerd Font (font MUST be
installed before Ghostty config applies — first real cross-item dependency edge); font-size 13;
theme default = **"One Dark Two"** (from his existing config, surfaced on screen); shell
integration on; quick terminal WITH default keybinding; copy-on-select + paste protection;
window padding + remember size; macOS option-as-alt.
Existing config found at ~/Library/Application Support/com.mitchellh.ghostty/config.ghostty:
  theme = One Dark Two
  shell-integration-features = cursor,title,path,sudo,ssh-env,ssh-terminfo
Rule: everything in his existing file goes INTO the generated config; only the approved
screen-items are user-adjustable at setup time (rest applied silently).

### Cursor — DECIDED 2026-08-26 (installer OWNS config; sync not relied on)
Context: his real Cursor setup was lost when Highspot (former employer) remotely wiped his work
machine — explains /Users/peter.kloss paths in reference files and why this machine is stock.
- Theme: One Dark Pro (ext: zhuangtongfa.material-theme) — pairs with Ghostty One Dark Two
- Icons: Material Icon Theme (ext: pkief.material-icon-theme)
- Editor font: (assume JetBrains Mono NF to match Ghostty — confirm in extensions question)
- Models enabled: ONLY Haiku 4.5, Opus 5, Sonnet 5, Fable 5; default agent model = Opus 5
  (research at build: whether model config is file-settable or app-state/manual-guided)
- Anthropic API key: he HAS one, wants it captured/applied — **SECRETS DESIGN TOPIC now has 2
  items (Typora license + Anthropic key). Design a secrets mechanism in Phase C** (candidates:
  macOS Keychain, prompt-once-at-setup, private file; NEVER in repo).
- Extensions DECIDED 2026-08-26: Bun for VS Code (oven.bun-vscode), Go (golang.go),
  Error Lens, Pretty TypeScript Errors, ESLint, Prettier, GitLens, Path Intellisense, DotENV,
  **+ Claude Code IDE extension** (Peter: "connect claude code and cursor" — the Anthropic
  IDE integration; verify exact marketplace id at build). Tailwind IntelliSense: OUT (skipped).
  Notes: TS language support is BUILT-IN to Cursor (no extension needed; no conflict with Bun
  ext — that's runtime/debug). Syntax highlighting TS/Go: built-in + Go ext cover it.
  **Config precedence requirement (Peter): ESLint/Prettier must use the PROJECT's config file
  when present, IDE defaults only as fallback** (their default behavior; encode explicitly in
  settings at build). Editor font: JetBrains Mono NF (no objection raised).

### VS Code — DECIDED 2026-08-26: MIRROR CURSOR exactly (same theme/icons/font/extensions/
settings incl. Claude Code IDE ext; single shared config definition in the manifest, applied
to both editors).

### superwhisper — DECIDED 2026-08-26 (captured from this machine)
Defaults: push-to-talk = hold RIGHT-COMMAND (carbonKeyCode 54/modifiers 256);
alwaysShowMiniRecorder=1; showApplicationInDock=0; showExperimentalModels=1; mode=default;
account pkloss@gmail.com. Stage C: sign-in + mic/accessibility permissions (guided,
tool-verified). Modes/custom vocab live in sqlite (not templated — rebuilt in-app).
**License key (Peter): «superwhisper license — in .secrets.local.json (untracked) until age store exists» — SECRETS STORY item #3**
(with Typora license + Anthropic API key). Research at build: how superwhisper license
activation is applied programmatically.

### Typora — DECIDED 2026-08-26
License auto-applied (key in secrets story). Theme: **Vercel** (theme.typora.io/theme/Vercel/,
by tecladochen, actively maintained; installer drops CSS into theme folder + auto-installs its
font deps Geist + Inter → ADD to Group 4 fonts). Autosave OFF. Everything else default.
Research at build: Typora license activation mechanism + theme folder path + CSS install.

### Claude desktop / Zoom / Discord — DECIDED 2026-08-26: install + Stage C sign-in only.
Zoom additionally: mic/screen-share permissions in final checklist. Peter asked whether Claude
Code settings carry to Claude desktop — answered: NO, separate config systems; account sign-in
covers shared account features; desktop MCP config is its own file (nothing specced needs it).

### Raycast — DECIDED 2026-08-26
Install + first-launch onboarding; **Raycast takes ⌘Space, Spotlight's shortcut disabled**
(installer automates both); clipboard history hotkey ⌥V; starter extensions via deeplinks:
Brew search, GitHub, Kill Process. NO cloud sync / .rayconfig for now (adopt an export in
`envsetup sync` later once he's shaped it). Build research: symbolic-hotkeys defaults write for
Spotlight disable + raycast deeplink install format.

### CleanShot X — DECIDED 2026-08-26 (Peter PURCHASED during session)
**License key: «cleanshot license — in .secrets.local.json (untracked) until age store exists» — SECRETS STORY item #4.**
Config (approved as proposed): take over system screenshot shortcuts (⇧⌘3/4/5); save to
~/Screenshots; quick-access overlay after capture; PNG; no window shadows; freeze-screen on
area select; NO auto-copy to clipboard; launch at login. Research at build: CleanShot defaults
domain (pl.maketheweb.cleanshotx?) writable keys + programmatic license activation.

### Podman — DECIDED 2026-08-26
VM defaults (adjustable): 4 CPUs / 8GB mem / 100GB disk; docker compat helper + socket +
`docker`→`podman` shell alias (alias line owned by dotfiles step); machine start ON DEMAND
(not at login); NO Podman Desktop GUI.
**PHASE A COMPLETE (2026-08-26): all 13 apps specced.**

## Group 4: fonts — DECIDED 2026-08-26
- JetBrains Mono Nerd Font (also in his pinned zip list — single source at build, dedupe)
- Fira Code Nerd Font
- Google Sans (fonts.google.com/specimen/Google+Sans — install method research at build)
- From HIS repo github.com/loriensleafs/fonts: dankmono (all), hack (all), ligahack (all)
  → that repo becomes a clone/fetch source during font install
- Geist + Inter (ADDED — Typora Vercel theme dependencies)
- Nerd Fonts v3.5.1 pinned release zips (ryanoasis/nerd-fonts):
  GoogleSansCode.zip, JetBrainsMono.zip, Noto.zip, RobotoMono.zip
Build-time research: brew font casks vs his pinned v3.5.1 zips (version-pinning policy says
honor pins; casks track latest — decide per font, present to Peter), font install location
(~/Library/Fonts), dedupe JetBrainsMono.

## Group 5: macOS settings — in progress
### Finder — DECIDED 2026-08-26: ALL NINE:
show hidden files; show all extensions; path bar; status bar; folders-on-top; new windows →
home; search current folder; no extension-change warning; show ~/Library.
**#10 ADDED (Peter, during Ghostty pass): default view style = COLUMN view always
(FXPreferredViewStyle=clmv).**
### Desktop Quick Actions via Apple Shortcuts (Peter, 2026-08-26) — right-click any file/dir:
  1. Copy full absolute path to clipboard
  2. Open Ghostty at the dir (file → its containing dir)
  3. Open in Cursor
**DECIDED 2026-08-26: Automator .workflow Services (silent drop-ins to ~/Library/Services)** —
Peter chose silent over Shortcuts-app visibility after research showed Shortcuts import is
GUI-only (1 click per shortcut). Same right-click Quick Actions menu either way.
### Dock — DECIDED 2026-08-26 (Peter's spec; NOTHING beyond what's listed):
- Position bottom; recents OFF; trash + minimized windows shown normally (NO minimize-into-icon,
  NO auto-hide, NO size/animation changes).
- Dock apps (ONLY these): Finder, Apps, System Settings, Ghostty, Chrome, Cursor, Typora,
  + the 3 Chrome PWAs (Gmail, Google Calendar, Google Drive).
- **Ghostty in Dock must use the native macOS Terminal.app icon** — the Icon\r/NSWorkspace
  technique from this session (2026-08-25) is now a REQUIRED setup step. Note: cask upgrades
  wipe it; sync/doctor should re-detect+reapply. The icon is READ FROM THE TARGET MACHINE at
  runtime (/System/Applications/Utilities/Terminal.app/.../Terminal.icns) — nothing bundled;
  Peter's old custom icns was removed from the repo 2026-08-26 (recoverable from git history).
- PWAs now FOUR: Gmail (Dock label "Mail"), Google Calendar, Google Drive, Google Keep (label
  "Notes") — custom labels require renaming the installed PWA .app bundle (research at build).
- Claude desktop ADDED to Dock.
- Order APPROVED with additions — proposed final (pending nod): Finder · Apps · System Settings ·
  Ghostty · Cursor · Typora · Claude · Chrome · Mail · Calendar · Drive · Notes.
### Keyboard/input — DECIDED 2026-08-26: ONLY reverse scroll direction (disable "natural
scrolling", com.apple.swipescrolldirection=false). ALL other input tweaks declined (key repeat,
accent menu, autocorrect, tab focus, tap-to-click, three-finger drag — none).
### Dock order APPROVED (no objection raised): Finder · Apps · System Settings · Ghostty ·
Cursor · Typora · Claude · Chrome · Mail · Calendar · Drive · Notes.
### Screenshots: macOS-level settings SKIPPED (CleanShot X owns screenshots; its config pass
covers save location/format). Misc catch-all: DECLINED ALL (battery %, hot corners, night
shift, sounds, password-after-sleep, etc.) — **GROUP 5 IS CLOSED 2026-08-26.**

## Runtimes — DECIDED 2026-08-26
- bun: locked required (Claude hooks run via bun; Peter is bun-first for ALL his TS work).
  **Peter: critical that the NEWEST bun is installed.**
  **DECIDED: official installer** (curl -fsSL https://bun.com/install | bash → ~/.bun).
  Research: docs-primary method; `bun upgrade` self-updates day-zero; docs explicitly say brew
  installs forfeit self-upgrade ("use brew upgrade bun instead"). Suppress installer's .zshrc
  edit — OUR dotfiles step owns the ~/.bun/bin PATH line. doctor checks version natively.
- Go: YES (his gopls-lsp Claude plugin needs the toolchain).
  **DECIDED: via brew** (re-confirmed after research 2026-08-26: official docs recommend .pkg
  and don't mention brew — but .pkg has NO upgrade automation, while brew rides `brew upgrade`;
  Go ≥1.21 toolchain directive auto-downloads newer toolchains per go.mod, so the installed go
  is a bootstrap whose exact version barely matters. Peter confirmed brew with full context.)
- Node.js: YES — not for his own work (pure bun) but for community tooling that hardcodes node.
  **DECIDED: via fnm** (brew install fnm → `fnm install --lts` + set default; shell hook line
  owned by our dotfiles step). Research: community 2026 consensus — plain brew node discouraged
  (single system version, surprise major bumps); fnm = Rust nvm-compatible, ~15ms hook,
  .nvmrc auto-switching; Volta's package.json pinning only pays off for node teams (his are bun);
  mise only wins if managing ALL runtimes, but per-tool idiomatic methods already chosen.
- Python: YES via uv (manages pythons/venvs/tools; modern single-binary answer).
  **DECIDED: uv via standalone installer** (docs-primary; `uv self update` explicitly disabled
  under brew per docs). Dotfiles own PATH line.
- gh: **DECIDED: via brew** (research-confirmed: official cli/cli README lists brew FIRST for macOS).
- NOTE (Peter): the self-updater⇒official/no-self-updater⇒brew pattern held for these cases but
  is NOT a standing rule — EVERY future tool still gets individually researched.
- Rust: NO.
- Rosetta 2: **SKIP — on-demand only** (research 2026-08-26: WWDC 2026 confirmed macOS 27 is
  the LAST full-Rosetta release; macOS 28 keeps only a games-focused remnant. Deprecated
  component doesn't belong in a future-machines manifest). doctor should learn to diagnose
  'bad CPU type in executable' + offer `softwareupdate --install-rosetta --agree-to-license`
  while it still exists; any future item truly needing Rosetta declares it as ITS dependency
  per the transitive-prereq principle.

## Secrets — DECIDED 2026-08-26 (research-reversed from private-repo lean)
**age-ENCRYPTED secrets file committed to the (public-safe) repo** — the chezmoi-validated
community pattern. Flow: clack password prompt for ONE passphrase per new machine (passphrase
lives in Google PM) → decrypt in memory → Anthropic API key → macOS Keychain (`security`);
license keys (Typora, superwhisper, CleanShot) applied to their apps → unlock cached locally
so doctor/sync never re-prompt. `envsetup secrets edit` helper: edit → re-encrypt → commit.
Forgotten passphrase = re-encrypt with new one (all 4 secrets reissuable). Build research:
age-encryption npm pkg bun-compat vs Bun crypto scrypt+AES-GCM. See RESEARCH doc §9.
The 4 current secrets are recorded in this PLAN under their app sections (MOVE into encrypted
store at build time, then SCRUB from PLAN.md before the plan ever leaves this machine).

## Manifest + journal architecture — APPROVED 2026-08-26 (research-backed, see RESEARCH §11)
manifest.json (XDG config via env-paths; Zod-versioned w/ migrations, verzod-style) = decisions;
journal.jsonl (XDG state; append-only step events) = execution truth + resume + audit trail;
one file per ITEM declaring detect/install/configure/verify/deps/ceremonies + Zod config schema;
execution order = toposort of declared deps. Packages: age-encryption (typage — OFFICIAL age TS
impl, bun-compatible) for secrets; env-paths; Zod 4; NO `conf` (would split schema systems).

## Claude Code customization step (flagship)
Reference files: /Users/peterkloss/Desktop/claude-reference-files/ (settings.json + hooks/{notify.ts,subagent-statusline.ts})
  → copy these INTO the repo as templates; Desktop copy is not durable.
Settings exposed to user (from Peter's list): model, fallbackModel, effortLevel,
  alwaysThinkingEnabled, agent, autoMemoryEnabled, autoDreamEnabled, permissions
  (defaultMode/deny/ask), selected env flags (friendly labels, e.g.
  CLAUDE_CODE_ENABLE_AUTO_MODE → "Enable auto mode" true/false),
  enableAllProjectMcpServers, plugins enable/disable, theme, viewMode, cleanupPeriodDays.
Not exposed: the rest (attribution, spinnerVerbs, statusLine cmd, etc.) — applied as-is.
Env flags displayed with friendly names + typed prompts (bool → radio, number → validated input).
TEMPLATING REQUIRED: settings.json contains machine-specific absolute paths
  (/Users/peter.kloss/Dev/ACMElabs/... — note DIFFERENT username from this machine) →
  must be generated from Dev-dir answer + $HOME, never copied verbatim.
  CONFIRMED by Peter: local-file marketplaces come from HIS git repos → the repo-clone step
  provides their paths; template maps them to {devDir}/{repo}/... after cloning.
**HOOK SCRIPTS ARE INCLUDED (Peter corrected 2026-08-26)**: hooks/notify.ts +
subagent-statusline.ts ARE part of the installation — copied into ~/.claude/hooks/ so the
settings.json hook blocks (hooks.Notification, hooks.Stop, subagentStatusLine) work as-is.
(His earlier "don't include the bun scripts" remark superseded by explicit correction; likely
meant: don't surface them as user-adjustable OPTIONS in the customization prompts.)
statusline.sh RESOLVED (2026-08-26): lives in github.com/acmelabs-15/.claude (PRIVATE repo —
anonymous clone refused; machine has no GitHub creds yet; access question pending).
Requirements from Peter:
  • Convert statusline.sh to a PURE BUN script when we build the Claude step
  • Later (not now): he may want to change what the statusline displays
  • Repo REVIEWED (2026-08-26). It's a full ~/.claude home snapshot (his work machine).
    **DECIDED: include NOTHING from it for now except statusline.sh** (that earlier decision
    stands: convert to pure bun — bonus: drops its jq dependency). Explicitly excluded for now:
    agents/ (orchestrator.md + bun-ts-engineer), 17 skills, 3 commands, extra hooks
    (drift-detector, feedback-capture, github-capture, pre/post-compact, session-auto-update),
    keybindings.json, home-specs/ (global CLAUDE.md etc). Revisit only if Peter reopens.
  • **KNOWN DANGLING REFERENCE (Peter chose "leave as is")**: Desktop settings.json has
    "agent": "orchestrator" but orchestrator.md is excluded → on fresh machines that setting
    points at a missing agent. Peter accepts this deliberately (may add the file himself later).
  • Repo clone lives at scratchpad/acmelabs-claude this session; statusline.sh (bash+jq,
    pill-style) is the conversion source.

## Repo
- **DECIDED**: repo `env-setup` on github.com/loriensleafs, binary `envsetup`.
  (Peter rejected themed names — wanted literal/descriptive. Chose envsetup in round 3.)
- **DECIDED**: persistent CLI, not run-once. Bootstrap is flagship command; `envsetup doctor`
  (drift check) and `envsetup sync` (re-apply) come later. @bomb.sh/tab back in scope.

## Item lists (TO BE BUILT WITH PETER — current knowledge)
Known from this machine so far:
- Casks: ghostty, cursor, superwhisper (+ Chrome stable/beta/dev present but installed manually)
- Claude Code via native installer (~/.local/bin/claude), NOT brew
- Ghostty custom icon saga: custom icns + NSWorkspace.setIcon Icon\r technique;
  currently using /System/.../Terminal.icns art; icon is wiped by cask upgrades.
  Peter's custom icns saved at ~/mac-setup/assets/ghostty-custom.icns. May become a setup step.
- Shell: zsh, ~/.zshrc (adds ~/.local/bin to PATH), ~/.zprofile (brew shellenv)
- No git identity configured globally yet on this machine (!). gh CLI not installed.
- Repos to clone: TBD (ACMElabs is one — plugin marketplace depends on it; tanstack/table as reference-clone example)
- Fonts: TBD
- macOS defaults: show hidden files in Finder confirmed wanted; rest TBD

## Research queue (comprehensive dives Claude will do; results get recorded here)
- [x] clack v1.7 full API — DONE, see RESEARCH-clack-citty-bun.md
- [ ] (superseded line) clack v1.7 full API: group/groupMultiselect/tasks/taskLog/progress/spinner/stream;
      what task+progress compatibility actually looks like; custom prompts via @clack/core
- [ ] Resumable-workflow state design (journal format, where it lives, idempotency per step)
- [ ] bun build --compile: cross-compile matrix, codesign/entitlements needs for arm64,
      GitHub Actions release pipeline, binary size reality check (~60MB)
- [ ] Non-interactive Xcode CLT install technique + progress reporting
- [ ] Homebrew non-interactive install (NONINTERACTIVE=1) + sudo handling via clack password prompt
- [ ] macOS `defaults write` catalog for the settings group
- [ ] Font installation via brew font casks
- [ ] gh auth login flow orchestration (needed before cloning private repos)
- [ ] Claude Code headless install + settings templating + plugin marketplace bootstrapping order

## Session log
- 2026-08-25/26: Ghostty icon fix (NSWorkspace.setIcon), installed cursor+superwhisper casks,
  distribution options discussed, Option B chosen, full workflow spec from Peter captured above.
  Earlier ~/mac-setup Brewfile scaffolding (pre-dating this plan) is superseded.

## Script-language rule (Peter, 2026-08-26)
Every script this project writes or installs — Automator Quick Action payloads, hooks, helpers —
is PURE BUN, always. No Node, no Python, and shell only as unavoidable glue: the Automator
.workflow wrapper may exec `bun <script>`, and install.sh is necessarily POSIX sh because it
runs before bun exists (the single sanctioned exception; it does nothing but fetch + exec).

## Repo structure — DECIDED 2026-08-26 (research-backed; Peter approved)
Single package, NO monorepo (community: workspaces only earn complexity with interdependent
packages; Bun workspaces make a later split cheap — documented migration path). Feature-first
layout (2026 consensus, over type-first): src/index.ts (citty entry), src/commands/ (one file
per subcommand — citty-ecosystem convention), src/items/<item>/ (one module per installable
thing = the feature dirs, each holding its detect/install/configure/verify + Zod schema +
assets/), src/ui/ (custom clack prompts), named shared homes (src/manifest/, src/secrets/) as
built — no lib/ junk drawer. kebab-case filenames. Peter's calls: spikes/ → test/spikes/
(PTY-harness seeds, delete when real tests supersede); templates/ dissolved into per-item
assets/ dirs (they're item payloads, not scaffolding templates).

## Testing convention (Peter, 2026-08-26)
Test files live in a `__tests__` directory that is a SIBLING of the file under test, named
`<original-filename>.test.ts`. Example: src/manifest/schema.ts → src/manifest/__tests__/
schema.test.ts. (test/spikes/ predates this rule and holds research spikes, not unit tests;
it dies when real tests supersede it.)

## Core spine — BUILT 2026-08-26 (25 tests green, typecheck clean)
- src/paths/ — XDG dirs (~/.config/envsetup, ~/.local/state/envsetup) honoring XDG_* overrides.
  DEVIATION from earlier decision: env-paths DROPPED — on macOS it returns Library/* (GUI-app
  convention) while dev CLIs (git, gh, ghostty, claude) use ~/.config; we follow the dev-CLI
  norm with a 20-line module instead.
- src/manifest/ — Zod schema (version-pinned, identity/locations/items), migration chain
  (MIGRATIONS registry, future-version guard w/ upgrade message), Bun.file store.
- src/journal/ — Zod-validated JSONL events, torn-line-tolerant reader, computeResume
  (latest run only; failed-then-retried steps count as completed; RUN_END_STEP marker).
- src/items/ — Item interface (detect/install/configure/verify, deps, ceremonies, per-item Zod
  configSchema + defaultConfig, defineItem typing helper), deterministic Kahn toposort
  (cycle + unknown-dep errors), ItemRegistry with executionOrder(selection) that ignores
  deps outside the run.
- Tests follow Peter's sibling-__tests__/<name>.test.ts convention.
- Claude hook assets excluded from project typecheck (they're payloads, not source).

## statusline — CONVERTED to pure Bun 2026-08-26
src/items/claude-code/assets/statusline.ts replaces statusline.sh (deleted). Port verified
byte-identical modulo runtime terminal-width detection (each process probes its own TTY
ancestry). jq dependency gone. settings.template.json statusLine.command → `bun ~/.claude/statusline.ts`.
install.sh clarified for Peter: the shim exists ONLY to arch-detect/fetch/exec the compiled
binary (which itself needs no bun); it never installs bun — bun is installed later BY envsetup
as a regular item (Claude hooks need it).

## Stage A UI — BUILT 2026-08-26 (36 tests green + PTY smoke pass)
- src/ui/unified-select-state.ts — PURE state machine (unit-tested): sectioned rows, locked
  "on"/"installed" states, hint annotations, LIVE dependency filtering (requires: [] — an
  option is visible iff every requirement is selected/locked/installed; hidden dependents keep
  selection MEMORY and return in their previous state; result() excludes hidden), cursor that
  skips headers/locked rows, wraps, and recovers when its row disappears.
- src/ui/unified-select.ts — thin @clack/core Prompt shell over the state machine.
- src/ui/horizontal-radio.ts — 2-4 option inline radio (left/right cycle, clack-styled).
- src/ui/theme.ts — clack-language symbols shared by custom prompts.
- src/ui/demo.ts — runnable interactive demo: `bun src/ui/demo.ts` (Peter can try it).
- test/spikes/ui-demo.exp — PTY smoke test proving live dep-filtering + radio end-to-end
  (toggles Ghostty off/on, verifies ghostty-config vanishes/returns, radio picks medium).

## First items + real doctor — BUILT 2026-08-26 (48 tests green)
- src/exec/run.ts — injectable Runner (Bun.spawn wrapper); ItemContext now carries `run` so
  every item is unit-testable with mocked commands.
- src/items/factories/brew.ts — brewFormula/brewCask factories (auto homebrew dep, version
  parsing, custom brew names e.g. delta→git-delta).
- src/items/defs/ — xcode-clt (marker-file + softwareupdate headless install technique),
  homebrew (NONINTERACTIVE official installer; orchestrator owns sudo keep-alive), bun + uv
  (official installers with PATH-edit suppression — dotfiles own PATH lines), node-lts (via
  fnm: install --lts + default lts-latest).
- src/items/all.ts — buildRegistry(): required spine (clt, brew, bun, uv, gh, go, fnm, node)
  + Peter's CLI picks (jq, delta, lazygit, dust). Apps/casks arrive next.
- `envsetup doctor` is REAL: live detection over the registry with versions. Verified on this
  machine (correctly found CLT/brew/bun/gh, correctly flagged missing uv/go/fnm/node/jq/...).
- Fixed citty quirk: root run() fires even after a subcommand — guarded by rawArgs check.

## Group 2 apps + fonts registered — BUILT 2026-08-26 (50 tests green, 31 items in registry)
- brewCask factory gained .app-bundle fallback detection: manually-installed apps read as
  installed with version from Info.plist, marked "(not brew-managed)" — verified live
  (Chrome 152, Typora 1.14.9 — Peter installed Typora himself mid-project).
- fontZip factory: pinned-URL zip → *.ttf/*.otf into ~/Library/Fonts (honors version pins).
- Registry now: required spine + jq/delta/lazygit/dust + all Group 2 casks (ghostty, cursor,
  vscode, chrome, superwhisper, raycast, cleanshot, zoom, discord, typora, claude-desktop,
  podman) + fonts (jetbrains-nf, fira-nf, geist, inter via brew; google-sans-code/noto/
  roboto-mono via pinned v3.5.1 nerd-font zips). All 16 brew names verified against brew
  before use. Google Sans (non-code) + Peter's fonts repo (dankmono/hack/ligahack) still
  pending: repo needs auth flow; config-only items (ghostty config/icon, chrome, dock,
  defaults, quick actions, PWAs) arrive with the orchestrator.

## Stage B orchestrator — BUILT 2026-08-26 (59 tests green)
src/orchestrator/orchestrator.ts — UI-agnostic engine (events interface; clack layer attaches
at bootstrap wiring): topo-ordered execution over the selection; per-step journaling;
detection short-circuit (installed & satisfies → skipped-installed); DECIDED failure policy
encoded — maxAttempts=2 (one auto-retry), REQUIRED failure aborts the run (journals RUN_END
failed), optional failure continues with transitive dependents skipped-with-reason;
resume continues the same runId when the latest run didn't finish, skipping its completed
steps; configure() runs after install with schema-validated manifest config (defaultConfig
fallback; invalid config fails the step — clamping is the prompt layer's job).
Full test coverage: happy path, skip-installed, retry, dependent-skipping, abort, resume
(same-runId continuation), config validation paths, transitive dependents.

## Bootstrap flow — WIRED 2026-08-26 (E2E dry-run passes on this machine)
`envsetup` (bare) now runs the real Stage A: detection scan (7s for 31 items) → identity +
Dev-dir prompts (hardcoded defaults) → unified selection screen fed by LIVE detection
(installed items render locked-✓ with versions; required-missing locked-on) → summary note →
confirm ("nothing has touched the system yet" honored) → manifest written → orchestrator with
clack spinner rendering (per-step ✓/✗/↷ outcomes) → triage note on failures / abort message
on required failure. `--dry-run` stops after the manifest + prints execution order (safe to
run on any machine). Resume: unfinished journal + manifest → offer resume, same runId.
Manifest semantics fix: already-installed items record selected=true (machine definition,
not install work-list — doctor/sync depend on this). identity.email = pending-noreply
placeholder until Stage C auth resolves the real address.
E2E: test/spikes/bootstrap-dry.exp — full PTY drive of the dry-run flow (proven green).
Config-prompt hook point marked in bootstrap for per-app screens (arrive with app items).
