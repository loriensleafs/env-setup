import * as p from "@clack/prompts";

// Stage A (decide) -> device-flow auth -> Stage B (build, unattended) -> Stage C (connect).
// See docs/PLAN.md for the full agreed design.
export async function bootstrap(): Promise<void> {
  p.intro("envsetup");
  p.log.warn("bootstrap is not implemented yet — scaffold only");
  p.outro("see docs/PLAN.md");
}
