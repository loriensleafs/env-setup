import type { Item } from "./item.ts";
import { toposort } from "./toposort.ts";

export class DuplicateItemError extends Error {
  constructor(public readonly id: string) {
    super(`duplicate item id "${id}"`);
  }
}

export class ItemRegistry {
  private readonly items = new Map<string, Item<unknown>>();

  register<C>(item: Item<C>): void {
    if (this.items.has(item.id)) throw new DuplicateItemError(item.id);
    this.items.set(item.id, item as Item<unknown>);
  }

  get(id: string): Item<unknown> | undefined {
    return this.items.get(id);
  }

  all(): Item<unknown>[] {
    return [...this.items.values()];
  }

  /** Execution order over the given ids (default: all), respecting declared deps. */
  executionOrder(ids?: string[]): string[] {
    const selected = ids ?? [...this.items.keys()];
    const deps = new Map<string, string[]>();
    for (const id of selected) {
      const item = this.items.get(id);
      if (item?.deps?.length) {
        // Only order against deps that are also part of this run.
        deps.set(id, item.deps.filter((d) => selected.includes(d)));
      }
    }
    return toposort(selected, deps);
  }
}
