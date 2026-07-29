import { Link } from "react-router-dom";
import { config } from "@/lib/config";
import { useBrand } from "@ballisticbrands/frontend-shared";

/**
 * `width` sizes the content column. "sm" is the default narrow auth card
 * (sign-in, forgot-password); "lg" is for /sign-up, which leads with the
 * reimbursement estimate — a revenue slider and turnaround panel sitting
 * side by side don't fit in a 384px column.
 */
export function AuthLayout({
  children,
  width = "sm",
}: {
  children: React.ReactNode;
  width?: "sm" | "lg";
}) {
  const brand = useBrand();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <img src="/DragonBot-logo.png" alt={brand.displayName} className="h-7 w-7 rounded" />
          {brand.headerLabel}
        </Link>
        <a
          href={config.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          Docs
        </a>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className={`w-full ${width === "lg" ? "max-w-3xl" : "max-w-sm"}`}>{children}</div>
      </main>
      <footer className="px-6 py-6 text-xs text-[var(--muted-foreground)] flex gap-4">
        <a href={config.docsUrl} target="_blank" rel="noreferrer">
          Docs
        </a>
        <a href={`mailto:${brand.supportEmail}`}>Support</a>
      </footer>
    </div>
  );
}
