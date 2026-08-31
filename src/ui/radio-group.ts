import { Prompt, isCancel } from "@clack/core";
import { S_BAR, S_BAR_END, symbol } from "@clack/prompts";
import color from "picocolors";

export interface RadioOption<V extends string> {
  value: V;
  label?: string;
}

export function cycle(length: number, index: number, direction: 1 | -1): number {
  return (index + direction + length) % length;
}

export interface RadioGroupOptions<V extends string> {
  message: string;
  options: RadioOption<V>[];
  initialValue?: V;
  /** Prompt input stream (thread promptInput() — see src/ui/terminal.ts). */
  input?: NodeJS.ReadStream;
}

/** Inline radio group for 2–4 options: (●) low   ( ) medium   ( ) high */
export async function radioGroup<V extends string>(
  opts: RadioGroupOptions<V>,
): Promise<V | symbol> {
  let cursor = Math.max(
    0,
    opts.options.findIndex((o) => o.value === opts.initialValue),
  );

  const prompt = new Prompt<V>(
    {
      input: opts.input,
      render() {
        // State-aware framing that matches clack's built-in prompts, so the
        // radio flows inside a p.group: only the ACTIVE prompt draws the
        // closing └ bar; a submitted/cancelled one leaves the bar continuing
        // into the next field (the earlier always-└ render sealed every
        // answered field off into its own box).
        const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
        const chosen = opts.options[cursor] as RadioOption<V>;
        const chosenLabel = chosen.label ?? chosen.value;
        switch (this.state) {
          case "submit":
            return `${title}${color.gray(S_BAR)}  ${color.dim(chosenLabel)}`;
          case "cancel":
            return `${title}${color.gray(S_BAR)}  ${color.strikethrough(color.dim(chosenLabel))}\n${color.gray(S_BAR)}`;
          default: {
            const row = opts.options
              .map((o, i) => {
                const dot = i === cursor ? color.green("●") : color.dim("○");
                const label = o.label ?? o.value;
                return `(${dot}) ${i === cursor ? label : color.dim(label)}`;
              })
              .join("   ");
            return `${title}${color.cyan(S_BAR)}  ${row}\n${color.cyan(S_BAR_END)}\n`;
          }
        }
      },
    },
    false,
  );

  prompt.value = (opts.options[cursor] as RadioOption<V>).value;
  prompt.on("cursor", (key) => {
    if (key === "left" || key === "up") cursor = cycle(opts.options.length, cursor, -1);
    if (key === "right" || key === "down") cursor = cycle(opts.options.length, cursor, 1);
    prompt.value = (opts.options[cursor] as RadioOption<V>).value;
  });

  const answer = await prompt.prompt();
  return isCancel(answer) ? answer : (answer as V);
}
