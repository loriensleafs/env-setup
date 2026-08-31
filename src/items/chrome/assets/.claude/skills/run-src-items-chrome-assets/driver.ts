#!/usr/bin/env bun
/**
 * Driver for src/items/chrome/assets — TYPECHECK ONLY. install-web-app.swift
 * drives Chrome's UI through Accessibility and INSTALLS web apps; running it
 * mutates the machine, so this driver never executes it.
 */
import { INSTALL_SWIFT } from "../../../../chrome-pwas.ts";

const swift = new URL("../../../install-web-app.swift", import.meta.url).pathname;
const r = Bun.spawnSync(["xcrun", "swiftc", "-typecheck", swift]);
if (r.exitCode !== 0) throw new Error(`typecheck failed:\n${r.stderr.toString()}`);
console.log("swiftc -typecheck install-web-app.swift ✓");
if ((await Bun.file(swift).text()) !== INSTALL_SWIFT)
  throw new Error("embedded INSTALL_SWIFT drifted");
console.log("byte-identical to the INSTALL_SWIFT constant embedded in chrome-pwas.ts ✓");
