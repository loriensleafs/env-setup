import { afterEach, describe, expect, test } from "bun:test";
import { homedir } from "node:os";
import { configDir, journalPath, manifestPath, stateDir } from "../paths.ts";

const saved = { config: process.env.XDG_CONFIG_HOME, state: process.env.XDG_STATE_HOME };

afterEach(() => {
  if (saved.config === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = saved.config;
  if (saved.state === undefined) delete process.env.XDG_STATE_HOME;
  else process.env.XDG_STATE_HOME = saved.state;
});

describe("paths", () => {
  test("defaults to ~/.config and ~/.local/state", () => {
    delete process.env.XDG_CONFIG_HOME;
    delete process.env.XDG_STATE_HOME;
    expect(configDir()).toBe(`${homedir()}/.config/envsetup`);
    expect(stateDir()).toBe(`${homedir()}/.local/state/envsetup`);
  });

  test("honors XDG overrides", () => {
    process.env.XDG_CONFIG_HOME = "/tmp/xdg-c";
    process.env.XDG_STATE_HOME = "/tmp/xdg-s";
    expect(manifestPath()).toBe("/tmp/xdg-c/envsetup/manifest.json");
    expect(journalPath()).toBe("/tmp/xdg-s/envsetup/journal.jsonl");
  });

  test("ignores empty XDG values", () => {
    process.env.XDG_CONFIG_HOME = "";
    expect(configDir()).toBe(`${homedir()}/.config/envsetup`);
  });
});
