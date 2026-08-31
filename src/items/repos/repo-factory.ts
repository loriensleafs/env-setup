import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { defineItem, type Item } from "../item.ts";

export function expandHome(path: string): string {
  return path.startsWith("~") ? join(homedir(), path.slice(1)) : path;
}

export interface RepoSpec {
  id: string;
  title: string;
  /** owner/name on github.com */
  repo: string;
  /** Destination dir relative to devDir, e.g. "ACMElabs/skills". */
  dest: string;
  /** Private repos clone through gh (auth); public through plain git. */
  isPrivate?: boolean;
}

export function repoItem(spec: RepoSpec): Item {
  return defineItem({
    id: spec.id,
    title: spec.title,
    kind: "repo",
    deps: spec.isPrivate ? ["github-auth"] : ["xcode-clt"],
    detect: async (ctx) => {
      const dest = join(expandHome(ctx.manifest.locations.devDir), spec.dest);
      const r = await ctx.run(["git", "-C", dest, "rev-parse", "--is-inside-work-tree"]);
      return { installed: r.exitCode === 0 };
    },
    install: async (ctx) => {
      const dest = join(expandHome(ctx.manifest.locations.devDir), spec.dest);
      await mkdir(join(dest, ".."), { recursive: true });
      const cmd = spec.isPrivate
        ? ["/opt/homebrew/bin/gh", "repo", "clone", spec.repo, dest]
        : ["git", "clone", `https://github.com/${spec.repo}.git`, dest];
      const r = await ctx.run(cmd);
      if (r.exitCode !== 0)
        throw new Error(`clone ${spec.repo} failed: ${r.stderr.trim().slice(-300)}`);
    },
    verify: async (ctx) => {
      const dest = join(expandHome(ctx.manifest.locations.devDir), spec.dest);
      return (
        (await ctx.run(["git", "-C", dest, "rev-parse", "--is-inside-work-tree"])).exitCode === 0
      );
    },
  });
}

/** The decided ACMElabs plugin repos (docs/plan/PRD-001-envsetup.md Group 3; `session` per ADR-023). */
export const ACMELABS_REPOS: RepoSpec[] = [
  {
    id: "repo-skills",
    title: "ACMElabs/skills",
    repo: "acmelabs-15/skills",
    dest: "ACMElabs/skills",
  },
  {
    id: "repo-ask-user-question",
    title: "ACMElabs/ask-user-question",
    repo: "acmelabs-15/ask-user-question",
    dest: "ACMElabs/ask-user-question",
  },
  {
    id: "repo-plugin-kit",
    title: "ACMElabs/plugin-kit",
    repo: "acmelabs-15/plugin-kit",
    dest: "ACMElabs/plugin-kit",
  },
  {
    id: "repo-brain",
    title: "ACMElabs/brain",
    repo: "acmelabs-15/brain",
    dest: "ACMElabs/brain",
  },
  {
    id: "repo-code-review",
    title: "ACMElabs/code-review",
    repo: "acmelabs-15/code-review",
    dest: "ACMElabs/code-review",
    isPrivate: true,
  },
  {
    id: "repo-code-simplifier",
    title: "ACMElabs/code-simplifier",
    repo: "acmelabs-15/code-simplifier",
    dest: "ACMElabs/code-simplifier",
    isPrivate: true,
  },
];

/** The 4 decided reference clones, owner-prefixed dirs (docs/plan/PRD-001-envsetup.md Group 3). */
export const REFERENCE_REPOS: RepoSpec[] = [
  {
    id: "repo-basic-memory",
    title: "reference: basic-memory",
    repo: "basicmachines-co/basic-memory",
    dest: "reference/basic-memory",
  },
  {
    id: "repo-addy-osmani-agent-skills",
    title: "reference: addy-osmani-agent-skills",
    repo: "addyosmani/agent-skills",
    dest: "reference/addy-osmani-agent-skills",
  },
  {
    id: "repo-matt-pocock-skills",
    title: "reference: matt-pocock-skills",
    repo: "mattpocock/skills",
    dest: "reference/matt-pocock-skills",
  },
  {
    id: "repo-rj-murillo-ai-agents",
    title: "reference: rj-murillo-ai-agents",
    repo: "rjmurillo/ai-agents",
    dest: "reference/rj-murillo-ai-agents",
  },
];
