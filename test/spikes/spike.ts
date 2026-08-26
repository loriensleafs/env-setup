// Spike: many sequential prompts + spinner + progress + custom @clack/core prompt under Bun
import * as p from "@clack/prompts";
import { Prompt } from "@clack/core";

p.intro("envsetup spike — 20 prompts, spinner, progress, custom prompt");

// 1-18: sequential text prompts (crash-after-17 regression test)
for (let i = 1; i <= 18; i++) {
  const v = await p.text({ message: `Prompt ${i}/18 — type anything`, initialValue: `v${i}` });
  if (p.isCancel(v)) { p.cancel("cancelled"); process.exit(1); }
}

// 19: multiselect
const ms = await p.multiselect({
  message: "Multiselect works?",
  options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }],
  initialValues: ["a"],
});
if (p.isCancel(ms)) process.exit(1);

// 20: custom prompt via @clack/core — horizontal radio proof
class HorizontalRadio extends Prompt<string> {
  cursor = 0;
  choices: string[];
  constructor(opts: { message: string; choices: string[] }) {
    super({
      render() {
        const self = this as unknown as HorizontalRadio;
        const row = self.choices
          .map((c, i) => (i === self.cursor ? `(●) ${c}` : `( ) ${c}`))
          .join("   ");
        return `${opts.message}\n  ${row}\n`;
      },
    }, false);
    this.choices = opts.choices;
    this.value = opts.choices[0];
    this.on("cursor", (key) => {
      if (key === "left") this.cursor = (this.cursor - 1 + this.choices.length) % this.choices.length;
      if (key === "right") this.cursor = (this.cursor + 1) % this.choices.length;
      this.value = this.choices[this.cursor];
    });
  }
}
const radio = await new HorizontalRadio({ message: "Custom horizontal radio:", choices: ["low", "medium", "high"] }).prompt();
p.log.info(`radio -> ${String(radio)}`);

// spinner + progress
const s = p.spinner();
s.start("Spinner test");
await new Promise((r) => setTimeout(r, 300));
s.stop("Spinner OK");

const pr = p.progress({ max: 5 });
pr.start("Progress test");
for (let i = 0; i < 5; i++) { await new Promise((r) => setTimeout(r, 60)); pr.advance(1); }
pr.stop("Progress OK");

p.outro("SPIKE PASSED — all 20 prompts + custom core prompt + spinner + progress");
