# Image Background Remover

A Cloudflare-deployed Next.js MVP for converting batches of product photos into transparent or clean white-background PNGs.

## Features

- Upload up to 20 JPG, PNG, or WebP images.
- Process two images concurrently through the Remove.bg API.
- Verify every paid API request with Cloudflare Turnstile.
- Apply white or transparent backgrounds in the browser.
- Export Original, Amazon, Etsy, or Shopify canvas presets.
- Download individual PNGs or a client-generated ZIP.
- No persistent image storage, image history, or server-side ZIP storage.
- D1 stores Google account profiles and hashed login sessions only.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- OpenNext for Cloudflare Workers
- Remove.bg API
- Cloudflare Turnstile
- Google OAuth 2.0
- Cloudflare D1 for users and sessions

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the public environment example:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Copy the Worker secrets example:

   ```powershell
   Copy-Item .dev.vars.example .dev.vars
   ```

4. Replace `REMOVE_BG_API_KEY` in `.dev.vars` with a real Remove.bg API key.

5. Run the app:

   ```bash
   npm run dev
   ```

The examples use Cloudflare's always-pass Turnstile test keys. Production must use keys created for the deployed hostname.

## Environment variables

| Variable | Location | Purpose |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `.env.local` / build environment | Public Turnstile site key |
| `REMOVE_BG_API_KEY` | Cloudflare secret | Remove.bg API credential |
| `TURNSTILE_SECRET_KEY` | Cloudflare secret | Turnstile server verification |
| `ALLOWED_ORIGIN` | Wrangler variable | Exact production site origin |
| `MAX_FILE_SIZE_BYTES` | Wrangler variable | Per-image request limit; defaults to 10 MB |
| `GOOGLE_CLIENT_ID` | Wrangler variable | Google OAuth client identifier |
| `GOOGLE_CLIENT_SECRET` | Cloudflare secret | Google OAuth client secret |
| `AUTH_DB` | Cloudflare D1 binding | User and session database |

Never expose `REMOVE_BG_API_KEY` or `TURNSTILE_SECRET_KEY` as `NEXT_PUBLIC_*` variables.

The Google OAuth callback is `/api/auth/google/callback`. Apply `migrations/0001_auth.sql`
to the `listingcut-auth` D1 database before testing login.

## Verification

```bash
npm run lint
npm run test
npm run build
```

To test the Cloudflare bundle locally:

```bash
npm run preview
```

## Cloudflare deployment

1. Update `ALLOWED_ORIGIN` in `wrangler.jsonc` to the production origin.
2. Add production secrets:

   ```bash
   npx wrangler secret put REMOVE_BG_API_KEY
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```

3. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in the build environment.
4. Deploy:

   ```bash
   npm run deploy
   ```

Configure Cloudflare Web Analytics and edge Rate Limiting Rules in the dashboard if needed. The application deliberately does not implement cross-request counters with Worker memory.

## Privacy model

Images travel from the browser through the Cloudflare Worker to Remove.bg. The site does not persist them, but Remove.bg remains a third-party processor governed by its own policy and terms. Canvas work, previews, and ZIP generation happen in the browser.

See [the phase-one requirements](docs/phase-1-requirements.md) for the complete MVP acceptance criteria.
