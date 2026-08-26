# envsetup

One-command interactive Mac environment setup. Bootstraps a fresh machine — apps, runtimes,
fonts, repos, macOS settings, and app customizations — from a single curl command, then keeps
it in shape with `envsetup doctor` and `envsetup sync`.

```sh
curl -fsSL https://raw.githubusercontent.com/loriensleafs/env-setup/main/install.sh | sh
```

Status: scaffold. Design + all decisions: [docs/PLAN.md](docs/PLAN.md).
Research foundation: [docs/RESEARCH-clack-citty-bun.md](docs/RESEARCH-clack-citty-bun.md).

Pure Bun (no Node), @clack prompts UI, citty commands, Zod-versioned manifest,
age-encrypted secrets.
