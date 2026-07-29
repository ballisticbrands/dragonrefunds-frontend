import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Label,
  Turnstile,
  useBrand,
  useSignUpForm,
} from "@ballisticbrands/frontend-shared";
import { ArrowRight, CheckCircle, Clock, ExternalLink, Lock, Shield } from "@/components/ui/icons";
import {
  FBA_RECOVERY_RATE,
  REPORT_ETA_HOURS,
  REVENUE_MAX,
  REVENUE_MIN,
  REVENUE_STEP,
  estimateRecoverable,
  formatUsd,
  formatUsdShort,
  parseRevenue,
} from "@/lib/refundsEstimate";

const APPSTORE_URL =
  "https://sellercentral.amazon.com/selling-partner-appstore/dp/amzn1.sp.solution.d78b7343-017b-4e68-92e4-a1defb51aa6f";

/**
 * Sign-up, led by the reimbursement estimate.
 *
 * Ported from the landing page's capture page so the funnel doesn't change
 * shape at the domain boundary: the visitor clicks "See what Amazon owes you"
 * on dragonrefunds.com and lands on the same estimate here, rather than on a
 * bare form. Everything above the fields is presentation; the account itself
 * is still created by `useSignUpForm` from the shared package, so the auth
 * flow stays identical to the sibling DragonBot app.
 *
 * The revenue figure is display-only — `useSignUpForm` posts a fixed field
 * set, so capturing it against the User record would need a backend change.
 */
