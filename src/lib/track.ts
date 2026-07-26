// Lightweight funnel tracking for the app frontend.
//
// Fires GA4 events (via the gtag injected in main.tsx) and mirrors them as
// Clarity custom events. Safe no-op if either script is blocked / not loaded.
//
// Funnel steps tracked here: `sign_up` (account created) and `connect_amazon`
// (SP-API OAuth connected — the bot-proof "real customer" signal). `cta_click`
// fires on the landing page, not here.

type Params = Record<string, unknown>;

export function track(event: string, params: Params = {}): void {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g === "function") g("event", event, params);
    const c = (window as unknown as { clarity?: (...a: unknown[]) => void }).clarity;
    if (typeof c === "function") c("event", event);
  } catch {
    /* analytics must never break the app */
  }
}
