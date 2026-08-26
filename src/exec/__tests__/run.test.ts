import { describe, expect, test } from "bun:test";
import { run } from "../run.ts";

describe("run", () => {
  test("captures stdout and exit code", async () => {
    const r = await run(["echo", "hello"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe("hello");
  });

  test("nonzero exit is returned, not thrown", async () => {
    const r = await run(["sh", "-c", "echo oops >&2; exit 3"]);
    expect(r.exitCode).toBe(3);
    expect(r.stderr.trim()).toBe("oops");
  });

  test("env vars flow through", async () => {
    const r = await run(["sh", "-c", "echo $ENVSETUP_T"], { env: { ENVSETUP_T: "yes" } });
    expect(r.stdout.trim()).toBe("yes");
  });
});
