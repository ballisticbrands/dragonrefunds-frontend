// Reimbursement estimate constants for the sign-up page.
//
// ⚠ MIRRORED IN dragonrefunds-lp/src/lib/refundsEstimate.js, which drives the
// calculator on the /refunds landing page. The two must stay in agreement:
// a visitor who is quoted one figure on the LP and a different one here for
// the same revenue stops believing both. There is no shared home for these —
// the LP does not consume @ballisticbrands/frontend-shared — so changing one
// means changing the other by hand.

/** Share of gross annual FBA revenue that is typically recoverable. */
export const FBA_RECOVERY_RATE = 0.015;

/**
 * Hours from account connection to the exact, itemized report landing.
 *
 * A DELIVERY PROMISE, not a countdown to an expiring offer — only true for
 * as long as the audit really does land inside the window. Never render it
 * as a ticking clock: the clock starts at connection, so a timer running
 * before sign-up counts down to nothing and resets on every reload.
 */
export const REPORT_ETA_HOURS = 4;

/** Slider bounds. A typed figure above MAX is honoured in full. */
export const REVENUE_MIN = 100_000;
export const REVENUE_MAX = 10_000_000;
export const REVENUE_STEP = 50_000;

/** Estimated annual recoverable amount for a given gross FBA revenue. */
export function estimateRecoverable(revenue: number): number {
  return revenue * FBA_RECOVERY_RATE;
}

/** Whole-dollar USD, e.g. 15000 → "$15,000". */
export function formatUsd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** Compact axis label, e.g. 10000000 → "$10M", 100000 → "$100K". */
export function formatUsdShort(n: number): string {
  return n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${Math.round(n / 1000)}K`;
}

/**
 * Accepts what people actually type into a revenue box — "$2,400,000",
 * "2400000", "" — and returns a number, or null when there's nothing usable.
 */
export function parseRevenue(raw: string): number | null {
  const digits = String(raw).replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Math.min(Number(digits), 999_999_999);
}
