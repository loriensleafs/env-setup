import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { githubAuthCeremony } from "../auth/auth-ceremony.ts";
import { run } from "../exec/run.ts";

export default defineCommand({
  meta: {
    name: "auth",
    description: "Sign in to GitHub (device flow under envsetup's app identity)",
  },
  args: {
    force: { type: "boolean", description: "Re-authenticate even if a stored token works" },
  },
  async run({ args }) {
    p.intro("envsetup auth");
    try {
      const result = await githubAuthCeremony(run, { force: args.force === true });
      p.log.info(`commit email will be ${result.email}`);
      p.outro(`connected as ${result.user.login}`);
    } catch (err) {
      p.cancel(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  },
});
