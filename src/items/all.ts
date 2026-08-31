import { brewCask, brewFormula } from "./factories/brew.ts";
import { fontZip } from "./factories/font-zip.ts";
import { bunRuntime } from "./defs/bun-runtime.ts";
import { dock } from "./defs/dock.ts";
import { gitIdentity } from "./defs/git-identity.ts";
import { homebrew } from "./defs/homebrew.ts";
import { macosDefaults } from "./defs/macos-defaults.ts";
import { nodeLts } from "./defs/node-lts.ts";
import { uv } from "./defs/uv.ts";
import { xcodeClt } from "./defs/xcode-clt.ts";
import { ghosttyConfig } from "./ghostty/ghostty-config.ts";
import { ghosttyIcon } from "./ghostty/ghostty-icon.ts";
import { betterDisplay } from "./defs/better-display.ts";
import { finderFavorites } from "./finder/finder-favorites.ts";
import { chromeConfig } from "./chrome/chrome-config.ts";
import { cleanshotConfig } from "./defs/cleanshot-config.ts";
import { cursorConfig, vscodeConfig } from "./editors/editor-config.ts";
import { podmanMachine } from "./defs/podman-machine.ts";
import { raycastConfig } from "./defs/raycast-config.ts";
import { githubAuth } from "./defs/github-auth.ts";
import { makeDotfiles } from "./defs/dotfiles.ts";
import { deltaConfig } from "./defs/delta-config.ts";
import { gitEmail } from "./defs/git-email.ts";
import { googleSans } from "./defs/google-sans.ts";
import { personalFonts } from "./defs/personal-fonts.ts";
import { sshKeys } from "./defs/ssh-keys.ts";
import { ACMELABS_REPOS, REFERENCE_REPOS, repoItem } from "./repos/repo-factory.ts";
import { acmelabsMarketplace } from "./repos/acmelabs-marketplace.ts";
import { claudeSettings } from "./claude-code/claude-settings.ts";
import { superwhisperConfig } from "./defs/superwhisper-config.ts";
import { typoraConfig } from "./typora/typora-config.ts";
import { chromePwas } from "./chrome/chrome-pwas.ts";
import { quickActions } from "./quick-actions/quick-actions.ts";
import { ItemRegistry } from "./registry.ts";

