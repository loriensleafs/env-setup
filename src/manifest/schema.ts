import { z } from "zod";

// The manifest is version-pinned: bump MANIFEST_VERSION and add a migration in
// migrations.ts whenever this shape changes (see docs/RESEARCH §7/§10).
export const MANIFEST_VERSION = 1;

export const identitySchema = z.object({
  name: z.string().min(1),
  githubUser: z.string().min(1),
  /** GitHub noreply address, resolved via API during setup. */
  email: z.string().min(3),
});

export const locationsSchema = z.object({
  devDir: z.string().min(1).default("~/Dev"),
  referenceDirName: z.string().min(1).default("reference"),
});

/** Per-item state; `config` is validated by that item's own schema at use time. */
export const itemStateSchema = z.object({
  selected: z.boolean(),
  /** Optional version pin; absent = policy default (usually latest). */
  version: z.string().optional(),
  config: z.unknown().optional(),
});

export const manifestSchema = z.object({
  manifestVersion: z.literal(MANIFEST_VERSION),
  createdAt: z.iso.datetime(),
  identity: identitySchema,
  locations: locationsSchema,
  items: z.record(z.string(), itemStateSchema),
});

export type Identity = z.infer<typeof identitySchema>;
export type Locations = z.infer<typeof locationsSchema>;
export type ItemState = z.infer<typeof itemStateSchema>;
export type Manifest = z.infer<typeof manifestSchema>;
