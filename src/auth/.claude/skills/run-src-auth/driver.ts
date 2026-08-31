#!/usr/bin/env bun
// Direct-invocation driver for src/auth: the device flow against a MOCKED
// fetch (no network), noreplyEmail(), and a read-only Keychain probe via
// storedToken() (reports present/absent, never prints the token).
import { KEYCHAIN_SERVICE, storedToken } from "../../../auth-ceremony.ts";
import {
  CLIENT_ID,
  type FetchLike,
  noreplyEmail,
  pollForToken,
  requestDeviceCode,
  SCOPES,
} from "../../../github-device-flow.ts";
import { run } from "../../../../exec/run.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

console.log(`src/auth driver — client ${CLIENT_ID}, scopes "${SCOPES}"\n`);
const calls: string[] = [];
let polls = 0;
const mockFetch: FetchLike = async (url) => {
  calls.push(String(url));
  if (String(url).endsWith("/device/code"))
    return json({
      device_code: "dc",
      user_code: "ABCD-1234",
      verification_uri: "https://github.com/login/device",
      expires_in: 60,
      interval: 1,
    });
  polls++;
  if (polls === 1) return json({ error: "authorization_pending" });
  if (polls === 2) return json({ error: "slow_down" });
  return json({ access_token: "gho_fake" });
};
const device = await requestDeviceCode(mockFetch);
check("requestDeviceCode parses the device code", device.user_code === "ABCD-1234");
const token = await pollForToken(device, mockFetch, async () => {});
check(
  "pollForToken honours pending + slow_down, then returns the token",
  token.accessToken === "gho_fake" && polls === 3,
  `${polls} polls, ${calls.length} requests`,
);
try {
  polls = 0;
  await pollForToken(
    device,
    async () => json({ error: "access_denied" }),
    async () => {},
  );
  check("access_denied throws", false);
} catch (e) {
  check("access_denied throws", (e as Error).message.includes("denied"), (e as Error).message);
}
check(
  "noreplyEmail",
  noreplyEmail({ login: "octocat", id: 583231 }) === "583231+octocat@users.noreply.github.com",
);
const stored = await storedToken(run);
console.log(
  `  Keychain service "${KEYCHAIN_SERVICE}": token ${stored ? "present" : "absent"} (read-only probe)`,
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
