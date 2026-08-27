import { describe, expect, test } from "bun:test";
import {
  CLIENT_ID,
  noreplyEmail,
  pollForToken,
  requestDeviceCode,
  type DeviceCode,
} from "../github-device-flow.ts";

const device: DeviceCode = {
  device_code: "d123",
  user_code: "ABCD-1234",
  verification_uri: "https://github.com/login/device",
  interval: 0,
  expires_in: 10,
};

function fetchSeq(responses: unknown[]): (url: string, init?: RequestInit) => Promise<Response> {
  let i = 0;
  return async () => new Response(JSON.stringify(responses[Math.min(i++, responses.length - 1)]));
}

describe("device flow", () => {
  test("requestDeviceCode posts the registered client id", async () => {
    let sentBody = "";
    const r = await requestDeviceCode(async (_url, init) => {
      sentBody = String(init?.body);
      return new Response(JSON.stringify(device));
    });
    expect(JSON.parse(sentBody).client_id).toBe(CLIENT_ID);
    expect(r.user_code).toBe("ABCD-1234");
  });

  test("poll waits through pending, honors slow_down, returns token", async () => {
    const sleeps: number[] = [];
    const result = await pollForToken(
      device,
      fetchSeq([
        { error: "authorization_pending" },
        { error: "slow_down" },
        { error: "authorization_pending" },
        { access_token: "gho_tok" },
      ]),
      async (ms) => void sleeps.push(ms),
    );
    expect(result.accessToken).toBe("gho_tok");
    expect(sleeps).toEqual([0, 0, 5000, 5000]); // slow_down added 5s
  });

  test("denial and expiry give clear errors", async () => {
    await expect(
      pollForToken(device, fetchSeq([{ error: "access_denied" }]), async () => {}),
    ).rejects.toThrow(/denied/);
    await expect(
      pollForToken(device, fetchSeq([{ error: "expired_token" }]), async () => {}),
    ).rejects.toThrow(/expired/);
  });

  test("noreply email format", () => {
    expect(noreplyEmail({ login: "loriensleafs", id: 12345 })).toBe(
      "12345+loriensleafs@users.noreply.github.com",
    );
  });
});
