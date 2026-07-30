import type { BrandConfig } from "@ballisticbrands/frontend-shared";

export const DRAGONREFUNDS: BrandConfig = {
  id: "dragonrefunds",
  appHost: "app.dragonrefunds.com",
  appOrigin: "https://app.dragonrefunds.com",
  headerLabel: "Dragon Refunds",
  displayName: "Dragon Refunds",
  metaDescription:
    "Dragon Refunds recovers Amazon FBA reimbursements. Connect your seller account via SP-API and see every place Amazon owes you money — do it yourself free, or hand it off for 15%.",
  supportEmail: "hello@dragonrefunds.com",
  ga4MeasurementId: "G-H3DKKWESYR",
  clarityId: "xpykdkfhjg",
  // Same postMessage namespace as DragonBot — the backend sends this
  // type regardless of tenant, so both brand frontends listen for the
  // same value.
  oauthMessageType: "dragonbot-oauth-result",
};

/**
 * Meta (Facebook) Pixel ID — DragonRefunds' own dataset, NOT DragonBot's
 * `881227664817776`. Same Business Portfolio, separate dataset: both brands
 * run the same shared attribution code firing identical event names
 * (`CompleteRegistration`, `ConnectSeller`), so one dataset would leave them
 * separable only by URL filter.
 *
 * Kept as a standalone export rather than a `BrandConfig` field because that
 * type is owned by @ballisticbrands/frontend-shared — adding a field there
 * means a version bump + npm publish + dependency bump here, and none of
 * that is needed to switch the pixel on. Fold it into BrandConfig alongside
 * ga4MeasurementId / clarityId on the next shared release.
 *
 * See DragonBot-marketing/META_TRACKING_SETUP.md.
 */
export const META_PIXEL_ID = "1030872029657370";