/** Registry of everything envsetup knows how to manage (catalog in docs/plan/PRD-001-envsetup.md). */
export function buildRegistry(): ItemRegistry {
  const r = new ItemRegistry();
  // Required spine
  r.register(xcodeClt);
  r.register(homebrew);
  r.register(bunRuntime);
  r.register(uv);
  r.register(brewFormula({ id: "gh", title: "GitHub CLI", required: true }));
  r.register(
    brewFormula({
      id: "go",
      title: "Go",
      required: true,
      zsh: {
        comment: "Go (toolchain + GOPATH bin)",
        env: [
          '[ -d "$(/opt/homebrew/bin/brew --prefix 2>/dev/null)/opt/go/libexec/bin" ] && export PATH="$(/opt/homebrew/bin/brew --prefix)/opt/go/libexec/bin:$PATH"',
          'export GOPATH="$HOME/go"',
          '[ -d "$GOPATH/bin" ] && export PATH="$GOPATH/bin:$PATH"',
        ],
      },
    }),
  );
  r.register(
    brewFormula({
      id: "fnm",
      title: "fnm (Node manager)",
      required: true,
      zsh: {
        comment: "fnm (Node auto-switching)",
        init: ['command -v fnm >/dev/null && eval "$(fnm env --use-on-cd --shell zsh)"'],
      },
    }),
  );
  r.register(nodeLts);
  // CLI tools (Peter's picks)
  r.register(brewFormula({ id: "jq", title: "jq" }));
  r.register(brewFormula({ id: "delta", title: "delta (git diffs)", name: "git-delta" }));
  r.register(deltaConfig);
  r.register(brewFormula({ id: "lazygit", title: "lazygit" }));
  r.register(brewFormula({ id: "dust", title: "dust (disk usage)" }));
  // Apps (Group 2)
  r.register(brewCask({ id: "ghostty", title: "Ghostty", appPath: "/Applications/Ghostty.app" }));
  r.register(brewCask({ id: "cursor", title: "Cursor", appPath: "/Applications/Cursor.app" }));
  r.register(
    brewCask({
      id: "vscode",
      title: "VS Code",
      name: "visual-studio-code",
      appPath: "/Applications/Visual Studio Code.app",
    }),
  );
  r.register(
    brewCask({
      id: "chrome",
      title: "Google Chrome",
      name: "google-chrome",
      appPath: "/Applications/Google Chrome.app",
    }),
  );
  r.register(
    brewCask({
      id: "superwhisper",
      title: "superwhisper",
      appPath: "/Applications/superwhisper.app",
    }),
  );
  r.register(brewCask({ id: "raycast", title: "Raycast", appPath: "/Applications/Raycast.app" }));
  r.register(
    brewCask({ id: "cleanshot", title: "CleanShot X", appPath: "/Applications/CleanShot X.app" }),
  );
  r.register(
    brewCask({ id: "zoom", title: "Zoom", name: "zoom", appPath: "/Applications/zoom.us.app" }),
  );
  r.register(brewCask({ id: "discord", title: "Discord", appPath: "/Applications/Discord.app" }));
  r.register(brewCask({ id: "typora", title: "Typora", appPath: "/Applications/Typora.app" }));
  r.register(
    brewCask({
      id: "claude-desktop",
      title: "Claude desktop",
      name: "claude",
      appPath: "/Applications/Claude.app",
    }),
  );
  r.register(brewFormula({ id: "podman", title: "Podman" }));
  // Needed by the Claude Code notify hook (click-to-focus notifications).
  r.register(brewFormula({ id: "terminal-notifier", title: "terminal-notifier" }));
  // Fonts — brew casks
  r.register(
    brewCask({
      id: "font-jetbrains-nf",
      title: "JetBrains Mono Nerd Font",
      name: "font-jetbrains-mono-nerd-font",
    }),
  );
  r.register(
    brewCask({
      id: "font-fira-nf",
      title: "Fira Code Nerd Font",
      name: "font-fira-code-nerd-font",
    }),
  );
  r.register(
    brewCask({ id: "font-geist", title: "Geist (Typora/Vercel theme)", name: "font-geist" }),
  );
  r.register(
    brewCask({ id: "font-inter", title: "Inter (Typora/Vercel theme)", name: "font-inter" }),
  );
  // Fonts — Peter's pinned Nerd Fonts v3.5.1 zips
  const NF = "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.5.1";
  r.register(
    fontZip({
      id: "font-google-sans-code-nf",
      title: "Google Sans Code Nerd Font (pinned v3.5.1)",
      url: `${NF}/GoogleSansCode.zip`,
      probeFile: "GoogleSansCodeNerdFont-Regular.ttf",
    }),
  );
  r.register(
    fontZip({
      id: "font-noto-nf",
      title: "Noto Nerd Font (pinned v3.5.1)",
      url: `${NF}/Noto.zip`,
      probeFile: "NotoSansNerdFont-Regular.ttf",
    }),
  );
  r.register(
    fontZip({
      id: "font-roboto-mono-nf",
      title: "Roboto Mono Nerd Font (pinned v3.5.1)",
      url: `${NF}/RobotoMono.zip`,
      probeFile: "RobotoMonoNerdFont-Regular.ttf",
    }),
  );
  // Config-only / system items
  r.register(macosDefaults);
  r.register(gitIdentity);
  r.register(ghosttyConfig);
  r.register(ghosttyIcon);
  r.register(brewFormula({ id: "dockutil", title: "dockutil (Dock manager)" }));
  r.register(dock);
  r.register(quickActions);
  r.register(chromeConfig);
  r.register(chromePwas);
  r.register(betterDisplay);
  r.register(finderFavorites);
  r.register(typoraConfig);
  r.register(superwhisperConfig);
  r.register(cleanshotConfig);
  r.register(cursorConfig);
  r.register(vscodeConfig);
  r.register(podmanMachine);
  r.register(raycastConfig);
  // Repos + Claude Code flagship
  r.register(githubAuth);
  r.register(sshKeys);
  r.register(gitEmail);
  r.register(personalFonts);
  r.register(googleSans);
  for (const spec of ACMELABS_REPOS) r.register(repoItem(spec));
  for (const spec of REFERENCE_REPOS) r.register(repoItem(spec));
  r.register(acmelabsMarketplace);
  r.register(claudeSettings);
  // Registered LAST: its managed ~/.zshrc block is assembled from every other
  // item's co-located zsh() contribution, so all items must exist first.
  r.register(makeDotfiles(r.all()));
  return r;
}
