import { Prompt, isCancel } from "@clack/core";
import color from "picocolors";
import { S_BAR, S_BAR_END, symbolFor } from "./theme.ts";

export interface RadioOption<V extends string> {
  value: V;
  label?: string;
}

export function cycle(length: number, index: number, direction: 1 | -1): number {
  return (index + direction + length) % length;
}

export interface HorizontalRadioOptions<V extends string> {
  message: string;
  options: RadioOption<V>[];
  initialValue?: V;
}

/** Inline radio row for 2–4 options: (●) low   ( ) medium   ( ) high */
export async function horizontalRadio<V extends string>(
  opts: HorizontalRadioOptions<V>,
): Promise<V | symbol> {
  let cursor = Math.max(
    0,
    opts.options.findIndex((o) => o.value === opts.initialValue),
  );

  const prompt = new Prompt<V>(
    {
      render() {
        const row = opts.options
          .map((o, i) => {
            const dot = i === cursor ? color.green("●") : color.dim("○");
            const label = o.label ?? o.value;
            return `(${dot}) ${i === cursor ? label : color.dim(label)}`;
          })
          .join("   ");
        const symbol = symbolFor(this.state);
        return `${color.gray(S_BAR)}\n${symbol}  ${opts.message}\n${color.cyan(S_BAR)}  ${row}\n${color.cyan(S_BAR_END)}\n`;
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
