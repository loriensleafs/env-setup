import { homedir } from "node:os";
import { join } from "node:path";
import { defineItem } from "../item.ts";

const FONT_DIR = join(homedir(), "Library", "Fonts");
const REPO = "loriensleafs/fonts";

/** Decided families from Peter's fonts repo: dankmono, hack, ligahack (all weights). */
const WANTED_PREFIXES = ["DankMono", "Hack-", "LigaHack"];
const PROBE = "DankMono-Regular.ttf";

/**
 * Installs Peter's personal fonts straight from the repo via the GitHub API
 * (public repo, raw contents) — no clone needed. Family filter per decision;
 * the stray Edhellond scripture file stays behind.
 */
export const personalFonts = defineItem({
  id: "font-personal",
  title: "Personal fonts (Dank Mono, Hack, LigaHack)",
  kind: "font",
  detect: async () => ({ installed: await Bun.file(join(FONT_DIR, PROBE)).exists() }),
  install: async (ctx) => {
    const list = await fetch(`https://api.github.com/repos/${REPO}/contents/`);
    if (!list.ok) throw new Error(`fonts repo listing failed: HTTP ${list.status}`);
    const entries = (await list.json()) as { name: string; download_url: string | null }[];
    const wanted = entries.filter(
      (e) => e.download_url !== null && WANTED_PREFIXES.some((p) => e.name.startsWith(p)),
    );
    if (wanted.length === 0) throw new Error("no matching fonts found in the repo");
    for (const f of wanted) {
      const r = await fetch(f.download_url as string);
      if (!r.ok) throw new Error(`download ${f.name} failed: HTTP ${r.status}`);
      await Bun.write(join(FONT_DIR, f.name), await r.arrayBuffer());
      ctx.log(`installed ${f.name}`);
    }
  },
  verify: async () => Bun.file(join(FONT_DIR, PROBE)).exists(),
});
