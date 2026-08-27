import * as p from "@clack/prompts";
import { z } from "zod";
import type { Item } from "../items/item.ts";
import { radioGroup } from "./radio-group.ts";
import { promptInput } from "./terminal.ts";

/** fontSize → "Font size"; memoryMb → "Memory mb". */
export function humanize(key: string): string {
  const words = key
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

interface JsonSchemaProp {
  type?: string;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  enum?: unknown[];
}

/**
 * Schema-driven config screen: prompts are derived from the item's own Zod
 * schema (via z.toJSONSchema), so adding a field to an item automatically
 * grows its screen. Defaults come from stored config, then schema defaults.
 */
export async function promptItemConfig(
  item: Item<unknown>,
  stored: unknown,
): Promise<unknown | symbol> {
  const schema = item.configSchema as z.ZodType<unknown> | undefined;
  if (!schema) return stored;
  const json = z.toJSONSchema(schema) as {
    properties?: Record<string, JsonSchemaProp>;
  };
  const props = json.properties ?? {};
  const current = (stored ?? item.defaultConfig ?? {}) as Record<string, unknown>;

  p.log.step(item.title);
  const answers: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(props)) {
    const label = humanize(key);
    const initial = current[key] ?? prop.default;

    if (prop.type === "boolean") {
      const v = await radioGroup({
        input: promptInput(),
        message: label,
        options: [{ value: "yes" }, { value: "no" }],
        initialValue: initial === false ? "no" : "yes",
      });
      if (p.isCancel(v)) return v;
      answers[key] = v === "yes";
      continue;
    }

    if (prop.type === "number" || prop.type === "integer") {
      const bounds =
        prop.minimum !== undefined || prop.maximum !== undefined
          ? ` (${prop.minimum ?? "…"}–${prop.maximum ?? "…"})`
          : "";
      const v = await p.text({
        input: promptInput(),
        message: `${label}${bounds}`,
        initialValue: String(initial ?? ""),
        validate: (value) => {
          const n = Number(value ?? "");
          if (!Number.isFinite(n)) return "enter a number";
          if (prop.minimum !== undefined && n < prop.minimum) return `minimum ${prop.minimum}`;
          if (prop.maximum !== undefined && n > prop.maximum) return `maximum ${prop.maximum}`;
          return undefined;
        },
      });
      if (p.isCancel(v)) return v;
      answers[key] = Number(v);
      continue;
    }

    // strings (incl. enums small enough for the radio)
    if (prop.enum && prop.enum.length >= 2 && prop.enum.length <= 4) {
      const v = await radioGroup({
        input: promptInput(),
        message: label,
        options: prop.enum.map((e) => ({ value: String(e) })),
        initialValue: String(initial ?? prop.enum[0]),
      });
      if (p.isCancel(v)) return v;
      answers[key] = v;
      continue;
    }
    const v = await p.text({
      input: promptInput(),
      message: label,
      initialValue: String(initial ?? ""),
      validate: (value) => ((value ?? "").trim() === "" ? `${label} is required` : undefined),
    });
    if (p.isCancel(v)) return v;
    answers[key] = v;
  }

  const parsed = schema.safeParse(answers);
  if (!parsed.success) {
    p.log.error(`invalid config: ${parsed.error.issues[0]?.message ?? "unknown"} — using defaults`);
    return item.defaultConfig;
  }
  return parsed.data;
}
