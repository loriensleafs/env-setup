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
# PATH: Homebrew, bun, uv/pipx (~/.local/bin), Go tools, Cargo — added once, deduped by zsh.
eval "$(/opt/homebrew/bin/brew shellenv zsh)" 2>/dev/null
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
[ -d "$(/opt/homebrew/bin/brew --prefix 2>/dev/null)/opt/go/libexec/bin" ] && export PATH="$(/opt/homebrew/bin/brew --prefix)/opt/go/libexec/bin:$PATH"
export GOPATH="$HOME/go"
[ -d "$GOPATH/bin" ] && export PATH="$GOPATH/bin:$PATH"
[ -d "$HOME/.cargo/bin" ] && export PATH="$HOME/.cargo/bin:$PATH"

# Runtimes: fnm (Node) auto-switching; bun completions.
command -v fnm >/dev/null && eval "$(fnm env --use-on-cd)"
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

# zsh completions from Homebrew (gh, etc.) — before compinit.
if type brew >/dev/null 2>&1; then
  FPATH="$(brew --prefix)/share/zsh/site-functions:$FPATH"
fi

# Aliases: docker → podman (containers decision).
command -v podman >/dev/null && alias docker=podman
${MARK_END}`;

export const dotfiles = defineItem({
  id: "dotfiles",
  title: "Shell config (PATH, fnm hook, docker alias)",
  kind: "config-only",
  detect: async (ctx) => {
    const shell = await ctx.run(["dscl", ".", "-read", `/Users/${process.env.USER}`, "UserShell"]);
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
    const shell = await ctx.run(["dscl", ".", "-read", `/Users/${process.env.USER}`, "UserShell"]);
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
