// Single-brand registry for dragonrefunds-frontend.
//
// This repo only builds the Dragon Refunds app (deployed at
// app.dragonrefunds.com). Sibling repo dragonbot-frontend builds
// the DragonBot app the same way with its own brand file.
//
// Kept as a module (rather than inlining into main.tsx) so the
// eventual shared components package can consume a BrandConfig via
// prop / provider and stay brand-agnostic.

import { DRAGONREFUNDS } from "./dragonrefunds";

export type { BrandConfig } from "./types";
export { DRAGONREFUNDS };

/** The one brand this repo builds. Consumers should call this
 *  instead of importing DRAGONREFUNDS directly — makes it a
 *  one-line swap if we ever fork this repo again. */
export function activeBrand() {
  return DRAGONREFUNDS;
}
