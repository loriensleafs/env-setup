import { brewFormula } from "./factories/brew.ts";
import { bunRuntime } from "./defs/bun-runtime.ts";
import { homebrew } from "./defs/homebrew.ts";
import { nodeLts } from "./defs/node-lts.ts";
import { uv } from "./defs/uv.ts";
import { xcodeClt } from "./defs/xcode-clt.ts";
import { ItemRegistry } from "./registry.ts";

/** Registry of everything envsetup knows how to manage (grows per docs/PLAN.md). */
export function buildRegistry(): ItemRegistry {
  const r = new ItemRegistry();
  // Required spine
  r.register(xcodeClt);
  r.register(homebrew);
  r.register(bunRuntime);
  r.register(uv);
  r.register(brewFormula({ id: "gh", title: "GitHub CLI", required: true }));
  r.register(brewFormula({ id: "go", title: "Go", required: true }));
  r.register(brewFormula({ id: "fnm", title: "fnm (Node manager)", required: true }));
  r.register(nodeLts);
  // CLI tools (Peter's picks)
  r.register(brewFormula({ id: "jq", title: "jq" }));
  r.register(brewFormula({ id: "delta", title: "delta (git diffs)", name: "git-delta" }));
  r.register(brewFormula({ id: "lazygit", title: "lazygit" }));
  r.register(brewFormula({ id: "dust", title: "dust (disk usage)" }));
  return r;
}
