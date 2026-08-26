import { existsSync, lstatSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { AutocompletePrompt, runValidation, type Validate } from "@clack/core";
import { S_BAR, S_BAR_END, symbol } from "@clack/prompts";
import color from "picocolors";

export interface PathPromptOptions {
  message: string;
  /** Starting directory for suggestions and the initial editable value. */
  initialValue?: string;
  directory?: boolean;
  validate?: Validate<string>;
}

interface PathOption {
  value: string;
  label: string;
}

function suggestions(input: string, directoriesOnly: boolean): PathOption[] {
  if (input === "") return [];
  try {
    const searchDir =
      existsSync(input) && lstatSync(input).isDirectory() && input.endsWith("/")
        ? input
        : dirname(input);
    if (!existsSync(searchDir)) return [];
    const prefix = input === "/" ? input : input.replace(/\/$/, "");
    return readdirSync(searchDir)
      .filter((name) => !name.startsWith("."))
      .map((name) => join(searchDir, name))
      .filter((full) => full.startsWith(prefix) || searchDir === input)
      .filter((full) => {
        try {
          return directoriesOnly ? lstatSync(full).isDirectory() : true;
        } catch {
          return false;
        }
      })
      .slice(0, 5)
      .map((full) => ({ value: full, label: full }));
  } catch {
    return [];
  }
}

/**
 * Path input with working TAB completion. Published @clack/prompts `path()`
 * advertises "Tab: complete" but core's completeOnTab is unreleased (on main
 * only) — this ports the behavior via public/protected prompt surface.
 * Swap back to stock p.path() once clack releases it (docs/PLAN.md).
 */
export async function pathPrompt(opts: PathPromptOptions): Promise<string | symbol> {
  const initial = opts.initialValue ?? process.cwd();
  const directoriesOnly = opts.directory === true;

  const prompt: AutocompletePrompt<PathOption> = new AutocompletePrompt<PathOption>({
    options: function (this: AutocompletePrompt<PathOption>): PathOption[] {
      return suggestions(this.userInput, directoriesOnly);
    },
    initialUserInput: initial,
    validate: (value: unknown): string | Error | undefined => {
      const v =
        typeof value === "string" && value !== ""
          ? value
          : prompt.userInput !== ""
            ? prompt.userInput
            : undefined;
      if (v === undefined) return "a path is required";
      if (opts.validate) {
        const problem = runValidation(opts.validate, v);
        if (problem) return problem;
      }
      return undefined;
    },
    render() {
      const input = this.userInput;
      const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
      if (this.state === "submit") {
        return `${title}${color.gray(S_BAR)}  ${color.dim(String(this.value ?? input))}`;
      }
      if (this.state === "cancel") {
        return `${title}${color.gray(S_BAR)}  ${color.strikethrough(color.dim(input))}`;
      }
      const rows = (this.filteredOptions as PathOption[]).map((o, i) => {
        const focused = i === this.cursor && this.isNavigating;
        return `${color.cyan(S_BAR)}  ${focused ? color.cyan("❯ ") : "  "}${
          focused ? o.label : color.dim(o.label)
        }`;
      });
      const err =
        this.state === "error" ? `\n${color.yellow(S_BAR_END)}  ${color.yellow(this.error)}` : "";
      const footer = color.dim("↑/↓ suggestions · Tab complete · Enter confirm");
      return `${title}${color.cyan(S_BAR)}  ${input}${color.inverse(" ")}\n${rows.join("\n")}${
        rows.length > 0 ? "\n" : ""
      }${color.cyan(S_BAR)}  ${footer}${err}\n${color.cyan(S_BAR_END)}\n`;
    },
  });

  // Ported tab-completion: fill the input with the focused (or first) suggestion.
  type Internals = { _clearUserInput(): void; _setUserInput(v: string, write?: boolean): void };
  prompt.on("key", (_char, key) => {
    if (key?.name !== "tab") return;
    const list = prompt.filteredOptions as PathOption[];
    const focused = (prompt.isNavigating ? list[prompt.cursor] : list[0])?.value;
    if (focused === undefined) return;
    const internals = prompt as unknown as Internals;
    internals._clearUserInput();
    internals._setUserInput(focused, true);
  });

  const answer = await prompt.prompt();
  if (typeof answer === "symbol") return answer;
  if (answer === undefined || answer === "") return prompt.userInput;
  if (Array.isArray(answer)) return (answer[0] as string | undefined) ?? prompt.userInput;
  return answer as string;
}
