import { describe, expect, test } from "bun:test";
import { superwhisperConfigSchema } from "../superwhisper-config.ts";

describe("superwhisper-config", () => {
  test("defaults mirror Peter's machine", () => {
    expect(superwhisperConfigSchema.parse({})).toEqual({
      pushToTalk: "right-option",
      alwaysShowMiniRecorder: true,
      showInDock: false,
      showExperimentalModels: true,
      recordingView: false,
      autoUpdate: true,
    });
  });

  test("push-to-talk default is Right-Option, not Right-Command (regression)", () => {
    // Captured from com.superduper.superwhisper: carbonKeyCode 61 / carbonModifiers 2048.
    expect(superwhisperConfigSchema.parse({}).pushToTalk).toBe("right-option");
  });
});
