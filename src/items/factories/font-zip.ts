import { homedir } from "node:os";
import { join } from "node:path";
import { defineItem, type Item } from "../item.ts";

export interface FontZipSpec {
  id: string;
  title: string;
  /** Pinned release zip URL (version-pinning policy: honor Peter's pins). */
  url: string;
  /** A filename that proves installation, e.g. a known .ttf inside the zip. */
  probeFile: string;
}

const FONT_DIR = join(homedir(), "Library", "Fonts");

/** Installs a pinned font zip (e.g. Nerd Fonts v3.5.1 assets) into ~/Library/Fonts. */
export function fontZip(spec: FontZipSpec): Item {
  return defineItem({
    id: spec.id,
    title: spec.title,
    kind: "font",
    detect: async () => {
      const installed = await Bun.file(join(FONT_DIR, spec.probeFile)).exists();
      return { installed };
    },
    install: async (ctx) => {
      const tmp = join("/tmp", `envsetup-font-${spec.id}.zip`);
      const dl = await ctx.run(["curl", "-fsSL", "-o", tmp, spec.url]);
      if (dl.exitCode !== 0) throw new Error(`font download failed: ${spec.url}`);
      // -o overwrite, -j junk paths (zip roots vary), exclude metadata/README noise
      const uz = await ctx.run(["unzip", "-o", "-j", tmp, "*.ttf", "*.otf", "-d", FONT_DIR]);
      if (uz.exitCode !== 0 && uz.exitCode !== 11) {
        throw new Error(`unzip failed for ${spec.id}: ${uz.stderr.trim()}`);
      }
      await ctx.run(["rm", "-f", tmp]);
    },
    verify: async () => Bun.file(join(FONT_DIR, spec.probeFile)).exists(),
  });
}
