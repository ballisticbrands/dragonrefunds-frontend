// Single-brand registry for dragonrefunds-frontend.
//
// This repo only builds the Dragon Refunds app (deployed at
// app.dragonrefunds.com). Sibling repo dragonbot-frontend builds
// the DragonBot app the same way with its own brand file.
//
// The BrandConfig type is owned by @ballisticbrands/frontend-shared —
// consumers import it from there, and pass their brand into the
// shared BrandProvider + configureShared({ brand }).

import { DRAGONREFUNDS } from "./dragonrefunds";

export type { BrandConfig } from "@ballisticbrands/frontend-shared";
export { DRAGONREFUNDS };

/** The one brand this repo builds. */
export function activeBrand() {
  return DRAGONREFUNDS;
}
