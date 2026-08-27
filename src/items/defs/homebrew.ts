import { defineItem } from "../item.ts";
import { BREW } from "../factories/brew.ts";

export const homebrew = defineItem({
  id: "homebrew",
  title: "Homebrew",
  kind: "system",
  required: true,
  deps: ["xcode-clt"],
  zsh: () => ({
    comment: "Homebrew (PATH, MANPATH, env)",
    env: [`eval "$(${BREW} shellenv zsh)" 2>/dev/null`],
    // brew's zsh completions live here; activated by compinit downstream.
    completions: [
      'type brew >/dev/null 2>&1 && FPATH="$(brew --prefix)/share/zsh/site-functions:$FPATH"',
    ],
  }),
  detect: async (ctx) => {
    const r = await ctx.run([BREW, "--version"]);
    if (r.exitCode !== 0) return { installed: false };
    return { installed: true, version: r.stdout.match(/Homebrew\s+(\S+)/)?.[1] };
  },
  install: async (ctx) => {
    // Official installer, NONINTERACTIVE per docs. Needs sudo for /opt/homebrew;
    // the orchestrator is responsible for having a sudo keep-alive active.
    const r = await ctx.run(
      [
        "/bin/bash",
        "-c",
        "curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | /bin/bash",
      ],
      {
        env: { NONINTERACTIVE: "1" },
      },
    );
    if (r.exitCode !== 0) throw new Error(`Homebrew install failed: ${r.stderr.slice(-500)}`);
  },
  verify: async (ctx) => (await ctx.run([BREW, "--version"])).exitCode === 0,
});
