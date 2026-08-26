import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { decryptSecrets, encryptSecrets } from "../secrets/age-store.ts";
import { configDir } from "../paths/paths.ts";
import { SECRET_KEYS } from "../secrets/secrets.ts";

const AGE_FILE = "secrets.json.age";

function bail(msg: string): never {
  p.cancel(msg);
  process.exit(1);
}

async function askPassphrase(confirm: boolean): Promise<string> {
  const pass = await p.password({ message: "Secrets passphrase" });
  if (p.isCancel(pass) || pass === "") bail("cancelled");
  if (confirm) {
    const again = await p.password({ message: "Confirm passphrase" });
    if (p.isCancel(again) || again !== pass) bail("passphrases don't match");
  }
  return pass as string;
}

export default defineCommand({
  meta: { name: "secrets", description: "Manage the age-encrypted secret store" },
  args: {
    action: {
      type: "positional",
      description: "init (encrypt .secrets.local.json) · show (masked) · reveal (full values) · unlock (decrypt to config dir for items)",
      required: true,
    },
  },
  async run({ args }) {
    const action = args.action as string;
    p.intro(`envsetup secrets ${action}`);

    if (action === "init") {
      const local = Bun.file(".secrets.local.json");
      if (!(await local.exists())) bail("no .secrets.local.json in the current directory to encrypt");
      const secrets = (await local.json()) as Record<string, string>;
      const expected = Object.values(SECRET_KEYS);
      const missing = expected.filter((k) => !(k in secrets));
      if (missing.length > 0) p.log.warn(`not present yet: ${missing.join(", ")}`);
      const pass = await askPassphrase(true);
      const blob = await encryptSecrets(secrets, pass);
      await Bun.write(AGE_FILE, blob);
      p.log.success(`${AGE_FILE} written (${Object.keys(secrets).length} secrets) — commit it; the passphrase goes in your password manager`);
      p.outro("done");
      return;
    }

    if (action === "show" || action === "reveal" || action === "unlock") {
      const blob = Bun.file(AGE_FILE);
      if (!(await blob.exists())) bail(`${AGE_FILE} not found in the current directory`);
      const pass = await askPassphrase(false);
      let secrets: Record<string, string>;
      try {
        secrets = await decryptSecrets(new Uint8Array(await blob.arrayBuffer()), pass);
      } catch {
        bail("wrong passphrase (or corrupted file)");
      }
      if (action === "show" || action === "reveal") {
        const full = action === "reveal";
        p.note(
          Object.entries(secrets)
            .map(([k, v]) => `${k}: ${full ? v : `${v.slice(0, 4)}…${v.slice(-4)}`}`)
            .join("\n"),
          full ? "secrets" : "secrets (masked)",
        );
      } else {
        await mkdir(configDir(), { recursive: true });
        const out = join(configDir(), "secrets.json");
        await Bun.write(out, JSON.stringify(secrets, null, 2));
        p.log.success(`decrypted to ${out} (items read from here; delete to re-lock)`);
      }
      p.outro("done");
      return;
    }

    bail(`unknown action "${action}" — use init, show, reveal, or unlock`);
  },
});
