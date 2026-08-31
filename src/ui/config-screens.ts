import { CANCEL_SYMBOL } from "@clack/core";
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

  // Rendered as ONE clack group (Peter, 2026-08-31): the item's title, then
  // every field flowing under a single connected bar — instead of each field
  // as its own standalone prompt with its own header.
  p.log.step(item.title);
  const prompts: Record<string, () => Promise<unknown>> = {};
  for (const [key, prop] of Object.entries(props)) {
    const label = humanize(key);
    const initial = current[key] ?? prop.default;

    if (prop.type === "boolean") {
      prompts[key] = async () => {
        const v = await radioGroup({
          input: promptInput(),
          message: label,
          options: [{ value: "yes" }, { value: "no" }],
          initialValue: initial === false ? "no" : "yes",
        });
        return p.isCancel(v) ? v : v === "yes";
      };
      continue;
    }

    if (prop.type === "number" || prop.type === "integer") {
      const bounds =
        prop.minimum !== undefined || prop.maximum !== undefined
          ? ` (${prop.minimum ?? "…"}–${prop.maximum ?? "…"})`
          : "";
      prompts[key] = async () => {
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
        return p.isCancel(v) ? v : Number(v);
      };
      continue;
    }

    // strings (incl. enums small enough for the radio)
    if (prop.enum && prop.enum.length >= 2 && prop.enum.length <= 4) {
      const choices = prop.enum.map((e) => ({ value: String(e) }));
      prompts[key] = () =>
        radioGroup({
          input: promptInput(),
          message: label,
          options: choices,
          initialValue: String(initial ?? prop.enum?.[0]),
        });
      continue;
    }
    prompts[key] = () =>
      p.text({
        input: promptInput(),
        message: label,
        initialValue: String(initial ?? ""),
        validate: (value) => ((value ?? "").trim() === "" ? `${label} is required` : undefined),
      });
  }

  let cancelled = false;
  const answers = (await p.group(prompts, {
    onCancel: () => {
      cancelled = true;
    },
  })) as Record<string, unknown>;
  if (cancelled) return CANCEL_SYMBOL;

  const parsed = schema.safeParse(answers);
  if (!parsed.success) {
    p.log.error(`invalid config: ${parsed.error.issues[0]?.message ?? "unknown"} — using defaults`);
    return item.defaultConfig;
  }
  return parsed.data;
}
