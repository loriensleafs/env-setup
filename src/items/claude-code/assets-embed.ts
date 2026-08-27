/**
 * Compile-safe asset paths. `import.meta.dir`-relative reads do NOT exist
 * inside a `bun build --compile` binary (ENOENT on /$bunfs/root/assets/… —
 * hit live in v0.1.3). `with { type: "file" }` imports embed each asset into
 * the binary and resolve to a readable path under both bun-run and compiled
 * (verified empirically 2026-08-27).
 */
// (tsc types this as the JSON's shape; at runtime the file-type import is a path string)
import templatePath from "./assets/settings.template.json" with { type: "file" };
// @ts-expect-error file-type import resolves to a path string
import notifyPath from "./assets/hooks-notify.ts" with { type: "file" };
// @ts-expect-error file-type import resolves to a path string
import subagentStatuslinePath from "./assets/hooks-subagent-statusline.ts" with { type: "file" };
// @ts-expect-error file-type import resolves to a path string
import formatPath from "./assets/hooks-format.ts" with { type: "file" };
// @ts-expect-error file-type import resolves to a path string
import statuslinePath from "./assets/statusline.ts" with { type: "file" };

export const ASSET_PATHS: Record<string, string> = {
  "settings.template.json": templatePath as unknown as string,
  "hooks-notify.ts": notifyPath as string,
  "hooks-subagent-statusline.ts": subagentStatuslinePath as string,
  "hooks-format.ts": formatPath as string,
  "statusline.ts": statuslinePath as string,
};
