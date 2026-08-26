/**
 * GitHub OAuth device flow under envsetup's own app identity
 * (registered by Peter 2026-08-26; client_id is public by design).
 * Scopes: repo (private clones), admin:public_key (SSH key upload),
 * read:org (org repo access), user:email (noreply resolution).
 */
export const CLIENT_ID = "Ov23liQUd4gIaj3ejiNo";
export const SCOPES = "repo admin:public_key read:org user:email";

export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export async function requestDeviceCode(fetchFn: FetchLike = fetch): Promise<DeviceCode> {
  const r = await fetchFn("https://github.com/login/device/code", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPES }),
  });
  if (!r.ok) throw new Error(`device code request failed: HTTP ${r.status}`);
  return (await r.json()) as DeviceCode;
}

export interface PollResult {
  accessToken: string;
}

/**
 * Polls until the user approves. Honors interval, slow_down (+5s per spec),
 * and gives a clear error on expiry/denial.
 */
export async function pollForToken(
  device: DeviceCode,
  fetchFn: FetchLike = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<PollResult> {
  let intervalMs = device.interval * 1000;
  const deadline = Date.now() + device.expires_in * 1000;
  while (Date.now() < deadline) {
    await sleep(intervalMs);
    const r = await fetchFn("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code: device.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });
    const body = (await r.json()) as Record<string, string>;
    if (body.access_token) return { accessToken: body.access_token };
    switch (body.error) {
      case "authorization_pending":
        continue;
      case "slow_down":
        intervalMs += 5000;
        continue;
      case "expired_token":
        throw new Error("the sign-in code expired — run again for a fresh code");
      case "access_denied":
        throw new Error("sign-in was denied in the browser");
      default:
        throw new Error(`token poll failed: ${body.error ?? "unknown"}`);
    }
  }
  throw new Error("the sign-in code expired — run again for a fresh code");
}

export interface GithubUser {
  login: string;
  id: number;
}

export async function fetchUser(token: string, fetchFn: FetchLike = fetch): Promise<GithubUser> {
  const r = await fetchFn("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!r.ok) throw new Error(`user lookup failed: HTTP ${r.status}`);
  const u = (await r.json()) as GithubUser;
  return { login: u.login, id: u.id };
}

/** GitHub's commit-privacy address (docs/PLAN.md: noreply email decision). */
export function noreplyEmail(user: GithubUser): string {
  return `${user.id}+${user.login}@users.noreply.github.com`;
}
