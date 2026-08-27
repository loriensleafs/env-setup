import { describe, expect, test } from "bun:test";
import { buildSettings, PLUGIN_REPO_MAP } from "../claude-settings.ts";

const template = {
  model: "opus[1m]",
  enabledPlugins: {
    "ask-user-question@ACMElabs": true,
    "code-review@ACMElabs": true,
    "code-simplifier@ACMElabs": true,
    "skills@ACMElabs": true,
    "superwhisper@superwhisper": true,
  },
  extraKnownMarketplaces: {
    ACMElabs: {
      source: {
        source: "file",
        path: "/Users/peter.kloss/Dev/ACMElabs/.claude-plugin/marketplace.json",
      },
    },
    superwhisper: { source: { source: "github", repo: "superultrainc/superwhisper-claude-code" } },
  },
  statusLine: { type: "command", command: "~/.claude/statusline.sh", refreshInterval: 5 },
  attribution: { commit: "Are you pondering what I am pondering? — 🧠" },
};

const allRepos = new Set(Object.values(PLUGIN_REPO_MAP));

describe("buildSettings", () => {
  test("templates the marketplace path onto the actual devDir (fixes peter.kloss path)", () => {
    const s = buildSettings({ template, devDir: "~/Dev", selection: allRepos });
    const path = (s.extraKnownMarketplaces as Record<string, { source: { path: string } }>).ACMElabs
      .source.path;
    expect(path).not.toContain("peter.kloss");
    expect(path).toContain("/Dev/ACMElabs/.claude-plugin/marketplace.json");
  });

  test("unselected repos drop their plugins; others survive (Peter's rule)", () => {
    const partial = new Set(["repo-skills"]);
    const s = buildSettings({ template, devDir: "~/Dev", selection: partial });
    const plugins = s.enabledPlugins as Record<string, boolean>;
    expect(plugins["skills@ACMElabs"]).toBe(true);
    expect(plugins["code-review@ACMElabs"]).toBeUndefined();
    expect(plugins["ask-user-question@ACMElabs"]).toBeUndefined();
    expect(plugins["superwhisper@superwhisper"]).toBe(true); // non-ACMElabs untouched
  });

  test("statusline points at the bun port; unrelated keys verbatim", () => {
    const s = buildSettings({ template, devDir: "~/Dev", selection: allRepos });
    expect((s.statusLine as Record<string, unknown>).command).toBe("bun ~/.claude/statusline.ts");
    expect((s.statusLine as Record<string, unknown>).refreshInterval).toBe(5);
    expect((s.attribution as Record<string, unknown>).commit).toContain("pondering");
    expect(s.model).toBe("opus[1m]");
  });

  test("template object is not mutated", () => {
    buildSettings({ template, devDir: "~/Dev", selection: new Set() });
    expect(template.enabledPlugins["code-review@ACMElabs"]).toBe(true);
  });
});