export function SignUp() {
  const navigate = useNavigate();
  const brand = useBrand();

  const [revenue, setRevenue] = useState(1_000_000);
  const [revenueText, setRevenueText] = useState("1,000,000");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const form = useSignUpForm({
    onSuccess: () => {
      // The `sign_up` GA4/Clarity event is fired by the shared
      // identifyUserAcrossPlatforms() (after the post-signup /me lookup),
      // which also sets user_id + user_properties. Firing it here too
      // double-counted the conversion, so we only navigate.
      navigate("/dashboard", { replace: true });
    },
  });

  useEffect(() => {
    document.title = `See what Amazon owes you — ${brand.displayName}`;
  }, [brand.displayName]);

  const recoverable = estimateRecoverable(revenue);

  const onSlide = (v: number) => {
    setRevenue(v);
    setRevenueText(v.toLocaleString("en-US"));
  };

  const onTypeRevenue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRevenue(raw);
    setRevenueText(raw === "" ? "" : (parsed ?? 0).toLocaleString("en-US"));
    setRevenue(parsed ?? 0);
  };

  const mismatch = confirm.length > 0 && confirm !== form.password;

  /* Confirm-password is local: the shared hook owns name/email/password only.
     Block the submit before the hook sees it, and let the hook call
     preventDefault itself on the happy path. */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setSubmitted(true);
    if (form.password !== confirm) {
      e.preventDefault();
      return;
    }
    form.onSubmit(e);
  };

  const showMismatch = mismatch || (submitted && form.password !== confirm);

  return (
    <div>
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          Free reimbursement audit
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em]">
          See what Amazon owes you.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Set your annual FBA revenue to see roughly how much is sitting there unclaimed — then
          create your account and we'll send the exact, itemized breakdown.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border bg-[var(--card)] p-6 shadow-sm sm:p-8">
        {/* revenue picker + turnaround, side by side */}
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <label htmlFor="revenue" className="block text-[13px] font-semibold">
              Your annual FBA revenue
              <span className="block text-[11px] font-normal text-[var(--muted-foreground)]">
                type it, or drag the slider
              </span>
            </label>
            <div className="mt-2.5 flex min-w-0 items-center rounded-xl border bg-[var(--muted)] px-3.5">
              <span className="text-lg font-bold text-[var(--muted-foreground)]">$</span>
              {/* size=1 + min-w-0: without both, the input's intrinsic ~20-character
                  width becomes the flex item's minimum and pushes the card wider
                  than a phone viewport. */}
              <input
                id="revenue"
                type="text"
                inputMode="numeric"
                size={1}
                value={revenueText}
                onChange={onTypeRevenue}
                onBlur={() => {
                  if (!revenueText) {
                    setRevenue(0);
                    setRevenueText("0");
                  }
                }}
                className="w-full min-w-0 bg-transparent px-2 py-3 text-xl font-extrabold tracking-[-0.02em] outline-none sm:text-2xl"
                aria-label="Annual FBA revenue in US dollars"
              />
            </div>
            <input
              type="range"
              min={REVENUE_MIN}
              max={REVENUE_MAX}
              step={REVENUE_STEP}
              value={Math.min(Math.max(revenue, REVENUE_MIN), REVENUE_MAX)}
              onChange={(e) => onSlide(Number(e.target.value))}
              className="mt-4 w-full cursor-pointer"
              style={{ accentColor: "var(--brand-green)" }}
              aria-label="Annual FBA revenue slider"
            />
            <div className="mt-1 flex justify-between font-mono text-[11px] text-[var(--muted-foreground)]">
              <span>{formatUsdShort(REVENUE_MIN)}</span>
              <span>{formatUsdShort(REVENUE_MAX)}+</span>
            </div>
          </div>

          {/* Turnaround, not a countdown — see REPORT_ETA_HOURS. */}
          <div className="eta-badge flex flex-col items-center justify-center rounded-xl border p-5 text-center">
            <Clock className="mb-2 h-5 w-5" />
            <div className="eta-badge-strong text-4xl font-extrabold leading-none">
              {REPORT_ETA_HOURS}
            </div>
            <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.15em]">hours</div>
            <p className="mt-2.5 text-[11.5px] leading-snug opacity-90">
              until your exact, itemized report is ready
            </p>
          </div>
        </div>

        {/* the number they came for */}
        <div className="mt-7 border-t pt-7 text-center">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Estimated waiting for you
          </div>
          <div className="bg-gradient-to-r from-[var(--brand-green)] to-[var(--brand-green-light)] bg-clip-text text-5xl font-extrabold tracking-[-0.03em] text-transparent sm:text-6xl">
            {formatUsd(recoverable)}
          </div>
          <p className="mt-2 text-[11.5px] text-[var(--muted-foreground)]">
            Estimate based on a typical ~{(FBA_RECOVERY_RATE * 100).toFixed(1)}% FBA recovery rate.
            Your real figure comes from your own shipment and fee history.
          </p>
        </div>

        <form className="mt-7 space-y-4 border-t pt-7" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => form.setPassword(e.target.value)}
              />
              <p className="text-xs text-[var(--muted-foreground)]">At least 8 characters.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {showMismatch && (
                <p className="text-xs text-[var(--danger)]">Passwords don't match.</p>
              )}
            </div>
          </div>

          <Turnstile onToken={form.onTurnstileToken} onExpired={form.onTurnstileExpired} />
          {form.error && <p className="text-sm text-[var(--danger)]">{form.error}</p>}

          <Button
            type="submit"
            disabled={form.pending || !form.turnstileToken}
            className="flex w-full items-center justify-center gap-2"
          >
            {form.pending ? "Creating account…" : "Send me my report"}
            {!form.pending && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-[var(--muted-foreground)]">
            By continuing you agree to our{" "}
            <a
              href="https://dragonrefunds.com/tos"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="https://dragonrefunds.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>

      {/* trust strip */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12.5px] font-medium">
        <a
          href={APPSTORE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[var(--brand-green)] hover:opacity-70"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="underline underline-offset-2">Amazon approved</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
        <span className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <Lock className="h-4 w-4 text-[var(--brand-green)]" />
          Read-only access over Amazon's official API
        </span>
        <span className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <Shield className="h-4 w-4 text-[var(--brand-green)]" />
          Amazon ToS compliant
        </span>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link to="/sign-in" className="font-medium text-[var(--foreground)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
