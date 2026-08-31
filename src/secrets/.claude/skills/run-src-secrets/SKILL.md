---
name: run-src-secrets
description: Run, invoke and smoke-test src/secrets — the age-encrypted secret store (encrypt/decrypt, secret slots, loader) — with throwaway data only. Use when asked to run, test or drive the secrets module.
---

`src/secrets/`: `age-store.ts` (`encryptSecrets`/`decryptSecrets`, passphrase/scrypt age) and
`secrets.ts` (`SECRET_KEYS` slots; `loadSecrets` reads `$ENVSETUP_SECRETS_FILE`, then
`~/.config/envsetup/secrets.json`, then `.secrets.local.json`). Drive it with
`src/secrets/.claude/skills/run-src-secrets/driver.ts` — round trip with a **throwaway**
passphrase and fake values, wrong-passphrase rejection, loader pointed at a temp file. It never
reads `secrets.json.age` or the real decrypted cache, and never prints a secret.

All paths are relative to the repo root.

## Run (agent path)

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun src/secrets/.claude/skills/run-src-secrets/driver.ts
```

Expected:

```text
  secret slots: typora, superwhisper, cleanshot, anthropic-api-key, better-display
  ✓ encryptSecrets → age armor-less binary starts with 'age-encryption.org/v1'
  ✓ decryptSecrets round trip
  ✓ wrong passphrase is rejected — no identity matched any of the file's recipients
  ✓ loadSecrets reads ENVSETUP_SECRETS_FILE first — …/envsetup-secrets-XXXX/secrets.json
  ✓ getSecret(missing) → null

PASS
```

## Test

```bash
bun test src/secrets/__tests__     # 5 pass, 0 fail (~3 s: scrypt)
```

## Gotchas

- `bun src/index.ts secrets list|show|reveal|copy|set|unlock` prompt for the passphrase and
  block — only `secrets --help` is safe non-interactively.
- Hard rule: never put a real key — even partial — in a tracked file or commit; the driver
  uses `not-a-real-key`.
