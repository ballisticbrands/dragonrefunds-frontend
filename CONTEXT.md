# dragonrefunds-frontend

The Dragon Refunds brand's app frontend. Deployed at
**app.dragonrefunds.com** via GitHub Pages.

## Sibling repos + services

- **[dragonbot-frontend](https://github.com/ballisticbrands/dragonbot-frontend)** —
  DragonBot brand's app (app.getdragonbot.com). Same shape as this
  repo with a different brand config. **This repo was forked from
  dragonbot-frontend** — treat that repo's structure as the
  canonical reference.
- **[frontend-shared](https://github.com/ballisticbrands/frontend-shared)** —
  npm package (`@ballisticbrands/frontend-shared`) that owns the
  auth flow, session/API client, brand context, Turnstile widget,
  verify-email banner, and auth-form hooks. See its README for the
  full shared-vs-per-brand boundary and dev loop.
- **[sellerconnect](https://github.com/ballisticbrands/sellerconnect)** —
  the shared backend at api.getdragonbot.com. Serves BOTH brand
  apps. Derives brand from the request's `Origin` header at
  `src/lib/brand.ts`.
- **[DragonRefunds-LP](https://github.com/ballisticbrands/DragonRefunds-LP)** —
  landing page at dragonrefunds.com (separate repo, unrelated
  build).

## Multi-brand model — what to know

Users are shared across brand apps. Same backend, same User table,
same bearer tokens. A user who signs up on `app.getdragonbot.com`
can enter the same credentials on `app.dragonrefunds.com` and sign
in — no re-signup needed. What differs per brand:

- **Frontend build**: brand config in `src/brands/dragonrefunds.ts`
  (name, GA4 ID, Clarity ID, Turnstile site key, support email,
  header label).
- **Frontend hostname + repo**: this repo → `app.dragonrefunds.com`;
  the sibling repo → `app.getdragonbot.com`.
- **Verify-email link**: backend picks the brand's app URL from the
  Origin header on the sign-up POST.
- **SP-API / Ads OAuth `return_to`**: frontend sends its own app
  origin on `/start`; backend threads it through the JWT state
  token and bounces the seller back to the right app.
- **Analytics**: per-brand GA4 (G-H3DKKWESYR here) + Clarity
  (xpykdkfhjg here). Injected at runtime in `main.tsx` from the
  brand config — NOT hardcoded in `index.html`.

What is the SAME across brands:

- Backend (`api.getdragonbot.com`)
- Auth flow, session, API client (all in `@ballisticbrands/frontend-shared`)
- SES sender (`hello@getdragonbot.com` — Dragon Refunds' domain has
  its own SES DKIM identity already provisioned; flipping the
  mailer to send from `hello@dragonrefunds.com` for this brand is
  a small backend-side follow-up)
- Cloudflare Turnstile widget (single widget with multiple
  hostnames in its allowlist — `app.dragonrefunds.com` is on it)

## Layout

```
src/
├── main.tsx              ← boot: configureShared(), analytics injection, BrandProvider
├── App.tsx               ← react-router routes
├── brands/
│   ├── dragonrefunds.ts  ← this brand's config
│   └── index.ts          ← re-exports + activeBrand() helper
├── lib/
│   ├── config.ts         ← build-time Vite config (apiUrl, turnstileSiteKey)
│   ├── connections.ts    ← SP-API/Ads /start + /reauth + /callback helpers
│   ├── keys.ts, cogs.ts, billing.ts, tools.ts  ← inherited from dragonbot; some may
│                            get replaced as Dragon Refunds diverges
├── pages/
│   ├── Index.tsx         ← marketing landing (will diverge — refunds pitch)
│   ├── SignUp.tsx        ← uses useSignUpForm from shared
│   ├── SignIn.tsx        ← uses useSignInForm from shared
│   ├── Dashboard.tsx     ← currently inherited from DragonBot; will be replaced
│                            with a refunds-workflow dashboard as the product
│                            behind Dragon Refunds is built
│   ├── Docs.tsx
│   └── (VerifyEmail + ForgotPassword served from shared)
├── components/
│   ├── layout/           ← AuthLayout, AppLayout, DocsLayout
│   ├── dashboard/        ← inherited; will diverge
│   └── ui/               ← Badge, Card, CopyButton, CodeBlock (brand-local primitives)
└── globals.css           ← Tailwind + CSS-var brand theme
```

Shared components (Button, Input, Label, Turnstile, VerifyEmailBanner,
VerifyEmailPage, ForgotPasswordPage) live in
`@ballisticbrands/frontend-shared` — import from there, don't
recreate locally.

## Boot sequence (main.tsx)

1. Resolve `activeBrand()` from `src/brands/`
2. `configureShared({ apiUrl, brand, turnstileSiteKey })` — sets
   the shared package's module-level singleton
3. Inject GA4 + Clarity scripts with this brand's IDs
4. Set document title + meta description from brand config
5. GitHub-Pages SPA-fallback restore
6. `captureAttribution()` — snapshot first-touch UTMs / gclid /
   referrer / landing_page into localStorage
7. Render app inside `<BrandProvider brand={brand}>`

## Divergence plan (what's expected to change here)

The Dragon Refunds product is the "recover Amazon FBA
reimbursements" pitch. As it's built out, expect these files to
diverge from the sibling dragonbot-frontend:

- `pages/Index.tsx` — refunds-specific marketing copy + hero
- `pages/Dashboard.tsx` + `components/dashboard/*` — will be
  replaced with a refunds-workflow UI (list of reimbursement
  opportunities, disputes-in-flight, etc.)
- `pages/SignUp.tsx` — copy will diverge ("start recovering your
  refunds" instead of "start your trial"), but the form logic
  stays in `useSignUpForm` from shared
- `docs/*` — Dragon Refunds-specific docs

DO NOT change these files (they should stay in sync with dragonbot
via the shared package):

- `src/lib/connections.ts` (SP-API flow) — belongs in shared
  eventually; keep in sync until then
- Session/auth code that's already in `frontend-shared`

If you find yourself wanting to change something in this list, ask
whether the change actually belongs upstream in
`@ballisticbrands/frontend-shared` first.

## Common tasks

**Add a Dragon Refunds-specific feature.** Add the page + components
here. If any component ends up being useful to DragonBot too,
promote to shared later (v0.4+).

**Update the shared package dep.** Bump the version in
`package.json` (`"@ballisticbrands/frontend-shared": "^0.4.0"`),
`npm install`, verify locally, commit + push. Do this for both
this repo AND dragonbot-frontend so the two apps stay in sync.

**Change brand config.** Edit `src/brands/dragonrefunds.ts`.
Analytics IDs, header label, support email, meta description all
live there.

**Iterate on shared code locally.** From `frontend-shared`:
```bash
npm run build && npm link
```
From this repo:
```bash
npm link @ballisticbrands/frontend-shared
```

## Deploy

Push to `main` → GitHub Actions runs `.github/workflows/deploy.yml`
→ Vite build → GitHub Pages picks up the artifact + reads
`public/CNAME` (`app.dragonrefunds.com`) as its custom domain.

**DNS**: at Namecheap on `dragonrefunds.com`, a CNAME on `app`
points at `ballisticbrands.github.io`. GitHub Pages auto-issues
Let's Encrypt cert. SES DKIM CNAMEs for the sender identity are
also on this zone.

**GH Packages auth**: `.npmrc` reads `NODE_AUTH_TOKEN`; CI sets it
to `GITHUB_TOKEN`. Local `npm install` needs a PAT with
`read:packages` on the ballisticbrands org.

## Local dev

```bash
NODE_AUTH_TOKEN=<PAT> npm install   # needed once + on shared updates
npm run dev                          # http://localhost:5173
```

Local dev connects to `api.getdragonbot.com` (real prod backend)
unless `VITE_API_URL` is set in `.env.local`.
