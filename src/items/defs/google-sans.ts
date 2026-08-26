import { homedir } from "node:os";
import { join, basename } from "node:path";
import { defineItem } from "../item.ts";

const FONT_DIR = join(homedir(), "Library", "Fonts");
const LIST_URL = "https://fonts.google.com/download/list?family=Google%20Sans";
const PROBE = "GoogleSans_17pt-Regular.ttf";

interface FileRef {
  filename: string;
  url: string;
}

/**
 * Google Sans — now OFL-licensed and served by the official Google Fonts
 * download manifest (verified 2026-08-26: /download/list returns fileRefs to
 * gstatic TTFs behind an XSSI prefix). Installs the static TTFs.
 */
export const googleSans = defineItem({
  id: "font-google-sans",
  title: "Google Sans",
  kind: "font",
  detect: async () => ({ installed: await Bun.file(join(FONT_DIR, PROBE)).exists() }),
  install: async (ctx) => {
    const r = await fetch(LIST_URL);
    if (!r.ok) throw new Error(`Google Sans manifest failed: HTTP ${r.status}`);
    const raw = await r.text();
    // Google prefixes JSON with an XSSI guard: )]}'
    const json = JSON.parse(raw.slice(raw.indexOf("{"))) as {
      manifest: { fileRefs?: FileRef[] };
    };
    const refs = (json.manifest.fileRefs ?? []).filter((f) => f.filename.endsWith(".ttf"));
    if (refs.length === 0) throw new Error("no TTFs in the Google Sans manifest");
    for (const ref of refs) {
      const dl = await fetch(ref.url);
      if (!dl.ok) throw new Error(`download ${ref.filename} failed: HTTP ${dl.status}`);
      await Bun.write(join(FONT_DIR, basename(ref.filename)), await dl.arrayBuffer());
    }
    ctx.log(`installed ${refs.length} Google Sans faces`);
  },
  verify: async () => Bun.file(join(FONT_DIR, PROBE)).exists(),
});
