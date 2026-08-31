---
name: run-src-auth
description: Run, invoke and smoke-test src/auth — the GitHub device-flow client and Keychain token handling — without the network. Use when asked to run, test or drive the auth module.
---

`src/auth/` implements GitHub sign-in: `github-device-flow.ts` (device code → poll → token,
`noreplyEmail`) and `auth-ceremony.ts` (Keychain storage, `gh` handoff). Drive it with
`src/auth/.claude/skills/run-src-auth/driver.ts`: it feeds a **mocked `fetch`** through the
real `requestDeviceCode` / `pollForToken` (pending → slow_down → token; access_denied), checks
`noreplyEmail`, and probes the Keychain **read-only** (`security find-generic-password`),
printing only present/absent. It never runs `githubAuthCeremony` or hits the network.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/auth/.claude/skills/run-src-auth/driver.ts
```

Expected:

```text
src/auth driver — client Ov23liQUd4gIaj3ejiNo, scopes "repo workflow admin:public_key read:org user:email"

  ✓ requestDeviceCode parses the device code
  ✓ pollForToken honours pending + slow_down, then returns the token — 3 polls, 4 requests
  ✓ access_denied throws — sign-in was denied in the browser
  ✓ noreplyEmail
  Keychain service "envsetup-github": token present (read-only probe)

PASS
```

## Direct invocation

```bash
bun -e 'import {noreplyEmail} from "./src/auth/github-device-flow.ts"; console.log(noreplyEmail({login:"octocat",id:583231}))'
# 583231+octocat@users.noreply.github.com
```

## Test

```bash
bun test src/auth/__tests__       # 4 pass, 0 fail
```

## Gotchas

- The real sign-in is `bun src/index.ts auth` — it opens a browser device-flow and writes the
  Keychain. That is a human step, not a smoke test; the driver's mock covers the logic.
