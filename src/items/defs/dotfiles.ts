import { homedir } from "node:os";
import { join } from "node:path";
import { defineItem, type Item } from "../item.ts";
import { MARK_START, MARK_END, assembleManagedBlock } from "./shell-block.ts";

const ZSHRC = join(homedir(), ".zshrc");

/**
 * The shell config item. Its managed block is ASSEMBLED from every item's
 * co-located `zsh()` contribution (see shell-block.ts) rather than hardcoded —
 * so adding a tool that needs a PATH/completion/alias line automatically
 * updates what gets written and what `doctor` validates. Idempotent: replaces
 * its own marker block only; everything else in ~/.zshrc is untouched.
 *
 * `allItems` is the full registry (injected by all.ts to avoid an import
 * cycle). The block is derived from all items — every line is self-guarded, so
 * unselected tools' lines are inert.
 */
export function makeDotfiles(allItems: Item[]) {
  const MANAGED_BLOCK = assembleManagedBlock(allItems);
  return defineItem({
    id: "dotfiles",
    title: "Shell config (PATH, completions, fnm hook, docker alias)",
    kind: "config-only",
    detect: async (ctx) => {
      const shell = await ctx.run([
        "dscl",
        ".",
        "-read",
        `/Users/${process.env.USER}`,
        "UserShell",
      ]);
      if (!shell.stdout.includes("/zsh")) return { installed: false };
      const file = Bun.file(ZSHRC);
      if (!(await file.exists())) return { installed: false };
      // Present AND current (the exact block content matters — this is the
      // validation Peter asked for: doctor/sync flag any drift from it).
      return { installed: (await file.text()).includes(MANAGED_BLOCK) };
    },
    configure: async (ctx) => {
      // macOS has defaulted to zsh since Catalina (2019), but ensure it — some
      // migrated/old accounts still have bash as the login shell.
      const shell = await ctx.run([
        "dscl",
        ".",
        "-read",
        `/Users/${process.env.USER}`,
        "UserShell",
      ]);
      if (!shell.stdout.includes("/zsh")) {
        const chsh = await ctx.run(["chsh", "-s", "/bin/zsh"]);
        if (chsh.exitCode === 0) ctx.log("login shell switched to zsh (re-open terminal)");
        else ctx.log("could not switch shell automatically — run `chsh -s /bin/zsh` yourself");
      }
      const file = Bun.file(ZSHRC);
      let text = (await file.exists()) ? await file.text() : "";
      const start = text.indexOf(MARK_START);
      const end = text.indexOf(MARK_END);
      if (start !== -1 && end !== -1) {
        text = text.slice(0, start) + MANAGED_BLOCK + text.slice(end + MARK_END.length);
        ctx.log("managed block updated in place");
      } else {
        text = `${text}${text.endsWith("\n") || text === "" ? "" : "\n"}${MANAGED_BLOCK}\n`;
        ctx.log("managed block appended to ~/.zshrc");
      }
      await Bun.write(ZSHRC, text);
    },
    verify: async () => (await Bun.file(ZSHRC).text()).includes(MARK_START),
  });
}
