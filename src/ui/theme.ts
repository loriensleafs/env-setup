import color from "picocolors";

// Symbols matching @clack/prompts' visual language.
export const S_BAR = "│";
export const S_BAR_END = "└";
export const S_STEP_ACTIVE = "◆";
export const S_STEP_SUBMIT = "◇";
export const S_STEP_CANCEL = "■";
export const S_CHECKBOX_SELECTED = "◼";
export const S_CHECKBOX_UNSELECTED = "◻";
export const S_LOCKED_ON = "◉";
export const S_INSTALLED = "✓";

export function symbolFor(state: string): string {
  if (state === "submit") return color.green(S_STEP_SUBMIT);
  if (state === "cancel") return color.red(S_STEP_CANCEL);
  return color.cyan(S_STEP_ACTIVE);
}
