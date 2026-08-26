import { homedir } from "node:os";
import { join } from "node:path";
import { defineItem } from "../item.ts";

const ZSHRC = join(homedir(), ".zshrc");
const MARK_START = "# >>> envsetup managed >>>";
const MARK_END = "# <<< envsetup managed <<<";

/**
 * The shell block envsetup owns (decided: installers' rc-edits are suppressed;
 * WE write the PATH lines). Idempotent: replaces its own marker block only,
 * everything else in .zshrc is untouched.
 */
export const MANAGED_BLOCK = `${MARK_START}
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
eval "$(/opt/homebrew/bin/brew shellenv zsh)" 2>/dev/null
command -v fnm >/dev/null && eval "$(fnm env --use-on-cd)"
command -v podman >/dev/null && alias docker=podman
${MARK_END}`;

export const dotfiles = defineItem({
  id: "dotfiles",
  title: "Shell config (PATH, fnm hook, docker alias)",
  kind: "config-only",
  detect: async () => {
    const file = Bun.file(ZSHRC);
    if (!(await file.exists())) return { installed: false };
    const text = await file.text();
    // Present AND current (the block content matters, not just the markers).
    return { installed: text.includes(MANAGED_BLOCK) };
  },
  configure: async (ctx) => {
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
