export class DependencyCycleError extends Error {
  constructor(public readonly cycle: string[]) {
    super(`dependency cycle: ${cycle.join(" -> ")}`);
  }
}

export class UnknownDependencyError extends Error {
  constructor(public readonly from: string, public readonly to: string) {
    super(`item "${from}" depends on unknown item "${to}"`);
  }
}

/**
 * Deterministic topological order (Kahn's algorithm; ready set kept sorted so
 * output is stable regardless of insertion order). Throws on cycles/unknown deps.
 */
export function toposort(nodes: string[], deps: Map<string, string[]>): string[] {
  const nodeSet = new Set(nodes);
  const indegree = new Map<string, number>(nodes.map((n) => [n, 0]));
  const dependents = new Map<string, string[]>();
  for (const [node, ds] of deps) {
    if (!nodeSet.has(node)) throw new UnknownDependencyError(node, node);
    for (const d of ds) {
      if (!nodeSet.has(d)) throw new UnknownDependencyError(node, d);
      indegree.set(node, (indegree.get(node) ?? 0) + 1);
      const list = dependents.get(d) ?? [];
      list.push(node);
      dependents.set(d, list);
    }
  }
  const ready = nodes.filter((n) => (indegree.get(n) ?? 0) === 0).sort();
  const order: string[] = [];
  while (ready.length > 0) {
    const node = ready.shift() as string;
    order.push(node);
    for (const dependent of dependents.get(node) ?? []) {
      const left = (indegree.get(dependent) ?? 0) - 1;
      indegree.set(dependent, left);
      if (left === 0) {
        ready.push(dependent);
        ready.sort();
      }
    }
  }
  if (order.length !== nodes.length) {
    const stuck = nodes.filter((n) => !order.includes(n));
    throw new DependencyCycleError(stuck);
  }
  return order;
}
